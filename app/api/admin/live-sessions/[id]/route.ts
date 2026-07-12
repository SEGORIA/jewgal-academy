import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

const patchSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().nullable().optional(),
  scheduledAt: z.coerce.date().optional(),
  durationMin: z.number().int().min(1).optional(),
  joinUrl: z.string().url().nullable().optional().or(z.literal("")),
  recordingUrl: z.string().url().nullable().optional().or(z.literal("")),
  isCompleted: z.boolean().optional(),
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
  if (data.joinUrl === "") data.joinUrl = null
  if (data.recordingUrl === "") data.recordingUrl = null

  const liveSession = await db.liveSession.update({ where: { id }, data }).catch(() => null)
  if (!liveSession) {
    return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 })
  }

  revalidatePath("/aula/clases")
  revalidatePath("/aula/grabaciones")
  revalidatePath("/superadmin/asistencia")

  return NextResponse.json({ ok: true, session: liveSession })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const { id } = await params

  const deleted = await db.liveSession.delete({ where: { id } }).catch(() => null)
  if (!deleted) {
    return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 })
  }

  revalidatePath("/aula/clases")
  revalidatePath("/superadmin/asistencia")

  return NextResponse.json({ ok: true })
}
