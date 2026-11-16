import { NextRequest, NextResponse } from "next/server"
import { runAfterResponse } from "@/lib/background"
import { capturePayPalOrder, isPayPalConfigured } from "@/lib/paypal"
import { db } from "@/lib/db"
import { enrollUserInCourse } from "@/lib/enroll"
import { sendWelcomeEmail } from "@/lib/email"

type PayPalCapture = {
  id?: string
  status?: string
  purchase_units?: { custom_id?: string; payments?: { captures?: { id?: string; amount?: { value?: string; currency_code?: string }; custom_id?: string }[] } }[]
}

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

  const capture = (await capturePayPalOrder(orderId)) as PayPalCapture
  if (capture.status !== "COMPLETED") {
    return NextResponse.json({ error: "Pago no completado", capture }, { status: 400 })
  }

  // Lo que se cobró de verdad y lo que el servidor anotó al crear la orden ("programa|CUPÓN|descuento").
  const unit = capture.purchase_units?.[0]
  const cap = unit?.payments?.captures?.[0]
  const customId = cap?.custom_id ?? unit?.custom_id ?? ""
  const [orderCourseId, couponCode, couponDiscount] = customId.split("|")
  if (orderCourseId && orderCourseId !== course.id) {
    console.error("[paypal/capture-order] la orden", orderId, "era de otro programa:", orderCourseId, "≠", course.id)
    return NextResponse.json({ error: "El pago no corresponde a este programa." }, { status: 400 })
  }
  const paid = Number(cap?.amount?.value)
  const discount = Number(couponDiscount)

  const result = await enrollUserInCourse({
    email,
    name,
    courseId,
    amount: Number.isFinite(paid) && paid >= 0 ? paid : course.price,
    currency: cap?.amount?.currency_code ?? course.currency,
    provider: "paypal",
    paymentRef: capture.id,
    coupon: couponCode && Number.isFinite(discount) && discount > 0 ? { code: couponCode, discount } : undefined,
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
