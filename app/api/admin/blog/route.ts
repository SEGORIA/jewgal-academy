import { NextRequest, NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "@/lib/db"
import { slugifyPost } from "@/lib/blog"

export async function GET() {
  const g = await adminGuard("sitio")
  if (!g.ok) return g.response
  g.enter()
  const session = g.session

  const posts = await db.post.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json({ posts })
}

const createSchema = z.object({
  title: z.string().min(2),
  category: z.string().trim().min(1).max(40),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  isPublished: z.boolean().default(false),
})

export async function POST(req: NextRequest) {
  const g = await adminGuard("sitio")
  if (!g.ok) return g.response
  g.enter()
  const session = g.session

  const parsed = createSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 })
  }
  const data = parsed.data

  const baseSlug = slugifyPost(data.title)
  if (!baseSlug) {
    return NextResponse.json({ error: "El título no genera un slug válido" }, { status: 400 })
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
      title: data.title.trim(),
      category: data.category,
      excerpt: data.excerpt.trim(),
      content: data.content.trim(),
      isPublished: data.isPublished,
      publishedAt: data.isPublished ? new Date() : null,
    },
  })

  revalidatePath("/(site)/[locale]", "layout")
  return NextResponse.json({ ok: true, post })
}
