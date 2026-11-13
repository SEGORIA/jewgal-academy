import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { adminGuard } from "@/lib/admin-guard"
import { baseDb, db } from "@/lib/db"
import { EMPTY_SEO, normalizeSeo, SEO_KEY, SEO_PAGES } from "@/lib/seo"

export const dynamic = "force-dynamic"

export async function GET() {
  const g = await adminGuard("sitio")
  if (!g.ok) return g.response
  g.enter()
  const setting = await baseDb.siteSetting.findUnique({ where: { key: SEO_KEY } })
  let settings = EMPTY_SEO
  try { if (setting?.value) settings = normalizeSeo(JSON.parse(setting.value)) } catch {}
  return NextResponse.json({ pages: SEO_PAGES, settings })
}

const text = z.object({ title: z.string().trim().max(120, "El título admite hasta 120 caracteres").optional(), description: z.string().trim().max(320, "La descripción admite hasta 320 caracteres").optional() })
const schema = z.object({
  ogImage: z.string().trim().max(600).refine((v) => v === "" || /^https?:\/\//.test(v) || v.startsWith("/"), "La imagen debe ser un enlace válido").default(""),
  pages: z.record(z.string(), z.object({ es: text.optional(), en: text.optional() })).default({}),
})

/** Guarda el SEO de todas las páginas (lo que queda vacío vuelve al valor por defecto). */
export async function PUT(req: NextRequest) {
  const g = await adminGuard("sitio")
  if (!g.ok) return g.response
  g.enter()
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })

  const clean = normalizeSeo(parsed.data)
  const value = JSON.stringify(clean)
  await db.siteSetting.upsert({ where: { key: SEO_KEY }, update: { value }, create: { key: SEO_KEY, value } })
  revalidatePath("/", "layout")
  return NextResponse.json({ ok: true, settings: clean })
}
