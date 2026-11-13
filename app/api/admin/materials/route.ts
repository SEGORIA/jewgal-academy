import { NextRequest, NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "@/lib/db"
import { materialFieldsSchema, toMaterialCreateData, nextOrderInModule, placeByRole } from "@/lib/materials-schema"

export async function GET(req: NextRequest) {
  const g = await adminGuard("cursos")
  if (!g.ok) return g.response
  g.enter()
  const session = g.session

  const courseId = req.nextUrl.searchParams.get("courseId")
  if (!courseId) {
    return NextResponse.json({ error: "courseId requerido" }, { status: 400 })
  }

  const materials = await db.material.findMany({
    where: { courseId },
    orderBy: [{ moduleNumber: "asc" }, { order: "asc" }, { createdAt: "asc" }],
  })

  return NextResponse.json({ materials })
}

const createSchema = materialFieldsSchema.extend({
  courseId: z.string().min(1),
  // Si no viene, el servidor lo manda al final de su módulo.
  order: z.number().int().min(0).optional(),
})

export async function POST(req: NextRequest) {
  const g = await adminGuard("cursos")
  if (!g.ok) return g.response
  g.enter()
  const session = g.session

  const parsed = createSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 })
  }
  const data = parsed.data

  const course = await db.course.findUnique({ where: { id: data.courseId } })
  if (!course) {
    return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })
  }

  const order = data.order ?? (await nextOrderInModule(data.courseId, data.moduleNumber))
  const created = await db.material.create({ data: toMaterialCreateData(data.courseId, data, order) })
  // Sin posición explícita: entra en el lugar que le corresponde por su rol
  // (Presentación → Workbook → Unidades → Examen → Autoevaluación).
  if (data.order === undefined) await placeByRole(data.courseId, data.moduleNumber, created.id)
  const material = (await db.material.findUnique({ where: { id: created.id } })) ?? created

  revalidatePath("/aula/materiales")

  return NextResponse.json({ ok: true, material })
}
