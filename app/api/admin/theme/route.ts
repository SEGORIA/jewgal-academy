import { NextRequest, NextResponse } from "next/server"
import { revalidateTag, revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { THEME_TAG } from "@/lib/theme"

export async function GET() {
  const s = await db.siteSetting.findUnique({ where: { key: "theme" } })
  return NextResponse.json({ theme: s?.value === "light" ? "light" : "dark" })
}

const schema = z.object({ theme: z.enum(["dark", "light"]) })

/** Cambia el tema global de toda la plataforma. Solo admin. */
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
    where: { key: "theme" },
    update: { value: parsed.data.theme },
    create: { key: "theme", value: parsed.data.theme },
  })

  // Refrescar el tema cacheado y regenerar el layout para toda la plataforma
  revalidateTag(THEME_TAG, "max")
  revalidatePath("/", "layout")

  return NextResponse.json({ ok: true, theme: parsed.data.theme })
}
