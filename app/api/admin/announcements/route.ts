import { NextRequest, NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import { baseDb, db } from "@/lib/db"
import { announcementSchema, audienceSchema, resolveRecipients } from "@/lib/announcements"
import { composeFromTemplate, getTemplate, isEmailConfigured, sendEmailBatch, type SendInput } from "@/lib/email"
import { SITE_URL } from "@/lib/site-url"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/** Historial de anuncios enviados. */
export async function GET() {
  const g = await adminGuard("comunicaciones")
  if (!g.ok) return g.response
  g.enter()
  const items = await db.announcement.findMany({ where: { NOT: { audience: { contains: "newsletter" } } }, orderBy: { createdAt: "desc" }, take: 100 })
  return NextResponse.json({ announcements: items, emailConfigured: isEmailConfigured() })
}

/** Cuántos alumnos recibirían un anuncio con esa audiencia (para confirmar antes de enviar). */
export async function PUT(req: NextRequest) {
  const g = await adminGuard("comunicaciones")
  if (!g.ok) return g.response
  g.enter()
  const parsed = audienceSchema.safeParse((await req.json().catch(() => null))?.audience)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Audiencia inválida" }, { status: 400 })
  const list = await resolveRecipients(parsed.data)
  return NextResponse.json({ count: list.length, sample: list.slice(0, 5).map((r) => r.name) })
}

/** Envía un anuncio: aviso dentro del aula (campana) y/o correo, a la audiencia elegida. */
export async function POST(req: NextRequest) {
  const g = await adminGuard("comunicaciones")
  if (!g.ok) return g.response
  g.enter()

  const parsed = announcementSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
  const { title, body, audience, channels } = parsed.data
  const linkUrl = parsed.data.linkUrl?.trim() || null

  if (channels.email && !isEmailConfigured()) {
    return NextResponse.json({ error: "El envío de correos no está configurado (falta RESEND_API_KEY). Enviá solo el aviso dentro del aula, o configurá el correo." }, { status: 400 })
  }

  const recipients = await resolveRecipients(audience)
  if (recipients.length === 0) return NextResponse.json({ error: "No hay alumnos en esa audiencia." }, { status: 400 })

  const announcement = await db.announcement.create({
    data: {
      title, body, linkUrl,
      audience: JSON.stringify(audience),
      channels: channels.app && channels.email ? "app+email" : channels.email ? "email" : "app",
      recipients: recipients.length,
      createdById: g.user.id, createdByName: g.user.name,
    },
  })

  // Aviso dentro del aula: una notificación por alumno (la campana de su aula)
  if (channels.app) {
    await db.notification.createMany({
      data: recipients.map((r) => ({
        userId: r.id,
        type: "announcement",
        message: title,
        metadata: JSON.stringify({ announcementId: announcement.id, title, body, href: linkUrl }),
      })),
    })
  }

  // Correo: con el marco “Avisos a alumnos” (editable en Plantillas de correo)
  let emailsSent = 0, emailsFailed = 0, emailError: string | undefined
  if (channels.email) {
    const tpl = await getTemplate("announcement")
    const href = linkUrl ? (linkUrl.startsWith("/") ? `${SITE_URL}${linkUrl}` : linkUrl) : undefined
    const items: SendInput[] = recipients.map((r) => {
      const c = composeFromTemplate(tpl, { nombre: r.name.split(" ")[0] || r.name, titulo: title, mensaje: body }, { preheader: body.slice(0, 120), ...(href ? { cta: { label: "Ver más", url: href } } : {}) })
      return { to: r.email, subject: c.subject, text: href ? `${c.text}\n\n${href}` : c.text, html: c.html }
    })
    const r = await sendEmailBatch(items)
    emailsSent = r.sent; emailsFailed = r.failed; emailError = r.firstError
    await baseDb.announcement.update({ where: { id: announcement.id }, data: { emailsSent, emailsFailed } }) // solo contadores: no ensucian el historial
  }

  return NextResponse.json({ ok: true, id: announcement.id, recipients: recipients.length, emailsSent, emailsFailed, emailError })
}
