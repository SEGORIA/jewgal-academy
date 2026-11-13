import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { adminGuard } from "@/lib/admin-guard"
import { db } from "@/lib/db"

const patchSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  role: z.string().trim().max(120).optional(),
  roleEn: z.string().trim().max(120).nullable().optional(),
  text: z.string().trim().min(10).max(1200).optional(),
  textEn: z.string().trim().max(1200).nullable().optional(),
  isVisible: z.boolean().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await adminGuard("sitio")
  if (!g.ok) return g.response
  g.enter()
  const { id } = await params
  const parsed = patchSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
  const d = parsed.data
  try {
    const t = await db.testimonial.update({
      where: { id },
      data: { ...d, ...("roleEn" in d ? { roleEn: d.roleEn || null } : {}), ...("textEn" in d ? { textEn: d.textEn || null } : {}) },
    })
    revalidatePath("/", "layout")
    return NextResponse.json({ testimonial: t })
  } catch {
    return NextResponse.json({ error: "No se encontró el testimonio" }, { status: 404 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await adminGuard("sitio")
  if (!g.ok) return g.response
  g.enter()
  const { id } = await params
  try {
    await db.testimonial.delete({ where: { id } })
    revalidatePath("/", "layout")
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "No se encontró el testimonio" }, { status: 404 })
  }
}
