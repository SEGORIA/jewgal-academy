import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

const patchSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().nullable().optional(),
  type: z.enum(["document", "video", "link"]).optional(),
  fileUrl: z.string().url().nullable().optional().or(z.literal("")),
  videoUrl: z.string().url().nullable().optional().or(z.literal("")),
  linkUrl: z.string().url().nullable().optional().or(z.literal("")),
  moduleNumber: z.number().int().min(1).optional(),
  order: z.number().int().min(0).optional(),
  isVisible: z.boolean().optional(),
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

  const data: Record<string, unknown> = { ...parsed.data }
  for (const k of ["fileUrl", "videoUrl", "linkUrl"]) {
    if (data[k] === "") data[k] = null
  }

  const material = await db.material.update({ where: { id }, data }).catch(() => null)
  if (!material) {
    return NextResponse.json({ error: "Material no encontrado" }, { status: 404 })
  }

  revalidatePath("/aula/materiales")
  return NextResponse.json({ ok: true, material })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const { id } = await params

  const deleted = await db.material.delete({ where: { id } }).catch(() => null)
  if (!deleted) {
    return NextResponse.json({ error: "Material no encontrado" }, { status: 404 })
  }

  revalidatePath("/aula/materiales")
  return NextResponse.json({ ok: true })
}
