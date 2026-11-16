import { createHmac, timingSafeEqual } from "crypto"
import type { CoachingBooking, CoachingOffer } from "@prisma/client"
import { baseDb } from "./db"
import { COACHING_SETTINGS_KEY, normalizeCoachingSettings, slotsForDate, dateInZone, type CoachingSettings, type Interval } from "./coaching"
import { buildEmailHtml } from "./email-html"
import { isEmailConfigured, sendEmail } from "./email"
import { createNotification } from "./notifications"
import { SITE_URL } from "./site-url"

/** Reservas de Coaching 1:1 (servidor): configuración, creación segura de reservas y correos. */

export async function getCoachingSettings(): Promise<CoachingSettings> {
  try {
    const s = await baseDb.siteSetting.findUnique({ where: { key: COACHING_SETTINGS_KEY } })
    return normalizeCoachingSettings(s?.value ? JSON.parse(s.value) : null)
  } catch {
    return normalizeCoachingSettings(null)
  }
}

export const localizeOffer = (o: CoachingOffer, locale: string) => ({
  id: o.id,
  title: (locale === "en" && o.titleEn?.trim()) || o.title,
  description: (locale === "en" && o.descriptionEn?.trim()) || o.description,
  durationMin: o.durationMin,
  price: o.price,
  currency: o.currency,
})

/** Reservas que ocupan agenda (pendientes y confirmadas) que se cruzan con el rango. */
export async function busyBetween(from: Date, to: Date): Promise<Interval[]> {
  const rows = await baseDb.coachingBooking.findMany({
    where: { status: { in: ["pending", "confirmed"] }, startsAt: { lt: to }, endsAt: { gt: from } },
    select: { startsAt: true, endsAt: true },
  })
  return rows.map((r) => ({ start: r.startsAt, end: r.endsAt }))
}

/* ── Enlace firmado para cancelar (sin cuenta): HMAC del id con el secreto del sitio ── */
const secret = () => process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "jewgal-dev-secret"
export const bookingToken = (id: string) => createHmac("sha256", secret()).update(`coaching-booking:${id}`).digest("base64url")
export function verifyBookingToken(id: string, token: string): boolean {
  const a = Buffer.from(bookingToken(id))
  const b = Buffer.from(token ?? "")
  return a.length === b.length && timingSafeEqual(a, b)
}
export const cancelUrl = (b: Pick<CoachingBooking, "id" | "locale">) => `${SITE_URL}${b.locale === "en" ? "/en" : ""}/coaching-1-1/cancelar?id=${b.id}&t=${bookingToken(b.id)}`

export class BookingError extends Error {
  constructor(message: string, public status = 400, public code = "error") { super(message) }
}

export type NewBooking = { offer: CoachingOffer; startsAt: Date; name: string; email: string; phone?: string; notes?: string; locale: string; settings: CoachingSettings }

/**
 * Crea la reserva. Todo ocurre en una transacción con un candado: la disponibilidad se vuelve a verificar con la agenda real
 * justo antes de guardar, así dos personas no pueden quedarse con el mismo turno (ni con turnos que se pisan).
 */
