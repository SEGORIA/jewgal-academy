import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }
  const { currentPassword, newPassword } = parsed.data

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (!user?.password) {
    return NextResponse.json({ error: "Esta cuenta no tiene contraseña configurada" }, { status: 400 })
  }

  const matches = await bcrypt.compare(currentPassword, user.password)
  if (!matches) {
    return NextResponse.json({ error: "La contraseña actual no es correcta" }, { status: 401 })
  }

  const hashed = await bcrypt.hash(newPassword, 10)
  await db.user.update({ where: { id: session.user.id }, data: { password: hashed } })

  return NextResponse.json({ ok: true })
}
