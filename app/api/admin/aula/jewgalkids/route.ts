import { NextRequest, NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import { db } from "@/lib/db"
import { JEWGALKIDS_CONTENT_KEY, normalizeJewgalkids } from "@/lib/jewgalkids-config"
import { getJewgalkids } from "@/lib/aula-config-server"

export const dynamic = "force-dynamic"

export async function GET() {
  const g = await adminGuard("cursos")
  if (!g.ok) return g.response
  g.enter()
  return NextResponse.json(await getJewgalkids())
}

/** Guarda el contenido de Joogalkids. Cada lista necesita al menos un elemento válido; lo inválido se descarta. */
export async function PUT(req: NextRequest) {
  const g = await adminGuard("cursos")
  if (!g.ok) return g.response
  g.enter()
  const body = (await req.json().catch(() => null)) as { content?: Record<string, unknown> } | null
  if (!body?.content || typeof body.content !== "object") return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  const c = body.content
  for (const [k, label] of [["breathing", "respiración"], ["postures", "posturas"], ["values", "valores"]] as const) {
    if (!Array.isArray(c[k]) || (c[k] as unknown[]).length === 0) return NextResponse.json({ error: `Tiene que haber al menos un elemento en ${label}.` }, { status: 400 })
  }
  const content = normalizeJewgalkids(c)
  const value = JSON.stringify(content)
  await db.siteSetting.upsert({ where: { key: JEWGALKIDS_CONTENT_KEY }, update: { value }, create: { key: JEWGALKIDS_CONTENT_KEY, value } })
  return NextResponse.json({ ok: true, content })
}

/** Volver al contenido original. */
export async function DELETE() {
  const g = await adminGuard("cursos")
  if (!g.ok) return g.response
  g.enter()
  await db.siteSetting.deleteMany({ where: { key: JEWGALKIDS_CONTENT_KEY } })
  return NextResponse.json({ ok: true })
}
