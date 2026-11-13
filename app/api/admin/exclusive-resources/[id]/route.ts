import { NextRequest, NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "@/lib/db"

const patchSchema = z.object({
  courseId: z.string().nullable().optional(),
  title: z.string().min(2).optional(),
  description: z.string().nullable().optional(),
  type: z.enum(["audio", "video", "document"]).optional(),
  fileUrl: z.string().url().optional(),
  duration: z.number().int().positive().nullable().optional(),
  isVisible: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await adminGuard("cursos")
  if (!g.ok) return g.response
  g.enter()
  const session = g.session
  const { id } = await params

  const parsed = patchSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 })
  }

  const resource = await db.exclusiveResource.update({ where: { id }, data: parsed.data }).catch(() => null)
  if (!resource) {
    return NextResponse.json({ error: "Recurso no encontrado" }, { status: 404 })
  }

  revalidatePath("/aula/recursos")
  return NextResponse.json({ ok: true, resource })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await adminGuard("cursos")
  if (!g.ok) return g.response
  g.enter()
  const session = g.session
  const { id } = await params

  const deleted = await db.exclusiveResource.delete({ where: { id } }).catch(() => null)
  if (!deleted) {
    return NextResponse.json({ error: "Recurso no encontrado" }, { status: 404 })
  }

  revalidatePath("/aula/recursos")
  return NextResponse.json({ ok: true })
}
