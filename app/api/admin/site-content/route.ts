import { NextRequest, NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "@/lib/db"
import { mergeSiteContent } from "@/lib/site-content"
import { isSafeHref } from "@/lib/site-menu"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const g = await adminGuard("sitio")
  if (!g.ok) return g.response
  g.enter()
  const session = g.session

  const locale = req.nextUrl.searchParams.get("locale") === "en" ? "en" : "es"

  let esContent = mergeSiteContent(null)
  try {
    const setting = await db.siteSetting.findUnique({ where: { key: "site_content" } })
    if (setting?.value) esContent = mergeSiteContent(JSON.parse(setting.value))
  } catch {}

  if (locale === "es") return NextResponse.json(esContent)

  try {
    const enSetting = await db.siteSetting.findUnique({ where: { key: "site_content_en" } })
    if (enSetting?.value) return NextResponse.json(mergeSiteContent(JSON.parse(enSetting.value), esContent, { overlay: true }))
  } catch {}

  return NextResponse.json(esContent)
}

// Enlaces del menú: los de fábrica solo cambian de texto/visibilidad; los propios ("c-…") necesitan texto y un destino seguro.
const menuLink = z.object({
  id: z.string().min(1).max(40), href: z.string().max(500), label: z.string().max(60), labelEn: z.string().max(60),
  visible: z.boolean(), key: z.string().max(40).optional(),
}).superRefine((l, ctx) => {
  if (!l.id.startsWith("c-")) return
  if (!l.label.trim()) ctx.addIssue({ code: "custom", path: ["label"], message: "Un enlace propio necesita un texto." })
  if (!isSafeHref(l.href)) ctx.addIssue({ code: "custom", path: ["href"], message: "El destino de un enlace tiene que ser una ruta del sitio (/…) o un enlace https, mailto o tel." })
})
const menuSchema = z.object({ header: z.array(menuLink).max(20), footerAcademia: z.array(menuLink).max(20), footerRecursos: z.array(menuLink).max(20) })
const homeSectionsSchema = z.array(z.object({ id: z.string().max(40), visible: z.boolean() })).max(30)

const pageHeading2 = z.object({ eyebrow: z.string(), title1: z.string(), title2: z.string(), subtext: z.string() })
const pageHeading1 = z.object({ eyebrow: z.string(), title: z.string(), subtext: z.string() })

const schema = z.object({
  hero: z.object({
    headline1: z.string().min(1), headline2: z.string().min(1), subtext: z.string().min(1),
    cta1: z.string().min(1), cta2: z.string().min(1),
  }),
  stats: z.array(z.object({ n: z.string(), l: z.string() })).length(3),
  fundacionStat: z.object({
    bigText: z.string(), label1: z.string(), label2: z.string(),
    buttonText: z.string(), buttonUrl: z.string(),
  }).optional(),
  fundadora: z.object({ name: z.string().min(1), sig: z.string().min(1), p1: z.string().min(1), p2: z.string().min(1) }),
  contacto: z.object({
    email: z.string().min(1), phone: z.string().min(1), city: z.string().min(1),
    ig: z.string(), fb: z.string(), yt: z.string(),
  }),
  footer: z.object({ tagline: z.string().min(1), copyright: z.string().min(1) }),
  pages: z.object({
    academia: pageHeading1,
    certificaciones: pageHeading1,
    eventos: pageHeading2,
    blog: pageHeading2,
    contacto: pageHeading2,
  }).optional(),
  emails: z.object({
    welcomeSubject: z.string().min(1),
    welcomeBody: z.string().min(1),
  }).optional(),
  // Una imagen vacía = vuelve la de siempre. Solo rutas del sitio (/…) o enlaces https.
  images: z.object(Object.fromEntries(
    ["academiaGroup", "academiaBanner", "homeKids", "devoraHero", "blogHero", "eventosHero", "contactoHero"].map((k) => [
      k, z.string().max(600).refine((v) => v === "" || v.startsWith("/") || /^https:\/\//.test(v), "La imagen tiene que ser un enlace https"),
    ]),
  ) as Record<"academiaGroup" | "academiaBanner" | "homeKids" | "devoraHero" | "blogHero" | "eventosHero" | "contactoHero", z.ZodString>).partial().optional(),
  menu: menuSchema.optional(),
  homeSections: homeSectionsSchema.optional(),
})

export async function POST(req: NextRequest) {
  const g = await adminGuard("sitio")
  if (!g.ok) return g.response
  g.enter()
  const session = g.session

  const locale = req.nextUrl.searchParams.get("locale") === "en" ? "en" : "es"
  const key = locale === "en" ? "site_content_en" : "site_content"

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos", details: parsed.error.flatten() }, { status: 400 })
  }

  await db.siteSetting.upsert({
    where: { key },
    update: { value: JSON.stringify(parsed.data) },
    create: { key, value: JSON.stringify(parsed.data) },
  })

  // Las páginas públicas ahora viven bajo /[locale] y la home se renderiza
  // estática con el contenido incrustado — revalidar todo el subárbol
  // localizado hace que la edición se vea al instante (ES y EN).
  revalidatePath("/(site)/[locale]", "layout")

  return NextResponse.json({ ok: true })
}