export async function createBooking(input: NewBooking): Promise<CoachingBooking> {
  const { offer, startsAt, settings } = input
  const endsAt = new Date(startsAt.getTime() + offer.durationMin * 60_000)
  const email = input.email.trim().toLowerCase()
  const date = dateInZone(startsAt, settings.timezone)
  const margin = (settings.bufferMinutes + 24 * 60) * 60_000

  return baseDb.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('coaching_booking'))`
    const rows = await tx.coachingBooking.findMany({
      where: { status: { in: ["pending", "confirmed"] }, startsAt: { lt: new Date(endsAt.getTime() + margin) }, endsAt: { gt: new Date(startsAt.getTime() - margin) } },
      select: { startsAt: true, endsAt: true },
    })
    const free = slotsForDate(settings, offer.durationMin, date, new Date(), rows.map((r) => ({ start: r.startsAt, end: r.endsAt })))
    if (!free.some((s) => s.getTime() === startsAt.getTime())) throw new BookingError("Ese horario ya no está disponible. Elegí otro.", 409, "slot_taken")

    // Una persona no acumula varias sesiones pendientes/confirmadas en el mismo día.
    const sameDay = await tx.coachingBooking.count({ where: { email, status: { in: ["pending", "confirmed"] }, startsAt: { gte: new Date(startsAt.getTime() - 12 * 3_600_000), lte: new Date(startsAt.getTime() + 12 * 3_600_000) } } })
    if (sameDay > 0) throw new BookingError("Ya tenés una reserva ese día con este correo.", 409, "same_day")

    const confirmed = settings.autoConfirm
    return tx.coachingBooking.create({
      data: {
        offerId: offer.id, offerTitle: offer.title, name: input.name.trim(), email, phone: input.phone?.trim() || null, notes: input.notes?.trim() || null,
        startsAt, endsAt, status: confirmed ? "confirmed" : "pending", slotKey: startsAt.toISOString(),
        meetingUrl: confirmed && settings.meetingUrl ? settings.meetingUrl : null, locale: input.locale === "en" ? "en" : "es",
      },
    })
  })
}

/* ── Correos ── */

const fmtWhen = (d: Date, tz: string, locale: string) =>
  new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-ES", { timeZone: tz, dateStyle: "full", timeStyle: "short" }).format(d) + ` (${tz.replace(/_/g, " ")})`

export type BookingEmailKind = "received" | "confirmed" | "cancelled"

/** Correo a quien reservó. `received` = recibida (pendiente), `confirmed` = confirmada (con el enlace de la videollamada), `cancelled` = cancelada por el equipo. */
export async function sendBookingEmail(kind: BookingEmailKind, b: CoachingBooking, tz: string) {
  if (!isEmailConfigured()) return
  const en = b.locale === "en"
  const first = b.name.trim().split(/\s+/)[0] || b.name
  const when = fmtWhen(b.startsAt, tz, b.locale)
  const link = b.meetingUrl ? (en ? `\n\nVideo call: ${b.meetingUrl}` : `\n\nVideollamada: ${b.meetingUrl}`) : ""
  const cancel = kind === "cancelled" ? "" : (en ? `\n\nNeed to cancel? Use this link: ${cancelUrl(b)}` : `\n\n¿Necesitás cancelar? Usá este enlace: ${cancelUrl(b)}`)
  const sign = "\n\nDevora Benchimol · Jewgal Academy"
  let subject: string, text: string
  if (kind === "received") {
    subject = en ? `We received your request: ${b.offerTitle}` : `Recibimos tu solicitud: ${b.offerTitle}`
    text = en
      ? `Hi ${first},\n\nWe received your request for ${b.offerTitle} on ${when}. We'll confirm it shortly and send you the video call link.${cancel}${sign}`
      : `Hola ${first},\n\nRecibimos tu solicitud de ${b.offerTitle} para el ${when}. La confirmaremos a la brevedad y te enviaremos el enlace de la videollamada.${cancel}${sign}`
  } else if (kind === "confirmed") {
    subject = en ? `Your session is confirmed: ${b.offerTitle}` : `Tu sesión está confirmada: ${b.offerTitle}`
    text = en
      ? `Hi ${first},\n\nYour session of ${b.offerTitle} is confirmed for ${when}.${link}${cancel}${sign}`
      : `Hola ${first},\n\nTu sesión de ${b.offerTitle} está confirmada para el ${when}.${link}${cancel}${sign}`
  } else {
    subject = en ? `Your session was cancelled: ${b.offerTitle}` : `Tu sesión fue cancelada: ${b.offerTitle}`
    text = en
      ? `Hi ${first},\n\nYour session of ${b.offerTitle} on ${when} was cancelled. If you'd like to book another time, you can do it at ${SITE_URL}/en/coaching-1-1.${sign}`
      : `Hola ${first},\n\nTu sesión de ${b.offerTitle} del ${when} fue cancelada. Si querés reservar otro horario, podés hacerlo en ${SITE_URL}/coaching-1-1.${sign}`
  }
  const r = await sendEmail({ to: b.email, subject, text, html: buildEmailHtml(text) })
  if (!r.ok) console.error("[coaching] el correo no salió:", r.error)
}

/** Aviso a administración de una reserva nueva o cancelada por el cliente. */
export async function notifyBooking(kind: "new" | "cancelled", b: CoachingBooking, tz: string) {
  const label = kind === "new" ? (b.status === "confirmed" ? "reserva confirmada" : "solicitud pendiente de confirmar") : "reserva cancelada por el cliente"
  await createNotification({
    type: "coaching_booking",
    message: `Coaching 1:1 · ${label}: ${b.name} (${b.email}) — ${b.offerTitle}, ${fmtWhen(b.startsAt, tz, "es")}.`,
    metadata: { bookingId: b.id, email: b.email, status: b.status },
  })
}
