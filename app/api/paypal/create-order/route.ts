import { NextRequest, NextResponse } from "next/server"
import { createPayPalOrder, isPayPalConfigured } from "@/lib/paypal"
import { db } from "@/lib/db"
import { rateLimit, getClientIp } from "@/lib/security"
import { CouponError, normalizeCouponCode, quoteCoupon } from "@/lib/coupons"

export async function POST(req: NextRequest) {
  const rl = rateLimit(`paypal-create:${getClientIp(req)}`, 10, 60_000)
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Demasiados intentos. Esperá un momento." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    )
  }

  if (!isPayPalConfigured()) {
    return NextResponse.json({ error: "PayPal no configurado" }, { status: 503 })
  }

  const { courseId, email, couponCode } = await req.json().catch(() => ({}))
  if (typeof courseId !== "string" || !courseId) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  const course = await db.course.findUnique({ where: { id: courseId } })
  if (!course) return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })

  // El importe lo fija el servidor (con el cupón, si lo hay); PayPal devuelve `custom_id` al capturar.
  let amount = course.price
  let customId = course.id
  const code = normalizeCouponCode(couponCode)
  if (code) {
    try {
      const q = await quoteCoupon({ code, course, email: typeof email === "string" ? email : null })
      if (q.finalAmount === 0) return NextResponse.json({ error: "Con este cupón la inscripción es sin cargo: usá el botón de inscripción." }, { status: 400 })
      amount = q.finalAmount
      customId = `${course.id}|${q.coupon.code}|${q.discount}`
    } catch (e) {
      if (e instanceof CouponError) return NextResponse.json({ error: e.message, couponError: true }, { status: 400 })
      console.error("[paypal/create-order] cupón:", e)
      return NextResponse.json({ error: "No se pudo verificar el cupón." }, { status: 500 })
    }
  }

  const order = await createPayPalOrder(amount, course.currency, course.title, customId)
  return NextResponse.json({ id: order.id })
}
