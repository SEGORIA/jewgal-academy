import { NextRequest, NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import { z } from "zod"
import { db } from "@/lib/db"
import { PAYMENT_METHODS } from "@/lib/payment-methods"
import { sendEnrollmentEmail } from "@/lib/email"

const paymentInput = z.object({
  amount: z.number().min(0).max(1_000_000),
  currency: z.string().trim().length(3).transform((c) => c.toUpperCase()).default("USD"),
  method: z.enum(PAYMENT_METHODS).default("transferencia"),
  note: z.string().trim().max(300).optional(),
})

const postSchema = z.object({
  userId: z.string().min(1),
  courseId: z.string().min(1),
  /** Si viene, se registra además un pago manual asociado a esta inscripción. */
  payment: paymentInput.optional(),
})

/** Inscribir a un alumno que ya existe en un programa (cortesía/beca si no se registra pago). */
export async function POST(req: NextRequest) {
  const g = await adminGuard("alumnos")
  if (!g.ok) return g.response
  g.enter()

  const parsed = postSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
  }
  const { userId, courseId, payment } = parsed.data

  const [student, course] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { id: true, role: true, name: true, email: true } }),
    db.course.findUnique({ where: { id: courseId }, select: { id: true, title: true } }),
  ])
  if (!student || student.role !== "student") return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 })
  if (!course) return NextResponse.json({ error: "Programa no encontrado" }, { status: 404 })

  const existing = await db.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } })
  if (existing && (existing.status === "active" || existing.status === "completed")) {
    return NextResponse.json({ error: "Este alumno ya está inscripto en ese programa" }, { status: 409 })
  }

  const enrollment = existing
    ? await db.enrollment.update({ where: { id: existing.id }, data: { status: existing.completedAt ? "completed" : "active" } })
    : await db.enrollment.create({ data: { userId, courseId, status: "active" } })

  if (payment) {
    await db.payment.create({
      data: {
        userId, courseId,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method,
        note: payment.note || null,
        status: "completed",
        paidAt: new Date(),
        recordedById: g.user.id,
      },
    })
  }

  await db.notification.create({
    data: {
      userId,
      type: "enrollment",
      message: `Ya tenés acceso al programa “${course.title}”. ¡Bienvenido/a!`,
      metadata: JSON.stringify({ courseId, href: "/aula" }),
    },
  }).catch(() => {})
  sendEnrollmentEmail({ email: student.email, name: student.name, courseTitle: course.title }).catch(() => {})

  return NextResponse.json({ ok: true, enrollment: { id: enrollment.id, status: enrollment.status } })
}

const patchSchema = z.object({
  enrollmentId: z.string().min(1),
  progress: z.number().int().min(0).max(100).optional(),
  hoursCompleted: z.number().min(0).max(10000).optional(),
  /** Pausar o cancelar corta el acceso al aula; reactivar lo devuelve. */
  status: z.enum(["active", "paused", "cancelled"]).optional(),
})

/** Ajustar avance (%), horas realizadas o estado (activa / pausada / cancelada) de una inscripción. */
export async function PATCH(req: NextRequest) {
  const g = await adminGuard("alumnos")
  if (!g.ok) return g.response
  g.enter()

  const parsed = patchSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }
  const { enrollmentId, progress, hoursCompleted, status } = parsed.data

  const current = await db.enrollment.findUnique({ where: { id: enrollmentId }, select: { id: true, completedAt: true } })
  if (!current) return NextResponse.json({ error: "Inscripción no encontrada" }, { status: 404 })

  const data: Record<string, number | string> = {}
  if (progress !== undefined) data.progress = progress
  if (hoursCompleted !== undefined) data.hoursCompleted = hoursCompleted
  // Una inscripción con certificado que se reactiva vuelve a "completed", no a "active".
  if (status !== undefined) data.status = status === "active" && current.completedAt ? "completed" : status
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nada para actualizar" }, { status: 400 })
  }

  const updated = await db.enrollment.update({ where: { id: enrollmentId }, data })
  return NextResponse.json({
    ok: true,
    enrollment: { id: updated.id, progress: updated.progress, hoursCompleted: updated.hoursCompleted, status: updated.status },
  })
}

/**
 * Quitar la inscripción (el alumno pierde el acceso y sale de las listas del programa).
 * No borra pagos ni el avance por material: si se vuelve a inscribir, recupera lo que ya había hecho.
 * Con certificado emitido hay que revocarlo primero.
 */
export async function DELETE(req: NextRequest) {
  const g = await adminGuard("alumnos")
  if (!g.ok) return g.response
  g.enter()

  const body = await req.json().catch(() => null)
  const enrollmentId = typeof body?.enrollmentId === "string" ? body.enrollmentId : ""
  if (!enrollmentId) return NextResponse.json({ error: "enrollmentId requerido" }, { status: 400 })

  const enrollment = await db.enrollment.findUnique({ where: { id: enrollmentId }, select: { id: true, certificateNumber: true } })
  if (!enrollment) return NextResponse.json({ error: "Inscripción no encontrada" }, { status: 404 })
  if (enrollment.certificateNumber) {
    return NextResponse.json({ error: "Tiene un certificado emitido. Revocalo primero desde el detalle del alumno." }, { status: 409 })
  }

  await db.enrollment.delete({ where: { id: enrollmentId } })
  return NextResponse.json({ ok: true })
}
