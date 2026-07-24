import { cache } from "react"
import { db } from "./db"
import { mergeSiteContent, type SiteContent } from "./site-content"

export type PublicCourse = {
  slug: string
  title: string
  shortDesc: string
  price: number
  currency: string
  isFree: boolean
  durationWeeks: number | null
  totalHours: number | null
}

/**
 * Contenido del sitio para el idioma pedido, leído directamente de la DB
 * en el servidor (sin round-trip HTTP). Se usa para renderizar el HTML ya
 * en el idioma correcto — así no hay parpadeo de español en /en ni una
 * llamada extra de API tras hidratar.
 *
 * `cache()` deduplica la consulta dentro del mismo render (layout + página).
 */
export const getSiteContentForLocale = cache(
  async (locale: string): Promise<SiteContent> => {
    let esContent = mergeSiteContent(null)
    try {
      const setting = await db.siteSetting.findUnique({ where: { key: "site_content" } })
      if (setting?.value) esContent = mergeSiteContent(JSON.parse(setting.value))
    } catch {}

    if (locale !== "en") return esContent

    try {
      const enSetting = await db.siteSetting.findUnique({ where: { key: "site_content_en" } })
      if (enSetting?.value) return mergeSiteContent(JSON.parse(enSetting.value), esContent)
    } catch {}

    return esContent
  }
)

/** Cursos publicados con su copy en el idioma pedido (cae a español si falta). */
export const getCoursesForLocale = cache(
  async (locale: string): Promise<PublicCourse[]> => {
    const isEn = locale === "en"
    try {
      const courses = await db.course.findMany({
        where: { isPublished: true },
        select: {
          slug: true, title: true, titleEn: true,
          shortDesc: true, shortDescEn: true,
          price: true, currency: true, isFree: true,
          durationWeeks: true, totalHours: true,
        },
        orderBy: { createdAt: "asc" },
      })
      return courses.map(({ titleEn, shortDescEn, ...c }) => ({
        ...c,
        title: (isEn && titleEn) || c.title,
        shortDesc: (isEn && shortDescEn) || c.shortDesc,
      }))
    } catch {
      return []
    }
  }
)
