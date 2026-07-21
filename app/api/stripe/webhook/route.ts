import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import { enrollUserInCourse } from "@/lib/enroll"
import { sendWelcomeEmail } from "@/lib/email"
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
  }

  return NextResponse.json({ received: true })
}
