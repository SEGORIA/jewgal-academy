import { baseDb } from "./db"
import { normalizeEventos, localizeEvento, type EventoItem } from "./eventos"
import { buildEmailHtml } from "./email-html"
import { sendEmail, isEmailConfigured } from "./email"
import { createNotification } from "./notifications"

/** Reservas de eventos desde el sitio: cupo, lista de espera y correos. */

export async function getEventoById(eventId: string): Promise<EventoItem | null> {
  try {
    const s = await baseDb.siteSetting.findUnique({ where: { key: "eventos" } })
    if (!s?.value) return null
    return normalizeEventos(JSON.parse(s.value)).upcoming.find((e) => e.id === eventId) ?? null
  } catch {
    return null
  }
}

/** ¿Se puede reservar todavía? (el evento no pasó: se acepta hasta el final del día del evento). */
export function isOpenForRegistration(ev: EventoItem, now = new Date()): boolean {
  if (!ev.active || !ev.registration) return false
  const day = ev.datetime.slice(0, 10)
  return day >= now.toISOString().slice(0, 10)
}

export type RegisterInput = { event: EventoItem; name: string; email: string; phone?: string; notes?: string; locale: string }
export type RegisterResult = { status: "confirmed" | "waitlist"; already: boolean; id: string }

/**
 * Anota una reserva. Se hace dentro de una transacción con un candado, así dos personas que reservan a la vez no pueden
 * pasarse del cupo. Una persona (correo) tiene una sola reserva por evento: si ya tenía, se devuelve la que estaba.
 */
export async function registerForEvent(input: RegisterInput): Promise<RegisterResult> {
  const { event } = input
  const email = input.email.trim().toLowerCase()
  return baseDb.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${"event:" + event.id}))`
    const existing = await tx.eventRegistration.findUnique({ where: { eventId_email: { eventId: event.id, email } } })
    if (existing && existing.status !== "cancelled") return { status: existing.status as "confirmed" | "waitlist", already: true, id: existing.id }

    const taken = event.capacity ? await tx.eventRegistration.count({ where: { eventId: event.id, status: "confirmed" } }) : 0
    const status: "confirmed" | "waitlist" = event.capacity && taken >= event.capacity ? "waitlist" : "confirmed"
    const data = { eventTitle: event.title, name: input.name.trim(), phone: input.phone?.trim() || null, notes: input.notes?.trim() || null, status, locale: input.locale }
    const row = existing
      ? await tx.eventRegistration.update({ where: { id: existing.id }, data })
      : await tx.eventRegistration.create({ data: { eventId: event.id, email, ...data } })
    return { status, already: false, id: row.id }
  })
}

const fmtDate = (datetime: string, locale: string) => {
  const [d, t] = datetime.split("T")
  const [y, m, day] = d.split("-").map(Number)
  const months = locale === "en"
    ? ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    : ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
  return locale === "en" ? `${months[m - 1]} ${day}, ${y} · ${t}` : `${day} de ${months[m - 1]} de ${y} · ${t}`
}

/** Correo a la persona que reservó (confirmada o en lista de espera) y aviso a administración. Nunca debe romper la reserva. */
export async function sendRegistrationEmails(args: { event: EventoItem; name: string; email: string; status: "confirmed" | "waitlist"; locale: string }) {
  const { status, locale } = args
  const ev = localizeEvento(args.event, locale)
  const en = locale === "en"
  const first = args.name.trim().split(/\s+/)[0] || args.name
  const when = fmtDate(ev.datetime, locale)

  if (isEmailConfigured()) {
    const subject = status === "confirmed"
      ? (en ? `You're registered: ${ev.title}` : `Tu lugar está reservado: ${ev.title}`)
      : (en ? `You're on the waitlist: ${ev.title}` : `Estás en la lista de espera: ${ev.title}`)
    const body = status === "confirmed"
      ? (en
        ? `Hi ${first},\n\nYour spot is reserved for ${ev.title}.\n\nWhen: ${when}\nWhere: ${ev.location}\n\nWe'll write to you with any details before the event. If you can't make it, just reply to this message so we can free your spot.\n\nDevora Benchimol · Jewgal Academy`
        : `Hola ${first},\n\nTu lugar está reservado para ${ev.title}.\n\nCuándo: ${when}\nDónde: ${ev.location}\n\nTe escribiremos con los detalles antes del evento. Si no podés asistir, respondé este mensaje para liberar tu lugar.\n\nDevora Benchimol · Jewgal Academy`)
      : (en
        ? `Hi ${first},\n\n${ev.title} is currently full, so we added you to the waitlist. If a spot opens up we'll write to you right away.\n\nWhen: ${when}\nWhere: ${ev.location}\n\nDevora Benchimol · Jewgal Academy`
        : `Hola ${first},\n\n${ev.title} está completo por ahora, así que te anotamos en la lista de espera. Si se libera un lugar te escribimos enseguida.\n\nCuándo: ${when}\nDónde: ${ev.location}\n\nDevora Benchimol · Jewgal Academy`)
    const r = await sendEmail({ to: args.email, subject, text: body, html: buildEmailHtml(body) })
    if (!r.ok) console.error("[eventos] el correo de reserva no salió:", r.error)
  }

  const label = status === "confirmed" ? "reserva confirmada" : "lista de espera"
  await createNotification({
    type: "event_registration",
    message: `Nueva ${label}: ${args.name} (${args.email}) — "${args.event.title}".`,
    metadata: { email: args.email, eventId: args.event.id, eventTitle: args.event.title, status },
  }).catch((e) => console.error("[eventos] notificación:", e))
}

/** Aviso a quien estaba en lista de espera y ahora tiene lugar (lo dispara el panel). */
export async function sendPromotionEmail(args: { event: EventoItem | null; eventTitle: string; name: string; email: string; locale: string }) {
  if (!isEmailConfigured()) return
  const en = args.locale === "en"
  const ev = args.event ? localizeEvento(args.event, args.locale) : null
  const title = ev?.title ?? args.eventTitle
  const first = args.name.trim().split(/\s+/)[0] || args.name
  const body = en
    ? `Hi ${first},\n\nGood news: a spot opened up and your place for ${title} is now confirmed.${ev ? `\n\nWhen: ${fmtDate(ev.datetime, "en")}\nWhere: ${ev.location}` : ""}\n\nDevora Benchimol · Jewgal Academy`
    : `Hola ${first},\n\nBuenas noticias: se liberó un lugar y tu reserva para ${title} quedó confirmada.${ev ? `\n\nCuándo: ${fmtDate(ev.datetime, "es")}\nDónde: ${ev.location}` : ""}\n\nDevora Benchimol · Jewgal Academy`
  const r = await sendEmail({ to: args.email, subject: en ? `Your spot is confirmed: ${title}` : `Tu lugar está confirmado: ${title}`, text: body, html: buildEmailHtml(body) })
  if (!r.ok) console.error("[eventos] correo de lugar liberado:", r.error)
}
