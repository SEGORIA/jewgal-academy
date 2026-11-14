import { NextRequest, NextResponse } from "next/server"
import { runAfterResponse } from "@/lib/background"
import { capturePayPalOrder, isPayPalConfigured } from "@/lib/paypal"
import { db } from "@/lib/db"
import { enrollUserInCourse } from "@/lib/enroll"
import { sendWelcomeEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  if (!isPayPalConfigured()) {
    return NextResponse.json({ error: "PayPal no configurado" }, { status: 503 })
  }

  const { orderId, courseId, email, name } = await req.json()
  if (!orderId || !courseId || !email) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
  }

  const course = await db.course.findUnique({ where: { id: courseId } })
  if (!course) return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })

  const capture = await capturePayPalOrder(orderId)
  if (capture.status !== "COMPLETED") {
    return NextResponse.json({ error: "Pago no completado", capture }, { status: 400 })
  }

  const result = await enrollUserInCourse({
    email,
    name,
    courseId,
    amount: course.price,
    currency: course.currency,
    provider: "paypal",
    paymentRef: capture.id,
  })

  const tempPassword = result.tempPassword
  if (tempPassword) {
    runAfterResponse(() => sendWelcomeEmail({
      email: String(email).trim().toLowerCase(),
      name: name || "Estudiante",
      courseTitle: course.title,
      tempPassword,
    }), "correo de bienvenida")
  }

  return NextResponse.json({ ok: true, ...result })
}
