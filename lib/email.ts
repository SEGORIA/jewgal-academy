import { baseDb } from "./db"
import { DEFAULT_SITE_CONTENT, mergeSiteContent } from "./site-content"
import { buildEmailHtml, type HtmlOptions } from "./email-html"
import { SITE_URL } from "./site-url"
import { EMAIL_TEMPLATES_KEY, mergeTemplate, metaOf, renderTemplate, type EmailTemplate, type TemplateKey } from "./email-templates"

/**
 * Envío de correos (Resend).
 * - Si RESEND_API_KEY no está configurada, todo es no-op: nunca rompe un flujo de compra o inscripción.
 * - Las plantillas (asunto y cuerpo) se editan en Comunicaciones → Plantillas de correo.
 */

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY)
}

export function emailFrom() {
  return process.env.EMAIL_FROM || process.env.RESEND_FROM || "Jewgal Academy <onboarding@resend.dev>"
}

/** Plantilla vigente: lo editado en el panel o el texto por defecto. La de bienvenida vive con el contenido del sitio. */
export async function getTemplate(key: TemplateKey): Promise<EmailTemplate> {
  try {
    if (key === "welcome") {
      const s = await baseDb.siteSetting.findUnique({ where: { key: "site_content" } })
      const e = s?.value ? mergeSiteContent(JSON.parse(s.value)).emails : DEFAULT_SITE_CONTENT.emails
      return { enabled: true, subject: e.welcomeSubject, body: e.welcomeBody }
    }
    const s = await baseDb.siteSetting.findUnique({ where: { key: EMAIL_TEMPLATES_KEY } })
    const all = s?.value ? (JSON.parse(s.value) as Record<string, unknown>) : {}
    return mergeTemplate(key, all[key])
  } catch {
    return metaOf(key).defaults
  }
}

export type SendInput = {
  to: string
  subject: string
  text: string
  html?: string
  replyTo?: string
  headers?: Record<string, string>
}
export type SendResult = { ok: boolean; id?: string; error?: string }

const payload = (i: SendInput) => ({
  from: emailFrom(),
  to: i.to,
  subject: i.subject,
  text: i.text,
  ...(i.html ? { html: i.html } : {}),
  ...(i.replyTo ? { replyTo: i.replyTo } : {}),
  ...(i.headers ? { headers: i.headers } : {}),
})

/**
 * Un correo. El SDK de Resend NO lanza excepción ante errores de la API (dominio sin verificar, remitente
 * inválido…): devuelve { data, error }. Por eso se revisa acá y se devuelve el resultado.
 */
export async function sendEmail(input: SendInput): Promise<SendResult> {
  if (!isEmailConfigured()) return { ok: false, error: "El envío de correos no está configurado (falta RESEND_API_KEY)." }
  try {
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { data, error } = await resend.emails.send(payload(input))
    if (error) {
      console.error("[sendEmail] Resend devolvió un error:", error)
      return { ok: false, error: error.message || "No se pudo enviar el correo." }
    }
    return { ok: true, id: data?.id }
  } catch (e) {
    console.error("[sendEmail] falló:", e)
    return { ok: false, error: e instanceof Error ? e.message : "No se pudo enviar el correo." }
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Muchos correos de una vez (hasta 100 por llamada). Devuelve cuántos salieron y cuántos fallaron. */
export async function sendEmailBatch(inputs: SendInput[]): Promise<{ sent: number; failed: number; firstError?: string }> {
  if (!inputs.length) return { sent: 0, failed: 0 }
  if (!isEmailConfigured()) return { sent: 0, failed: inputs.length, firstError: "El envío de correos no está configurado (falta RESEND_API_KEY)." }
  const { Resend } = await import("resend")
  const resend = new Resend(process.env.RESEND_API_KEY)
  let sent = 0, failed = 0, firstError: string | undefined

  for (let i = 0; i < inputs.length; i += 100) {
    const chunk = inputs.slice(i, i + 100)
    try {
      const { error } = await resend.batch.send(chunk.map(payload))
      if (error) { failed += chunk.length; firstError ??= error.message }
      else sent += chunk.length
    } catch (e) {
      failed += chunk.length
      firstError ??= e instanceof Error ? e.message : "Error de envío"
    }
    if (i + 100 < inputs.length) await sleep(700) // respeta el límite de velocidad de Resend
  }
  return { sent, failed, firstError }
}

/** Arma asunto, texto y HTML de una plantilla con sus variables. */
export function composeFromTemplate(tpl: EmailTemplate, vars: Record<string, string>, html?: HtmlOptions) {
  const subject = renderTemplate(tpl.subject, vars)
  const text = renderTemplate(tpl.body, vars)
  return { subject, text, html: buildEmailHtml(text, html) }
}

/**
 * Correo de bienvenida al crear una cuenta de alumno (compra o inscripción gratis).
 * Variables: {nombre}, {curso}, {email}, {password}. Nunca debe romper el flujo de inscripción.
 */
export async function sendWelcomeEmail(input: { email: string; name: string; courseTitle: string; tempPassword: string }) {
  if (!isEmailConfigured()) return
  const tpl = await getTemplate("welcome")
  const { subject, text, html } = composeFromTemplate(tpl, { nombre: input.name, curso: input.courseTitle, email: input.email, password: input.tempPassword })
  const r = await sendEmail({ to: input.email, subject, text, html })
  if (r.ok) console.log("[sendWelcomeEmail] enviado, id:", r.id)
}

/** Confirmación de inscripción a un alumno que ya tenía cuenta (solo si la plantilla está activada). */
export async function sendEnrollmentEmail(input: { email: string; name: string; courseTitle: string }) {
  if (!isEmailConfigured()) return
  const tpl = await getTemplate("enrollment")
  if (!tpl.enabled) return
  const { subject, text, html } = composeFromTemplate(tpl, { nombre: input.name, curso: input.courseTitle, email: input.email, enlace: `${SITE_URL}/aula` }, { cta: { label: "Entrar al aula", url: `${SITE_URL}/aula` } })
  const r = await sendEmail({ to: input.email, subject, text, html })
  if (r.ok) console.log("[sendEnrollmentEmail] enviado, id:", r.id)
}

/** Aviso de certificado emitido (solo si la plantilla está activada). */
export async function sendCertificateEmail(input: { email: string; name: string; courseTitle: string; certificateNumber: string }) {
  if (!isEmailConfigured()) return
  const tpl = await getTemplate("certificate")
  if (!tpl.enabled) return
  const url = `${SITE_URL}/aula/certificaciones`
  const { subject, text, html } = composeFromTemplate(tpl, { nombre: input.name, curso: input.courseTitle, certificado: input.certificateNumber, enlace: url }, { cta: { label: "Ver mi certificado", url } })
  const r = await sendEmail({ to: input.email, subject, text, html })
  if (r.ok) console.log("[sendCertificateEmail] enviado, id:", r.id)
}

/**
 * Alerta por correo a la casilla de administración de la plataforma (ADMIN_EMAIL) cada vez que ocurre
 * un evento relevante: compra exitosa, recompra bloqueada, reembolso, mensaje de contacto.
 * No-op si falta RESEND_API_KEY o ADMIN_EMAIL.
 */
export async function sendAdminAlert(subject: string, message: string, replyTo?: string) {
  if (!isEmailConfigured()) return
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return
  const r = await sendEmail({ to: adminEmail, subject: `[Jewgal Academy] ${subject}`, text: message, ...(replyTo ? { replyTo } : {}) })
  if (r.ok) console.log("[sendAdminAlert] enviado, id:", r.id)
}
