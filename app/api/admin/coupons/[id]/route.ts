import { NextRequest, NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import { db } from "@/lib/db"
import { patchCouponSchema, couponData } from "@/lib/coupon-input"

type Ctx = { params: Promise<{ id: string }> }

/** Un cupón con quién lo usó (correo, fecha y cuánto pagó). */
export async function GET(_req: NextRequest, { params }: Ctx) {
  const g = await adminGuard("pagos")
  if (!g.ok) return g.response
  g.enter()
  const { id } = await params

  const coupon = await db.coupon.findUnique({ where: { id }, include: { uses: { orderBy: { createdAt: "desc" }, take: 200 } } })
  if (!coupon) return NextResponse.json({ error: "Cupón no encontrado" }, { status: 404 })

  const paymentIds = coupon.uses.map((u) => u.paymentId).filter((x): x is string => !!x)
  const payments = paymentIds.length
    ? await db.payment.findMany({ where: { id: { in: paymentIds } }, select: { id: true, amount: true, currency: true, discountAmount: true, course: { select: { title: true } } } })
    : []
  const byId = new Map(payments.map((p) => [p.id, p]))
  const uses = coupon.uses.map((u) => {
    const p = u.paymentId ? byId.get(u.paymentId) : undefined
    return { id: u.id, email: u.email, createdAt: u.createdAt, course: p?.course.title ?? null, paid: p?.amount ?? null, discount: p?.discountAmount ?? null, currency: p?.currency ?? null }
  })
  return NextResponse.json({ coupon: { ...coupon, uses: undefined }, uses })
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const g = await adminGuard("pagos")
  if (!g.ok) return g.response
  g.enter()
  const { id } = await params

  const parsed = patchCouponSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })

  try {
    const existing = await db.coupon.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Cupón no encontrado" }, { status: 404 })

    const next = { type: parsed.data.type ?? existing.type, value: parsed.data.value ?? existing.value }
    if (next.type === "percent" && next.value > 100) return NextResponse.json({ error: "Un porcentaje no puede superar 100." }, { status: 400 })
    const starts = parsed.data.startsAt !== undefined ? parsed.data.startsAt : existing.startsAt
    const ends = parsed.data.expiresAt !== undefined ? parsed.data.expiresAt : existing.expiresAt
    if (starts && ends && new Date(starts) >= new Date(ends)) return NextResponse.json({ error: "El vencimiento tiene que ser posterior al inicio." }, { status: 400 })
    if (parsed.data.maxRedemptions != null && parsed.data.maxRedemptions < existing.redemptions) {
      return NextResponse.json({ error: `Ya se usó ${existing.redemptions} vez/veces: el tope no puede ser menor.` }, { status: 400 })
    }

    if (parsed.data.code && parsed.data.code !== existing.code) {
      const taken = await db.coupon.findUnique({ where: { code: parsed.data.code } })
      if (taken) return NextResponse.json({ error: "Ya existe un cupón con ese código." }, { status: 409 })
    }

    const coupon = await db.coupon.update({ where: { id }, data: couponData(parsed.data) as never })
    return NextResponse.json({ ok: true, coupon })
  } catch (e) {
    console.error("[admin/coupons PATCH]", e)
    return NextResponse.json({ error: "No se pudo guardar el cupón" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const g = await adminGuard("pagos")
  if (!g.ok) return g.response
  g.enter()
  const { id } = await params

  const deleted = await db.coupon.delete({ where: { id } }).catch(() => null)
  if (!deleted) return NextResponse.json({ error: "Cupón no encontrado" }, { status: 404 })
  return NextResponse.json({ ok: true })
}
