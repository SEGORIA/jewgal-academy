import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { adminGuard } from "@/lib/admin-guard"
import { db } from "@/lib/db"
import { patchPageSchema, pageData } from "@/lib/page-input"

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const g = await adminGuard("sitio")
  if (!g.ok) return g.response
  g.enter()
  const { id } = await params

  const parsed = patchPageSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
  const input = parsed.data

  try {
    const existing = await db.page.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Página no encontrada" }, { status: 404 })

    const data: Record<string, unknown> = pageData(input)
    if (input.slug !== undefined && input.slug !== existing.slug) {
      const taken = await db.page.findUnique({ where: { slug: input.slug } })
      if (taken && taken.id !== id) return NextResponse.json({ error: "Ese enlace ya lo usa otra página. Elegí uno distinto." }, { status: 409 })
      data.slug = input.slug
    }
    const page = await db.page.update({ where: { id }, data })
    revalidatePath("/(site)/[locale]", "layout")
    return NextResponse.json({ ok: true, page })
  } catch (e) {
    console.error("[admin/pages PATCH]", e)
    return NextResponse.json({ error: "No se pudo guardar la página" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const g = await adminGuard("sitio")
  if (!g.ok) return g.response
  g.enter()
  const { id } = await params

  const deleted = await db.page.delete({ where: { id } }).catch(() => null)
  if (!deleted) return NextResponse.json({ error: "Página no encontrada" }, { status: 404 })
  revalidatePath("/(site)/[locale]", "layout")
  return NextResponse.json({ ok: true })
}
