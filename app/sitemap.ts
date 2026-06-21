import type { MetadataRoute } from "next"

const SITE = "https://jewgal-academy.vercel.app"

const ROUTES = ["", "/academia", "/certificaciones", "/conoce-a-devora", "/eventos", "/blog", "/contacto"]
const PROGRAMS = ["life-coaching-integrativo", "joogal-adultos", "joogalkids", "metodo-sholem", "cabala-coach"]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    ...ROUTES.map((r) => ({
      url: `${SITE}${r}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: r === "" ? 1 : 0.8,
    })),
    ...PROGRAMS.map((p) => ({
      url: `${SITE}/programas/${p}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ]
}
