import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { adminGuard } from "@/lib/admin-guard"
import { db } from "@/lib/db"
import { createPageSchema, pageData, slugifyPost } from "@/lib/page-input"

export async function GET() {
  const g = await adminGuard("sitio")
  if (!g.ok) return g.response
  g.enter()
  try {
    const pages = await db.page.findMany({ orderBy: { updatedAt: "desc" } })
    return NextResponse.json({ pages })
  } catch (e) {
    console.error("[admin/pages GET]", e)
    return NextResponse.json({ error: "No se pudieron cargar las páginas" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const g = await adminGuard("sitio")
  if (!g.ok) return g.response
  g.enter()

  const parsed = createPageSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
  const input = parsed.data

  try {
    const baseSlug = input.slug || slugifyPost(input.title)
    if (!baseSlug) return NextResponse.json({ error: "El título no genera un enlace válido" }, { status: 400 })
    let slug = baseSlug
    let n = 1
    while (await db.page.findUnique({ where: { slug } })) { n += 1; slug = `${baseSlug}-${n}` }

    const page = await db.page.create({ data: { slug, title: input.title, content: input.content, ...pageData(input) } as never })
    revalidatePath("/(site)/[locale]", "layout")
    return NextResponse.json({ ok: true, page })
  } catch (e) {
    console.error("[admin/pages POST]", e)
    return NextResponse.json({ error: "No se pudo guardar la página" }, { status: 500 })
  }
}
