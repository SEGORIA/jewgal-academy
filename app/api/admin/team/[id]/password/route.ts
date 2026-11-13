import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { adminGuard } from "@/lib/admin-guard"
import { db } from "@/lib/db"
import { generateTempPassword } from "@/lib/security"

/** Contraseña temporal nueva para un integrante del equipo (se muestra una sola vez). */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await adminGuard("superadmin")
  if (!g.ok) return g.response
  g.enter()
  const { id } = await params

  const member = await db.user.findUnique({ where: { id }, select: { id: true, role: true } })
  if (!member || (member.role !== "admin" && member.role !== "staff")) return NextResponse.json({ error: "Integrante no encontrado" }, { status: 404 })

  const tempPassword = generateTempPassword()
  await db.user.update({ where: { id }, data: { password: await bcrypt.hash(tempPassword, 10) } })
  return NextResponse.json({ ok: true, tempPassword })
}
