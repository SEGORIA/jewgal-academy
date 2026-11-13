import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { adminGuard } from "@/lib/admin-guard"
import { db } from "@/lib/db"
import { isEmailConfigured } from "@/lib/email"

export const dynamic = "force-dynamic"

/** Mensajes recibidos desde el formulario de contacto del sitio. */
export async function GET(req: NextRequest) {
  const g = await adminGuard("comunicaciones")
  if (!g.ok) return g.response
  g.enter()
  const status = req.nextUrl.searchParams.get("status")
  const where = status && ["new", "read", "replied", "archived"].includes(status) ? { status } : {}
  const [messages, counts] = await Promise.all([
    db.contactMessage.findMany({ where, orderBy: { createdAt: "desc" }, take: 300 }),
    db.contactMessage.groupBy({ by: ["status"], _count: { _all: true } }),
  ])
  return NextResponse.json({
    messages,
    counts: Object.fromEntries(counts.map((c) => [c.status, c._count._all])),
    emailConfigured: isEmailConfigured(),
  })
}

const patchSchema = z.object({ ids: z.array(z.string().min(1)).min(1).max(200), status: z.enum(["new", "read", "replied", "archived"]) })

/** Cambia el estado de uno o varios mensajes (leído, sin leer, archivado). */
export async function PATCH(req: NextRequest) {
  const g = await adminGuard("comunicaciones")
  if (!g.ok) return g.response
  g.enter()
  const parsed = patchSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  const r = await db.contactMessage.updateMany({ where: { id: { in: parsed.data.ids } }, data: { status: parsed.data.status } })
  return NextResponse.json({ ok: true, updated: r.count })
}

const delSchema = z.object({ id: z.string().min(1) })

/** Elimina un mensaje (queda registrado en el Historial y se puede restaurar desde allí). */
export async function DELETE(req: NextRequest) {
  const g = await adminGuard("comunicaciones")
  if (!g.ok) return g.response
  g.enter()
  const parsed = delSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  try {
    await db.contactMessage.delete({ where: { id: parsed.data.id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "No se encontró el mensaje" }, { status: 404 })
  }
}
