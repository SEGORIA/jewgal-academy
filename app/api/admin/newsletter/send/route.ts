import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { adminGuard } from "@/lib/admin-guard"
import { baseDb, db } from "@/lib/db"
import { composeFromTemplate, getTemplate, isEmailConfigured, sendEmailBatch, type SendInput } from "@/lib/email"
import { readSubscribers, unsubscribeHeaders, unsubscribeUrl } from "@/lib/newsletter"
import { linkSchema } from "@/lib/announcements"

export const dynamic = "force-dynamic"
export const maxDuration = 60

const schema = z.object({
  subject: z.string().trim().min(3, "Escribí el asunto (mínimo 3 caracteres)").max(150),
  body: z.string().trim().min(10, "Escribí el contenido del newsletter").max(8000, "El contenido admite hasta 8000 caracteres"),
  ctaLabel: z.string().trim().max(40).optional(),
  ctaUrl: linkSchema,
})

/** Envía el newsletter a todas las personas suscriptas, cada una con su enlace de baja. */
export async function POST(req: NextRequest) {
  const g = await adminGuard("comunicaciones")
  if (!g.ok) return g.response
  g.enter()
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
  const { subject, body, ctaLabel } = parsed.data
  const ctaUrl = parsed.data.ctaUrl?.trim() || ""
  if (ctaUrl && !ctaLabel) return NextResponse.json({ error: "Si agregás un enlace, escribí el texto del botón." }, { status: 400 })
  if (!isEmailConfigured()) return NextResponse.json({ error: "El envío de correos no está configurado (falta RESEND_API_KEY)." }, { status: 400 })

  const subscribers = await readSubscribers()
  if (subscribers.length === 0) return NextResponse.json({ error: "Todavía no hay personas suscriptas." }, { status: 400 })

  const tpl = await getTemplate("newsletter")
  const announcement = await db.announcement.create({
    data: {
      title: subject, body, linkUrl: ctaUrl || null,
      audience: JSON.stringify({ type: "newsletter" }), channels: "email",
      recipients: subscribers.length, createdById: g.user.id, createdByName: g.user.name,
    },
  })

  const items: SendInput[] = subscribers.map((s) => {
    const unsub = unsubscribeUrl(s.email)
    const c = composeFromTemplate(tpl, { titulo: subject, mensaje: body }, {
      preheader: body.slice(0, 120), unsubscribeUrl: unsub,
      ...(ctaUrl && ctaLabel ? { cta: { label: ctaLabel, url: ctaUrl } } : {}),
    })
    return {
      to: s.email, subject: c.subject,
      text: `${c.text}${ctaUrl ? `\n\n${ctaLabel}: ${ctaUrl}` : ""}\n\n—\nPara darte de baja: ${unsub}`,
      html: c.html, headers: unsubscribeHeaders(s.email),
    }
  })

  const r = await sendEmailBatch(items)
  await baseDb.announcement.update({ where: { id: announcement.id }, data: { emailsSent: r.sent, emailsFailed: r.failed } })
  return NextResponse.json({ ok: true, recipients: subscribers.length, sent: r.sent, failed: r.failed, error: r.firstError })
}
