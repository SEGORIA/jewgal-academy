import type { Page } from "@prisma/client"
import { baseDb } from "./db"

/** Páginas propias (/p/<enlace>): lectura pública en el idioma pedido (en inglés cae al español campo por campo). */

const clean = (s: string | null | undefined) => (s && s.trim() ? s.trim() : null)

export type PublicPage = {
  id: string
  slug: string
  title: string
  content: string
  coverUrl: string | null
  seoTitle: string | null
  seoDescription: string | null
  updatedAt: string
}

export function toPublicPage(p: Page, locale: string): PublicPage {
  const en = locale === "en"
  const titleEn = en ? clean(p.titleEn) : null
  const contentEn = en ? clean(p.contentEn) : null
  return {
    id: p.id,
    slug: p.slug,
    title: titleEn ?? p.title,
    content: contentEn ?? p.content,
    coverUrl: clean(p.coverUrl),
    // Los campos SEO se escriben en español: en inglés valen solo si no hay título traducido.
    seoTitle: titleEn ? null : clean(p.seoTitle),
    seoDescription: titleEn ? null : clean(p.seoDescription),
    updatedAt: p.updatedAt.toISOString(),
  }
}

export async function getPublishedPage(slug: string, locale: string): Promise<PublicPage | null> {
  const row = await baseDb.page.findFirst({ where: { slug, isPublished: true } })
  return row ? toPublicPage(row, locale) : null
}

/** Para el sitemap y para elegir una página al armar el menú. */
export async function listPublishedPages(): Promise<{ slug: string; title: string; updatedAt: Date }[]> {
  try {
    return await baseDb.page.findMany({ where: { isPublished: true }, select: { slug: true, title: true, updatedAt: true }, orderBy: { title: "asc" } })
  } catch {
    return []
  }
}
