import type { Post } from "@prisma/client"
import { baseDb } from "./db"
import { DEFAULT_POST_AUTHOR, type PublicPost, type PublicPostCard } from "./blog"
import { readMinutes } from "./markdown-text"

/**
 * Lectura pública del blog (servidor).
 * Un artículo se ve en el sitio si está publicado Y su fecha de publicación ya llegó
 * (con fecha futura queda "programado": se muestra solo en ese momento, sin tocar nada).
 */
export function publishedWhere() {
  return {
    isPublished: true,
    OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }],
  }
}

const clean = (s: string | null | undefined) => (s && s.trim() ? s.trim() : null)

/** Convierte un artículo de la base en el que se muestra en `locale` (en inglés cae al español campo por campo). */
export function toPublicPost(p: Post, locale: string): PublicPost {
  const en = locale === "en"
  const titleEn = en ? clean(p.titleEn) : null
  const excerptEn = en ? clean(p.excerptEn) : null
  const contentEn = en ? clean(p.contentEn) : null
  const content = contentEn ?? p.content
  return {
    id: p.id,
    slug: p.slug,
    category: p.category,
    title: titleEn ?? p.title,
    excerpt: excerptEn ?? p.excerpt,
    content,
    coverUrl: clean(p.coverUrl),
    author: clean(p.author) ?? DEFAULT_POST_AUTHOR,
    tags: p.tags ?? [],
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    readMinutes: readMinutes(content),
    translated: Boolean(titleEn || contentEn),
    // Los campos SEO se escriben en español: en inglés valen solo si no hay título/resumen traducido.
    seoTitle: titleEn ? null : clean(p.seoTitle),
    seoDescription: excerptEn ? null : clean(p.seoDescription),
  }
}

export function toCard(p: PublicPost): PublicPostCard {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- se descartan a propósito
  const { content, seoTitle, seoDescription, ...card } = p
  return card
}

export async function getPublishedPosts(locale: string): Promise<PublicPost[]> {
  const rows = await baseDb.post.findMany({ where: publishedWhere(), orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }] })
  return rows.map((r) => toPublicPost(r, locale))
}

export async function getPublishedPost(slug: string, locale: string): Promise<PublicPost | null> {
  const row = await baseDb.post.findFirst({ where: { slug, ...publishedWhere() } })
  return row ? toPublicPost(row, locale) : null
}

/** Artículos relacionados: misma categoría o etiquetas en común primero, luego los más recientes. */
export async function getRelatedPosts(post: PublicPost, locale: string, limit = 3): Promise<PublicPostCard[]> {
  const rows = await baseDb.post.findMany({
    where: { ...publishedWhere(), NOT: { id: post.id } },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 30,
  })
  const mine = new Set(post.tags.map((t) => t.toLowerCase()))
  return rows
    .map((r) => toPublicPost(r, locale))
    .map((p) => ({ p, score: (p.category === post.category ? 2 : 0) + p.tags.filter((t) => mine.has(t.toLowerCase())).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => toCard(x.p))
}
