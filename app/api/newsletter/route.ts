import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { rateLimit, getClientIp } from "@/lib/security"

export const dynamic = "force-dynamic"

const bodySchema = z.object({ email: z.string().email("Email inválido").max(160) })

type Subscriber = { email: string; date: string }

export async function POST(req: NextRequest) {
  const rl = rateLimit(`newsletter:${getClientIp(req)}`, 5, 60_000)
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera un momento." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    )
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Escribe un email válido." }, { status: 400 })
  }
  const email = parsed.data.email.trim().toLowerCase()

  try {
    const setting = await db.siteSetting.findUnique({ where: { key: "newsletter_subscribers" } })
    const list: Subscriber[] = setting?.value ? JSON.parse(setting.value) : []

    if (!list.some((s) => s.email === email)) {
      list.push({ email, date: new Date().toISOString() })
      await db.siteSetting.upsert({
        where: { key: "newsletter_subscribers" },
        update: { value: JSON.stringify(list) },
        create: { key: "newsletter_subscribers", value: JSON.stringify(list) },
      })
    }

    // Idempotente: si ya estaba suscrito, responde ok igual (no revela si el email existe)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "No se pudo guardar. Intenta de nuevo." }, { status: 500 })
  }
}
