import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { materialFieldsSchema, toMaterialCreateData } from "@/lib/materials-schema"

// Importa un lote de materiales (y opcionalmente los nombres de módulo) a un
// programa. SIEMPRE agrega al final de cada módulo — nunca pisa ni borra lo
// que ya está cargado.
const schema = z.object({
  courseId: z.string().min(1),
  modules: z.array(z.object({
    number: z.number().int().min(1).max(99),
    title: z.string().min(1).max(200),
    description: z.string().max(1000).nullable().optional(),
  })).max(99).optional(),
  materials: z.array(materialFieldsSchema).min(1).max(300),
  // Importar todo oculto: para revisar con la vista previa antes de mostrarlo.
  hidden: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    const issues = parsed.error.issues.slice(0, 12).map((i) => {
      const path = i.path.map((p, idx) => (typeof p === "number" && i.path[idx - 1] === "materials" ? `#${p + 1}` : String(p))).join(" › ")
      return `${path}: ${i.message}`
    })
    return NextResponse.json({ error: "El archivo tiene errores", issues }, { status: 400 })
  }
  const { courseId, modules, materials, hidden } = parsed.data

  const course = await db.course.findUnique({ where: { id: courseId }, select: { id: true } })
  if (!course) {
    return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })
  }

  // Posición de partida por módulo: después de lo que ya existe.
  const maxes = await db.material.groupBy({ by: ["moduleNumber"], where: { courseId }, _max: { order: true } })
  const cursor = new Map<number, number>(maxes.map((m) => [m.moduleNumber, (m._max.order ?? -1) + 1]))

  const creates = materials.map((m) => {
    const order = cursor.get(m.moduleNumber) ?? 0
    cursor.set(m.moduleNumber, order + 1)
    return db.material.create({ data: toMaterialCreateData(courseId, hidden ? { ...m, isVisible: false } : m, order) })
  })

  const moduleUpserts = (modules ?? []).map((m) =>
    db.courseModule.upsert({
      where: { courseId_number: { courseId, number: m.number } },
      update: { title: m.title, description: m.description ?? null },
      create: { courseId, number: m.number, title: m.title, description: m.description ?? null },
    })
  )

  await db.$transaction([...moduleUpserts, ...creates])

  revalidatePath("/aula/materiales")
  return NextResponse.json({ ok: true, materials: creates.length, modules: moduleUpserts.length })
}
