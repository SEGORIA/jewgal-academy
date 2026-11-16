import { NextRequest, NextResponse } from "next/server"
import { baseDb } from "@/lib/db"
import { rateLimit, getClientIp } from "@/lib/security"
import { addDays, dateInZone, slotsForDate } from "@/lib/coaching"
import { busyBetween, getCoachingSettings } from "@/lib/coaching-server"

export const dynamic = "force-dynamic"

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/** Turnos libres de una oferta. `?offerId=…&from=YYYY-MM-DD&days=14` (hasta 31 días). Las fechas son las de la zona horaria de la consultora. */
export async function GET(req: NextRequest) {
  const rl = rateLimit(`coaching-slots:${getClientIp(req)}`, 60, 60_000)
  if (!rl.ok) return NextResponse.json({ error: "Demasiadas consultas." }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } })

  const q = req.nextUrl.searchParams
  const offerId = q.get("offerId") ?? ""
  const settings = await getCoachingSettings()
  if (!settings.enabled) return NextResponse.json({ error: "Las reservas no están disponibles." }, { status: 404 })
  const offer = offerId ? await baseDb.coachingOffer.findFirst({ where: { id: offerId, isActive: true } }).catch(() => null) : null
  if (!offer) return NextResponse.json({ error: "Oferta no encontrada." }, { status: 404 })

  const now = new Date()
  const today = dateInZone(now, settings.timezone)
  const fromParam = q.get("from") ?? today
  const from = DATE_RE.test(fromParam) && fromParam > today ? fromParam : today
  const days = Math.min(31, Math.max(1, Number(q.get("days")) || 14))

  const busy = await busyBetween(new Date(now.getTime() - 86_400_000), new Date(now.getTime() + (settings.maxDaysAhead + 3) * 86_400_000))
  const out: { date: string; slots: string[] }[] = []
  for (let i = 0; i < days; i++) {
    const date = addDays(from, i)
    const slots = slotsForDate(settings, offer.durationMin, date, now, busy).map((s) => s.toISOString())
    out.push({ date, slots })
  }
  return NextResponse.json({ timezone: settings.timezone, days: out }, { headers: { "Cache-Control": "no-store" } })
}
