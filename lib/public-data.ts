import { cache } from "react"
import { db } from "./db"

/**
 * Datos del sitio público que antes estaban fijos en el código y ahora se editan desde el panel.
 * Cada uno tiene un valor por defecto (el contenido de siempre): si la base no responde o todavía no se
 * editó nada, el sitio se ve exactamente igual que antes.
 */

/* ───────────── Avales (franja de logos del inicio) ───────────── */
export type Aval = { id: string; code: string; name: string; logoUrl: string; visible: boolean }

const aval = (id: string, code: string, name: string): Aval => ({ id, code, name, logoUrl: `/brand/certs/${id}.webp`, visible: true })
export const DEFAULT_AVALES: Aval[] = [
  aval("idc", "IDC", "International Development Community"),
  aval("hbdt", "HBDT", "Acreditación Institución de Formación en Desarrollo Humano"),
  aval("hdp", "HDP", "Programas de Desarrollo Humano"),
  aval("thd", "THD", "Acreditación de Entrenador Humano"),
  aval("cel", "CEL", "Center for Executive Leadership"),
  aval("fgu", "FGU", "Florida Global University"),
  aval("global-coaching", "GC", "Global Coaching Federation"),
  aval("fundacion", "FSC", "Fundación Sholem Corazón Valiente"),
]

export function normalizeAvales(raw: unknown): Aval[] {
  if (!Array.isArray(raw)) return DEFAULT_AVALES
  const out: Aval[] = []
  for (const r of raw as Partial<Aval>[]) {
    if (!r || typeof r.name !== "string" || typeof r.logoUrl !== "string" || !r.name.trim()) continue
    out.push({
      id: typeof r.id === "string" && r.id ? r.id : Math.random().toString(36).slice(2, 10),
      code: typeof r.code === "string" ? r.code.slice(0, 12) : "",
      name: r.name.trim().slice(0, 160),
      logoUrl: r.logoUrl,
      visible: r.visible !== false,
    })
  }
  return out
}

export const getAvales = cache(async (): Promise<Aval[]> => {
  try {
    const s = await db.siteSetting.findUnique({ where: { key: "avales" } })
    if (s?.value) return normalizeAvales(JSON.parse(s.value)).filter((a) => a.visible)
  } catch { /* defaults */ }
  return DEFAULT_AVALES
})

/* ───────────── Testimonios ───────────── */
export type PublicTestimonial = { id: string; who: string; role: string; text: string }

export const DEFAULT_TESTIMONIALS = [
  {
    name: "Constanza Wohlgemut", role: "Life Coaching Integrativo",
    text: "Qué bendición cruzarse con maestros tan empáticos que no solo educan, sino que muchas veces rescatan. Sus clases crean una profunda conexión entre quienes participamos.",
  },
  {
    name: "Diana Atri", role: "Cábala Coach",
    text: "Tus clases de coaching y Cábala han sido un faro en mi camino, ayudándome a comprender no solo la materia, sino aspectos de mi propia vida. Estas enseñanzas me han transformado.",
  },
  {
    name: "Andrea Gálvez", role: "Instructor Jewgal Adultos",
    text: "De todo corazón quiero agradecerte. Eres una guía invaluable; tu dedicación y sabiduría han marcado profundamente mi camino.",
  },
]

/** Testimonios visibles en el idioma pedido (cae al español si falta la traducción). Antes de la primera edición, los de siempre. */
export const getTestimonials = cache(async (locale: string): Promise<PublicTestimonial[]> => {
  const fallback = DEFAULT_TESTIMONIALS.map((t, i) => ({ id: `default-${i}`, who: t.name, role: t.role, text: t.text }))
  try {
    const seeded = await db.siteSetting.findUnique({ where: { key: "testimonials_seeded" } })
    if (!seeded) return fallback
    const rows = await db.testimonial.findMany({ where: { isVisible: true }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] })
    const en = locale === "en"
    return rows.map((r) => ({ id: r.id, who: r.name, role: (en && r.roleEn) || r.role, text: (en && r.textEn) || r.text }))
  } catch {
    return fallback
  }
})
