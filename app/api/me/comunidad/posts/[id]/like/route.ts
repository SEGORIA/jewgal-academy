import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireActiveStudent } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireActiveStudent()
  if (!session.ok) return session.response

  const { id: postId } = await params
  const post = await db.forumPost.findFirst({ where: { id: postId, isVisible: true }, select: { id: true } })
  if (!post) {
    return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 })
  }

  const existing = await db.forumLike.findUnique({
    where: { userId_postId: { userId: session.userId, postId } },
  })

  if (existing) {
    await db.forumLike.delete({ where: { id: existing.id } })
  } else {
    await db.forumLike.create({ data: { userId: session.userId, postId } })
  }

  const likeCount = await db.forumLike.count({ where: { postId } })
  return NextResponse.json({ liked: !existing, likeCount })
}
