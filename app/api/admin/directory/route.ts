import { NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import { can } from "@/lib/permissions"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

/**
 * Listas livianas (alumnos y programas) para los formularios de inscripción y de pagos.
 * Basta con poder gestionar Alumnos, Pagos o Comunicaciones: no hace falta tener también permiso sobre Programas.
 */
export async function GET() {
  const g = await adminGuard("any")
  if (!g.ok) return g.response
  g.enter()
  if (!can(g.user, "alumnos") && !can(g.user, "pagos") && !can(g.user, "comunicaciones")) {
    return NextResponse.json({ error: "No tenés permiso para esta acción" }, { status: 403 })
  }

  const [students, courses] = await Promise.all([
    db.user.findMany({ where: { role: "student" }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }),
    db.course.findMany({ select: { id: true, title: true, price: true, currency: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
  ])
  return NextResponse.json({ students, courses })
}
