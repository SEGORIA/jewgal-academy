import { NextRequest, NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import { revalidateTag, revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "@/lib/db"
import { THEME_TAG } from "@/lib/theme"

export async function GET() {
  const s = await db.siteSetting.findUnique({ where: { key: "theme" } })
  return NextResponse.json({ theme: s?.value === "light" ? "light" : "dark" })
}

const schema = z.object({ theme: z.enum(["dark", "light"]) })

/** Cambia el tema global de toda la plataforma. Solo admin. */
export async function POST(req: NextRequest) {
  const g = await adminGuard("sitio")
  if (!g.ok) return g.response
  g.enter()
  const session = g.session

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }

  await db.siteSetting.upsert({
    where: { key: "theme" },
    update: { value: parsed.data.theme },
    create: { key: "theme", value: parsed.data.theme },
  })

  // Refrescar el tema cacheado y regenerar los layouts de toda la plataforma.
  // El sitio público vive bajo /[locale] y el aula/superadmin en su propio
  // route group sin prefijo común — hay que revalidar ambos árboles.
  revalidateTag(THEME_TAG, "max")
  revalidatePath("/(site)/[locale]", "layout")
  revalidatePath("/(app)/aula", "layout")
  revalidatePath("/(app)/superadmin", "layout")

  return NextResponse.json({ ok: true, theme: parsed.data.theme })
}
