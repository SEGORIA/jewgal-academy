import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { DEFAULT_BLOG_CATEGORIES } from "@/lib/blog"

export const dynamic = "force-dynamic"

async function readCategories(): Promise<string[]> {
  try {
    const setting = await db.siteSetting.findUnique({ where: { key: "blog_categories" } })
    if (setting?.value) {
      const cats = JSON.parse(setting.value)
      if (Array.isArray(cats) && cats.length) return cats
    }
  } catch {}
  return DEFAULT_BLOG_CATEGORIES
}

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  return NextResponse.json({ categories: await readCategories() })
}

const schema = z.object({
  categories: z.array(z.string().trim().min(1).max(40)).min(1).max(20),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Debe haber al menos una categoría (máx. 20, hasta 40 caracteres cada una)." }, { status: 400 })
  }

  // Normaliza: quita duplicados conservando el orden
  const unique = [...new Map(parsed.data.categories.map((c) => [c.toLowerCase(), c])).values()]

  try {
    await db.siteSetting.upsert({
      where: { key: "blog_categories" },
      update: { value: JSON.stringify(unique) },
      create: { key: "blog_categories", value: JSON.stringify(unique) },
    })
  } catch {
    return NextResponse.json({ error: "No se pudo guardar." }, { status: 500 })
  }

  revalidatePath("/blog")
  return NextResponse.json({ ok: true, categories: unique })
}
