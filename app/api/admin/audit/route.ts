import { NextRequest, NextResponse } from "next/server"
import type { Prisma } from "@prisma/client"
import { adminGuard } from "@/lib/admin-guard"
import { baseDb } from "@/lib/db"
import { AUDITED_MODELS, clip } from "@/lib/audit"

export const dynamic = "force-dynamic"

const MODEL_LABELS = Object.entries(AUDITED_MODELS).map(([model, m]) => ({ model, label: m.label, restorable: m.restorable }))

/** Reduce los textos largos de un registro para el listado (el detalle completo se pide con ?id=). */
function clipRecord(rec: unknown) {
  if (!rec || typeof rec !== "object") return rec ?? null
  return Object.fromEntries(Object.entries(rec as Record<string, unknown>).map(([k, v]) => [k, clip(v, 400)]))
}

/**
 * Historial de cambios del panel: quién hizo qué y cuándo.
 * Filtros: model, actor, action, q (texto del registro), view=trash (eliminados sin restaurar), before (fecha, para paginar).
 * Con ?id= devuelve un cambio completo.
 */
export async function GET(req: NextRequest) {
  const g = await adminGuard("superadmin")
  if (!g.ok) return g.response
  g.enter()
  const sp = req.nextUrl.searchParams

  const one = sp.get("id")
  if (one) {
    const e = await baseDb.auditLog.findUnique({ where: { id: one } })
    if (!e) return NextResponse.json({ error: "No se encontró el cambio" }, { status: 404 })
    return NextResponse.json({ entry: e })
  }

  const limit = Math.min(Math.max(Number(sp.get("limit")) || 40, 1), 100)
  const where: Prisma.AuditLogWhereInput = {}
  if (sp.get("model")) where.model = sp.get("model")!
  if (sp.get("actor")) where.actorId = sp.get("actor")!
  if (sp.get("action")) where.action = sp.get("action")!
  if (sp.get("q")) where.label = { contains: sp.get("q")!, mode: "insensitive" }
  if (sp.get("view") === "trash") { where.action = "delete"; where.restoredAt = null; where.model = sp.get("model") || { in: MODEL_LABELS.filter((m) => m.restorable).map((m) => m.model) } }
  const before = sp.get("before")
  if (before && !Number.isNaN(Date.parse(before))) where.createdAt = { lt: new Date(before) }

  const rows = await baseDb.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, take: limit + 1 })
  const hasMore = rows.length > limit
  const items = rows.slice(0, limit).map((r) => ({
    id: r.id, createdAt: r.createdAt, actorId: r.actorId, actorName: r.actorName, actorRole: r.actorRole,
    action: r.action, model: r.model, recordId: r.recordId, label: r.label, restoredAt: r.restoredAt,
    before: clipRecord(r.before), after: clipRecord(r.after),
  }))

  const actors = await baseDb.auditLog.groupBy({ by: ["actorId", "actorName"], where: { actorId: { not: null } }, _count: { _all: true } })
  return NextResponse.json({
    items, hasMore, models: MODEL_LABELS,
    actors: actors.map((a) => ({ id: a.actorId, name: a.actorName })),
  })
}
