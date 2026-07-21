import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { mergeSiteContent } from "@/lib/site-content"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const setting = await db.siteSetting.findUnique({ where: { key: "site_content" } })
    if (setting?.value) return NextResponse.json(mergeSiteContent(JSON.parse(setting.value)))
  } catch {}
  return NextResponse.json(mergeSiteContent(null))
}

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
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 })
  }

  await db.siteSetting.upsert({
    where: { key: "site_content" },
    update: { value: JSON.stringify(parsed.data) },
    create: { key: "site_content", value: JSON.stringify(parsed.data) },
  })

  revalidatePath("/", "page")
  revalidatePath("/academia")
  revalidatePath("/certificaciones")
  revalidatePath("/eventos")
  revalidatePath("/blog")
  revalidatePath("/contacto")

  return NextResponse.json({ ok: true })
}
