import { NextRequest, NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import { db } from "@/lib/db"
import { offerSchema } from "@/lib/coaching-input"

export async function GET() {
  const g = await adminGuard("alumnos")
  if (!g.ok) return g.response
  g.enter()
  const offers = await db.coachingOffer.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] })
  return NextResponse.json({ offers })
}

export async function POST(req: NextRequest) {
  const g = await adminGuard("alumnos")
  if (!g.ok) return g.response
  g.enter()
  const parsed = offerSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
  const d = parsed.data
  const offer = await db.coachingOffer.create({ data: { ...d, titleEn: d.titleEn || null, descriptionEn: d.descriptionEn || null } })
  return NextResponse.json({ ok: true, offer })
}
