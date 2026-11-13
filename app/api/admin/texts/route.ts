import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { adminGuard } from "@/lib/admin-guard"
import { baseDb, db } from "@/lib/db"
import { isDeepLConfigured } from "@/lib/deepl"
import { flattenMessages, parseOverrides, TEXT_OVERRIDES_KEY, validateOverride, type OverridesByLocale } from "@/lib/text-overrides"
import esMessages from "@/messages/es.json"
import enMessages from "@/messages/en.json"

export const dynamic = "force-dynamic"

const ES = flattenMessages(esMessages)
const EN = flattenMessages(enMessages)
const DEFAULTS = { es: ES, en: EN } as const

/** Catálogo completo de textos del sitio (originales) + los cambios guardados. */
export async function GET() {
  const g = await adminGuard("sitio")
  if (!g.ok) return g.response
  g.enter()

  const keys = [...new Set([...Object.keys(ES), ...Object.keys(EN)])]
  const catalog = keys.map((key) => ({ key, es: ES[key] ?? null, en: EN[key] ?? null }))
  const setting = await baseDb.siteSetting.findUnique({ where: { key: TEXT_OVERRIDES_KEY } })
  return NextResponse.json({ catalog, overrides: parseOverrides(setting?.value), deepl: isDeepLConfigured() })
}

const schema = z.object({
  changes: z.array(z.object({
    locale: z.enum(["es", "en"]),
    key: z.string().min(1).max(200),
    /** Texto nuevo; vacío o null = volver al original. */
    value: z.string().nullable(),
  })).min(1).max(300),
})

/** Guarda uno o varios cambios de texto. Se rechaza cualquier texto que pierda una variable {x} o una marca <b>. */
export async function PUT(req: NextRequest) {
  const g = await adminGuard("sitio")
  if (!g.ok) return g.response
  g.enter()

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const setting = await baseDb.siteSetting.findUnique({ where: { key: TEXT_OVERRIDES_KEY } })
  const current: OverridesByLocale = parseOverrides(setting?.value)
  const next: Record<"es" | "en", Record<string, string>> = { es: { ...(current.es ?? {}) }, en: { ...(current.en ?? {}) } }
  const errors: { locale: string; key: string; error: string }[] = []

  for (const { locale, key, value } of parsed.data.changes) {
    const original = DEFAULTS[locale][key]
    if (original === undefined) { errors.push({ locale, key, error: "Ese texto no existe en este idioma." }); continue }
    const text = (value ?? "").trim()
    if (!text || text === original) { delete next[locale][key]; continue }
    const v = validateOverride(original, text)
    if (!v.ok) { errors.push({ locale, key, error: v.error }); continue }
    next[locale][key] = text
  }
  if (errors.length) return NextResponse.json({ error: `${errors[0].key}: ${errors[0].error}`, errors }, { status: 400 })

  const out: OverridesByLocale = {}
  if (Object.keys(next.es).length) out.es = next.es
  if (Object.keys(next.en).length) out.en = next.en
  const json = JSON.stringify(out)
  await db.siteSetting.upsert({ where: { key: TEXT_OVERRIDES_KEY }, update: { value: json }, create: { key: TEXT_OVERRIDES_KEY, value: json } })
  revalidatePath("/", "layout")
  return NextResponse.json({ ok: true, overrides: out })
}
