import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

const patchSchema = z.object({
  isPinned: z.boolean().optional(),
  isVisible: z.boolean().optional(),
})

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session.ok) return session.response

  const { id } = await params
  const topic = await db.forumTopic.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      user: { select: { name: true, email: true } },
    },
  })
  if (!topic) {
    return NextResponse.json({ error: "Tema no encontrado" }, { status: 404 })
  }

  // Trae también posts ocultos: el admin necesita verlos para poder restaurarlos.
  const posts = await db.forumPost.findMany({
    where: { topicId: id, parentId: null },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      _count: { select: { likes: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          _count: { select: { likes: true } },
        },
      },
    },
  })

  return NextResponse.json({ topic, posts })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session.ok) return session.response

  const { id } = await params
  const topic = await db.forumTopic.findUnique({ where: { id } })
  if (!topic) {
    return NextResponse.json({ error: "Tema no encontrado" }, { status: 404 })
  }

  const parsed = patchSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 })
  }

  const updated = await db.forumTopic.update({ where: { id }, data: parsed.data })
  return NextResponse.json({ ok: true, topic: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session.ok) return session.response

  const { id } = await params
  const topic = await db.forumTopic.findUnique({ where: { id } })
  if (!topic) {
    return NextResponse.json({ error: "Tema no encontrado" }, { status: 404 })
  }

  await db.forumTopic.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
