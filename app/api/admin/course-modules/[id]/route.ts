import { NextRequest, NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "@/lib/db"

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).nullable().optional(),
  isVisible: z.boolean().optional(),
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

  const courseModule = await db.courseModule.update({ where: { id }, data: parsed.data }).catch(() => null)
  if (!courseModule) {
    return NextResponse.json({ error: "Módulo no encontrado" }, { status: 404 })
  }

  revalidatePath("/aula/programa")
  return NextResponse.json({ ok: true, courseModule })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await adminGuard("cursos")
  if (!g.ok) return g.response
  g.enter()
  const session = g.session
  const { id } = await params

  const deleted = await db.courseModule.delete({ where: { id } }).catch(() => null)
  if (!deleted) {
    return NextResponse.json({ error: "Módulo no encontrado" }, { status: 404 })
  }

  revalidatePath("/aula/programa")
  return NextResponse.json({ ok: true })
}
