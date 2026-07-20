import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { stripe, isStripeConfigured } from "@/lib/stripe"
import { db } from "@/lib/db"
import { enrollUserInCourse } from "@/lib/enroll"
import { generateTempPassword, rateLimit, getClientIp } from "@/lib/security"

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

    // Cuenta recién creada por esta compra (p. ej. por el webhook segundos antes):
    // el comprador todavía no tiene contraseña conocida → se le asigna una temporal.
    // Sólo aplica a cuentas de alumno con minutos de antigüedad; jamás a cuentas previas.
    const isBrandNew = Date.now() - new Date(user.createdAt).getTime() < 2 * 60 * 60 * 1000
    if (!tempPassword && isBrandNew && user.role === "student") {
      tempPassword = generateTempPassword()
      await db.user.update({
        where: { id: user.id },
        data: { password: await bcrypt.hash(tempPassword, 10) },
      })
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
