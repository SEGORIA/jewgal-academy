import { readMinutes } from "./markdown-text"

// Categorías por defecto (fallback). Las reales se administran desde el superadmin
// y se guardan en SiteSetting key "blog_categories". Ver /api/blog-categories.
export const DEFAULT_BLOG_CATEGORIES = ["Coaching", "Cabalá", "Jewgal", "Liderazgo", "Formación"]

// Todas las categorías comparten el dorado de marca (decisión cliente jul-2026)
const CATEGORY_ACCENT = "#C49F72"

export function accentForCategory(_category: string) {
  return CATEGORY_ACCENT
}

export function estimateReadTime(content: string) {
  return `${readMinutes(content)} min`
}

export function slugifyPost(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/** Un slug válido: minúsculas, números y guiones simples (ej. "como-calmar-la-mente"). */
export const POST_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Autoría por defecto cuando el artículo no indica una. */
export const DEFAULT_POST_AUTHOR = "Devora Benchimol"

export const MAX_POST_TAGS = 8

/** Etiquetas limpias: sin vacías ni repetidas (sin distinguir mayúsculas), cada una de hasta 30 caracteres, máximo 8. */
export function normalizeTags(raw: unknown): string[] {
  const list = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(",") : []
  const seen = new Set<string>()
  const out: string[] = []
  for (const item of list) {
    if (typeof item !== "string") continue
    const t = item.replace(/^#/, "").replace(/\s+/g, " ").trim().slice(0, 30)
    const k = t.toLowerCase()
    if (!t || seen.has(k)) continue
    seen.add(k)
    out.push(t)
    if (out.length >= MAX_POST_TAGS) break
  }
  return out
}

/** Datos de un artículo ya preparados para mostrarse en un idioma (la versión en inglés cae al español si falta). */
export type PublicPost = {
  id: string
  slug: string
  category: string
  title: string
  excerpt: string
  content: string
  coverUrl: string | null
  author: string
  tags: string[]
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  readMinutes: number
  /** true si el texto mostrado es la versión en inglés. */
  translated: boolean
  seoTitle: string | null
  seoDescription: string | null
}

/** Tarjeta del listado (sin el contenido completo, para no mandar de más al navegador). */
export type PublicPostCard = Omit<PublicPost, "content" | "seoTitle" | "seoDescription">
