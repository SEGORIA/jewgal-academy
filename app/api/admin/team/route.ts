import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { adminGuard } from "@/lib/admin-guard"
import { db } from "@/lib/db"
import { STAFF_PERMISSION_KEYS } from "@/lib/permissions"
import { generateTempPassword } from "@/lib/security"

export const dynamic = "force-dynamic"

const MEMBER_SELECT = { id: true, name: true, email: true, role: true, status: true, permissions: true, lastLoginAt: true, createdAt: true } as const

/** Integrantes del equipo: Super administradores y colaboradores. */
export async function GET() {
  const g = await adminGuard("superadmin")
  if (!g.ok) return g.response
  g.enter()
  const members = await db.user.findMany({ where: { role: { in: ["admin", "staff"] } }, select: MEMBER_SELECT, orderBy: [{ role: "asc" }, { createdAt: "asc" }] })
  return NextResponse.json({ members, me: g.user.id })
}

const permissions = z.array(z.string()).transform((l) => [...new Set(l)]).refine((l) => l.every((p) => STAFF_PERMISSION_KEYS.includes(p)), "Permiso desconocido")

const createSchema = z.object({
  name: z.string().trim().min(2, "El nombre es muy corto").max(120),
  email: z.string().trim().toLowerCase().email("Email inválido").max(160),
  role: z.enum(["staff", "admin"]).default("staff"),
  permissions: permissions.default([]),
})

/** Crea una cuenta del equipo con una contraseña temporal (se muestra una sola vez). */
export async function POST(req: NextRequest) {
  const g = await adminGuard("superadmin")
  if (!g.ok) return g.response
  g.enter()
  const parsed = createSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
  const { name, email, role, permissions: perms } = parsed.data

  if (role === "staff" && perms.length === 0) return NextResponse.json({ error: "Elegí al menos un área para el/la colaborador/a." }, { status: 400 })
  const exists = await db.user.findUnique({ where: { email }, select: { id: true, role: true } })
  if (exists) {
    return NextResponse.json({ error: exists.role === "student" ? "Ese correo ya tiene una cuenta de alumno. Usá otro correo para la cuenta del equipo." : "Ya existe una cuenta con ese correo." }, { status: 409 })
  }

  const tempPassword = generateTempPassword()
  const user = await db.user.create({
    data: { name, email, role, permissions: role === "admin" ? [] : perms, password: await bcrypt.hash(tempPassword, 10) },
    select: MEMBER_SELECT,
  })
  return NextResponse.json({ ok: true, member: user, tempPassword })
}
