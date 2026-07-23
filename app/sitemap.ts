import type { MetadataRoute } from "next"

const SITE = "https://jewgal-academy.vercel.app"

const ROUTES = ["", "/academia", "/certificaciones", "/conoce-a-devora", "/eventos", "/blog", "/contacto"]
const PROGRAMS = ["life-coaching-integrativo", "joogal-adultos", "joogalkids", "metodo-sholem", "cabala-coach"]

function withAlternates(path: string) {
  const es = `${SITE}${path}`
  const en = `${SITE}/en${path}`
  return { es, en }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const pages = [...ROUTES, ...PROGRAMS.map((p) => `/programas/${p}`)]

  return pages.flatMap((path) => {
    const { es, en } = withAlternates(path)
    return [
      {
        url: es,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: path === "" ? 1 : path.startsWith("/programas/") ? 0.7 : 0.8,
        alternates: { languages: { es, en } },
      },
      {
        url: en,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: path === "" ? 0.9 : path.startsWith("/programas/") ? 0.6 : 0.7,
        alternates: { languages: { es, en } },
      },
    ]
  })
}
