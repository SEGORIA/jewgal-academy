import { NextRequest, NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import { db } from "@/lib/db"
import { createCouponSchema, couponData } from "@/lib/coupon-input"

export async function GET() {
  const g = await adminGuard("pagos")
  if (!g.ok) return g.response
  g.enter()
  try {
    const [coupons, courses] = await Promise.all([
      db.coupon.findMany({ orderBy: { createdAt: "desc" } }),
      db.course.findMany({ where: { isFree: false }, select: { id: true, title: true, price: true, currency: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    ])
    return NextResponse.json({ coupons, courses })
  } catch (e) {
    console.error("[admin/coupons GET]", e)
    return NextResponse.json({ error: "No se pudieron cargar los cupones" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const g = await adminGuard("pagos")
  if (!g.ok) return g.response
  g.enter()

  const parsed = createCouponSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })

  try {
    if (await db.coupon.findUnique({ where: { code: parsed.data.code } })) {
      return NextResponse.json({ error: "Ya existe un cupón con ese código." }, { status: 409 })
    }
    const coupon = await db.coupon.create({ data: couponData(parsed.data) as never })
    return NextResponse.json({ ok: true, coupon })
  } catch (e) {
    console.error("[admin/coupons POST]", e)
    return NextResponse.json({ error: "No se pudo crear el cupón" }, { status: 500 })
  }
}
