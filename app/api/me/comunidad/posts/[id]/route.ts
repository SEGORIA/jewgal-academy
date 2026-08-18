import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { requireActiveStudent } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

const bodySchema = z.union([
  z.object({ body: z.string().min(1).max(8000) }),
  z.object({ isVisible: z.literal(false) }),
])

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireActiveStudent()
  if (!session.ok) return session.response

  const { id } = await params
  const post = await db.forumPost.findFirst({
    where: { id, userId: session.userId },
    include: { _count: { select: { replies: true } } },
  })
  if (!post) {
    return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 })
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 })
  }

  if ("isVisible" in parsed.data) {
    if (post._count.replies > 0) {
      return NextResponse.json({ error: "No se puede ocultar una publicación con respuestas" }, { status: 409 })
    }
    const updated = await db.forumPost.update({ where: { id }, data: { isVisible: false } })
    return NextResponse.json({ post: updated })
  }

  const updated = await db.forumPost.update({ where: { id }, data: { body: parsed.data.body } })
  return NextResponse.json({ post: updated })
}
