import { z } from "zod"
import { POST_SLUG_RE, normalizeTags } from "./blog"

/**
 * Validación y armado de los datos de un artículo que llegan desde el panel (alta y edición comparten reglas).
 */

const nullableText = (max: number) => z.string().max(max).nullish()

const coverSchema = z
  .string()
  .trim()
  .max(1000)
  .refine((v) => v === "" || /^https:\/\//i.test(v) || (v.startsWith("/") && !v.startsWith("//")), "La portada debe ser un enlace https o una imagen del sitio")
  .nullish()

const dateSchema = z
  .string()
  .refine((v) => !Number.isNaN(new Date(v).getTime()), "Fecha inválida")
  .nullish()

const fields = {
  slug: z.string().trim().toLowerCase().max(120).regex(POST_SLUG_RE, "El enlace solo puede tener letras sin tildes, números y guiones").optional(),
  title: z.string().trim().min(2, "Falta el título").max(200),
  category: z.string().trim().min(1, "Falta la categoría").max(40),
  excerpt: z.string().trim().min(1, "Falta el resumen").max(600),
  content: z.string().trim().min(1, "Falta el contenido").max(100_000),
  isPublished: z.boolean(),
  publishedAt: dateSchema,
  coverUrl: coverSchema,
  author: nullableText(80),
  tags: z.array(z.string().max(60)).max(30).optional(),
  titleEn: nullableText(200),
  excerptEn: nullableText(600),
  contentEn: nullableText(100_000),
  seoTitle: nullableText(120),
  seoDescription: nullableText(300),
}

export const createPostSchema = z.object({ ...fields, isPublished: fields.isPublished.default(false) })
export const patchPostSchema = z.object(fields).partial()

export type PostInput = z.infer<typeof patchPostSchema>

const nul = (s: string | null | undefined) => (s && s.trim() ? s.trim() : null)

/** Campos de contenido listos para guardar (solo los que vinieron en la petición). */
export function postContentData(p: PostInput): Record<string, unknown> {
  const d: Record<string, unknown> = {}
  if (p.title !== undefined) d.title = p.title.trim()
  if (p.category !== undefined) d.category = p.category.trim()
  if (p.excerpt !== undefined) d.excerpt = p.excerpt.trim()
  if (p.content !== undefined) d.content = p.content.trim()
  if (p.tags !== undefined) d.tags = normalizeTags(p.tags)
  for (const k of ["coverUrl", "author", "titleEn", "excerptEn", "contentEn", "seoTitle", "seoDescription"] as const) {
    if (p[k] !== undefined) d[k] = nul(p[k])
  }
  return d
}

/**
 * Estado y fecha de publicación.
 * - Borrador: sin fecha.
 * - Publicado: usa la fecha indicada (una futura lo deja programado); sin fecha usa la que ya tenía o "ahora".
 */
export function publicationData(
  existing: { isPublished: boolean; publishedAt: Date | null } | null,
  input: { isPublished?: boolean; publishedAt?: string | null },
): { isPublished?: boolean; publishedAt?: Date | null } {
  const target = input.isPublished ?? existing?.isPublished ?? false
  if (!target) {
    return input.isPublished === false || !existing ? { isPublished: false, publishedAt: null } : {}
  }
  const touched = input.isPublished !== undefined || input.publishedAt !== undefined
  if (!touched) return {}
  const publishedAt = input.publishedAt ? new Date(input.publishedAt) : (existing?.publishedAt ?? new Date())
  return { isPublished: true, publishedAt }
}
