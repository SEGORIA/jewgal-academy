import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { adminGuard } from "@/lib/admin-guard"
import { db } from "@/lib/db"
import { runAfterResponse } from "@/lib/background"
import { getEventoById, sendPromotionEmail } from "@/lib/event-registration"

export const dynamic = "force-dynamic"

/** Reservas de un evento (`?eventId=`) o, sin parámetro, cuántas hay de cada evento. */
export async function GET(req: NextRequest) {
  const g = await adminGuard("sitio")
  if (!g.ok) return g.response
  g.enter()

  const eventId = req.nextUrl.searchParams.get("eventId")
  try {
    if (!eventId) {
      const groups = await db.eventRegistration.groupBy({ by: ["eventId", "status"], _count: { _all: true } })
      const counts: Record<string, { confirmed: number; waitlist: number }> = {}
      for (const r of groups) {
        const c = (counts[r.eventId] ??= { confirmed: 0, waitlist: 0 })
        if (r.status === "confirmed") c.confirmed = r._count._all
        if (r.status === "waitlist") c.waitlist = r._count._all
      }
      return NextResponse.json({ counts })
    }
    const registrations = await db.eventRegistration.findMany({ where: { eventId }, orderBy: { createdAt: "asc" } })
    return NextResponse.json({ registrations })
  } catch (e) {
    console.error("[admin/eventos/registrations GET]", e)
    return NextResponse.json({ error: "No se pudieron cargar las reservas" }, { status: 500 })
  }
}

const patchSchema = z.object({ id: z.string().min(1), status: z.enum(["confirmed", "waitlist", "cancelled"]) })

/** Cambia el estado de una reserva. Pasar de lista de espera a confirmada le avisa a la persona por correo. */
export async function PATCH(req: NextRequest) {
  const g = await adminGuard("sitio")
  if (!g.ok) return g.response
  g.enter()

  const parsed = patchSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  const { id, status } = parsed.data

  const existing = await db.eventRegistration.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })
  const updated = await db.eventRegistration.update({ where: { id }, data: { status } })

  if (existing.status === "waitlist" && status === "confirmed") {
    runAfterResponse(async () => sendPromotionEmail({ event: await getEventoById(existing.eventId), eventTitle: existing.eventTitle, name: existing.name, email: existing.email, locale: existing.locale }), "aviso de lugar liberado")
  }
  return NextResponse.json({ ok: true, registration: updated })
}

export async function DELETE(req: NextRequest) {
  const g = await adminGuard("sitio")
  if (!g.ok) return g.response
  g.enter()
  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Falta la reserva" }, { status: 400 })
  const deleted = await db.eventRegistration.delete({ where: { id } }).catch(() => null)
  if (!deleted) return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })
  return NextResponse.json({ ok: true })
}
