import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

export const dynamic = "force-dynamic"

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
  return NextResponse.json([])
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
