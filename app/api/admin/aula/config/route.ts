import { NextRequest, NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import { db } from "@/lib/db"
import { AULA_CONFIG_KEY, normalizeAulaConfig } from "@/lib/aula-config"
import { getAulaConfig } from "@/lib/aula-config-server"

export const dynamic = "force-dynamic"

export async function GET() {
  const g = await adminGuard("cursos")
  if (!g.ok) return g.response
  g.enter()
  return NextResponse.json({ config: await getAulaConfig() })
}

export async function PUT(req: NextRequest) {
  const g = await adminGuard("cursos")
  if (!g.ok) return g.response
  g.enter()
  const body = (await req.json().catch(() => null)) as { config?: { levels?: { min?: number }[] } } | null
  if (!body?.config || typeof body.config !== "object") return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  const mins = (body.config.levels ?? []).map((l) => l?.min)
  if (mins.length !== 5 || mins.some((m) => typeof m !== "number") || mins[0] !== 0 || mins[4] !== 100 || mins.some((m, i) => i > 0 && (m as number) <= (mins[i - 1] as number))) {
    return NextResponse.json({ error: "Los niveles tienen que ser 5, con el primero en 0%, el último en 100% y cada uno mayor que el anterior." }, { status: 400 })
  }
  const config = normalizeAulaConfig(body.config)
  const value = JSON.stringify(config)
  await db.siteSetting.upsert({ where: { key: AULA_CONFIG_KEY }, update: { value }, create: { key: AULA_CONFIG_KEY, value } })
  return NextResponse.json({ ok: true, config })
}
