import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { adminGuard } from "@/lib/admin-guard"
import { db } from "@/lib/db"
import { PAYMENT_METHODS } from "@/lib/payment-methods"
import { sendEnrollmentEmail } from "@/lib/email"

export const dynamic = "force-dynamic"

export async function GET() {
  const g = await adminGuard("pagos")
  if (!g.ok) return g.response
  g.enter()

  const payments = await db.payment.findMany({
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const byProgram = await db.payment.groupBy({
    by: ["courseId"],
    _count: { courseId: true },
    _sum: { amount: true },
    where: { status: { in: ["completed", "demo"] } },
  })

  return NextResponse.json({ payments, byProgram })
}

const postSchema = z.object({
  userId: z.string().min(1, "Elegí un alumno"),
  courseId: z.string().min(1, "Elegí un programa"),
  amount: z.number({ message: "Ingresá un monto" }).min(0, "El monto no puede ser negativo").max(1_000_000),
  currency: z.string().trim().length(3, "Moneda de 3 letras (ej. USD)").transform((c) => c.toUpperCase()).default("USD"),
  method: z.enum(PAYMENT_METHODS).default("transferencia"),
  status: z.enum(["completed", "pending"]).default("completed"),
  note: z.string().trim().max(300).optional(),
  paidAt: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  /** Inscribir (o reactivar) al alumno en el programa al registrar un pago cobrado. */
  enroll: z.boolean().default(false),
})

/** Registrar a mano un pago recibido fuera de la plataforma (transferencia, efectivo, etc.). */
export async function POST(req: NextRequest) {
  const g = await adminGuard("pagos")
  if (!g.ok) return g.response
  g.enter()

  const parsed = postSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
  const d = parsed.data

  const [student, course] = await Promise.all([
    db.user.findUnique({ where: { id: d.userId }, select: { id: true, role: true, name: true, email: true } }),
    db.course.findUnique({ where: { id: d.courseId }, select: { id: true, title: true } }),
  ])
  if (!student || student.role !== "student") return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 })
  if (!course) return NextResponse.json({ error: "Programa no encontrado" }, { status: 404 })

  const paidAt = d.status === "completed" ? (d.paidAt ? new Date(d.paidAt) : new Date()) : null
  const payment = await db.payment.create({
    data: {
      userId: d.userId, courseId: d.courseId, amount: d.amount, currency: d.currency,
      method: d.method, status: d.status, note: d.note || null, paidAt, recordedById: g.user.id,
    },
  })

  let enrolled = false
  if (d.enroll && d.status === "completed") {
    const existing = await db.enrollment.findUnique({ where: { userId_courseId: { userId: d.userId, courseId: d.courseId } } })
    if (!existing) {
      await db.enrollment.create({ data: { userId: d.userId, courseId: d.courseId, status: "active" } })
      enrolled = true
    } else if (existing.status === "paused" || existing.status === "cancelled") {
      await db.enrollment.update({ where: { id: existing.id }, data: { status: existing.completedAt ? "completed" : "active" } })
      enrolled = true
    }
    if (enrolled) {
      await db.notification.create({
        data: { userId: d.userId, type: "enrollment", message: `Recibimos tu pago. Ya tenés acceso al programa “${course.title}”.`, metadata: JSON.stringify({ courseId: d.courseId, href: "/aula" }) },
      }).catch(() => {})
      sendEnrollmentEmail({ email: student.email, name: student.name, courseTitle: course.title }).catch(() => {})
    }
  }

  return NextResponse.json({ ok: true, payment: { id: payment.id }, enrolled })
}
