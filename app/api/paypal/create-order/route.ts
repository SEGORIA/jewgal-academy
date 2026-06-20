import { NextRequest, NextResponse } from "next/server"
import { createPayPalOrder, isPayPalConfigured } from "@/lib/paypal"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  if (!isPayPalConfigured()) {
    return NextResponse.json({ error: "PayPal no configurado" }, { status: 503 })
  }

  const { courseId } = await req.json()
  const course = await db.course.findUnique({ where: { id: courseId } })
  if (!course) return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })

  const order = await createPayPalOrder(course.price, course.currency, course.title)
  return NextResponse.json({ id: order.id })
}
