import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

const patchSchema = z.object({
  courseId: z.string().min(1).nullable().optional(),
  name: z.string().min(2).max(120).optional(),
  description: z.string().max(500).nullable().optional(),
  order: z.number().int().min(0).optional(),
  isVisible: z.boolean().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session.ok) return session.response

  const { id } = await params
  const category = await db.forumCategory.findUnique({ where: { id } })
  if (!category) {
    return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 })
  }

  const parsed = patchSchema.safeParse(await req.json().catch(() => null))
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

  const updated = await db.forumCategory.update({
    where: { id },
    data: {
      ...(data.courseId !== undefined && { courseId: data.courseId }),
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.description !== undefined && { description: data.description || null }),
      ...(data.order !== undefined && { order: data.order }),
      ...(data.isVisible !== undefined && { isVisible: data.isVisible }),
    },
  })

  return NextResponse.json({ ok: true, category: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session.ok) return session.response

  const { id } = await params
  const category = await db.forumCategory.findUnique({ where: { id } })
  if (!category) {
    return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 })
  }

  const topicCount = await db.forumTopic.count({ where: { categoryId: id } })
  if (topicCount > 0) {
    return NextResponse.json(
      { error: "Esta categoría tiene temas creados. Ocultala en vez de borrarla, o borrá primero sus temas." },
      { status: 409 }
    )
  }

  await db.forumCategory.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
