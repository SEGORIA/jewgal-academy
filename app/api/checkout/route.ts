import { NextRequest, NextResponse } from "next/server"
import { runAfterResponse } from "@/lib/background"
import { stripe, isStripeConfigured } from "@/lib/stripe"
import { db } from "@/lib/db"
import { rateLimit, getClientIp } from "@/lib/security"
import { hasActiveEnrollment } from "@/lib/enroll"
import { createNotification } from "@/lib/notifications"
import { CouponError, normalizeCouponCode, quoteCoupon, type CouponQuote } from "@/lib/coupons"
import { enrollWithFullDiscount } from "@/lib/coupon-checkout"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  const rl = rateLimit(`checkout:${getClientIp(req)}`, 10, 60_000)
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Demasiados intentos. Esperá un momento." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    )
  }

  const { courseId, email, name, couponCode } = await req.json().catch(() => ({}))
  if (typeof courseId !== "string" || !courseId) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const course = await db.course.findUnique({ where: { id: courseId } })
  if (!course) return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })
  if (!course.isPublished) return NextResponse.json({ error: "Curso no disponible" }, { status: 400 })
  if (course.isFree) return NextResponse.json({ free: true })

  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : ""
  if (normalizedEmail && await hasActiveEnrollment(normalizedEmail, course.id)) {
    runAfterResponse(() => createNotification({
      type: "duplicate_purchase_blocked",
      message: `Se bloqueó un intento de recompra: ${normalizedEmail} ya está inscrito/a en "${course.title}".`,
      metadata: { email: normalizedEmail, courseId: course.id, courseTitle: course.title },
    }), "notificación")
    return NextResponse.json(
      { error: "Ya estás inscrito/a en este programa. Revisá tu aula virtual — no hace falta pagar de nuevo." },
      { status: 409 }
    )
  }

  // Cupón: el descuento lo calcula el servidor (el navegador solo manda el código).
  let quote: CouponQuote | null = null
  const code = normalizeCouponCode(couponCode)
  if (code) {
    try {
      quote = await quoteCoupon({ code, course, email: normalizedEmail || null })
    } catch (e) {
      if (e instanceof CouponError) return NextResponse.json({ error: e.message, couponError: true }, { status: 400 })
      console.error("[checkout] cupón:", e)
      return NextResponse.json({ error: "No se pudo verificar el cupón. Probá de nuevo." }, { status: 500 })
    }
  }
  const finalAmount = quote ? quote.finalAmount : course.price

  // Descuento del 100%: se inscribe directo, sin pasar por la pasarela (que no admite cobros de 0).
  if (quote && finalAmount === 0) {
    const studentName = typeof name === "string" ? name.trim() : ""
    if (!EMAIL_RE.test(normalizedEmail) || studentName.length < 2) {
      return NextResponse.json({ error: "Completá tu nombre y un email válido." }, { status: 400 })
    }
    try {
      const r = await enrollWithFullDiscount({ quote, course: { id: course.id, title: course.title }, email: normalizedEmail, name: studentName })
      return NextResponse.json({ enrolled: true, email: normalizedEmail, tempPassword: r.tempPassword ?? null, existing: !r.isNewUser, courseTitle: course.title })
    } catch (e) {
      if (e instanceof CouponError) return NextResponse.json({ error: e.message, couponError: true }, { status: 400 })
      console.error("[checkout] inscripción con cupón:", e)
      return NextResponse.json({ error: "No se pudo completar la inscripción. Probá de nuevo." }, { status: 500 })
    }
  }

  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe no configurado" }, { status: 503 })
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: email || undefined,
    line_items: [
      {
        price_data: {
          currency: course.currency.toLowerCase(),
          unit_amount: Math.round(finalAmount * 100),
          product_data: {
            name: course.title,
            description: quote ? `${course.shortDesc} · Cupón ${quote.coupon.code} aplicado` : course.shortDesc,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      courseId: course.id,
      ...(quote ? { couponCode: quote.coupon.code, discount: String(quote.discount), listPrice: String(quote.listPrice) } : {}),
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/compra-exitosa?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/programas/${course.slug}`,
  })

  return NextResponse.json({ url: session.url })
}
