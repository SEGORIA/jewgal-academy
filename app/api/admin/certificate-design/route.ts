import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getCertificateDesign } from "@/lib/certificate-design"

export const dynamic = "force-dynamic"

const HEX = /^#[0-9A-Fa-f]{6}$/
const hexColor = z.string().regex(HEX, "Color inválido (formato #RRGGBB)")

const programAccentSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  accent: hexColor,
})

const schema = z.object({
  accentColor: hexColor,
  backgroundColor: hexColor,
  textColor: hexColor,
  mutedTextColor: hexColor,
  eyebrow: z.string().trim().min(1).max(60),
  title: z.string().trim().min(1).max(80),
  awardedToLabel: z.string().trim().min(1).max(60),
  completionText: z.string().trim().min(1).max(200),
  institutionLine: z.string().trim().min(1).max(200),
  signatureName: z.string().trim().min(1).max(80),
  signatureRole: z.string().trim().min(1).max(100),
  tagline: z.string().trim().min(1).max(140),
  watermarkEnabled: z.boolean(),
  watermarkOpacity: z.number().min(0).max(0.3),
  programs: z.array(programAccentSchema).max(50),
  coBrandingEnabled: z.boolean(),
  coBrandingLogoUrl: z.string().url().nullable(),
})

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  return NextResponse.json(await getCertificateDesign(db))
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  await db.siteSetting.upsert({
    where: { key: "certificate_design" },
    update: { value: JSON.stringify(parsed.data) },
    create: { key: "certificate_design", value: JSON.stringify(parsed.data) },
  })

  return NextResponse.json({ ok: true })
}
