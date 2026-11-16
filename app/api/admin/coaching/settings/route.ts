import { NextRequest, NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import { db } from "@/lib/db"
import { COACHING_SETTINGS_KEY, isValidTimezone, normalizeCoachingSettings, toMin } from "@/lib/coaching"
import { getCoachingSettings } from "@/lib/coaching-server"

export const dynamic = "force-dynamic"

export async function GET() {
  const g = await adminGuard("alumnos")
  if (!g.ok) return g.response
  g.enter()
  return NextResponse.json({ settings: await getCoachingSettings() })
}

/** Guarda la configuración de reservas. Se rechazan zonas horarias inexistentes y franjas al revés. */
export async function PUT(req: NextRequest) {
  const g = await adminGuard("alumnos")
  if (!g.ok) return g.response
  g.enter()

  const body = (await req.json().catch(() => null)) as { settings?: Record<string, unknown> } | null
  const raw = body?.settings
  if (!raw || typeof raw !== "object") return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  if (!isValidTimezone(raw.timezone)) return NextResponse.json({ error: "La zona horaria no es válida (ejemplo: America/New_York)." }, { status: 400 })
  if (typeof raw.meetingUrl === "string" && raw.meetingUrl.trim() && !/^https:\/\/\S+$/i.test(raw.meetingUrl.trim())) {
    return NextResponse.json({ error: "El enlace de la videollamada tiene que empezar con https://" }, { status: 400 })
  }
  const weekly = (raw.weekly ?? {}) as Record<string, { start?: string; end?: string }[]>
  for (const [day, list] of Object.entries(weekly)) {
    for (const w of Array.isArray(list) ? list : []) {
      if (typeof w?.start !== "string" || typeof w?.end !== "string" || toMin(w.end) <= toMin(w.start)) {
        return NextResponse.json({ error: `Revisá las franjas del ${["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][Number(day)] ?? "día"}: la hora de fin tiene que ser posterior a la de inicio.` }, { status: 400 })
      }
    }
  }

  const settings = normalizeCoachingSettings(raw)
  const value = JSON.stringify(settings)
  await db.siteSetting.upsert({ where: { key: COACHING_SETTINGS_KEY }, update: { value }, create: { key: COACHING_SETTINGS_KEY, value } })
  return NextResponse.json({ ok: true, settings })
}
