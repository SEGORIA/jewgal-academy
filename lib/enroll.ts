import { db } from "./db"
import { runAfterResponse } from "./background"
import bcrypt from "bcryptjs"
import { generateTempPassword } from "./security"
import { sendEnrollmentEmail } from "./email"
import { recordRedemption } from "./coupons"

export type EnrollInput = {
  email: string
  name: string
  courseId: string
  amount: number
  currency?: string
  provider: "stripe" | "paypal" | "demo" | "manual" | "coupon"
  paymentRef?: string
  /** Cupón aplicado: `amount` ya viene con el descuento; `discount` es lo que se descontó del precio de lista. */
  coupon?: { code: string; discount: number }
}

export type EnrollResult = {
  userId: string
  isNewUser: boolean
  tempPassword?: string
  /** Id del pago registrado (o del que ya existía, si este aviso llegó repetido). */
  paymentId?: string
}

/**
 * Shared enrollment routine used by Stripe webhook, PayPal capture,
 * the demo checkout and manual admin enrollment.
 * Creates the user if it doesn't exist, records the enrollment + payment.
 */
export async function enrollUserInCourse(input: EnrollInput): Promise<EnrollResult> {
  const email = input.email.trim().toLowerCase()

  let user = await db.user.findUnique({ where: { email } })
  let isNewUser = false
  let tempPassword: string | undefined

  if (!user) {
    isNewUser = true
    tempPassword = generateTempPassword()
    user = await db.user.create({
      data: {
        email,
        name: input.name || "Estudiante",
        password: await bcrypt.hash(tempPassword, 10),
        role: "student",
      },
    })
  }

  await db.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId: input.courseId } },
    create: { userId: user.id, courseId: input.courseId, status: "active" },
    update: { status: "active" },
  })

  // Un mismo cobro no se registra dos veces: Stripe puede reenviar el aviso y el navegador confirma por su lado.
  const ref = input.paymentRef
  const duplicate = ref
    ? await db.payment.findFirst({
        where: input.provider === "stripe" ? { stripeSessionId: ref } : input.provider === "paypal" ? { stripePaymentId: ref } : { id: "__none__" },
        select: { id: true },
      })
    : null

  let paymentId = duplicate?.id
  if (!duplicate) {
    const payment = await db.payment.create({
      data: {
        userId: user.id,
        courseId: input.courseId,
        amount: input.amount,
        currency: input.currency ?? "USD",
        status: input.provider === "demo" ? "demo" : "completed",
        paidAt: new Date(),
        stripeSessionId: input.provider === "stripe" ? input.paymentRef : null,
        stripePaymentId: input.provider === "paypal" ? input.paymentRef : null,
        ...(input.provider === "coupon" ? { method: "cupón" } : {}),
        ...(input.coupon ? { couponCode: input.coupon.code, discountAmount: input.coupon.discount } : {}),
      },
    })
    paymentId = payment.id
    if (input.coupon && input.provider !== "coupon") {
      // En la inscripción directa con cupón del 100% el uso ya se reservó antes (claimCouponUse).
      try { await recordRedemption({ code: input.coupon.code, email, userId: user.id, paymentId: payment.id }) }
      catch (e) { console.error("[enroll] no se pudo anotar el uso del cupón:", e) }
    }
  }

  // Alumno que ya tenía cuenta: confirmación de inscripción (la cuenta nueva recibe la bienvenida con su clave)
  if (!isNewUser) {
    const course = await db.course.findUnique({ where: { id: input.courseId }, select: { title: true } })
    if (course) runAfterResponse(() => sendEnrollmentEmail({ email: user.email, name: user.name, courseTitle: course.title }), "correo de inscripción")
  }

  return { userId: user.id, isNewUser, tempPassword, paymentId }
}

/**
 * ¿El email ya tiene una inscripción activa/completada en este curso?
 * Se usa para bloquear la recompra antes de crear la sesión de pago.
 */
export async function hasActiveEnrollment(email: string, courseId: string): Promise<boolean> {
  const user = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } })
  if (!user) return false
  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
  })
  return enrollment?.status === "active" || enrollment?.status === "completed"
}
