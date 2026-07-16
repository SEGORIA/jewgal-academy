import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

export const dynamic = "force-dynamic"

const DEFAULT_PHOTOS = [
  { src: "/brand/hero/devora-coaching.webp",  alt: "Devora con su grupo de coaching",  active: true, order: 0 },
  { src: "/brand/hero/devora-tv.webp",         alt: "Devora en televisión",            active: true, order: 1 },
  { src: "/brand/hero/devora-ninos.webp",      alt: "Devora con niños",                active: true, order: 2 },
  { src: "/brand/hero/devora-miami.webp",      alt: "Devora en Miami con familia",     active: true, order: 3 },
]

const photoSchema = z.object({
  src:    z.string().min(1),
  alt:    z.string().min(1),
  active: z.boolean().default(true),
  order:  z.number().int().default(0),
})
const schema = z.array(photoSchema)

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const setting = await db.siteSetting.findUnique({ where: { key: "hero_photos" } })
    if (setting?.value) return NextResponse.json(JSON.parse(setting.value))
  } catch {}
  return NextResponse.json(DEFAULT_PHOTOS)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const sorted = parsed.data.map((p, i) => ({ ...p, order: i }))

  await db.siteSetting.upsert({
    where:  { key: "hero_photos" },
    update: { value: JSON.stringify(sorted) },
    create: { key: "hero_photos", value: JSON.stringify(sorted) },
  })

  revalidatePath("/", "page")
  return NextResponse.json({ ok: true })
}
