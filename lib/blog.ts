// Categorías por defecto (fallback). Las reales se administran desde el superadmin
// y se guardan en SiteSetting key "blog_categories". Ver /api/blog-categories.
export const DEFAULT_BLOG_CATEGORIES = ["Coaching", "Cabalá", "Jewgal", "Liderazgo", "Formación"]

// Todas las categorías comparten el dorado de marca (decisión cliente jul-2026)
const CATEGORY_ACCENT = "#C49F72"

export function accentForCategory(_category: string) {
  return CATEGORY_ACCENT
}

export function estimateReadTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 200))
  return `${minutes} min`
}

export function slugifyPost(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
