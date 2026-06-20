import { NextRequest, NextResponse } from "next/server"
import { stripe, isStripeConfigured } from "@/lib/stripe"
import { db } from "@/lib/db"
import { rateLimit, getClientIp } from "@/lib/security"

export async function POST(req: NextRequest) {
  const rl = rateLimit(`checkout:${getClientIp(req)}`, 10, 60_000)
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Demasiados intentos. Esperá un momento." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    )
  }

  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe no configurado" }, { status: 503 })
  }

  const { courseId, email } = await req.json()

  const course = await db.course.findUnique({ where: { id: courseId } })
  if (!course) return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })
  if (!course.isPublished) return NextResponse.json({ error: "Curso no disponible" }, { status: 400 })
  if (course.isFree) return NextResponse.json({ free: true })

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: email || undefined,
    line_items: [
      {
        price_data: {
          currency: course.currency.toLowerCase(),
          unit_amount: Math.round(course.price * 100),
          product_data: { name: course.title, description: course.shortDesc },
        },
        quantity: 1,
      },
    ],
    metadata: { courseId: course.id },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/aula?enrolled=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/programas/${course.slug}`,
  })

  return NextResponse.json({ url: session.url })
}
