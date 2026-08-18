import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { contentBlockSchema, quizQuestionSchema, materialTypeSchema } from "@/lib/materials-content"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const courseId = req.nextUrl.searchParams.get("courseId")
  if (!courseId) {
    return NextResponse.json({ error: "courseId requerido" }, { status: 400 })
  }

  const materials = await db.material.findMany({
    where: { courseId },
    orderBy: [{ moduleNumber: "asc" }, { order: "asc" }],
  })

  return NextResponse.json({ materials })
}

const createSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(2),
  description: z.string().nullable().optional(),
  type: materialTypeSchema,
  fileUrl: z.string().url().nullable().optional().or(z.literal("")),
  videoUrl: z.string().url().nullable().optional().or(z.literal("")),
  linkUrl: z.string().url().nullable().optional().or(z.literal("")),
  moduleNumber: z.number().int().min(1).default(1),
  order: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
  interactionKind: z.enum(["reflection", "quiz"]).nullable().optional(),
  toolHref: z.string().nullable().optional(),
  estimatedMinutes: z.number().int().min(0).max(600).nullable().optional(),
  coverImageUrl: z.string().url().nullable().optional().or(z.literal("")),
  groupLabel: z.string().max(200).nullable().optional(),
  content: z.array(contentBlockSchema).max(100).nullable().optional(),
  quizData: z.array(quizQuestionSchema).max(50).nullable().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const parsed = createSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 })
  }
  const data = parsed.data

  const course = await db.course.findUnique({ where: { id: data.courseId } })
  if (!course) {
    return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })
  }

  const material = await db.material.create({
    data: {
      courseId: data.courseId,
      title: data.title.trim(),
      description: data.description || null,
      type: data.type,
      fileUrl: data.fileUrl || null,
      videoUrl: data.videoUrl || null,
      linkUrl: data.linkUrl || null,
      moduleNumber: data.moduleNumber,
      order: data.order,
      isVisible: data.isVisible,
      interactionKind: data.interactionKind ?? null,
      toolHref: data.toolHref ?? null,
      estimatedMinutes: data.estimatedMinutes ?? null,
      coverImageUrl: data.coverImageUrl || null,
      groupLabel: data.groupLabel ?? null,
      content: data.content ? JSON.stringify(data.content) : null,
      quizData: data.quizData ? JSON.stringify(data.quizData) : null,
    },
  })

  revalidatePath("/aula/materiales")

  return NextResponse.json({ ok: true, material })
}
