import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { adminGuard } from "@/lib/admin-guard"
import { db, baseDb } from "@/lib/db"
import { runAfterResponse } from "@/lib/background"
import { getCoachingSettings, sendBookingEmail } from "@/lib/coaching-server"

type Ctx = { params: Promise<{ id: string }> }

const patchSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]).optional(),
  meetingUrl: z.string().trim().max(500).refine((v) => v === "" || /^https:\/\/\S+$/i.test(v), "El enlace de la videollamada tiene que empezar con https://").optional(),
  adminNote: z.string().trim().max(2000).optional(),
  /** Avisar por correo a la persona (confirmada / cancelada). Por defecto sí. */
  notify: z.boolean().default(true),
})

/** Confirmar, cancelar o completar una reserva; guardar el enlace de la videollamada y notas internas. */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const g = await adminGuard("alumnos")
  if (!g.ok) return g.response
  g.enter()
  const { id } = await params

  const parsed = patchSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
  const { status, meetingUrl, adminNote, notify } = parsed.data

  const existing = await db.coachingBooking.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })
  const settings = await getCoachingSettings()

  const data: Record<string, unknown> = {}
  if (meetingUrl !== undefined) data.meetingUrl = meetingUrl || null
  if (adminNote !== undefined) data.adminNote = adminNote || null

  if (status && status !== existing.status) {
    data.status = status
    if (status === "cancelled") data.slotKey = null
    else if (!existing.slotKey) {
      // Se reabre una reserva cancelada: el turno tiene que seguir libre.
      const clash = await baseDb.coachingBooking.count({ where: { id: { not: id }, status: { in: ["pending", "confirmed"] }, startsAt: { lt: existing.endsAt }, endsAt: { gt: existing.startsAt } } })
      if (clash > 0) return NextResponse.json({ error: "Ese horario ya lo ocupa otra reserva." }, { status: 409 })
      data.slotKey = existing.startsAt.toISOString()
    }
    if (status === "confirmed" && !(data.meetingUrl ?? existing.meetingUrl) && settings.meetingUrl) data.meetingUrl = settings.meetingUrl
  }

  const booking = await db.coachingBooking.update({ where: { id }, data })
  if (notify && status && status !== existing.status && (status === "confirmed" || status === "cancelled")) {
    runAfterResponse(() => sendBookingEmail(status, booking, settings.timezone), "correo de reserva")
  }
  return NextResponse.json({ ok: true, booking })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const g = await adminGuard("alumnos")
  if (!g.ok) return g.response
  g.enter()
  const { id } = await params
  const deleted = await db.coachingBooking.delete({ where: { id } }).catch(() => null)
  if (!deleted) return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })
  return NextResponse.json({ ok: true })
}
