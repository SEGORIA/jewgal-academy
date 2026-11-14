import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { adminGuard } from "@/lib/admin-guard"
import { composeFromTemplate, getTemplate, sendEmail } from "@/lib/email"
import { SAMPLE_VARS } from "@/lib/email-templates"
import { buildEmailHtml } from "@/lib/email-html"
import { unsubscribeHeaders, unsubscribeUrl } from "@/lib/newsletter"
import { linkSchema } from "@/lib/announcements"
import { rateLimit } from "@/lib/security"
import { can } from "@/lib/permissions"

export const dynamic = "force-dynamic"

const schema = z.discriminatedUnion("kind", [
  /** Prueba simple de entrega (sin plantilla): sirve para comprobar que el correo funciona de punta a punta. */
  z.object({ kind: z.literal("ping") }),
  /** Prueba de una plantilla con el borrador que se está editando (sin guardarlo). */
  z.object({ kind: z.literal("template"), key: z.enum(["welcome", "enrollment", "certificate", "announcement", "newsletter"]), subject: z.string().trim().min(1).max(200), body: z.string().trim().min(1).max(8000) }),
  z.object({ kind: z.literal("announcement"), title: z.string().trim().min(1).max(120), body: z.string().trim().min(1).max(4000), linkUrl: linkSchema }),
  z.object({ kind: z.literal("newsletter"), subject: z.string().trim().min(1).max(150), body: z.string().trim().min(1).max(8000), ctaLabel: z.string().trim().max(40).optional(), ctaUrl: linkSchema }),
])

/** Manda una prueba al correo de quien está logueado (nunca a otra persona), con datos de ejemplo. */
export async function POST(req: NextRequest) {
  const g = await adminGuard("comunicaciones")
  if (!g.ok) return g.response
  g.enter()
  const rl = rateLimit(`email-test:${g.user.id}`, 8, 60_000)
  if (!rl.ok) return NextResponse.json({ error: "Demasiadas pruebas seguidas. Esperá un momento." }, { status: 429 })

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
  const d = parsed.data
  // Por defecto la prueba va a la casilla de quien la pide. El Super administrador puede elegir otra dirección
  // (útil si el correo de su cuenta no recibe mensajes); un colaborador solo puede probar con su propia casilla.
  const requested = typeof (body as { to?: unknown })?.to === "string" ? (body as { to: string }).to.trim().toLowerCase() : ""
  if (requested && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requested)) return NextResponse.json({ error: "Escribí una dirección de correo válida." }, { status: 400 })
  if (requested && requested !== g.user.email.toLowerCase() && !can(g.user, "superadmin")) {
    return NextResponse.json({ error: "Solo un Super administrador puede enviar la prueba a otra dirección." }, { status: 403 })
  }
  const to = requested || g.user.email

  let subject: string, text: string, html: string, headers: Record<string, string> | undefined
  if (d.kind === "ping") {
    subject = "Prueba de correo de Jewgal Academy"
    text = "¡Funciona! Este mensaje confirma que la plataforma puede enviar correos.\n\nSi lo estás leyendo, el envío está bien configurado."
    html = buildEmailHtml(text)
  } else if (d.kind === "template") {
    const c = composeFromTemplate({ enabled: true, subject: d.subject, body: d.body }, SAMPLE_VARS, d.key === "newsletter" ? { unsubscribeUrl: unsubscribeUrl(to) } : undefined)
    ;({ subject, text, html } = c)
    if (d.key === "newsletter") headers = unsubscribeHeaders(to)
  } else if (d.kind === "announcement") {
    const tpl = await getTemplate("announcement")
    const c = composeFromTemplate(tpl, { nombre: g.user.name.split(" ")[0] || g.user.name, titulo: d.title, mensaje: d.body }, d.linkUrl?.startsWith("http") ? { cta: { label: "Ver más", url: d.linkUrl } } : undefined)
    ;({ subject, text, html } = c)
  } else {
    const tpl = await getTemplate("newsletter")
    const unsub = unsubscribeUrl(to)
    const c = composeFromTemplate(tpl, { titulo: d.subject, mensaje: d.body }, { unsubscribeUrl: unsub, ...(d.ctaUrl && d.ctaLabel ? { cta: { label: d.ctaLabel, url: d.ctaUrl } } : {}) })
    ;({ subject, text, html } = c)
    headers = unsubscribeHeaders(to)
  }

  const r = await sendEmail({ to, subject: `[Prueba] ${subject}`, text, html, ...(headers ? { headers } : {}) })
  if (!r.ok) return NextResponse.json({ error: r.error ?? "No se pudo enviar la prueba" }, { status: 502 })
  return NextResponse.json({ ok: true, to })
}
