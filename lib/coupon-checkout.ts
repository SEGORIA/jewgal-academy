import { baseDb } from "./db"
import { runAfterResponse } from "./background"
import { sendWelcomeEmail } from "./email"
import { enrollUserInCourse, type EnrollResult } from "./enroll"
import { CouponError, claimCouponUse, releaseCouponUse, type CouponQuote } from "./coupons"

/**
 * Inscripción sin cobro por un cupón del 100% (becas, cortesías). No pasa por Stripe ni PayPal: queda registrada como un
 * pago de 0 con el cupón y el descuento, y cuenta como un uso del cupón.
 */
export async function enrollWithFullDiscount(input: {
  quote: CouponQuote
  course: { id: string; title: string }
  email: string
  name: string
}): Promise<EnrollResult> {
  const { quote, course } = input
  const email = input.email.trim().toLowerCase()

  // Primero se reserva el uso (con el tope verificado en la base); si algo falla después, se devuelve.
  if (!(await claimCouponUse(quote.coupon.id))) throw new CouponError("Este cupón alcanzó su límite de usos.")

  let result: EnrollResult
  try {
    result = await enrollUserInCourse({
      email,
      name: input.name,
      courseId: course.id,
      amount: 0,
      currency: quote.currency,
      provider: "coupon",
      coupon: { code: quote.coupon.code, discount: quote.discount },
    })
  } catch (e) {
    await releaseCouponUse(quote.coupon.id).catch(() => {})
    throw e
  }

  try {
    await baseDb.couponRedemption.create({ data: { couponId: quote.coupon.id, email, userId: result.userId, paymentId: result.paymentId ?? null } })
  } catch (e) {
    console.error("[coupon] no se pudo anotar el uso:", e)
  }

  const tempPassword = result.tempPassword
  if (tempPassword) {
    runAfterResponse(() => sendWelcomeEmail({ email, name: input.name, courseTitle: course.title, tempPassword }), "correo de bienvenida")
  }
  return result
}
