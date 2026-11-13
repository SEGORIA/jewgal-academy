import type { Metadata } from "next"
import { cache } from "react"
import { baseDb } from "./db"
import { SITE_URL } from "./site-url"

/**
 * SEO por página: el título y la descripción que ven Google y las redes al compartir un enlace.
 * Los valores por defecto están acá; quien administra los puede cambiar desde “Textos y SEO”
 * (SiteSetting "seo_pages"). Si un campo queda vacío, vale el valor por defecto.
 */

export type SeoText = { title: string; description: string }
export type SeoPageKey = "home" | "academia" | "certificaciones" | "conoce-a-devora" | "eventos" | "blog" | "contacto" | "terminos" | "privacidad"
export type SeoLocale = "es" | "en"

export type SeoPage = { key: SeoPageKey; label: string; path: string; defaults: Record<SeoLocale, SeoText> }

export const SEO_PAGES: SeoPage[] = [
  {
    key: "home", label: "Inicio", path: "",
    defaults: {
      es: { title: "Jewgal Academy – Devora Benchimol | Master Coach", description: "Acompañándote a integrar tu ser para liderar tu vida. Formación de coaches, retiros transformadores y programas de desarrollo personal con Devora Benchimol desde Miami." },
      en: { title: "Jewgal Academy – Devora Benchimol | Master Coach", description: "Helping you integrate who you are to lead your life. Coach training, transformative retreats and personal development programs with Devora Benchimol from Miami." },
    },
  },
  {
    key: "academia", label: "Academia", path: "/academia",
    defaults: {
      es: { title: "Academia: programas de formación", description: "Life Coaching Integrativo, Cábala Coach, Método Sholem y más: programas de formación y certificación con Devora Benchimol, en línea y presenciales." },
      en: { title: "Academy: training programs", description: "Integrative Life Coaching, Kabbalah Coach, Sholem Method and more: certification and training programs with Devora Benchimol, online and in person." },
    },
  },
  {
    key: "certificaciones", label: "Certificaciones", path: "/certificaciones",
    defaults: {
      es: { title: "Certificaciones y avales", description: "Conocé las certificaciones de Jewgal Academy, sus requisitos y los avales internacionales que respaldan cada programa." },
      en: { title: "Certifications and endorsements", description: "Discover Jewgal Academy certifications, their requirements and the international endorsements behind each program." },
    },
  },
  {
    key: "conoce-a-devora", label: "Conoce a Devora", path: "/conoce-a-devora",
    defaults: {
      es: { title: "Conoce a Devora Benchimol", description: "Master Coach Internacional, educadora, Rabbanit y fundadora de Jewgal Academy: su historia, su formación y su método." },
      en: { title: "Meet Devora Benchimol", description: "International Master Coach, educator, Rabbanit and founder of Jewgal Academy: her story, her training and her method." },
    },
  },
  {
    key: "eventos", label: "Eventos y retiros", path: "/eventos",
    defaults: {
      es: { title: "Eventos y retiros", description: "Retiros, talleres y encuentros presenciales y en línea de Jewgal Academy. Mirá las próximas fechas." },
      en: { title: "Events and retreats", description: "Jewgal Academy retreats, workshops and gatherings, in person and online. See the upcoming dates." },
    },
  },
  {
    key: "blog", label: "Blog", path: "/blog",
    defaults: {
      es: { title: "Blog", description: "Artículos sobre coaching, Cábala, mindfulness y desarrollo personal por Devora Benchimol." },
      en: { title: "Blog", description: "Articles on coaching, Kabbalah, mindfulness and personal development by Devora Benchimol." },
    },
  },
  {
    key: "contacto", label: "Contacto", path: "/contacto",
    defaults: {
      es: { title: "Contacto", description: "Escribinos para consultar por programas, sesiones o eventos. Te respondemos a la brevedad." },
      en: { title: "Contact", description: "Write to us about programs, sessions or events. We will get back to you shortly." },
    },
  },
  {
    key: "terminos", label: "Términos de uso", path: "/terminos",
    defaults: {
      es: { title: "Términos de uso", description: "Condiciones generales de uso de los servicios educativos de Jewgal Academy." },
      en: { title: "Terms of use", description: "General terms of use for Jewgal Academy's educational services." },
    },
  },
  {
    key: "privacidad", label: "Política de privacidad", path: "/politica-privacidad",
    defaults: {
      es: { title: "Política de privacidad", description: "Cómo Jewgal Academy recopila, usa y protege tus datos personales." },
      en: { title: "Privacy policy", description: "How Jewgal Academy collects, uses and protects your personal data." },
    },
  },
]

