import type { MetadataRoute } from "next"
import { SITE_URL as SITE } from "@/lib/site-url"
import { baseDb } from "@/lib/db"

export const dynamic = "force-dynamic"

const ROUTES = ["", "/academia", "/certificaciones", "/conoce-a-devora", "/eventos", "/blog", "/contacto"]
// Red de seguridad si la base no responde: los programas originales.
const FALLBACK_PROGRAMS = ["life-coaching-integrativo", "joogal-adultos", "joogalkids", "metodo-sholem", "cabala-coach"]

function withAlternates(path: string) {
  const es = `${SITE}${path}`
  const en = `${SITE}/en${path}`
  return { es, en }
}

/** Programas publicados en el panel (así un programa nuevo entra al sitemap solo). */
async function publishedPrograms(): Promise<{ slug: string; updatedAt: Date | null }[]> {
  try {
    const rows = await baseDb.course.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] })
    if (rows.length) return rows
  } catch {}
  return FALLBACK_PROGRAMS.map((slug) => ({ slug, updatedAt: null }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const programs = await publishedPrograms()

  const pages: { path: string; lastModified: Date }[] = [
    ...ROUTES.map((path) => ({ path, lastModified: now })),
    ...programs.map((p) => ({ path: `/programas/${p.slug}`, lastModified: p.updatedAt ?? now })),
  ]

  return pages.flatMap(({ path, lastModified }) => {
    const { es, en } = withAlternates(path)
    return [
      {
        url: es,
        lastModified,
        changeFrequency: "monthly" as const,
        priority: path === "" ? 1 : path.startsWith("/programas/") ? 0.7 : 0.8,
        alternates: { languages: { es, en } },
      },
      {
        url: en,
        lastModified,
        changeFrequency: "monthly" as const,
        priority: path === "" ? 0.9 : path.startsWith("/programas/") ? 0.6 : 0.7,
        alternates: { languages: { es, en } },
      },
    ]
  })
}
