import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await requireAdmin()
  if (!session.ok) return session.response

  const categories = await db.forumCategory.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: {
      course: { select: { title: true } },
      _count: { select: { topics: true } },
    },
  })

  return NextResponse.json({ categories })
}

const createSchema = z.object({
  courseId: z.string().min(1).nullable(),
  name: z.string().min(2).max(120),
  description: z.string().max(500).nullable().optional(),
  order: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
})

export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session.ok) return session.response

  const parsed = createSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 })
  }
  const data = parsed.data

  if (data.courseId) {
    const course = await db.course.findUnique({ where: { id: data.courseId } })
    if (!course) {
      return NextResponse.json({ error: "Programa no encontrado" }, { status: 404 })
    }
  }

  const category = await db.forumCategory.create({
    data: {
      courseId: data.courseId,
      name: data.name.trim(),
      description: data.description || null,
      order: data.order,
      isVisible: data.isVisible,
    },
  })

  return NextResponse.json({ ok: true, category })
}
