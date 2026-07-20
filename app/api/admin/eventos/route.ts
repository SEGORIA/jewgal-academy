import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import { DEFAULT_EVENTOS } from "@/lib/eventos"

export const dynamic = "force-dynamic"

const eventoSchema = z.object({
  datetime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Fecha inválida"),
  title: z.string().min(1),
  type: z.string(),
  location: z.string(),
  desc: z.string(),
  spots: z.string(),
  price: z.string(),
  active: z.boolean().default(true),
})

const pasadoSchema = z.object({
  title: z.string().min(1),
  date: z.string(),
  location: z.string(),
})

const schema = z.object({
  upcoming: z.array(eventoSchema),
  past: z.array(pasadoSchema),
})

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const setting = await db.siteSetting.findUnique({ where: { key: "eventos" } })
    if (setting?.value) return NextResponse.json(JSON.parse(setting.value))
  } catch {}
  return NextResponse.json(DEFAULT_EVENTOS)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  try {
    await db.siteSetting.upsert({
      where: { key: "eventos" },
      update: { value: JSON.stringify(parsed.data) },
      create: { key: "eventos", value: JSON.stringify(parsed.data) },
    })
  } catch {
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 })
  }

  revalidatePath("/eventos", "page")
  return NextResponse.json({ ok: true })
}
