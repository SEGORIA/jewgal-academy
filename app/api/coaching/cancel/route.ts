import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { baseDb } from "@/lib/db"
import { rateLimit, getClientIp } from "@/lib/security"
import { runAfterResponse } from "@/lib/background"
import { getCoachingSettings, notifyBooking, verifyBookingToken } from "@/lib/coaching-server"

const schema = z.object({ id: z.string().min(1).max(60), token: z.string().min(10).max(200) })

/** Cancelación por quien reservó, con el enlace firmado que recibió por correo (sin necesidad de cuenta). Libera el turno. */
export async function POST(req: NextRequest) {
  const rl = rateLimit(`coaching-cancel:${getClientIp(req)}`, 10, 60_000)
  if (!rl.ok) return NextResponse.json({ error: "Demasiados intentos." }, { status: 429 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success || !verifyBookingToken(parsed.data.id, parsed.data.token)) return NextResponse.json({ error: "El enlace no es válido." }, { status: 400 })

  const booking = await baseDb.coachingBooking.findUnique({ where: { id: parsed.data.id } })
  if (!booking) return NextResponse.json({ error: "No encontramos la reserva." }, { status: 404 })
  if (booking.status === "cancelled") return NextResponse.json({ ok: true, already: true })
  if (booking.status === "completed") return NextResponse.json({ error: "La sesión ya se realizó." }, { status: 400 })
  if (booking.startsAt.getTime() < Date.now()) return NextResponse.json({ error: "La sesión ya pasó." }, { status: 400 })

  const updated = await baseDb.coachingBooking.update({ where: { id: booking.id }, data: { status: "cancelled", slotKey: null } })
  const settings = await getCoachingSettings()
  runAfterResponse(() => notifyBooking("cancelled", updated, settings.timezone), "cancelación de coaching")
  return NextResponse.json({ ok: true })
}
