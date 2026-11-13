import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { adminGuard } from "@/lib/admin-guard"
import { db } from "@/lib/db"
import { generateTempPassword } from "@/lib/security"

/**
 * Genera una contraseña temporal nueva para el alumno y la devuelve UNA sola vez
 * (el panel se la muestra a quien administra para que se la haga llegar).
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await adminGuard("alumnos")
  if (!g.ok) return g.response
  g.enter()
  const { id } = await params

  const student = await db.user.findUnique({ where: { id }, select: { id: true, role: true } })
  if (!student || student.role !== "student") {
    return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 })
  }

  const tempPassword = generateTempPassword()
  await db.user.update({ where: { id }, data: { password: await bcrypt.hash(tempPassword, 10) } })
  return NextResponse.json({ ok: true, tempPassword })
}
