import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { adminGuard } from "@/lib/admin-guard"
import { db } from "@/lib/db"
import { buildEmailHtml } from "@/lib/email-html"
import { defaultReplyTo, sendEmail } from "@/lib/email"

export const dynamic = "force-dynamic"

const schema = z.object({
  id: z.string().min(1),
  subject: z.string().trim().min(2, "Escribí el asunto").max(150),
  body: z.string().trim().min(2, "Escribí la respuesta").max(6000),
})

/** Responde un mensaje de contacto por correo desde el panel (las respuestas llegan a la casilla de quien responde). */
export async function POST(req: NextRequest) {
  const g = await adminGuard("comunicaciones")
  if (!g.ok) return g.response
  g.enter()
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
  const { id, subject, body } = parsed.data

  const msg = await db.contactMessage.findUnique({ where: { id } })
  if (!msg) return NextResponse.json({ error: "No se encontró el mensaje" }, { status: 404 })

  const quoted = `${body}\n\n—\nEn respuesta a tu mensaje del ${msg.createdAt.toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" })}:\n“${msg.message}”`
  const r = await sendEmail({
    to: msg.email, subject, text: quoted,
    html: buildEmailHtml(quoted),
    // las respuestas van al correo de contacto del sitio (una casilla real); si no hay, al de quien responde
    replyTo: (await defaultReplyTo()) ?? g.user.email,
  })
  if (!r.ok) return NextResponse.json({ error: r.error ?? "No se pudo enviar la respuesta" }, { status: 502 })

  await db.contactMessage.update({ where: { id }, data: { status: "replied", replyBody: body, repliedAt: new Date(), repliedById: g.user.id } })
  return NextResponse.json({ ok: true })
}
