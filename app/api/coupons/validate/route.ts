import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { rateLimit, getClientIp } from "@/lib/security"
import { CouponError, normalizeCouponCode, quoteCoupon } from "@/lib/coupons"

const schema = z.object({
  code: z.string().max(60),
  courseId: z.string().min(1).max(60),
  email: z.string().max(200).optional(),
})

/**
 * Cuánto descuenta un cupón en un programa. Sirve para mostrar el nuevo total antes de pagar; el cobro vuelve a validar todo.
 * Limitado por IP para que no se puedan adivinar códigos probando uno por uno.
 */
export async function POST(req: NextRequest) {
  const rl = rateLimit(`coupon-validate:${getClientIp(req)}`, 15, 60_000)
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: "Probaste demasiados códigos. Esperá un momento." }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } })
  }

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Datos inválidos." }, { status: 400 })

  const course = await db.course.findUnique({ where: { id: parsed.data.courseId }, select: { id: true, price: true, currency: true, isFree: true, isPublished: true } })
  if (!course || !course.isPublished) return NextResponse.json({ ok: false, error: "Programa no disponible." }, { status: 404 })

  try {
    const email = parsed.data.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsed.data.email.trim()) ? parsed.data.email : null
    const q = await quoteCoupon({ code: parsed.data.code, course, email })
    return NextResponse.json({
      ok: true,
      code: normalizeCouponCode(parsed.data.code),
      description: q.coupon.description,
      type: q.coupon.type,
      value: q.coupon.value,
      listPrice: q.listPrice,
      discount: q.discount,
      finalAmount: q.finalAmount,
      currency: q.currency,
    })
  } catch (e) {
    if (e instanceof CouponError) return NextResponse.json({ ok: false, error: e.message }, { status: 400 })
    console.error("[coupons/validate]", e)
    return NextResponse.json({ ok: false, error: "No se pudo verificar el cupón. Probá de nuevo." }, { status: 500 })
  }
}
