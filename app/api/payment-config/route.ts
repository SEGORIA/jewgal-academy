import { NextResponse } from "next/server"
import { isStripeConfigured } from "@/lib/stripe"
import { isPayPalConfigured } from "@/lib/paypal"

export async function GET() {
  return NextResponse.json({
    stripe: isStripeConfigured(),
    paypal: isPayPalConfigured(),
    paypalClientId: isPayPalConfigured() ? process.env.PAYPAL_CLIENT_ID : null,
    // Demo mode is available whenever a real provider is NOT configured
    demo: !isStripeConfigured() || !isPayPalConfigured(),
  })
}
