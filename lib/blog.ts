export const BLOG_CATEGORIES = ["Coaching", "Cabalá", "Jewgal", "Liderazgo", "Educación"]

const CATEGORY_ACCENTS: Record<string, string> = {
  "Coaching": "#A58D66",
  "Cabalá": "#CBB78B",
  "Jewgal": "#C49F72",
  "Liderazgo": "#A76D61",
  "Educación": "#A76D61",
}

export function accentForCategory(category: string) {
  return CATEGORY_ACCENTS[category] ?? "#A76D61"
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
