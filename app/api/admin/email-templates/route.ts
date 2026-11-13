import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { adminGuard } from "@/lib/admin-guard"
import { baseDb, db } from "@/lib/db"
import { isEmailConfigured } from "@/lib/email"
import { DEFAULT_SITE_CONTENT, mergeSiteContent } from "@/lib/site-content"
import { EMAIL_TEMPLATES_KEY, TEMPLATE_META, mergeTemplate, missingRequired, unknownPlaceholders, type TemplateKey } from "@/lib/email-templates"

export const dynamic = "force-dynamic"

async function readAll() {
  const [custom, site] = await Promise.all([
    baseDb.siteSetting.findUnique({ where: { key: EMAIL_TEMPLATES_KEY } }),
    baseDb.siteSetting.findUnique({ where: { key: "site_content" } }),
  ])
  let stored: Record<string, unknown> = {}
  try { if (custom?.value) stored = JSON.parse(custom.value) } catch {}
  let welcome = DEFAULT_SITE_CONTENT.emails
  try { if (site?.value) welcome = mergeSiteContent(JSON.parse(site.value)).emails } catch {}
  return { stored, welcome }
}

export async function GET() {
  const g = await adminGuard("comunicaciones")
  if (!g.ok) return g.response
  g.enter()
  const { stored, welcome } = await readAll()
  const templates = TEMPLATE_META.map((m) => ({
    ...m,
    current: m.key === "welcome" ? { enabled: true, subject: welcome.welcomeSubject, body: welcome.welcomeBody } : mergeTemplate(m.key, stored[m.key]),
  }))
  return NextResponse.json({ templates, emailConfigured: isEmailConfigured() })
}

const schema = z.object({
  key: z.enum(["welcome", "enrollment", "certificate", "announcement", "newsletter"]),
  enabled: z.boolean().optional(),
  subject: z.string().trim().min(1, "Falta el asunto").max(200),
  body: z.string().trim().min(5, "Falta el texto del correo").max(8000),
})

/** Guarda una plantilla. Se rechazan las variables que no existen y las obligatorias que faltan. */
export async function PUT(req: NextRequest) {
  const g = await adminGuard("comunicaciones")
  if (!g.ok) return g.response
  g.enter()
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
  const { key, subject, body, enabled } = parsed.data
  const k = key as TemplateKey

  const unknown = [...new Set([...unknownPlaceholders(k, subject), ...unknownPlaceholders(k, body)])]
  if (unknown.length) return NextResponse.json({ error: `Variables que no existen en este correo: ${unknown.map((u) => `{${u}}`).join(", ")}` }, { status: 400 })
  const missing = missingRequired(k, body)
  if (missing.length) return NextResponse.json({ error: `El texto tiene que incluir {${missing[0]}}.` }, { status: 400 })

  if (k === "welcome") {
    // La bienvenida vive junto al contenido del sitio (así sigue funcionando la edición de “Portada y contacto”)
    const site = await baseDb.siteSetting.findUnique({ where: { key: "site_content" } })
    let data: Record<string, unknown> = {}
    try { if (site?.value) data = JSON.parse(site.value) } catch {}
    data.emails = { ...(data.emails as object | undefined), welcomeSubject: subject, welcomeBody: body }
    const value = JSON.stringify(data)
    await db.siteSetting.upsert({ where: { key: "site_content" }, update: { value }, create: { key: "site_content", value } })
    return NextResponse.json({ ok: true })
  }

  const { stored } = await readAll()
  const next = { ...stored, [k]: { enabled: enabled ?? mergeTemplate(k, stored[k]).enabled, subject, body } }
  const value = JSON.stringify(next)
  await db.siteSetting.upsert({ where: { key: EMAIL_TEMPLATES_KEY }, update: { value }, create: { key: EMAIL_TEMPLATES_KEY, value } })
  return NextResponse.json({ ok: true })
}
