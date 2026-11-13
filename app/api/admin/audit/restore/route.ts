import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { adminGuard } from "@/lib/admin-guard"
import { baseDb } from "@/lib/db"
import { AUDITED_MODELS, recordLabel, sanitizeRecord } from "@/lib/audit"

export const dynamic = "force-dynamic"

const schema = z.object({ id: z.string().min(1), force: z.boolean().optional() })

const lower = (m: string) => m.charAt(0).toLowerCase() + m.slice(1)
const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null)

/** El historial guarda las fechas como texto: se vuelven a convertir a fecha según el modelo. */
function coerce(model: string, data: Record<string, unknown>) {
  const m = Prisma.dmmf.datamodel.models.find((x) => x.name === model)
  const dates = new Set((m?.fields ?? []).filter((f) => f.type === "DateTime").map((f) => f.name))
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(data)) out[k] = dates.has(k) && typeof v === "string" ? new Date(v) : v
  return out
}

/**
 * Restaura un cambio del historial:
 *  · eliminación → vuelve a crear el registro con sus datos de antes (misma identidad)
 *  · edición     → vuelve los campos a su valor anterior (avisa si cambiaron después; hay que confirmar)
 *  · creación    → deshace la creación (elimina el registro)
 * Lo que se restaura queda también anotado en el historial.
 */
export async function POST(req: NextRequest) {
  const g = await adminGuard("superadmin")
  if (!g.ok) return g.response
  g.enter()
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const entry = await baseDb.auditLog.findUnique({ where: { id: parsed.data.id } })
  if (!entry) return NextResponse.json({ error: "No se encontró el cambio" }, { status: 404 })
  const meta = AUDITED_MODELS[entry.model]
  if (!meta?.restorable) return NextResponse.json({ error: `Los cambios en “${meta?.label ?? entry.model}” no se pueden restaurar desde acá.` }, { status: 400 })
  if (entry.restoredAt) return NextResponse.json({ error: "Este cambio ya se restauró." }, { status: 409 })
  if (!entry.recordId || !["create", "update", "delete"].includes(entry.action)) return NextResponse.json({ error: "Este tipo de cambio no se puede restaurar." }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const delegate = (baseDb as any)[lower(entry.model)]
  const where = { [meta.key]: entry.recordId }
  const current = sanitizeRecord(await delegate.findUnique({ where }))
  const before = (entry.before ?? null) as Record<string, unknown> | null
  const after = (entry.after ?? null) as Record<string, unknown> | null

  try {
    let result: Record<string, unknown> | null = null

    if (entry.action === "delete") {
      if (current) return NextResponse.json({ error: "Ese registro ya existe (alguien lo volvió a crear)." }, { status: 409 })
      if (!before) return NextResponse.json({ error: "El historial no guardó los datos de este registro." }, { status: 400 })
      result = sanitizeRecord(await delegate.create({ data: coerce(entry.model, before) }))
    } else if (entry.action === "update") {
      if (!current) return NextResponse.json({ error: "El registro ya no existe, no hay nada que restaurar." }, { status: 404 })
      if (!before) return NextResponse.json({ error: "El historial no guardó los valores anteriores." }, { status: 400 })
      const conflicts = Object.keys(before).filter((k) => after && k in after && !same(current[k], after[k]))
      if (conflicts.length && !parsed.data.force) {
        return NextResponse.json({ conflict: true, fields: conflicts, error: "Este registro cambió después de esta edición. Si lo restaurás, se pisan esos cambios más nuevos." }, { status: 409 })
      }
      result = sanitizeRecord(await delegate.update({ where, data: coerce(entry.model, before) }))
    } else {
      if (!current) return NextResponse.json({ error: "El registro ya no existe." }, { status: 404 })
      await delegate.delete({ where })
      result = null
    }

    await baseDb.auditLog.update({ where: { id: entry.id }, data: { restoredAt: new Date() } })
    await baseDb.auditLog.create({
      data: {
        actorId: g.user.id, actorName: g.user.name, actorRole: g.user.role, action: "restore", model: entry.model, recordId: entry.recordId,
        label: recordLabel(result ?? current) ?? entry.label,
        before: (current ?? Prisma.JsonNull) as Prisma.InputJsonValue, after: (result ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      },
    })
    revalidatePath("/", "layout")
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[audit/restore] falló:", e)
    return NextResponse.json({ error: "No se pudo restaurar: el registro depende de otros que ya no existen (por ejemplo, un programa o un alumno eliminados). Restaurá primero esos." }, { status: 409 })
  }
}
