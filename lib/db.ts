import { PrismaClient } from "@prisma/client"
import { AUDITED_MODELS, NOISE_FIELDS, getActor, recordLabel, sanitizeRecord } from "./audit"

const WRITE_OPS = new Set(["create", "update", "upsert", "delete", "createMany", "updateMany", "deleteMany"])
const MAX_BEFORE_CHARS = 500_000 // tope de seguridad por campo guardado en el historial

const lower = (m: string) => m.charAt(0).toLowerCase() + m.slice(1)
const isPlain = (v: unknown) => v !== null && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date)

/** Campos escalares que una operación `data` modifica (ignora operaciones de relación e incrementos). */
function changedKeys(data: Record<string, unknown> | undefined): { keys: string[]; values: Record<string, unknown> } {
  const keys: string[] = []
  const values: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(data ?? {})) {
    if (isPlain(v)) {
      if ("set" in (v as object)) { keys.push(k); values[k] = (v as { set: unknown }).set }
      continue
    }
    keys.push(k); values[k] = v
  }
  return { keys, values }
}

const normalize = (v: unknown) => JSON.stringify(v instanceof Date ? v.toISOString() : v ?? null)

function pick(rec: Record<string, unknown> | null, keys: string[]) {
  const out: Record<string, unknown> = {}
  if (!rec) return out
  for (const k of keys) if (k in rec) {
    const v = rec[k]
    out[k] = typeof v === "string" && v.length > MAX_BEFORE_CHARS ? v.slice(0, MAX_BEFORE_CHARS) : v
  }
  return out
}

function createClient() {
  const base = new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["error"] : [] })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- delegados de Prisma elegidos por nombre de modelo
  const delegate = (model: string) => (base as unknown as Record<string, any>)[lower(model)]

  async function log(entry: {
    action: string; model: string; recordId?: string | null; label?: string | null
    before?: Record<string, unknown> | null; after?: Record<string, unknown> | null
  }) {
    const actor = getActor()
    if (!actor) return
    try {
      await base.auditLog.create({
        data: {
          actorId: actor.id, actorName: actor.name, actorRole: actor.role,
          action: entry.action, model: entry.model, recordId: entry.recordId ?? null, label: entry.label ?? null,
          ...(entry.before ? { before: entry.before as never } : {}),
          ...(entry.after ? { after: entry.after as never } : {}),
        },
      })
    } catch (e) {
      console.error("[audit] no se pudo registrar:", e)
    }
  }

  const extended = base.$extends({
    name: "audit",
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const meta = AUDITED_MODELS[model]
          if (!meta || !WRITE_OPS.has(operation) || !getActor()) return query(args)

          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- los argumentos dependen del modelo y de la operación
          const a = args as Record<string, any>
          let before: Record<string, unknown> | null = null
          if (["update", "delete", "upsert"].includes(operation) && a.where) {
            try { before = sanitizeRecord(await delegate(model).findUnique({ where: a.where })) } catch { /* se registra sin "antes" */ }
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- el resultado depende del modelo
          const result = (await query(args)) as Record<string, any> | { count: number } | null

          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rec = result && !("count" in result && Object.keys(result).length === 1) ? (result as Record<string, any>) : null
            const id = rec ? (rec[meta.key] as string | undefined) : undefined

            if (operation === "create" && rec) {
              await log({ action: "create", model, recordId: id, label: recordLabel(rec), after: sanitizeRecord(rec) })
            } else if (operation === "delete" && rec) {
              await log({ action: "delete", model, recordId: id, label: recordLabel(before ?? rec), before: before ?? sanitizeRecord(rec) })
            } else if ((operation === "update" || operation === "upsert") && rec) {
              if (operation === "upsert" && !before) {
                await log({ action: "create", model, recordId: id, label: recordLabel(rec), after: sanitizeRecord(rec) })
              } else {
                const { keys } = changedKeys((operation === "upsert" ? a.update : a.data) as Record<string, unknown>)
                const meaningful = keys.filter((k) => !NOISE_FIELDS.has(k))
                if (meaningful.length && before) {
                  const afterRec = sanitizeRecord(rec)
                  const b = pick(before, meaningful), f = pick(afterRec, meaningful)
                  const changed = meaningful.filter((k) => normalize(b[k]) !== normalize(f[k]))
                  if (changed.length) {
                    await log({ action: "update", model, recordId: id, label: recordLabel(afterRec), before: pick(before, changed), after: pick(afterRec, changed) })
                  }
                }
              }
            } else if (operation.endsWith("Many")) {
              const { keys } = changedKeys(a.data as Record<string, unknown>)
              const onlyNoise = operation === "updateMany" && keys.length > 0 && keys.every((k) => NOISE_FIELDS.has(k))
              if (!onlyNoise) {
                const count = (result as { count?: number } | null)?.count ?? 0
                await log({ action: "bulk", model, label: `${operation} · ${count} registro(s)`, after: operation === "updateMany" ? { campos: keys } : null })
              }
            }
          } catch (e) {
            console.error("[audit] error al preparar el registro:", e)
          }
          return result
        },
      },
    },
  })

  return { db: extended, base }
}

type Clients = ReturnType<typeof createClient>
const globalForPrisma = globalThis as unknown as { prismaAudited?: Clients }

const clients: Clients = globalForPrisma.prismaAudited ?? createClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prismaAudited = clients

/** Cliente de uso normal: registra en el historial lo que hace el panel de administración. */
export const db = clients.db
/** Cliente sin auditoría: solo para el propio historial (restaurar) y tareas internas. */
export const baseDb = clients.base

/** Tipo del cliente (también sirve para el cliente de una transacción interactiva). */
export type DbClient = typeof db
export type DbTx = Parameters<Parameters<DbClient["$transaction"]>[0]>[0]
