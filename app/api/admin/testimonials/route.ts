import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { adminGuard } from "@/lib/admin-guard"
import { db } from "@/lib/db"
import { DEFAULT_TESTIMONIALS } from "@/lib/public-data"

export const dynamic = "force-dynamic"

const refresh = () => revalidatePath("/", "layout")

/** Los testimonios de siempre se cargan en la base la primera vez que se abre el panel (y queda anotado). */
async function seedIfNeeded() {
  const seeded = await db.siteSetting.findUnique({ where: { key: "testimonials_seeded" } })
  if (seeded) return
  const count = await db.testimonial.count()
  if (count === 0) {
    await db.testimonial.createMany({
      data: DEFAULT_TESTIMONIALS.map((t, i) => ({ name: t.name, role: t.role, text: t.text, order: i })),
    })
  }
  await db.siteSetting.upsert({ where: { key: "testimonials_seeded" }, update: { value: "1" }, create: { key: "testimonials_seeded", value: "1" } })
}

export async function GET() {
  const g = await adminGuard("sitio")
  if (!g.ok) return g.response
  g.enter()
  await seedIfNeeded()
  const testimonials = await db.testimonial.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] })
  return NextResponse.json({ testimonials })
}

const createSchema = z.object({
  name: z.string().trim().min(2, "Escribí el nombre").max(80),
  role: z.string().trim().max(120).default(""),
  roleEn: z.string().trim().max(120).nullable().optional(),
  text: z.string().trim().min(10, "El testimonio es muy corto").max(1200),
  textEn: z.string().trim().max(1200).nullable().optional(),
  isVisible: z.boolean().default(true),
})

export async function POST(req: NextRequest) {
  const g = await adminGuard("sitio")
  if (!g.ok) return g.response
  g.enter()
  const parsed = createSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })

  await seedIfNeeded()
  const last = await db.testimonial.findFirst({ orderBy: { order: "desc" }, select: { order: true } })
  const d = parsed.data
  const t = await db.testimonial.create({
    data: { name: d.name, role: d.role, roleEn: d.roleEn || null, text: d.text, textEn: d.textEn || null, isVisible: d.isVisible, order: (last?.order ?? -1) + 1 },
  })
  refresh()
  return NextResponse.json({ testimonial: t }, { status: 201 })
}

/** Reordenar: recibe los ids en el orden deseado. */
export async function PUT(req: NextRequest) {
  const g = await adminGuard("sitio")
  if (!g.ok) return g.response
  g.enter()
  const parsed = z.object({ ids: z.array(z.string()).min(1) }).safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  await db.$transaction(parsed.data.ids.map((id, i) => db.testimonial.update({ where: { id }, data: { order: i } })))
  refresh()
  return NextResponse.json({ ok: true })
}
