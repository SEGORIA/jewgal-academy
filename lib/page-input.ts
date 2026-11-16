import { z } from "zod"
import { POST_SLUG_RE, slugifyPost } from "./blog"

/** Validación de una página propia (alta y edición comparten reglas). Las páginas viven en /p/<enlace>. */

const nullableText = (max: number) => z.string().max(max).nullish()

const coverSchema = z
  .string()
  .trim()
  .max(1000)
  .refine((v) => v === "" || /^https:\/\//i.test(v) || (v.startsWith("/") && !v.startsWith("//")), "La imagen debe ser un enlace https o una imagen del sitio")
  .nullish()

const fields = {
  slug: z.string().trim().toLowerCase().max(120).regex(POST_SLUG_RE, "El enlace solo puede tener letras sin tildes, números y guiones").optional(),
  title: z.string().trim().min(2, "Falta el título").max(200),
  titleEn: nullableText(200),
  content: z.string().trim().min(1, "Falta el contenido").max(100_000),
  contentEn: nullableText(100_000),
  coverUrl: coverSchema,
  seoTitle: nullableText(120),
  seoDescription: nullableText(300),
  isPublished: z.boolean(),
}

export const createPageSchema = z.object({ ...fields, isPublished: fields.isPublished.default(false) })
export const patchPageSchema = z.object(fields).partial()
export type PageInput = z.infer<typeof patchPageSchema>

const nul = (s: string | null | undefined) => (s && s.trim() ? s.trim() : null)

export function pageData(p: PageInput): Record<string, unknown> {
  const d: Record<string, unknown> = {}
  if (p.title !== undefined) d.title = p.title.trim()
  if (p.content !== undefined) d.content = p.content.trim()
  if (p.isPublished !== undefined) d.isPublished = p.isPublished
  for (const k of ["titleEn", "contentEn", "coverUrl", "seoTitle", "seoDescription"] as const) {
    if (p[k] !== undefined) d[k] = nul(p[k])
  }
  return d
}

export { slugifyPost }
