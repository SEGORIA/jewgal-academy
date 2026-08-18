import { z } from "zod"

const linkItemSchema = z.object({ label: z.string().min(1).max(200), url: z.string().url() })

// Única fuente de verdad para el tipo de bloque de contenido — antes vivía
// duplicado a mano (un union de TS acá + un discriminatedUnion de Zod
// repetido en cada ruta de API). Los tipos se derivan del schema de Zod
// con z.infer para que agregar un bloque nuevo sea un solo lugar, no 3-4.
export const contentBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("heading"), level: z.union([z.literal(1), z.literal(2), z.literal(3)]), text: z.string().min(1).max(200) }),
  z.object({ type: z.literal("paragraph"), text: z.string().min(1).max(4000) }),
  z.object({ type: z.literal("list"), ordered: z.boolean(), items: z.array(z.string().min(1).max(300)).max(50) }),
  z.object({ type: z.literal("divider") }),
  z.object({ type: z.literal("video-youtube"), url: z.string().url(), caption: z.string().max(200).optional(), posterUrl: z.string().url().optional() }),
  z.object({ type: z.literal("video-vimeo"), url: z.string().url(), caption: z.string().max(200).optional(), posterUrl: z.string().url().optional() }),
  z.object({ type: z.literal("slides"), images: z.array(z.string().url()).min(1).max(120), captions: z.array(z.string().max(200)).optional() }),
  // Video autohospedado en Cloudinary — <video controls poster>, sin
  // necesidad de fabricar una barra de controles a mano.
  z.object({ type: z.literal("video-cloudinary"), url: z.string().url(), posterUrl: z.string().url().optional(), caption: z.string().max(200).optional() }),
  // Grilla de sub-clips de la unidad ("Contenido de la unidad") — cada
  // ítem abre su propio player inline al hacer clic, desacoplado del
  // video principal a propósito (ver nota de diseño en el plan).
  z.object({
    type: z.literal("video-grid"),
    title: z.string().max(200).optional(),
    items: z.array(z.object({
      title: z.string().min(1).max(200),
      durationLabel: z.string().max(20).optional(),
      provider: z.enum(["cloudinary", "youtube", "vimeo"]),
      url: z.string().url(),
      posterUrl: z.string().url().optional(),
    })).min(1).max(12),
  }),
  // "Recursos de la unidad" — 4 categorías fijas (así el contador "· 3
  // videos" sale directo de .length, sin un campo aparte que desincronizar).
  z.object({
    type: z.literal("unit-resources"),
    videos: z.array(linkItemSchema).max(30),
    readings: z.array(linkItemSchema).max(30),
    quotes: z.array(z.string().min(1).max(500)).max(30),
    links: z.array(linkItemSchema).max(30),
  }),
])
export type ContentBlock = z.infer<typeof contentBlockSchema>

export const quizQuestionSchema = z.object({
  question: z.string().min(1).max(500),
  options: z.array(z.string().min(1).max(300)).min(2).max(10),
  correctIndexes: z.array(z.number().int().min(0)).min(1),
})
export type QuizQuestion = z.infer<typeof quizQuestionSchema>

export const materialTypeSchema = z.enum(["document", "video", "link", "lesson"])
export type MaterialType = z.infer<typeof materialTypeSchema>

export function parseContent(json: string | null | undefined): ContentBlock[] {
  if (!json) return []
  try {
    const parsed = JSON.parse(json)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((b): b is ContentBlock => contentBlockSchema.safeParse(b).success)
  } catch {
    return []
  }
}

export function parseQuizData(json: string | null | undefined): QuizQuestion[] {
  if (!json) return []
  try {
    const parsed = JSON.parse(json)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((q): q is QuizQuestion => quizQuestionSchema.safeParse(q).success)
  } catch {
    return []
  }
}
