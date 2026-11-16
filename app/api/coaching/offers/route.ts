import { NextRequest, NextResponse } from "next/server"
import { baseDb } from "@/lib/db"
import { getCoachingSettings, localizeOffer } from "@/lib/coaching-server"

export const dynamic = "force-dynamic"

/** Ofertas de Coaching 1:1 activas y lo que la página pública necesita de la configuración. Si las reservas están apagadas, `enabled: false`. */
export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get("locale") === "en" ? "en" : "es"
  try {
    const settings = await getCoachingSettings()
    if (!settings.enabled) return NextResponse.json({ enabled: false, offers: [] })
    const offers = await baseDb.coachingOffer.findMany({ where: { isActive: true }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] })
    return NextResponse.json({
      enabled: offers.length > 0,
      timezone: settings.timezone,
      instructions: settings.instructions,
      autoConfirm: settings.autoConfirm,
      maxDaysAhead: settings.maxDaysAhead,
      offers: offers.map((o) => localizeOffer(o, locale)),
    })
  } catch {
    return NextResponse.json({ enabled: false, offers: [] })
  }
}
