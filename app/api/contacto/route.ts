import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { rateLimit, getClientIp } from "@/lib/security"

const schema = z.object({
  nombre: z.string().trim().min(2, "Ingresá tu nombre").max(120),
  email: z.string().email("Email inválido").max(160),
  asunto: z.string().max(80).optional(),
  mensaje: z.string().trim().min(10, "Tu mensaje es muy corto").max(3000),
})

export async function POST(req: NextRequest) {
  // Rate limit por IP: máx. 5 mensajes por minuto
  const rl = rateLimit(`contacto:${getClientIp(req)}`, 5, 60_000)
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Demasiados intentos. Esperá un momento." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    )
  }

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", fields: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  // TODO: cuando Resend esté configurado, enviar el email aquí (RESEND_API_KEY).
  // Por ahora validamos, registramos y confirmamos la recepción.
  console.log("[contacto]", parsed.data.email, "·", parsed.data.asunto || "sin asunto")

  return NextResponse.json({ ok: true })
}
