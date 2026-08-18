import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

// Acepta tanto URLs de Cloudinary como rutas locales de public/ (ej. los
// logos ya existentes en public/brand/certs/).
const logoUrlSchema = z.string().refine((v) => v.startsWith("/") || /^https?:\/\//.test(v), {
  message: "Debe ser una ruta local (/brand/...) o una URL http(s)",
})

const patchSchema = z.object({
  code: z.string().min(1).max(20).optional(),
  name: z.string().min(1).max(200).optional(),
  logoUrl: logoUrlSchema.nullable().optional().or(z.literal("")),
  order: z.number().int().min(0).optional(),
  courseIds: z.array(z.string()).optional(),
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
  const { courseIds, ...rest } = parsed.data
  const data: Record<string, unknown> = { ...rest }
  if (data.logoUrl === "") data.logoUrl = null
  if (courseIds) data.courses = { set: courseIds.map((cid) => ({ id: cid })) }

  const accreditation = await db.accreditation.update({
    where: { id },
    data,
    include: { courses: { select: { id: true, title: true } } },
  }).catch(() => null)

  if (!accreditation) {
    return NextResponse.json({ error: "Aval no encontrado" }, { status: 404 })
  }

  revalidatePath("/(site)/[locale]", "layout")

  return NextResponse.json({ ok: true, accreditation })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const { id } = await params

  await db.accreditation.delete({ where: { id } }).catch(() => null)

  revalidatePath("/(site)/[locale]", "layout")

  return NextResponse.json({ ok: true })
}
