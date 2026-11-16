import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { rateLimit, getClientIp } from "@/lib/security"
import { runAfterResponse } from "@/lib/background"
import { getEventoById, isOpenForRegistration, registerForEvent, sendRegistrationEmails } from "@/lib/event-registration"

const schema = z.object({
  eventId: z.string().min(1).max(60),
  name: z.string().trim().min(2, "Escribí tu nombre.").max(120),
  email: z.string().trim().toLowerCase().email("Revisá el correo electrónico.").max(200),
  phone: z.string().trim().max(40).optional(),
  notes: z.string().trim().max(500).optional(),
  locale: z.enum(["es", "en"]).default("es"),
})

/** Reserva de un lugar en un evento (con cupo y lista de espera). */
export async function POST(req: NextRequest) {
  const rl = rateLimit(`event-register:${getClientIp(req)}`, 6, 60_000)
  if (!rl.ok) return NextResponse.json({ error: "Demasiados intentos. Esperá un momento." }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 })
  const input = parsed.data

  const byEmail = rateLimit(`event-register-mail:${input.eventId}:${input.email}`, 3, 60 * 60_000)
  if (!byEmail.ok) return NextResponse.json({ error: "Ya enviaste varios pedidos con este correo. Probá más tarde." }, { status: 429 })

  const event = await getEventoById(input.eventId)
  if (!event || !isOpenForRegistration(event)) return NextResponse.json({ error: "Las reservas para este evento están cerradas." }, { status: 404 })

  try {
    const r = await registerForEvent({ event, name: input.name, email: input.email, phone: input.phone, notes: input.notes, locale: input.locale })
    if (!r.already) {
      runAfterResponse(() => sendRegistrationEmails({ event, name: input.name, email: input.email, status: r.status, locale: input.locale }), "correo de reserva")
    }
    return NextResponse.json({ ok: true, status: r.status, already: r.already })
  } catch (e) {
    console.error("[eventos/register]", e)
    return NextResponse.json({ error: "No se pudo guardar la reserva. Probá de nuevo." }, { status: 500 })
  }
}
