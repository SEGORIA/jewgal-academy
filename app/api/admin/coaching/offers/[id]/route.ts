import { NextRequest, NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import { db } from "@/lib/db"
import { offerSchema } from "@/lib/coaching-input"

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const g = await adminGuard("alumnos")
  if (!g.ok) return g.response
  g.enter()
  const { id } = await params
  const parsed = offerSchema.partial().safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
  const d = parsed.data
  const data = { ...d, ...(d.titleEn !== undefined ? { titleEn: d.titleEn || null } : {}), ...(d.descriptionEn !== undefined ? { descriptionEn: d.descriptionEn || null } : {}) }
  const offer = await db.coachingOffer.update({ where: { id }, data }).catch(() => null)
  if (!offer) return NextResponse.json({ error: "Oferta no encontrada" }, { status: 404 })
  return NextResponse.json({ ok: true, offer })
}

/** Eliminar una oferta no borra las reservas que ya tiene (guardan el nombre de la oferta). */
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const g = await adminGuard("alumnos")
  if (!g.ok) return g.response
  g.enter()
  const { id } = await params
  const deleted = await db.coachingOffer.delete({ where: { id } }).catch(() => null)
  if (!deleted) return NextResponse.json({ error: "Oferta no encontrada" }, { status: 404 })
  return NextResponse.json({ ok: true })
}
