import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

// Las rutas existentes del proyecto chequean sesión inline (no había un
// helper compartido) — acá sí se justifica uno porque el foro agrega ~12
// rutas nuevas que repiten los mismos dos chequeos. No toca las rutas ya
// existentes.

type AuthFail = { ok: false; response: NextResponse }
type AuthOk = { ok: true; userId: string }

export async function requireAdmin(): Promise<AuthFail | AuthOk> {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }
  return { ok: true, userId: session.user.id }
}

export async function requireStudent(): Promise<AuthFail | AuthOk> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, response: NextResponse.json({ error: "No autenticado" }, { status: 401 }) }
  }
  return { ok: true, userId: session.user.id }
}

// Chequea el baneo fresco desde la base, no desde el JWT — la sesión usa
// strategy:"jwt", así que un flag de baneo embebido en el token quedaría
// desactualizado hasta el próximo login. Una consulta extra, pero correcta.
export async function requireActiveStudent(): Promise<AuthFail | AuthOk> {
  const result = await requireStudent()
  if (!result.ok) return result

  const user = await db.user.findUnique({ where: { id: result.userId }, select: { status: true } })
  if (!user || user.status === "banned") {
    return { ok: false, response: NextResponse.json({ error: "Tu cuenta no puede publicar en el foro" }, { status: 403 }) }
  }
  return { ok: true, userId: result.userId }
}

// courseId null = categoría general, accesible a cualquier alumno logueado.
// Con courseId, requiere una Enrollment activa/completada de ese programa.
export async function canAccessCategory(userId: string, courseId: string | null): Promise<boolean> {
  if (courseId === null) return true
  const enrollment = await db.enrollment.findFirst({
    where: { userId, courseId, status: { in: ["active", "completed"] } },
    select: { id: true },
  })
  return !!enrollment
}
