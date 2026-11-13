import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { adminGuard } from "@/lib/admin-guard"
import { db } from "@/lib/db"
import { isEmailConfigured } from "@/lib/email"
import { EMAIL_RE, readSubscribers, writeSubscribers } from "@/lib/newsletter"

export const dynamic = "force-dynamic"

/** Suscriptores y envíos anteriores. */
export async function GET() {
  const g = await adminGuard("comunicaciones")
  if (!g.ok) return g.response
  g.enter()
  const [subscribers, campaigns] = await Promise.all([
    readSubscribers(),
    db.announcement.findMany({ where: { audience: { contains: "newsletter" } }, orderBy: { createdAt: "desc" }, take: 50 }),
  ])
  return NextResponse.json({ subscribers, campaigns, emailConfigured: isEmailConfigured() })
}

const listSchema = z.object({ emails: z.array(z.string().trim().max(200)).min(1).max(5000) })

/** Agrega suscriptores a mano (uno o muchos, por ejemplo desde una planilla). Quien se agrega acá lo hace por pedido propio. */
export async function POST(req: NextRequest) {
  const g = await adminGuard("comunicaciones")
  if (!g.ok) return g.response
  g.enter()
  const parsed = listSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const list = await readSubscribers()
  const have = new Set(list.map((s) => s.email))
  const invalid: string[] = []
  let added = 0, existing = 0
  const now = new Date().toISOString()
  for (const raw of parsed.data.emails) {
    const email = raw.toLowerCase()
    if (!EMAIL_RE.test(email)) { invalid.push(raw); continue }
    if (have.has(email)) { existing++; continue }
    have.add(email); list.push({ email, date: now }); added++
  }
  if (added) await writeSubscribers(list)
  return NextResponse.json({ ok: true, added, existing, invalid })
}

/** Quita suscriptores de la lista. */
export async function DELETE(req: NextRequest) {
  const g = await adminGuard("comunicaciones")
  if (!g.ok) return g.response
  g.enter()
  const parsed = listSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  const remove = new Set(parsed.data.emails.map((e) => e.toLowerCase()))
  const list = await readSubscribers()
  const next = list.filter((s) => !remove.has(s.email))
  await writeSubscribers(next)
  return NextResponse.json({ ok: true, removed: list.length - next.length })
}
