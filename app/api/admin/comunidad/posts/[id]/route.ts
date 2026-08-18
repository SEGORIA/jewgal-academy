import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

const patchSchema = z.object({ isVisible: z.boolean() })

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session.ok) return session.response

  const { id } = await params
  const post = await db.forumPost.findUnique({ where: { id } })
  if (!post) {
    return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 })
  }

  const parsed = patchSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 })
  }

  const updated = await db.forumPost.update({ where: { id }, data: { isVisible: parsed.data.isVisible } })
  return NextResponse.json({ ok: true, post: updated })
}
