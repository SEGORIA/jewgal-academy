import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export const DEFAULT_GENERAL = {
  name: "Jewgal Academy",
  url: "https://jewgal-academy.vercel.app",
  email: "Hola@devorabenchimol.com",
  phone: "+1 (786) 483-5893",
  metaDescription: "Programas de Life Coaching Integrativo, Cabalá y bienestar para transformación consciente.",
}

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const setting = await db.siteSetting.findUnique({ where: { key: "site_general" } })
    if (setting?.value) return NextResponse.json({ ...DEFAULT_GENERAL, ...JSON.parse(setting.value) })
  } catch {}
  return NextResponse.json(DEFAULT_GENERAL)
}

const schema = z.object({
  name: z.string().min(1),
  url: z.string().min(1),
  email: z.string().min(1),
  phone: z.string().min(1),
  metaDescription: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }

  await db.siteSetting.upsert({
    where: { key: "site_general" },
    update: { value: JSON.stringify(parsed.data) },
    create: { key: "site_general", value: JSON.stringify(parsed.data) },
  })

  return NextResponse.json({ ok: true })
}
