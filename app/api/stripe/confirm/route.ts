import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { stripe, isStripeConfigured } from "@/lib/stripe"
import { db } from "@/lib/db"
import { enrollUserInCourse } from "@/lib/enroll"
import { rateLimit, getClientIp } from "@/lib/security"
import { sendWelcomeEmail } from "@/lib/email"

/**
 * Confirmación del checkout de Stripe desde el navegador del comprador.
 * Poseer el session_id de una sesión PAGADA es la prueba de que es el pagador
 * (Stripe lo devuelve sólo en su redirect). Complementa al webhook:
 * - Si el webhook aún no corrió, inscribe (idempotente por stripeSessionId).
 * - Si el usuario es NUEVO (cuenta creada por esta compra), devuelve una
 *   contraseña temporal para el auto-login. NUNCA toca la contraseña de
 *   cuentas preexistentes.
 */
const bodySchema = z.object({ sessionId: z.string().min(10).max(200) })

export async function POST(req: NextRequest) {
  const rl = rateLimit(`stripe-confirm:${getClientIp(req)}`, 10, 60_000)
  if (!rl.ok) {
    return NextResponse.json({ error: "Demasiados intentos." }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } })
  }

  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe no configurado" }, { status: 503 })
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  try {
    const session = await stripe.checkout.sessions.retrieve(parsed.data.sessionId)
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "El pago no está completado" }, { status: 400 })
    }

    const courseId = session.metadata?.courseId
    const email = session.customer_details?.email?.trim().toLowerCase()
    const name = session.customer_details?.name || "Estudiante"
    if (!courseId || !email) {
      return NextResponse.json({ error: "Sesión sin datos de curso" }, { status: 400 })
    }

    const course = await db.course.findUnique({ where: { id: courseId } })
    if (!course) return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })

    // ¿El webhook ya registró este pago?
    const existingPayment = await db.payment.findFirst({ where: { stripeSessionId: session.id } })

    let tempPassword: string | null = null

    if (!existingPayment) {
      const result = await enrollUserInCourse({
        email,
        name,
        courseId,
        amount: (session.amount_total ?? 0) / 100,
        currency: session.currency ?? "usd",
        provider: "stripe",
        paymentRef: session.id,
      })
      tempPassword = result.tempPassword ?? null
    }

    const user = await db.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

    // NOTA: si existingPayment era true (el webhook llegó primero), tempPassword
    // queda en null aquí — NUNCA se resetea la contraseña por edad de la cuenta.
    // Si el webhook creó una cuenta nueva de verdad, es el propio webhook el que
    // genera su contraseña temporal y envía el correo de bienvenida (ver
    // app/api/stripe/webhook/route.ts) — este endpoint no necesita adivinarlo.

    if (tempPassword) {
      sendWelcomeEmail({ email, name, courseTitle: course.title, tempPassword }).catch(() => {})
    }

    return NextResponse.json({
      ok: true,
      email,
      tempPassword,
      existing: !tempPassword,
      courseTitle: course.title,
    })
  } catch {
    return NextResponse.json({ error: "No se pudo verificar el pago" }, { status: 500 })
  }
}
