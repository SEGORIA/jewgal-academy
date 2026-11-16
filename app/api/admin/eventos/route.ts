import { NextRequest, NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { z } from "zod"
import { DEFAULT_EVENTOS, normalizeEventos } from "@/lib/eventos"

export const dynamic = "force-dynamic"

const optText = (max: number) => z.string().max(max).optional()
const optImage = z.string().trim().max(1000)
  .refine((v) => v === "" || /^https:\/\//i.test(v) || (v.startsWith("/") && !v.startsWith("//")), "La imagen debe ser un enlace https o una imagen del sitio")
  .optional()

const eventoSchema = z.object({
  id: optText(60),
  datetime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Fecha inválida"),
  title: z.string().min(1, "Falta el título de un evento"),
  type: z.string(),
  location: z.string(),
  desc: z.string(),
  spots: z.string(),
  price: z.string(),
  active: z.boolean().default(true),
  imageUrl: optImage,
  titleEn: optText(200), typeEn: optText(100), locationEn: optText(200), descEn: optText(2000), priceEn: optText(100),
  registration: z.boolean().optional(),
  capacity: z.number().int().min(1, "El cupo tiene que ser al menos 1").max(100000).nullable().optional(),
})

const pasadoSchema = z.object({
  title: z.string().min(1, "Falta el título de un evento anterior"),
  date: z.string(),
  location: z.string(),
  titleEn: optText(200), dateEn: optText(100), locationEn: optText(200),
  imageUrl: optImage,
})

const schema = z.object({
  upcoming: z.array(eventoSchema),
  past: z.array(pasadoSchema),
})

export async function GET() {
  const g = await adminGuard("sitio")
  if (!g.ok) return g.response
  g.enter()
  const session = g.session

  try {
    const setting = await db.siteSetting.findUnique({ where: { key: "eventos" } })
    if (setting?.value) return NextResponse.json(normalizeEventos(JSON.parse(setting.value)))
  } catch {}
  return NextResponse.json(DEFAULT_EVENTOS)
}

export async function POST(req: NextRequest) {
  const g = await adminGuard("sitio")
  if (!g.ok) return g.response
  g.enter()
  const session = g.session

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })

  try {
    await db.siteSetting.upsert({
      where: { key: "eventos" },
      update: { value: JSON.stringify(normalizeEventos(parsed.data)) },
      create: { key: "eventos", value: JSON.stringify(normalizeEventos(parsed.data)) },
    })
  } catch {
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 })
  }

  // La página pública vive en app/(site)/[locale]/eventos — revalidar todo
  // el subárbol localizado (ES y EN) en vez del path viejo pre-i18n.
  revalidatePath("/(site)/[locale]", "layout")
  return NextResponse.json({ ok: true })
}
