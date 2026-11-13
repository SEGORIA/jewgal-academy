import { NextRequest, NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

function randomPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"
  let out = ""
  for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await adminGuard("alumnos")
  if (!g.ok) return g.response
  g.enter()
  const session = g.session
  const { id } = await params

  const student = await db.user.findUnique({ where: { id } })
  if (!student) {
    return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 })
  }

  const tempPassword = randomPassword()
  await db.user.update({ where: { id }, data: { password: await bcrypt.hash(tempPassword, 10) } })

  return NextResponse.json({ ok: true, tempPassword })
}
