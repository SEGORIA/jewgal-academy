import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const courseId = req.nextUrl.searchParams.get("courseId")
  if (!courseId) {
    return NextResponse.json({ error: "courseId requerido" }, { status: 400 })
  }

  const courseModules = await db.courseModule.findMany({
    where: { courseId },
    orderBy: { number: "asc" },
  })

  return NextResponse.json({ courseModules })
}

const upsertSchema = z.object({
  courseId: z.string().min(1),
  number: z.number().int().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).nullable().optional(),
  isVisible: z.boolean().default(true),
})

// Upsert por (courseId, number) — re-guardar el módulo 1 de un curso no
// debe chocar con un constraint único, así que crear y editar comparten
// esta misma ruta en vez de tener un POST que falla si el número ya existe.
export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const parsed = upsertSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 })
  }
  const { courseId, number, ...data } = parsed.data

  const course = await db.course.findUnique({ where: { id: courseId } })
  if (!course) {
    return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })
  }

  const courseModule = await db.courseModule.upsert({
    where: { courseId_number: { courseId, number } },
    create: { courseId, number, ...data },
    update: data,
  })

  revalidatePath("/aula/programa")

  return NextResponse.json({ ok: true, courseModule })
}
