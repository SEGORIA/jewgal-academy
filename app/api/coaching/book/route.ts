import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { baseDb } from "@/lib/db"
import { rateLimit, getClientIp } from "@/lib/security"
import { runAfterResponse } from "@/lib/background"
import { BookingError, createBooking, getCoachingSettings, notifyBooking, sendBookingEmail } from "@/lib/coaching-server"

const schema = z.object({
  offerId: z.string().min(1).max(60),
  startsAt: z.string().refine((v) => !Number.isNaN(new Date(v).getTime()), "Horario inválido"),
  name: z.string().trim().min(2, "Escribí tu nombre.").max(120),
  email: z.string().trim().toLowerCase().email("Revisá el correo electrónico.").max(200),
  phone: z.string().trim().max(40).optional(),
  notes: z.string().trim().max(1000).optional(),
  locale: z.enum(["es", "en"]).default("es"),
})

/** Reserva de una sesión de Coaching 1:1. La disponibilidad se verifica de nuevo en el servidor, con la agenda real. */
export async function POST(req: NextRequest) {
  const rl = rateLimit(`coaching-book:${getClientIp(req)}`, 5, 60_000)
  if (!rl.ok) return NextResponse.json({ error: "Demasiados intentos. Esperá un momento.", code: "rate_limited" }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 })
  const input = parsed.data
  const day = rateLimit(`coaching-book-mail:${input.email}`, 4, 24 * 60 * 60_000)
  if (!day.ok) return NextResponse.json({ error: "Hiciste varios pedidos con este correo. Probá más tarde o escribinos.", code: "rate_limited" }, { status: 429 })

  const settings = await getCoachingSettings()
  if (!settings.enabled) return NextResponse.json({ error: "Las reservas no están disponibles." }, { status: 404 })
  const offer = await baseDb.coachingOffer.findFirst({ where: { id: input.offerId, isActive: true } }).catch(() => null)
  if (!offer) return NextResponse.json({ error: "Esa oferta ya no está disponible." }, { status: 404 })

  try {
    const booking = await createBooking({ offer, startsAt: new Date(input.startsAt), name: input.name, email: input.email, phone: input.phone, notes: input.notes, locale: input.locale, settings })
    runAfterResponse(async () => {
      await sendBookingEmail(booking.status === "confirmed" ? "confirmed" : "received", booking, settings.timezone)
      await notifyBooking("new", booking, settings.timezone)
    }, "reserva de coaching")
    return NextResponse.json({ ok: true, status: booking.status, startsAt: booking.startsAt.toISOString(), timezone: settings.timezone })
  } catch (e) {
    if (e instanceof BookingError) return NextResponse.json({ error: e.message, code: e.code }, { status: e.status })
    console.error("[coaching/book]", e)
    return NextResponse.json({ error: "No se pudo guardar la reserva. Probá de nuevo." }, { status: 500 })
  }
}
