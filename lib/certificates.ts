import type { Prisma, PrismaClient } from "@prisma/client"
import { renderToBuffer } from "@react-pdf/renderer"
import { CertificateDocument, fetchCoBrandingLogoBuffer, fetchAccreditationLogoBuffers } from "@/lib/certificate-pdf"
import { isCloudinaryConfigured, uploadBufferToCloudinary } from "@/lib/cloudinary"
import { getCertificateDesign, resolveProgramAccent } from "@/lib/certificate-design"

type Tx = Prisma.TransactionClient

export type AttachCertificatePdfInput = {
  enrollmentId: string
  studentName: string
  courseTitle: string
  courseSlug: string
  certificateNumber: string
  completedAt: Date
}

// Genera el PDF y lo sube a Cloudinary, fuera de cualquier transacción de
// base de datos (es trabajo de red, no debe bloquear ni arriesgar el
// timeout de una transacción de Prisma). Si algo falla acá, el certificado
// ya emitido (número + fecha) sigue siendo válido — el PDF es una capa
// adicional, no un requisito para /verificar/[numero].
export async function attachCertificatePdf(db: PrismaClient, input: AttachCertificatePdfInput): Promise<void> {
  if (!isCloudinaryConfigured()) {
    console.warn("[attachCertificatePdf] Cloudinary no configurado, se omite la generación del PDF")
    return
  }
  try {
    const design = await getCertificateDesign(db)
    const accent = resolveProgramAccent(design, input.courseSlug)
    const coBrandingLogo = design.coBrandingEnabled
      ? await fetchCoBrandingLogoBuffer(design.coBrandingLogoUrl)
      : null
    const course = await db.course.findFirst({
      where: { slug: input.courseSlug },
      select: { accreditations: { select: { logoUrl: true }, orderBy: { order: "asc" } } },
    })
    const accreditationLogos = course
      ? await fetchAccreditationLogoBuffers(course.accreditations.map((a) => a.logoUrl))
      : []
    const buffer = await renderToBuffer(
      CertificateDocument({
        data: {
          studentName: input.studentName,
          courseTitle: input.courseTitle,
          certificateNumber: input.certificateNumber,
          completedAt: input.completedAt,
          accent,
        },
        design,
        coBrandingLogo,
        accreditationLogos,
      })
    )
    const certificateUrl = await uploadBufferToCloudinary(buffer, {
      folder: "jewgal-certificados",
      publicId: input.certificateNumber,
      mimeType: "application/pdf",
      resourceType: "image",
    })
    await db.enrollment.update({ where: { id: input.enrollmentId }, data: { certificateUrl } })
  } catch (err) {
    console.error(`[attachCertificatePdf] falló para enrollment ${input.enrollmentId}:`, err)
  }
}

// JA-{año}-{NNNN} — misma lógica que ya usaba app/api/admin/enrollments/complete/route.ts,
// extraída acá para no duplicarla entre la emisión manual (admin) y la automática (alumno).
export async function nextCertificateNumber(tx: Tx): Promise<string> {
  const completedCount = await tx.enrollment.count({ where: { completedAt: { not: null } } })
  const year = new Date().getFullYear()
  return `JA-${year}-${String(completedCount + 1).padStart(4, "0")}`
}

export type SyncResult = {
  progress: number
  certificateIssued: boolean
  certificateNumber: string | null
}

// Recalcula Enrollment.progress a partir de MaterialProgress (antes estaban
// completamente desconectados) y, si llega al 100% y todavía no tenía
// certificado, lo emite automáticamente con el mismo formato que el flujo
// manual de superadmin. Todo en una transacción: dos lecciones completadas
// casi al mismo tiempo por el mismo alumno no deben generar dos números de
// certificado distintos (el flujo manual no corría este riesgo por ser un
// solo admin operando; acá lo dispara el propio alumno).
export async function syncEnrollmentProgress(db: PrismaClient, userId: string, courseId: string): Promise<SyncResult> {
  const result = await db.$transaction(async (tx) => {
    const enrollment = await tx.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      include: { user: { select: { name: true } }, course: { select: { title: true, slug: true } } },
    })
    if (!enrollment) {
      return { progress: 0, certificateIssued: false, certificateNumber: null, issued: null }
    }

    const materials = await tx.material.findMany({ where: { courseId, isVisible: true }, select: { id: true } })
    const total = materials.length
    if (total === 0) {
      return { progress: enrollment.progress, certificateIssued: false, certificateNumber: enrollment.certificateNumber, issued: null }
    }

    const completedCount = await tx.materialProgress.count({
      where: { userId, materialId: { in: materials.map((m) => m.id) }, completedAt: { not: null } },
    })
    const progress = Math.round((completedCount / total) * 100)

    if (progress >= 100 && !enrollment.completedAt) {
      const certificateNumber = await nextCertificateNumber(tx)
      const completedAt = new Date()
      await tx.enrollment.update({
        where: { id: enrollment.id },
        data: { progress: 100, completedAt, certificateNumber, status: "completed" },
      })
      return {
        progress: 100, certificateIssued: true, certificateNumber,
        issued: {
          enrollmentId: enrollment.id,
          studentName: enrollment.user.name ?? "Estudiante",
          courseTitle: enrollment.course.title,
          courseSlug: enrollment.course.slug,
          certificateNumber,
          completedAt,
        },
      }
    }

    await tx.enrollment.update({ where: { id: enrollment.id }, data: { progress } })
    return { progress, certificateIssued: false, certificateNumber: enrollment.certificateNumber, issued: null }
  })

  if (result.issued) {
    await attachCertificatePdf(db, result.issued)
  }

  return { progress: result.progress, certificateIssued: result.certificateIssued, certificateNumber: result.certificateNumber }
}
