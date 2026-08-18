import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { requireStudent, requireActiveStudent, canAccessCategory } from "@/lib/auth-helpers"
import { rateLimit } from "@/lib/security"

export const dynamic = "force-dynamic"

const bodySchema = z.object({
  title: z.string().min(3).max(200),
  body: z.string().min(1).max(8000),
})

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireStudent()
  if (!session.ok) return session.response

  const { id } = await params
  const category = await db.forumCategory.findUnique({ where: { id }, select: { courseId: true, isVisible: true } })
  if (!category || !category.isVisible || !(await canAccessCategory(session.userId, category.courseId))) {
    return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 })
  }

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get("page")) || 1)
  const pageSize = 20

  const [topics, total] = await Promise.all([
    db.forumTopic.findMany({
      where: { categoryId: id, isVisible: true },
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { name: true, image: true } },
        _count: { select: { posts: { where: { isVisible: true } } } },
      },
    }),
    db.forumTopic.count({ where: { categoryId: id, isVisible: true } }),
  ])

  return NextResponse.json({ topics, total, page, pageSize })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireActiveStudent()
  if (!session.ok) return session.response

  const { id } = await params
  const category = await db.forumCategory.findUnique({ where: { id }, select: { courseId: true, isVisible: true } })
  if (!category || !category.isVisible || !(await canAccessCategory(session.userId, category.courseId))) {
    return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 })
  }

  const rl = rateLimit(`forum-topic:${session.userId}`, 10, 60_000)
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Esperá un momento e intentá de nuevo." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    )
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 })
  }

  const topic = await db.$transaction(async (tx) => {
    const t = await tx.forumTopic.create({
      data: { categoryId: id, userId: session.userId, title: parsed.data.title },
    })
    await tx.forumPost.create({
      data: { topicId: t.id, userId: session.userId, body: parsed.data.body },
    })
    return t
  })

  return NextResponse.json({ topic }, { status: 201 })
}
