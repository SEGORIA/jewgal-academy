import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { adminGuard } from "@/lib/admin-guard"
import { db } from "@/lib/db"
import { PAYMENT_METHODS, PAYMENT_STATUSES } from "@/lib/payment-methods"

const patchSchema = z.object({
  status: z.enum(PAYMENT_STATUSES).optional(),
  amount: z.number().min(0).max(1_000_000).optional(),
  method: z.enum(PAYMENT_METHODS).nullable().optional(),
  note: z.string().trim().max(300).nullable().optional(),
  /** Al reembolsar: además quita el acceso del alumno al programa (inscripción cancelada). */
  revokeAccess: z.boolean().optional(),
})

/**
 * Cambiar el estado de un pago (cobrado, pendiente, reembolsado, fallido) o corregir sus datos.
 * Ojo: marcar un pago de Stripe/PayPal como reembolsado solo lo registra acá;
 * el dinero se devuelve desde el panel del proveedor.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await adminGuard("pagos")
  if (!g.ok) return g.response
  g.enter()
  const { id } = await params

  const parsed = patchSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
  const { revokeAccess, ...fields } = parsed.data

  const payment = await db.payment.findUnique({ where: { id } })
  if (!payment) return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 })

  const data: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(fields)) if (v !== undefined) data[k] = v
  if (fields.status === "completed" && !payment.paidAt) data.paidAt = new Date()
  if (Object.keys(data).length === 0 && !revokeAccess) return NextResponse.json({ error: "Nada para actualizar" }, { status: 400 })

  const updated = Object.keys(data).length ? await db.payment.update({ where: { id }, data }) : payment

  let accessRevoked = false
  if (revokeAccess && fields.status === "refunded") {
    // Solo si no queda otro pago cobrado para ese mismo programa.
    const stillPaid = await db.payment.count({
      where: { userId: payment.userId, courseId: payment.courseId, id: { not: id }, status: { in: ["completed", "demo"] } },
    })
    if (stillPaid === 0) {
      const r = await db.enrollment.updateMany({
        where: { userId: payment.userId, courseId: payment.courseId, status: { in: ["active", "completed"] } },
        data: { status: "cancelled" },
      })
      accessRevoked = r.count > 0
    }
  }

  return NextResponse.json({ ok: true, payment: { id: updated.id, status: updated.status }, accessRevoked })
}

/** Eliminar un pago registrado a mano o de prueba. Los cobrados por Stripe/PayPal no se borran: se marcan como reembolsados. */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await adminGuard("pagos")
  if (!g.ok) return g.response
  g.enter()
  const { id } = await params

  const payment = await db.payment.findUnique({ where: { id } })
  if (!payment) return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 })
  if (payment.stripeSessionId || payment.stripePaymentId) {
    return NextResponse.json({ error: "Los pagos cobrados por Stripe o PayPal no se eliminan para conservar el registro contable. Marcalo como reembolsado si corresponde." }, { status: 409 })
  }

  await db.payment.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
