import { BREATHING_PATTERNS, POSTURES, VALUE_CARDS, type BreathingPattern, type Posture, type ValueCard } from "./jewgalkids-content"

/**
 * Contenido de las herramientas de Joogalkids editable desde el panel (SiteSetting "jewgalkids_content").
 * Sin configuración, valen los textos originales de `jewgalkids-content.ts`. Sin dependencias del servidor.
 */
export type JewgalkidsContent = { breathing: BreathingPattern[]; postures: Posture[]; values: ValueCard[] }

export const JEWGALKIDS_CONTENT_KEY = "jewgalkids_content"
export const DEFAULT_JEWGALKIDS: JewgalkidsContent = { breathing: BREATHING_PATTERNS, postures: POSTURES, values: VALUE_CARDS }

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "")
const sec = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? Math.min(30, Math.max(0, Math.round(v))) : 0)
const HEX = /^#[0-9a-fA-F]{6}$/
const slug = (v: string, i: number) => (v.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `item-${i + 1}`)

/** Lo guardado con todos los campos presentes; una lista vacía o inválida vuelve a la original. */
export function normalizeJewgalkids(raw: unknown): JewgalkidsContent {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<Record<keyof JewgalkidsContent, unknown>>
  const list = (v: unknown) => (Array.isArray(v) ? v : [])

  const breathing: BreathingPattern[] = list(r.breathing).map((x, i) => {
    const b = (x ?? {}) as Partial<BreathingPattern>
    const name = str(b.name, 60)
    return { id: str(b.id, 40) || slug(name, i), name, description: str(b.description, 300), inhale: sec(b.inhale), hold: sec(b.hold), exhale: sec(b.exhale), visual: (b.visual === "balloon" ? "balloon" : "circle") as BreathingPattern["visual"] }
  }).filter((b) => b.name && b.inhale + b.exhale > 0)

  const postures: Posture[] = list(r.postures).map((x, i) => {
    const p = (x ?? {}) as Partial<Posture>
    const nameGeneral = str(p.nameGeneral, 80)
    return { id: str(p.id, 40) || slug(nameGeneral, i), order: i + 1, nameGeneral, nameHebrew: str(p.nameHebrew, 80), instructions: str(p.instructions, 1500), variations: str(p.variations, 1000), spiritualGeneral: str(p.spiritualGeneral, 600), spiritualHebrew: str(p.spiritualHebrew, 600) }
  }).filter((p) => p.nameGeneral)

  const values: ValueCard[] = list(r.values).map((x, i) => {
    const v = (x ?? {}) as Partial<ValueCard>
    const name = str(v.name, 60)
    return { id: str(v.id, 40) || slug(name, i), name, ...(v.isShadow === true ? { isShadow: true } : {}), color: HEX.test(str(v.color, 9)) ? str(v.color, 9) : "#A58D66", bg: HEX.test(str(v.bg, 9)) ? str(v.bg, 9) : "#F3E8D6", description: str(v.description, 400) }
  }).filter((v) => v.name)

  return {
    breathing: breathing.length ? breathing : DEFAULT_JEWGALKIDS.breathing,
    postures: postures.length ? postures : DEFAULT_JEWGALKIDS.postures,
    values: values.length ? values : DEFAULT_JEWGALKIDS.values,
  }
}
