import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { adminGuard } from "@/lib/admin-guard"
import { db } from "@/lib/db"
import { syncEnrollmentProgress } from "@/lib/certificates"

export const dynamic = "force-dynamic"
export const maxDuration = 30

async function loadEnrollment(id: string) {
  return db.enrollment.findUnique({
    where: { id },
    select: { id: true, userId: true, courseId: true, progress: true, completedAt: true, certificateNumber: true, course: { select: { title: true } }, user: { select: { name: true } } },
  })
}

/** Avance del alumno material por material (solo lectura). */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await adminGuard("alumnos")
  if (!g.ok) return g.response
  g.enter()
  const { id } = await params

  const enrollment = await loadEnrollment(id)
  if (!enrollment) return NextResponse.json({ error: "Inscripción no encontrada" }, { status: 404 })

  const materials = await db.material.findMany({
    where: { courseId: enrollment.courseId },
    orderBy: [{ moduleNumber: "asc" }, { order: "asc" }],
    select: { id: true, title: true, type: true, moduleNumber: true, isVisible: true, interactionKind: true },
  })
  const progress = await db.materialProgress.findMany({
    where: { userId: enrollment.userId, materialId: { in: materials.map((m) => m.id) } },
    select: { materialId: true, completedAt: true, quizScore: true, quizTotal: true },
  })
  const byMaterial = new Map(progress.map((p) => [p.materialId, p]))

  return NextResponse.json({
    enrollment: {
      id: enrollment.id, progress: enrollment.progress, student: enrollment.user.name, course: enrollment.course.title,
      certificateNumber: enrollment.certificateNumber,
    },
    materials: materials.map((m) => {
      const p = byMaterial.get(m.id)
      return { ...m, completedAt: p?.completedAt ?? null, quizScore: p?.quizScore ?? null, quizTotal: p?.quizTotal ?? null }
    }),
  })
}

const postSchema = z.union([
  z.object({ materialId: z.string().min(1), completed: z.boolean() }),
  z.object({ all: z.enum(["complete", "reset"]) }),
])

/**
 * Marcar o desmarcar un material como completado, o completar / reiniciar todo el programa del alumno.
 * Después recalcula el avance (%) de la inscripción. Si el avance llega al 100% se emite el certificado
 * igual que cuando lo completa el propio alumno. Reiniciar NO revoca un certificado ya emitido
 * (eso se hace aparte, desde el detalle del alumno).
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await adminGuard("alumnos")
  if (!g.ok) return g.response
  g.enter()
  const { id } = await params

  const parsed = postSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const enrollment = await loadEnrollment(id)
  if (!enrollment) return NextResponse.json({ error: "Inscripción no encontrada" }, { status: 404 })
  const { userId, courseId } = enrollment
  const body = parsed.data

  if ("materialId" in body) {
    const material = await db.material.findUnique({ where: { id: body.materialId }, select: { id: true, courseId: true } })
    if (!material || material.courseId !== courseId) return NextResponse.json({ error: "Material no encontrado en este programa" }, { status: 404 })
    if (body.completed) {
      await db.materialProgress.upsert({
        where: { userId_materialId: { userId, materialId: material.id } },
        create: { userId, materialId: material.id, completedAt: new Date() },
        update: { completedAt: new Date() },
      })
    } else {
      await db.materialProgress.updateMany({ where: { userId, materialId: material.id }, data: { completedAt: null } })
    }
  } else if (body.all === "complete") {
    const mats = await db.material.findMany({ where: { courseId, isVisible: true }, select: { id: true } })
    const done = await db.materialProgress.findMany({
      where: { userId, materialId: { in: mats.map((m) => m.id) }, completedAt: { not: null } }, select: { materialId: true },
    })
    const doneIds = new Set(done.map((d) => d.materialId))
    const now = new Date()
    for (const m of mats) {
      if (doneIds.has(m.id)) continue
      await db.materialProgress.upsert({
        where: { userId_materialId: { userId, materialId: m.id } },
        create: { userId, materialId: m.id, completedAt: now },
        update: { completedAt: now },
      })
    }
  } else {
    const mats = await db.material.findMany({ where: { courseId }, select: { id: true } })
    await db.materialProgress.updateMany({
      where: { userId, materialId: { in: mats.map((m) => m.id) } },
      data: { completedAt: null, quizScore: null, quizTotal: null },
    })
  }

  const result = await syncEnrollmentProgress(db, userId, courseId)
  const certificateKept = !!(await loadEnrollment(id))?.certificateNumber
  return NextResponse.json({ ok: true, progress: result.progress, certificateIssued: result.certificateIssued, certificateNumber: result.certificateNumber, certificateKept })
}
