import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { adminGuard } from "@/lib/admin-guard"
import { db } from "@/lib/db"
import { SITE_URL } from "@/lib/site-url"
import { DEFAULT_GENERAL, mergeGeneral } from "@/lib/general-settings"

export const dynamic = "force-dynamic"

export async function GET() {
  const g = await adminGuard("superadmin")
  if (!g.ok) return g.response
  g.enter()

  let current = DEFAULT_GENERAL
  try {
    const setting = await db.siteSetting.findUnique({ where: { key: "site_general" } })
    if (setting?.value) current = mergeGeneral(JSON.parse(setting.value))
  } catch {}
  return NextResponse.json({ ...current, siteUrl: SITE_URL })
}

const schema = z.object({
  name: z.string().trim().min(1, "Escribí el nombre de la academia").max(60),
  // solo dígitos con código de país (ej. 17864835893); vacío oculta el botón
  whatsapp: z.string().transform((v) => v.replace(/\D/g, "")).refine((v) => v === "" || (v.length >= 8 && v.length <= 15), "El número debe tener entre 8 y 15 dígitos, con código de país"),
  whatsappMessage: z.string().max(300),
})

export async function POST(req: NextRequest) {
  const g = await adminGuard("superadmin")
  if (!g.ok) return g.response
  g.enter()

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
  }

  const value = JSON.stringify(parsed.data)
  await db.siteSetting.upsert({
    where: { key: "site_general" },
    update: { value },
    create: { key: "site_general", value },
  })
  revalidatePath("/", "layout")

  return NextResponse.json({ ok: true })
}
