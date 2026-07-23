import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import { enrollUserInCourse } from "@/lib/enroll"
import { sendWelcomeEmail } from "@/lib/email"
import { createNotification } from "@/lib/notifications"
import Stripe from "stripe"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const courseId = session.metadata?.courseId
    const email = session.customer_details?.email
    const name = session.customer_details?.name || "Estudiante"

    if (!courseId || !email) {
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 })
    }

    const course = await db.course.findUnique({ where: { id: courseId } })
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 })

    const result = await enrollUserInCourse({
      email,
      name,
      courseId,
      amount: (session.amount_total ?? 0) / 100,
      currency: session.currency ?? "usd",
      provider: "stripe",
      paymentRef: session.id,
    })

    if (result.tempPassword) {
      sendWelcomeEmail({ email, name, courseTitle: course.title, tempPassword: result.tempPassword }).catch(() => {})
    }

    createNotification({
      type: "payment_received",
      message: `Nuevo pago: ${name} (${email}) — "${course.title}" (${((session.amount_total ?? 0) / 100).toFixed(2)} ${(session.currency ?? "usd").toUpperCase()}).`,
      metadata: {
        email,
        courseTitle: course.title,
        amount: (session.amount_total ?? 0) / 100,
        currency: session.currency ?? "usd",
      },
    }).catch(() => {})
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge
    const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id

    if (paymentIntentId) {
      // El charge no tiene el Checkout Session directamente — hay que buscarla por payment_intent
      const sessions = await stripe.checkout.sessions.list({ payment_intent: paymentIntentId, limit: 1 })
      const stripeSessionId = sessions.data[0]?.id

      if (stripeSessionId) {
        const payment = await db.payment.findFirst({
          where: { stripeSessionId },
          include: { user: { select: { name: true, email: true } }, course: { select: { title: true } } },
        })

        if (payment && payment.status !== "refunded") {
          await db.payment.update({ where: { id: payment.id }, data: { status: "refunded" } })
          await db.enrollment.updateMany({
            where: { userId: payment.userId, courseId: payment.courseId },
            data: { status: "refunded" },
          })
          createNotification({
            type: "refund_synced",
            message: `Reembolso sincronizado: ${payment.user.name} (${payment.user.email}) — "${payment.course.title}" (${(charge.amount_refunded / 100).toFixed(2)} ${charge.currency.toUpperCase()}). Se revocó el acceso al aula.`,
            metadata: {
              email: payment.user.email,
              courseTitle: payment.course.title,
              amount: charge.amount_refunded / 100,
              currency: charge.currency,
              paymentId: payment.id,
            },
          }).catch(() => {})
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}
