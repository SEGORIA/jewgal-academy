/**
 * Textos del sitio editables desde el panel.
 *
 * Los textos de la interfaz viven en messages/es.json y messages/en.json. Quien administra puede cambiar
 * cualquiera desde “Textos y SEO”: el cambio se guarda como una “capa” encima de esos archivos
 * (SiteSetting "text_overrides") y se aplica al cargar los mensajes. Si se borra el cambio, vuelve el texto original.
 *
 * Formato guardado:  { "es": { "Home.hero.title": "…" }, "en": { … } }  (claves planas con puntos;
 * los elementos de una lista se numeran: "Home.pillar1Items.0").
 *
 * Este módulo no toca la base: se usa tanto en el servidor como en el panel (validación en vivo).
 */

export type Locale = "es" | "en"
export type OverridesByLocale = Partial<Record<Locale, Record<string, string>>>

export const TEXT_OVERRIDES_KEY = "text_overrides"
export const MAX_TEXT_LENGTH = 4000

type Json = string | number | boolean | null | Json[] | { [k: string]: Json }

/** Aplana los mensajes anidados a claves con puntos (las listas se numeran). Solo hojas de texto. */
export function flattenMessages(messages: unknown, prefix = "", out: Record<string, string> = {}): Record<string, string> {
  if (typeof messages === "string") { out[prefix] = messages; return out }
  if (Array.isArray(messages)) {
    messages.forEach((v, i) => flattenMessages(v, prefix ? `${prefix}.${i}` : String(i), out))
    return out
  }
  if (messages && typeof messages === "object") {
    for (const [k, v] of Object.entries(messages as Record<string, unknown>)) flattenMessages(v, prefix ? `${prefix}.${k}` : k, out)
  }
  return out
}

/** Copia de los mensajes con los textos modificados puestos en su lugar. Las claves que ya no existen se ignoran. */
export function applyOverrides<T>(messages: T, overrides: Record<string, string> | undefined): T {
  const entries = Object.entries(overrides ?? {})
  if (!entries.length) return messages
  const copy = structuredClone(messages) as Json
  for (const [key, value] of entries) {
    if (typeof value !== "string" || !value.trim()) continue
    const path = key.split(".")
    let node: Json = copy
    for (let i = 0; i < path.length - 1; i++) {
      const next: Json | undefined = (node as Record<string, Json>)?.[path[i]]
      if (next === undefined || typeof next !== "object" || next === null) { node = null; break }
      node = next
    }
    if (node && typeof node === "object") {
      const last = path[path.length - 1]
      // Solo se reemplaza lo que ya era un texto: no se inventan claves ni se cambia la forma del mensaje.
      if (typeof (node as Record<string, Json>)[last] === "string") (node as Record<string, Json>)[last] = value
    }
  }
  return copy as T
}

/** Normaliza lo leído de la base (por si el JSON viene dañado o incompleto). */
export function parseOverrides(raw: string | null | undefined): OverridesByLocale {
  if (!raw) return {}
  try {
    const data = JSON.parse(raw) as Record<string, unknown>
    const out: OverridesByLocale = {}
    for (const loc of ["es", "en"] as const) {
      const src = data?.[loc]
      if (src && typeof src === "object" && !Array.isArray(src)) {
        const clean: Record<string, string> = {}
        for (const [k, v] of Object.entries(src as Record<string, unknown>)) if (typeof v === "string" && v.trim()) clean[k] = v
        if (Object.keys(clean).length) out[loc] = clean
      }
    }
    return out
  } catch { return {} }
}

/* ── Protección de variables y marcas ─────────────────────────────────────────────────────────── */

/** Variables {nombre} que un texto usa (con repetidos). */
export const placeholdersOf = (text: string): string[] => (text.match(/\{[^{}]*\}/g) ?? []).sort()
/** Marcas <b>, </b>, <em>… que un texto usa (con repetidos). */
export const tagsOf = (text: string): string[] => (text.match(/<\/?[a-zA-Z][a-zA-Z0-9]*\s*\/?>/g) ?? []).sort()

const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((v, i) => v === b[i])

export type ValidationResult = { ok: true } | { ok: false; error: string }

/**
 * Un texto modificado tiene que conservar las mismas variables ({curso}) y marcas (<b>…</b>) que el original,
 * porque el código las rellena o las convierte en formato. Si no, la página mostraría un error o texto roto.
 */
export function validateOverride(original: string, value: string): ValidationResult {
  const v = value.trim()
  if (!v) return { ok: true } // vacío = volver al original
  if (v.length > MAX_TEXT_LENGTH) return { ok: false, error: `Máximo ${MAX_TEXT_LENGTH} caracteres.` }
  // Llaves sueltas o desbalanceadas rompen el formato de mensajes.
  const open = (v.match(/\{/g) ?? []).length, close = (v.match(/\}/g) ?? []).length
  if (open !== close) return { ok: false, error: "Las llaves { } no están balanceadas." }
  const needVars = placeholdersOf(original), haveVars = placeholdersOf(v)
  if (!sameList(needVars, haveVars)) {
    return { ok: false, error: needVars.length
      ? `Tiene que conservar ${needVars.join(" ")} tal como está (el sistema lo reemplaza por el dato real).`
      : "Este texto no admite llaves { }." }
  }
  const needTags = tagsOf(original), haveTags = tagsOf(v)
  if (!sameList(needTags, haveTags)) {
    return { ok: false, error: needTags.length
      ? `Tiene que conservar las marcas de formato ${[...new Set(needTags)].join(" ")}.`
      : "Este texto no admite marcas de formato como <b>." }
  }
  return { ok: true }
}

/** Agrupa las claves por sección (lo que va antes del primer punto) para mostrar el árbol del panel. */
export const namespaceOf = (key: string) => key.split(".")[0]

/** Nombres amigables de cada sección para quien edita (la clave técnica queda como respaldo). */
export const NAMESPACE_LABELS: Record<string, string> = {
  Navbar: "Menú superior",
  Footer: "Pie de página",
  Home: "Inicio",
  Academia: "Academia (programas)",
  Programa: "Ficha de programa",
  Certificaciones: "Certificaciones",
  Devora: "Conoce a Devora",
  Coaching: "Coaching",
  Contacto: "Contacto",
  Blog: "Blog",
  Eventos: "Eventos",
  Testimonials: "Testimonios",
  Comunidad: "Comunidad",
  Verificar: "Verificar certificado",
  Login: "Ingreso",
  CompraExitosa: "Compra exitosa",
  WhatsApp: "Botón de WhatsApp",
  LanguageSwitcher: "Selector de idioma",
}
