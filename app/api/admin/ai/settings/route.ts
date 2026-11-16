import { NextRequest, NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import { db } from "@/lib/db"
import { isAIConfigured } from "@/lib/ai"
import { AI_SETTINGS_KEY, getAiSettings, normalizeAiSettings } from "@/lib/ai-settings"

export const dynamic = "force-dynamic"

export async function GET() {
  const g = await adminGuard("superadmin")
  if (!g.ok) return g.response
  g.enter()
  const since = new Date(Date.now() - 7 * 86_400_000)
  const [settings, conversations, messages7d, students7d] = await Promise.all([
    getAiSettings(),
    db.conversation.count(),
    db.chatMessage.count({ where: { role: "user", createdAt: { gte: since } } }),
    db.conversation.findMany({ where: { messages: { some: { role: "user", createdAt: { gte: since } } } }, select: { userId: true }, distinct: ["userId"] }),
  ])
  return NextResponse.json({ settings, configured: isAIConfigured(), stats: { conversations, messages7d, students7d: students7d.length } })
}

export async function PUT(req: NextRequest) {
  const g = await adminGuard("superadmin")
  if (!g.ok) return g.response
  g.enter()
  const body = (await req.json().catch(() => null)) as { settings?: unknown } | null
  if (!body?.settings || typeof body.settings !== "object") return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  const s = body.settings as Record<string, unknown>
  if (typeof s.dailyLimit === "number" && (s.dailyLimit < 0 || s.dailyLimit > 1000)) return NextResponse.json({ error: "El límite diario va de 0 (sin límite) a 1000 mensajes." }, { status: 400 })
  if (typeof s.extraInstructions === "string" && s.extraInstructions.length > 3000) return NextResponse.json({ error: "Las instrucciones extra pueden tener hasta 3000 caracteres." }, { status: 400 })

  const settings = normalizeAiSettings(s)
  const value = JSON.stringify(settings)
  await db.siteSetting.upsert({ where: { key: AI_SETTINGS_KEY }, update: { value }, create: { key: AI_SETTINGS_KEY, value } })
  return NextResponse.json({ ok: true, settings })
}
