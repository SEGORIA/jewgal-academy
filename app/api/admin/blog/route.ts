import { NextRequest, NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { slugifyPost } from "@/lib/blog"
import { createPostSchema, postContentData, publicationData } from "@/lib/blog-input"

export async function GET() {
  const g = await adminGuard("sitio")
  if (!g.ok) return g.response
  g.enter()

  try {
    const posts = await db.post.findMany({ orderBy: { createdAt: "desc" } })
    return NextResponse.json({ posts })
  } catch (e) {
    console.error("[admin/blog GET]", e)
    return NextResponse.json({ error: "No se pudieron cargar las entradas" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const g = await adminGuard("sitio")
  if (!g.ok) return g.response
  g.enter()

  const parsed = createPostSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos", details: parsed.error.flatten() }, { status: 400 })
  }
  const input = parsed.data

  try {
    const baseSlug = input.slug || slugifyPost(input.title)
    if (!baseSlug) {
      return NextResponse.json({ error: "El título no genera un enlace válido" }, { status: 400 })
    }
    let slug = baseSlug
    let n = 1
    while (await db.post.findUnique({ where: { slug } })) {
      n += 1
      slug = `${baseSlug}-${n}`
    }

    const post = await db.post.create({
      data: {
        slug,
        title: input.title,
        category: input.category,
        excerpt: input.excerpt,
        content: input.content,
        ...postContentData(input),
        ...publicationData(null, input),
      },
    })

    revalidatePath("/(site)/[locale]", "layout")
    return NextResponse.json({ ok: true, post })
  } catch (e) {
    console.error("[admin/blog POST]", e)
    return NextResponse.json({ error: "No se pudo guardar la entrada" }, { status: 500 })
  }
}
