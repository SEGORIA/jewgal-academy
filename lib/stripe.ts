import Stripe from "stripe"

const key = process.env.STRIPE_SECRET_KEY

export function isStripeConfigured() {
  return Boolean(key && !key.includes("XXXX"))
}

// Use a harmless placeholder so the module never throws at import time.
// Real calls are only made when isStripeConfigured() is true.
export const stripe = new Stripe(key && !key.includes("XXXX") ? key : "sk_test_placeholder", {
  apiVersion: "2026-05-27.dahlia",
  typescript: true,
})
