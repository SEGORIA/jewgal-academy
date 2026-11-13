import { NextRequest, NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import { z } from "zod"
import { db } from "@/lib/db"

const optionalText = (max: number) =>
  z.string().trim().max(max).nullable().optional().transform((v) => (v === undefined ? undefined : v ? v : null))

const patchSchema = z
  .object({
    status: z.enum(["active", "banned"]),
    name: z.string().trim().min(2, "El nombre es muy corto").max(120),
    email: z.string().trim().toLowerCase().email("Email inválido").max(160),
    phone: optionalText(40),
    country: optionalText(80),
    city: optionalText(80),
    job: optionalText(120),
    bio: optionalText(1000),
  })
  .partial()
  .refine((d) => Object.values(d).some((v) => v !== undefined), { message: "Nada para actualizar" })

/** Editar los datos de un alumno (perfil) o suspender / reactivar su cuenta. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await adminGuard("alumnos")
  if (!g.ok) return g.response
  g.enter()
  const { id } = await params

  const student = await db.user.findUnique({ where: { id } })
  if (!student || student.role !== "student") {
    return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 })
  }

  const parsed = patchSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
  }
  const data = Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== undefined))

  if (typeof data.email === "string" && data.email !== student.email) {
    const taken = await db.user.findUnique({ where: { email: data.email }, select: { id: true } })
    if (taken && taken.id !== id) {
      return NextResponse.json({ error: "Ya existe otra cuenta con ese email" }, { status: 409 })
    }
  }

  const updated = await db.user.update({ where: { id }, data })
  const { password: _password, ...safe } = updated
  void _password
  return NextResponse.json({ ok: true, student: safe })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  void req
  const g = await adminGuard("alumnos")
  if (!g.ok) return g.response
  g.enter()
  const { id } = await params

  const student = await db.user.findUnique({ where: { id } })
  if (!student || student.role !== "student") {
    return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 })
  }

  const [enrollmentCount, paymentCount] = await Promise.all([
    db.enrollment.count({ where: { userId: id } }),
    db.payment.count({ where: { userId: id } }),
  ])
  if (enrollmentCount > 0 || paymentCount > 0) {
    return NextResponse.json(
      { error: "Esta cuenta tiene inscripciones o pagos registrados. Para conservar el historial académico y de pagos, suspendela en lugar de eliminarla, o quitá primero sus inscripciones y pagos." },
      { status: 409 }
    )
  }

  await db.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
