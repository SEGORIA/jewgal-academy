import { cache } from "react"
import { baseDb } from "./db"
import { LEGAL_DEFAULTS, type LegalContent, type LegalDoc, type LegalLocale, type LegalSection } from "./legal-defaults"

/** Clave en SiteSetting donde se guardan las ediciones de cada documento legal. */
export const legalKey = (doc: LegalDoc) => `legal_${doc}`
export const LEGAL_DOCS: { doc: LegalDoc; label: string; path: string }[] = [
  { doc: "terminos", label: "Términos de uso", path: "/terminos" },
  { doc: "privacidad", label: "Política de privacidad", path: "/politica-privacidad" },
]

const str = (v: unknown, fallback: string) => (typeof v === "string" && v.trim() ? v.trim() : fallback)

function normalizeSections(raw: unknown, fallback: LegalSection[]): LegalSection[] {
  if (!Array.isArray(raw)) return fallback
  const list = raw
    .map((s) => ({ title: typeof s?.title === "string" ? s.title.trim() : "", content: typeof s?.content === "string" ? s.content.trim() : "" }))
    .filter((s) => s.title || s.content)
  return list.length ? list : fallback
}

/** Contenido de un idioma: lo editado, completando con el original lo que falte. */
export function mergeLegal(doc: LegalDoc, locale: LegalLocale, raw: unknown): LegalContent {
  const d = LEGAL_DEFAULTS[doc][locale]
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<LegalContent>
  return {
    title1: str(r.title1, d.title1),
    title2: str(r.title2, d.title2),
    updated: str(r.updated, d.updated),
    intro: str(r.intro, d.intro),
    questions: str(r.questions, d.questions),
    email: str(r.email, d.email),
    sections: normalizeSections(r.sections, d.sections),
  }
}

/** Lo guardado en la base para un documento: { es?, en? } (solo los idiomas que se editaron). */
export async function readStoredLegal(doc: LegalDoc): Promise<Partial<Record<LegalLocale, unknown>>> {
  try {
    const s = await baseDb.siteSetting.findUnique({ where: { key: legalKey(doc) } })
    if (s?.value) {
      const data = JSON.parse(s.value)
      if (data && typeof data === "object") return data as Partial<Record<LegalLocale, unknown>>
    }
  } catch { /* sin base: texto original */ }
  return {}
}

export const getLegal = cache(async (doc: LegalDoc, locale: string): Promise<LegalContent> => {
  const loc: LegalLocale = locale === "en" ? "en" : "es"
  const stored = await readStoredLegal(doc)
  return mergeLegal(doc, loc, stored[loc])
})
