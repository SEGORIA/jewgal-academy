import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { DEFAULT_BLOG_CATEGORIES } from "@/lib/blog"

export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "no-store, max-age=0" }

// Público: categorías vigentes del blog (para el filtro de la página pública)
export async function GET() {
  try {
    const setting = await db.siteSetting.findUnique({ where: { key: "blog_categories" } })
    if (setting?.value) {
      const cats = JSON.parse(setting.value)
      if (Array.isArray(cats) && cats.length) return NextResponse.json({ categories: cats }, { headers: NO_STORE })
    }
  } catch {}
  return NextResponse.json({ categories: DEFAULT_BLOG_CATEGORIES }, { headers: NO_STORE })
}
