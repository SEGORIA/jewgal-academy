import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { adminGuard } from "@/lib/admin-guard"
import { db } from "@/lib/db"
import { DEFAULT_AVALES, normalizeAvales } from "@/lib/public-data"

export const dynamic = "force-dynamic"

export async function GET() {
  const g = await adminGuard("sitio")
  if (!g.ok) return g.response
  g.enter()
  let avales = DEFAULT_AVALES
  let customized = false
  try {
    const s = await db.siteSetting.findUnique({ where: { key: "avales" } })
    if (s?.value) { avales = normalizeAvales(JSON.parse(s.value)); customized = true }
  } catch {}
  return NextResponse.json({ avales, customized, defaults: DEFAULT_AVALES })
}

const schema = z.object({
  avales: z.array(z.object({
    id: z.string().min(1),
    code: z.string().trim().max(12),
    name: z.string().trim().min(2, "Cada aval necesita un nombre").max(160),
    logoUrl: z.string().min(1, "Cada aval necesita su logo"),
    visible: z.boolean(),
  })).max(24, "Máximo 24 avales"),
})

/** Guarda la lista completa (orden, visibilidad, altas y bajas). */
export async function PUT(req: NextRequest) {
  const g = await adminGuard("sitio")
  if (!g.ok) return g.response
  g.enter()
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })

  const value = JSON.stringify(parsed.data.avales)
  await db.siteSetting.upsert({ where: { key: "avales" }, update: { value }, create: { key: "avales", value } })
  revalidatePath("/", "layout")
  return NextResponse.json({ ok: true })
}
