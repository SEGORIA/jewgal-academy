import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { adminGuard } from "@/lib/admin-guard"
import { db } from "@/lib/db"
import { LEGAL_DEFAULTS, type LegalDoc } from "@/lib/legal-defaults"
import { legalKey, mergeLegal, readStoredLegal } from "@/lib/legal"

export const dynamic = "force-dynamic"

const DOCS = ["terminos", "privacidad"] as const
const docParam = z.enum(DOCS)

/** Contenido vigente (editado u original) de un documento legal, en los dos idiomas. */
export async function GET(req: NextRequest) {
  const g = await adminGuard("sitio")
  if (!g.ok) return g.response
  g.enter()
  const doc = docParam.safeParse(req.nextUrl.searchParams.get("doc"))
  if (!doc.success) return NextResponse.json({ error: "Documento inválido" }, { status: 400 })

  const stored = await readStoredLegal(doc.data)
  return NextResponse.json({
    content: { es: mergeLegal(doc.data, "es", stored.es), en: mergeLegal(doc.data, "en", stored.en) },
    customized: { es: stored.es !== undefined, en: stored.en !== undefined },
    defaults: LEGAL_DEFAULTS[doc.data],
  })
}

const section = z.object({
  title: z.string().trim().min(1, "Cada sección necesita un título").max(160),
  content: z.string().trim().min(1, "Cada sección necesita contenido").max(12000, "Una sección admite hasta 12.000 caracteres"),
})
const content = z.object({
  title1: z.string().trim().min(1, "Falta el título").max(80),
  title2: z.string().trim().min(1, "Falta la segunda línea del título").max(80),
  updated: z.string().trim().min(1, "Falta la fecha de actualización").max(120),
  intro: z.string().trim().min(1, "Falta la introducción").max(3000),
  questions: z.string().trim().min(1, "Falta la frase del recuadro de contacto").max(300),
  email: z.string().trim().toLowerCase().email("El correo de contacto no es válido").max(160),
  sections: z.array(section).min(1, "Tiene que haber al menos una sección").max(40, "Máximo 40 secciones"),
})
const schema = z.object({
  doc: docParam,
  locale: z.enum(["es", "en"]),
  /** null = volver al texto original de ese idioma */
  content: content.nullable(),
})

export async function PUT(req: NextRequest) {
  const g = await adminGuard("sitio")
  if (!g.ok) return g.response
  g.enter()
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
  const { doc, locale, content: body } = parsed.data

  const stored = { ...(await readStoredLegal(doc as LegalDoc)) } as Record<string, unknown>
  if (body === null) delete stored[locale]
  else stored[locale] = body

  // Aunque no quede nada editado se guarda "{}" (y no se borra la fila): así el Historial conserva el antes y el después.
  const key = legalKey(doc as LegalDoc)
  const value = JSON.stringify(stored)
  await db.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } })
  revalidatePath("/", "layout")
  return NextResponse.json({ ok: true })
}
