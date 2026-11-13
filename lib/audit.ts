import { AsyncLocalStorage } from "node:async_hooks"

/**
 * Registro de auditoría automático.
 *
 * Cuando una ruta del panel pasa por `adminGuard`, se guarda quién es la persona (AsyncLocalStorage) y
 * lib/db.ts registra en AuditLog cada creación, edición o eliminación de los modelos de AUDITED_MODELS:
 * quién, qué registro y los valores de antes y después. Desde el panel de Historial se puede volver
 * a un valor anterior o restaurar un registro eliminado.
 */
export type Actor = { id: string; name: string; role: string }
// Un único almacén por proceso: Next puede evaluar este módulo más de una vez (un bundle por ruta, recarga en
// caliente), y el cliente de base de datos —cacheado en globalThis— tiene que ver al mismo "actor" que la ruta.
const g = globalThis as unknown as { __jewgalActorStore?: AsyncLocalStorage<Actor> }
export const actorStore: AsyncLocalStorage<Actor> = (g.__jewgalActorStore ??= new AsyncLocalStorage<Actor>())
export const setActor = (actor: Actor) => actorStore.enterWith(actor)
export const getActor = () => actorStore.getStore()

/** Modelos que se registran y la forma de reconocer su registro (campo único). */
export const AUDITED_MODELS: Record<string, { key: "id" | "key"; restorable: boolean; label: string }> = {
  Course: { key: "id", restorable: true, label: "Programa" },
  CourseModule: { key: "id", restorable: true, label: "Módulo" },
  Material: { key: "id", restorable: true, label: "Material" },
  LiveSession: { key: "id", restorable: true, label: "Clase en vivo" },
  ExclusiveResource: { key: "id", restorable: true, label: "Recurso exclusivo" },
  Post: { key: "id", restorable: true, label: "Artículo del blog" },
  Accreditation: { key: "id", restorable: true, label: "Acreditación" },
  ForumCategory: { key: "id", restorable: true, label: "Categoría de comunidad" },
  Testimonial: { key: "id", restorable: true, label: "Testimonio" },
  SiteSetting: { key: "key", restorable: true, label: "Ajuste del sitio" },
  User: { key: "id", restorable: false, label: "Usuario" },
  Enrollment: { key: "id", restorable: true, label: "Inscripción" },
  Payment: { key: "id", restorable: true, label: "Pago" },
  Announcement: { key: "id", restorable: false, label: "Aviso" },
  Respaldo: { key: "id", restorable: false, label: "Respaldo" },
  Alumno: { key: "id", restorable: false, label: "Vista de alumno" },
  ContactMessage: { key: "id", restorable: true, label: "Mensaje de contacto" },
}

/** Campos que nunca se guardan en el historial. */
export const SENSITIVE_FIELDS = new Set(["password"])

/** Cambios que son puro orden o marcas de tiempo: no se registran para no llenar el historial. */
export const NOISE_FIELDS = new Set(["order", "updatedAt", "lastLoginAt"])

export function sanitizeRecord<T extends Record<string, unknown>>(rec: T | null | undefined): Record<string, unknown> | null {
  if (!rec) return null
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(rec)) {
    if (SENSITIVE_FIELDS.has(k)) continue
    out[k] = v instanceof Date ? v.toISOString() : v
  }
  return out
}

export function recordLabel(rec: Record<string, unknown> | null | undefined): string | null {
  if (!rec) return null
  const v = rec.title ?? rec.name ?? rec.key ?? rec.email ?? rec.code ?? rec.message ?? rec.id
  return typeof v === "string" ? v.slice(0, 160) : null
}

/** Reduce un texto largo para mostrarlo en pantalla (no se usa para restaurar). */
export function clip(value: unknown, max = 600): unknown {
  if (typeof value === "string" && value.length > max) return value.slice(0, max) + `… (+${value.length - max} caracteres)`
  return value
}
