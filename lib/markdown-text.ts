/**
 * Ayudas de texto para los artículos del blog (sin React, usables en servidor y navegador).
 * El formato de los artículos es "Markdown ligero": ver `lib/markdown-lite.tsx`.
 */

/** Enlaces e imágenes permitidos: https, rutas del propio sitio, anclas y mailto. Cualquier otra cosa (javascript:, data:…) se descarta. */
export function safeUrl(raw: string, opts: { mailto?: boolean } = {}): string | null {
  const url = raw.trim()
  if (!url) return null
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith("/") && !url.startsWith("//")) return url
  if (url.startsWith("#")) return url
  if ((opts.mailto ?? true) && /^mailto:[^\s]+$/i.test(url)) return url
  return null
}

/** Texto plano de un artículo (sin marcas de formato): sirve para contar palabras y para armar descripciones. */
export function markdownToPlainText(src: string): string {
  return src
    .replace(/\r\n?/g, "\n")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}(?:#{1,6}|>|[-*+]|\d+[.)])\s+/gm, "")
    .replace(/^\s*(?:[-*_]\s*){3,}$/gm, " ")
    .replace(/[*`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

/** Minutos de lectura aproximados (200 palabras por minuto, mínimo 1). */
export function readMinutes(content: string): number {
  const words = markdownToPlainText(content).split(" ").filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

/** Recorta un texto a `max` caracteres sin cortar una palabra a la mitad. */
export function truncateText(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(" ")
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.\-–—]+$/, "")}…`
}
