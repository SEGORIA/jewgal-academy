import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { requireActiveStudent, canAccessCategory } from "@/lib/auth-helpers"
import { rateLimit } from "@/lib/security"
import { createNotification } from "@/lib/notifications"

export const dynamic = "force-dynamic"

const bodySchema = z.object({
  body: z.string().min(1).max(8000),
  parentId: z.string().nullish(),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireActiveStudent()
  if (!session.ok) return session.response

  const { id: topicId } = await params
  const topic = await db.forumTopic.findUnique({
    where: { id: topicId },
    include: { category: { select: { id: true, courseId: true, isVisible: true } } },
  })
  if (
    !topic ||
    !topic.isVisible ||
    !topic.category.isVisible ||
    !(await canAccessCategory(session.userId, topic.category.courseId))
  ) {
    return NextResponse.json({ error: "Tema no encontrado" }, { status: 404 })
  }

  const rl = rateLimit(`forum-post:${session.userId}`, 20, 60_000)
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

  // Un solo nivel de anidado: si el padre elegido ya es una respuesta, la
  // nueva respuesta se re-ancla en silencio a su ancestro de primer nivel.
  let parentId: string | null = null
  let notifyUserId: string | null = topic.userId
  if (parsed.data.parentId) {
    const parent = await db.forumPost.findFirst({
      where: { id: parsed.data.parentId, topicId, isVisible: true },
      select: { id: true, parentId: true, userId: true },
    })
    if (parent) {
      parentId = parent.parentId ?? parent.id
      notifyUserId = parent.userId
    }
  }

  const [post] = await db.$transaction([
    db.forumPost.create({
      data: { topicId, userId: session.userId, parentId, body: parsed.data.body },
      include: { user: { select: { id: true, name: true, image: true } } },
    }),
    db.forumTopic.update({ where: { id: topicId }, data: { updatedAt: new Date() } }),
  ])

  if (notifyUserId && notifyUserId !== session.userId) {
    createNotification({
      type: "forum_reply",
      message: "Alguien respondió en un tema que seguís en la comunidad.",
      userId: notifyUserId,
      metadata: { categoryId: topic.category.id, topicId },
    }).catch(() => {})
  }

  return NextResponse.json({ post }, { status: 201 })
}
