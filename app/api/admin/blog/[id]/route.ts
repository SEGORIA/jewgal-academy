import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
const patchSchema = z.object({
  title: z.string().min(2).optional(),
  category: z.string().trim().min(1).max(40).optional(),
  excerpt: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  isPublished: z.boolean().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const { id } = await params

  const parsed = patchSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 })
  }

  const existing = await db.post.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Entrada no encontrada" }, { status: 404 })
  }

  const data: Record<string, unknown> = { ...parsed.data }
  if (data.isPublished === true && !existing.isPublished) data.publishedAt = new Date()
  if (data.isPublished === false) data.publishedAt = null

  const post = await db.post.update({ where: { id }, data })

  revalidatePath("/blog")
  return NextResponse.json({ ok: true, post })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const { id } = await params

  const deleted = await db.post.delete({ where: { id } }).catch(() => null)
  if (!deleted) {
    return NextResponse.json({ error: "Entrada no encontrada" }, { status: 404 })
  }

  revalidatePath("/blog")
  return NextResponse.json({ ok: true })
}
