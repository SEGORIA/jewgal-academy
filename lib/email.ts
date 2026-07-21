import { db } from "./db"
import { DEFAULT_SITE_CONTENT, mergeSiteContent, type SiteContent } from "./site-content"

/**
 * Correo de bienvenida al crear una cuenta de alumno (compra o inscripción gratis).
 * - Sólo envía si RESEND_API_KEY está configurada; si no, no hace nada (no-op).
 * - La plantilla (asunto y cuerpo) se edita desde Superadmin → Sitio web → Correos.
 * - Placeholders: {nombre}, {curso}, {email}, {password}
 * - Nunca debe romper el flujo de inscripción: cualquier error se traga con .catch.
 */

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY)
}

function render(template: string, vars: Record<string, string>) {
  return template.replace(/\{(nombre|curso|email|password)\}/g, (_, k) => vars[k] ?? "")
}

async function getEmailTemplates(): Promise<SiteContent["emails"]> {
  try {
    const setting = await db.siteSetting.findUnique({ where: { key: "site_content" } })
    if (setting?.value) return mergeSiteContent(JSON.parse(setting.value)).emails
  } catch {}
  return DEFAULT_SITE_CONTENT.emails
}

export async function sendWelcomeEmail(input: {
  email: string
  name: string
  courseTitle: string
  tempPassword: string
}) {
  if (!isEmailConfigured()) return

  const { Resend } = await import("resend")
  const resend = new Resend(process.env.RESEND_API_KEY)
  const tpl = await getEmailTemplates()

  const vars = {
    nombre: input.name,
    curso: input.courseTitle,
    email: input.email,
    password: input.tempPassword,
  }

  await resend.emails.send({
    from: process.env.RESEND_FROM || "Jewgal Academy <onboarding@resend.dev>",
    to: input.email,
    subject: render(tpl.welcomeSubject, vars),
    text: render(tpl.welcomeBody, vars),
  })
}
