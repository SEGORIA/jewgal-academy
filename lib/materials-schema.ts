import { z } from "zod"
import { contentBlockSchema, quizQuestionSchema, materialTypeSchema } from "@/lib/materials-content"
import { db } from "@/lib/db"

const optionalUrl = z.string().url().nullable().optional().or(z.literal(""))

// Campos de un material tal como los edita el admin — sin courseId ni order
// (el orden lo asigna el servidor). Fuente única para crear, importar y
// validar: antes cada ruta repetía su propia copia.
export const materialFieldsSchema = z.object({
  title: z.string().min(2),
  description: z.string().nullable().optional(),
  type: materialTypeSchema,
  fileUrl: optionalUrl,
  videoUrl: optionalUrl,
  linkUrl: optionalUrl,
  moduleNumber: z.number().int().min(1).max(99).default(1),
  isVisible: z.boolean().default(true),
  interactionKind: z.enum(["reflection", "quiz"]).nullable().optional(),
  toolHref: z.string().nullable().optional(),
  estimatedMinutes: z.number().int().min(0).max(600).nullable().optional(),
  coverImageUrl: optionalUrl,
  groupLabel: z.string().max(200).nullable().optional(),
  content: z.array(contentBlockSchema).max(100).nullable().optional(),
  quizData: z.array(quizQuestionSchema).max(50).nullable().optional(),
})

export type MaterialFields = z.infer<typeof materialFieldsSchema>

export function toMaterialCreateData(courseId: string, d: MaterialFields, order: number) {
  return {
    courseId,
    title: d.title.trim(),
    description: d.description || null,
    type: d.type,
    fileUrl: d.fileUrl || null,
    videoUrl: d.videoUrl || null,
    linkUrl: d.linkUrl || null,
    moduleNumber: d.moduleNumber,
    order,
    isVisible: d.isVisible,
    interactionKind: d.interactionKind ?? null,
    toolHref: d.toolHref ?? null,
    estimatedMinutes: d.estimatedMinutes ?? null,
    coverImageUrl: d.coverImageUrl || null,
    groupLabel: d.groupLabel ?? null,
    content: d.content && d.content.length ? JSON.stringify(d.content) : null,
    quizData: d.quizData && d.quizData.length ? JSON.stringify(d.quizData) : null,
  }
}

// Próxima posición al final de un módulo — así un material nuevo cae abajo
// de los existentes en vez de mezclarse con la unidad 1 (order 0).
export async function nextOrderInModule(courseId: string, moduleNumber: number) {
  const agg = await db.material.aggregate({ where: { courseId, moduleNumber }, _max: { order: true } })
  return (agg._max.order ?? -1) + 1
}

// Rol de un material dentro del módulo, derivado de sus campos (sin columna nueva):
// 0 Presentación · 1 Workbook/documento · 2 Unidad · 3 Examen · 4 Autoevaluación.
// Es el orden pedagógico del programa: Presentación → Workbook → Unidades → Examen → Autoevaluación.
export function roleRank(m: { type: string; interactionKind?: string | null; content?: string | null }): number {
  if (m.interactionKind === "quiz") return 3
  if (m.interactionKind === "reflection") return 4
  if (m.type === "document") return 1
  if (m.type === "lesson" && m.content) {
    try {
      const blocks = JSON.parse(m.content) as { type: string }[]
      if (blocks.length > 0 && blocks.every((b) => b.type === "slides")) return 0
    } catch { /* contenido inválido: se trata como unidad */ }
  }
  return 2
}

// Coloca un material recién creado en el lugar que le corresponde por su rol y
// renumera el módulo (0..n-1). Solo toca filas cuyo orden cambia.
export async function placeByRole(courseId: string, moduleNumber: number, newId: string) {
  const rows = await db.material.findMany({
    where: { courseId, moduleNumber },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true, order: true, type: true, interactionKind: true, content: true },
  })
  const me = rows.find((r) => r.id === newId)
  if (!me) return
  const others = rows.filter((r) => r.id !== newId)
  const myRank = roleRank(me)
  // Después del último material con rol igual o anterior.
  let at = 0
  others.forEach((r, i) => { if (roleRank(r) <= myRank) at = i + 1 })
  const ids = [...others.map((r) => r.id)]
  ids.splice(at, 0, newId)
  const current = new Map(rows.map((r) => [r.id, r.order]))
  const updates = ids
    .map((id, i) => ({ id, i }))
    .filter(({ id, i }) => current.get(id) !== i)
    .map(({ id, i }) => db.material.update({ where: { id }, data: { order: i } }))
  if (updates.length) await db.$transaction(updates)
}
