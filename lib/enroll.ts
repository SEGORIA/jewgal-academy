import { db } from "./db"
import bcrypt from "bcryptjs"
import { generateTempPassword } from "./security"

export type EnrollInput = {
  email: string
  name: string
  courseId: string
  amount: number
  currency?: string
  provider: "stripe" | "paypal" | "demo" | "manual"
  paymentRef?: string
}

export type EnrollResult = {
  userId: string
  isNewUser: boolean
  tempPassword?: string
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

  await db.payment.create({
    data: {
      userId: user.id,
      courseId: input.courseId,
      amount: input.amount,
      currency: input.currency ?? "USD",
      status: input.provider === "demo" ? "demo" : "completed",
      paidAt: new Date(),
      stripeSessionId: input.provider === "stripe" ? input.paymentRef : null,
      stripePaymentId: input.provider === "paypal" ? input.paymentRef : null,
    },
  })

  return { userId: user.id, isNewUser, tempPassword }
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
