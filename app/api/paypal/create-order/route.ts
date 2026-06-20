import { NextRequest, NextResponse } from "next/server"
import { createPayPalOrder, isPayPalConfigured } from "@/lib/paypal"
import { db } from "@/lib/db"
import { rateLimit, getClientIp } from "@/lib/security"

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

  const { courseId } = await req.json()
  const course = await db.course.findUnique({ where: { id: courseId } })
  if (!course) return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })

  const order = await createPayPalOrder(course.price, course.currency, course.title)
  return NextResponse.json({ id: order.id })
}