export type SeoSettings = {
  /** Imagen que se muestra al compartir el sitio en redes (URL). Vacío = sin imagen. */
  ogImage: string
  pages: Partial<Record<SeoPageKey, Partial<Record<SeoLocale, Partial<SeoText>>>>>
}

export const SEO_KEY = "seo_pages"
export const EMPTY_SEO: SeoSettings = { ogImage: "", pages: {} }

export function normalizeSeo(raw: unknown): SeoSettings {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<SeoSettings>
  const pages: SeoSettings["pages"] = {}
  for (const p of SEO_PAGES) {
    const src = (r.pages as Record<string, unknown> | undefined)?.[p.key]
    if (!src || typeof src !== "object") continue
    const out: Partial<Record<SeoLocale, Partial<SeoText>>> = {}
    for (const loc of ["es", "en"] as const) {
      const t = (src as Record<string, unknown>)[loc] as Partial<SeoText> | undefined
      const title = typeof t?.title === "string" ? t.title.trim() : ""
      const description = typeof t?.description === "string" ? t.description.trim() : ""
      if (title || description) out[loc] = { ...(title ? { title } : {}), ...(description ? { description } : {}) }
    }
    if (Object.keys(out).length) pages[p.key] = out
  }
  return { ogImage: typeof r.ogImage === "string" ? r.ogImage.trim() : "", pages }
}

export const getSeoSettings = cache(async (): Promise<SeoSettings> => {
  try {
    const s = await baseDb.siteSetting.findUnique({ where: { key: SEO_KEY } })
    if (s?.value) return normalizeSeo(JSON.parse(s.value))
  } catch { /* sin base: valores por defecto */ }
  return EMPTY_SEO
})

export type SeoValues = SeoText & { url: string; alternates: { es: string; en: string }; image: string }

/** Título y descripción vigentes de una página (lo editado en el panel, o el valor por defecto). */
export async function getSeo(key: SeoPageKey, locale: string): Promise<SeoValues> {
  const page = SEO_PAGES.find((p) => p.key === key) ?? SEO_PAGES[0]
  const loc: SeoLocale = locale === "en" ? "en" : "es"
  const s = await getSeoSettings()
  const o = s.pages[page.key]?.[loc]
  const es = `${SITE_URL}${page.path}`
  const en = `${SITE_URL}/en${page.path}`
  return {
    title: o?.title?.trim() || page.defaults[loc].title,
    description: o?.description?.trim() || page.defaults[loc].description,
    url: loc === "es" ? es : en,
    alternates: { es, en },
    image: s.ogImage,
  }
}

/** Metadatos completos de una página pública (título, descripción, canónica, idiomas, Open Graph y Twitter). */
export async function pageMetadata(key: SeoPageKey, locale: string): Promise<Metadata> {
  const v = await getSeo(key, locale)
  return {
    title: key === "home" ? { absolute: v.title } : v.title,
    description: v.description,
    alternates: { canonical: v.url, languages: v.alternates },
    openGraph: { title: v.title, description: v.description, url: v.url, ...(v.image ? { images: [{ url: v.image }] } : {}) },
    twitter: { card: "summary_large_image", title: v.title, description: v.description, ...(v.image ? { images: [v.image] } : {}) },
  }
}
