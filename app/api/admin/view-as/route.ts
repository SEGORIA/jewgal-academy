import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { z } from "zod"
import { adminGuard } from "@/lib/admin-guard"
import { baseDb } from "@/lib/db"
import { VIEW_AS_COOKIE } from "@/lib/auth"

export const dynamic = "force-dynamic"

const schema = z.object({ userId: z.string().min(1) })

/** Empieza a “ver el aula como” un alumno (solo lectura). Hace falta poder gestionar Alumnos. */
export async function POST(req: NextRequest) {
  const g = await adminGuard("alumnos")
  if (!g.ok) return g.response
  g.enter()
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })

  const student = await baseDb.user.findUnique({ where: { id: parsed.data.userId }, select: { id: true, role: true, name: true } })
  if (!student || student.role !== "student") return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 })

  const jar = await cookies()
  jar.set(VIEW_AS_COOKIE, student.id, { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 2 })
  await baseDb.auditLog.create({ data: { actorId: g.user.id, actorName: g.user.name, actorRole: g.user.role, action: "view", model: "Alumno", recordId: student.id, label: `Vio el aula como ${student.name}` } }).catch(() => {})
  return NextResponse.json({ ok: true })
}

/** Sale de la vista de alumno. */
export async function DELETE() {
  const jar = await cookies()
  jar.delete(VIEW_AS_COOKIE)
  return NextResponse.json({ ok: true })
}
