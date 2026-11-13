import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { rateLimit, getClientIp } from "@/lib/security"
import { db } from "@/lib/db"
import { createNotification } from "@/lib/notifications"

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

  const { nombre, email, asunto, mensaje } = parsed.data
  const locale = req.headers.get("x-locale") === "en" ? "en" : "es"

  // Se guarda en la bandeja de Comunicaciones (antes solo se escribía en el log y el mensaje se perdía)
  let saved: { id: string } | null = null
  try {
    saved = await db.contactMessage.create({
      data: { name: nombre, email: email.trim().toLowerCase(), subject: asunto || null, message: mensaje, locale },
      select: { id: true },
    })
  } catch (e) {
    console.error("[contacto] no se pudo guardar el mensaje:", e)
    return NextResponse.json({ error: "No pudimos guardar tu mensaje. Probá de nuevo en un momento." }, { status: 500 })
  }

  // Aviso en la campana del panel (y por correo a ADMIN_EMAIL si está configurado)
  await createNotification({
    type: "contact_message",
    message: `${nombre} escribió desde el sitio${asunto ? ` (${asunto})` : ""}: “${mensaje.slice(0, 140)}${mensaje.length > 140 ? "…" : ""}”`,
    metadata: { messageId: saved.id, email, href: "/superadmin/comunicaciones" },
  })

  return NextResponse.json({ ok: true })
}
