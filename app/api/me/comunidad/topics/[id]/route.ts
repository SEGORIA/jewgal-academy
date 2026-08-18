import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireStudent, canAccessCategory } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireStudent()
  if (!session.ok) return session.response

  const { id } = await params
  const topic = await db.forumTopic.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, courseId: true, isVisible: true, name: true } },
      user: { select: { name: true, image: true } },
    },
  })
  if (
    !topic ||
    !topic.isVisible ||
    !topic.category.isVisible ||
    !(await canAccessCategory(session.userId, topic.category.courseId))
  ) {
    return NextResponse.json({ error: "Tema no encontrado" }, { status: 404 })
  }

  const posts = await db.forumPost.findMany({
    where: { topicId: id, isVisible: true, parentId: null },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { id: true, name: true, image: true } },
      likes: { where: { userId: session.userId }, select: { id: true } },
      _count: { select: { likes: true } },
      replies: {
        where: { isVisible: true },
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, name: true, image: true } },
          likes: { where: { userId: session.userId }, select: { id: true } },
          _count: { select: { likes: true } },
        },
      },
    },
  })

  return NextResponse.json({ topic, posts })
}
