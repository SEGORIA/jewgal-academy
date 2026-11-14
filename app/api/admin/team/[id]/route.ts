import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { adminGuard } from "@/lib/admin-guard"
import { db } from "@/lib/db"
import { STAFF_PERMISSION_KEYS } from "@/lib/permissions"

const patchSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().toLowerCase().email("Email inválido").max(160).optional(),
  role: z.enum(["staff", "admin"]).optional(),
  status: z.enum(["active", "banned"]).optional(),
  permissions: z.array(z.string()).transform((l) => [...new Set(l)]).refine((l) => l.every((p) => STAFF_PERMISSION_KEYS.includes(p)), "Permiso desconocido").optional(),
})

/** Cuántos Super administradores activos hay (para no dejar la plataforma sin ninguno). */
const activeAdmins = () => db.user.count({ where: { role: "admin", status: { not: "banned" } } })

/** Cambia el nombre, el rol, los permisos o suspende / reactiva a un integrante del equipo. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await adminGuard("superadmin")
  if (!g.ok) return g.response
  g.enter()
  const { id } = await params

  const parsed = patchSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
  const d = parsed.data

  const member = await db.user.findUnique({ where: { id }, select: { id: true, role: true, status: true } })
  if (!member || (member.role !== "admin" && member.role !== "staff")) return NextResponse.json({ error: "Integrante no encontrado" }, { status: 404 })

  const isSelf = id === g.user.id
  const losesAdmin = member.role === "admin" && ((d.role && d.role !== "admin") || d.status === "banned")
  if (isSelf && (d.status === "banned" || (d.role && d.role !== member.role))) {
    return NextResponse.json({ error: "No podés suspenderte ni cambiar tu propio rol. Pedile a otro Super administrador que lo haga." }, { status: 409 })
  }
  if (losesAdmin && member.status !== "banned" && (await activeAdmins()) <= 1) {
    return NextResponse.json({ error: "Tiene que quedar al menos un Super administrador activo." }, { status: 409 })
  }

  const nextRole = d.role ?? member.role
  if (nextRole === "staff" && d.permissions && d.permissions.length === 0) {
    return NextResponse.json({ error: "Un colaborador necesita al menos un área asignada." }, { status: 400 })
  }

  const data: Record<string, unknown> = {}
  if (d.name !== undefined) data.name = d.name
  if (d.email !== undefined) {
    const taken = await db.user.findUnique({ where: { email: d.email }, select: { id: true } })
    if (taken && taken.id !== id) return NextResponse.json({ error: "Ya existe otra cuenta con ese correo." }, { status: 409 })
    data.email = d.email
  }
  if (d.status !== undefined) data.status = d.status
  if (d.role !== undefined) { data.role = d.role; if (d.role === "admin") data.permissions = [] }
  if (d.permissions !== undefined && nextRole === "staff") data.permissions = d.permissions
  if (!Object.keys(data).length) return NextResponse.json({ error: "Nada para actualizar" }, { status: 400 })

  const updated = await db.user.update({
    where: { id }, data,
    select: { id: true, name: true, email: true, role: true, status: true, permissions: true, lastLoginAt: true, createdAt: true },
  })
  return NextResponse.json({ ok: true, member: updated })
}

/** Elimina la cuenta de un integrante del equipo (para pausar su acceso sin borrarla, usá “Suspender”). */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await adminGuard("superadmin")
  if (!g.ok) return g.response
  g.enter()
  const { id } = await params

  if (id === g.user.id) return NextResponse.json({ error: "No podés eliminar tu propia cuenta." }, { status: 409 })
  const member = await db.user.findUnique({ where: { id }, select: { id: true, role: true, status: true } })
  if (!member || (member.role !== "admin" && member.role !== "staff")) return NextResponse.json({ error: "Integrante no encontrado" }, { status: 404 })
  if (member.role === "admin" && member.status !== "banned" && (await activeAdmins()) <= 1) {
    return NextResponse.json({ error: "Tiene que quedar al menos un Super administrador activo." }, { status: 409 })
  }

  try {
    await db.user.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Esa cuenta tiene registros asociados y no se puede eliminar. Suspendela para quitarle el acceso." }, { status: 409 })
  }
}
