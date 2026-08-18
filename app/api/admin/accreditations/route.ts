import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const accreditations = await db.accreditation.findMany({
    orderBy: { order: "asc" },
    include: { courses: { select: { id: true, title: true } } },
  })

  return NextResponse.json({ accreditations })
}

// Acepta tanto URLs de Cloudinary como rutas locales de public/ (ej. los
// logos ya existentes en public/brand/certs/).
const logoUrlSchema = z.string().refine((v) => v.startsWith("/") || /^https?:\/\//.test(v), {
  message: "Debe ser una ruta local (/brand/...) o una URL http(s)",
})

const createSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(200),
  logoUrl: logoUrlSchema.nullable().optional(),
  order: z.number().int().min(0).default(0),
  courseIds: z.array(z.string()).default([]),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const parsed = createSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 })
  }
  const { courseIds, ...data } = parsed.data

  const existing = await db.accreditation.findUnique({ where: { code: data.code } })
  if (existing) {
    return NextResponse.json({ error: "Ya existe un aval con esa sigla" }, { status: 409 })
  }

  const accreditation = await db.accreditation.create({
    data: { ...data, courses: { connect: courseIds.map((id) => ({ id })) } },
    include: { courses: { select: { id: true, title: true } } },
  })

  revalidatePath("/(site)/[locale]", "layout")

  return NextResponse.json({ ok: true, accreditation })
}
