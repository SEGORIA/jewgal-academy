import { NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import { db } from "@/lib/db"
import { nextCertificateNumber, attachCertificatePdf } from "@/lib/certificates"

export const maxDuration = 30

export async function POST(req: Request) {
  const g = await adminGuard("certificados")
  if (!g.ok) return g.response
  g.enter()
  const session = g.session

  const { enrollmentId } = await req.json()
  if (!enrollmentId) {
    return NextResponse.json({ error: "enrollmentId requerido" }, { status: 400 })
  }

  const existing = await db.enrollment.findUnique({ where: { id: enrollmentId } })
  if (!existing) {
    return NextResponse.json({ error: "Inscripción no encontrada" }, { status: 404 })
  }

  if (existing.completedAt) {
    return NextResponse.json({ error: "Ya fue marcada como completada" }, { status: 409 })
  }

  const { updated, certNum } = await db.$transaction(async (tx) => {
    const certNum = await nextCertificateNumber(tx)
    const updated = await tx.enrollment.update({
      where: { id: enrollmentId },
      data: {
        completedAt:       new Date(),
        certificateNumber: certNum,
        status:            "completed",
      },
      include: { course: { select: { title: true, slug: true } }, user: { select: { name: true } } },
    })
    return { updated, certNum }
  })

  await attachCertificatePdf(db, {
    enrollmentId:      updated.id,
    studentName:       updated.user.name ?? "Estudiante",
    courseTitle:       updated.course.title,
    courseSlug:        updated.course.slug,
    certificateNumber: certNum,
    completedAt:       updated.completedAt!,
  })

  return NextResponse.json({ enrollment: updated, certificateNumber: certNum })
}

export async function DELETE(req: Request) {
  const g = await adminGuard("certificados")
  if (!g.ok) return g.response
  g.enter()
  const session = g.session

  const { enrollmentId } = await req.json()
  if (!enrollmentId) return NextResponse.json({ error: "enrollmentId requerido" }, { status: 400 })

  await db.enrollment.update({
    where: { id: enrollmentId },
    data: { completedAt: null, certificateNumber: null, status: "active" },
  })

  return NextResponse.json({ ok: true })
}
