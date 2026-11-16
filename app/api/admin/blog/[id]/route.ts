import { NextRequest, NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { patchPostSchema, postContentData, publicationData } from "@/lib/blog-input"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await adminGuard("sitio")
  if (!g.ok) return g.response
  g.enter()
  const { id } = await params

  const parsed = patchPostSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos", details: parsed.error.flatten() }, { status: 400 })
  }
  const input = parsed.data

  try {
    const existing = await db.post.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Entrada no encontrada" }, { status: 404 })
    }

    const data: Record<string, unknown> = {
      ...postContentData(input),
      ...publicationData(existing, input),
    }

    if (input.slug !== undefined && input.slug !== existing.slug) {
      const taken = await db.post.findUnique({ where: { slug: input.slug } })
      if (taken && taken.id !== id) {
        return NextResponse.json({ error: "Ese enlace ya lo usa otra entrada. Elegí uno distinto." }, { status: 409 })
      }
      data.slug = input.slug
    }

    const post = await db.post.update({ where: { id }, data })

    revalidatePath("/(site)/[locale]", "layout")
    return NextResponse.json({ ok: true, post })
  } catch (e) {
    console.error("[admin/blog PATCH]", e)
    return NextResponse.json({ error: "No se pudo guardar la entrada" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await adminGuard("sitio")
  if (!g.ok) return g.response
  g.enter()
  const { id } = await params

  const deleted = await db.post.delete({ where: { id } }).catch(() => null)
  if (!deleted) {
    return NextResponse.json({ error: "Entrada no encontrada" }, { status: 404 })
  }

  revalidatePath("/(site)/[locale]", "layout")
  return NextResponse.json({ ok: true })
}
