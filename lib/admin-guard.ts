import { NextResponse } from "next/server"
import type { Session } from "next-auth"
import { realAuth as auth } from "@/lib/auth"
import { baseDb } from "@/lib/db"
import { setActor } from "@/lib/audit"
import { can, isPanelRole, type Permission } from "@/lib/permissions"

export type GuardUser = { id: string; name: string; email: string; role: string; permissions: string[] }
type GuardFail = { ok: false; response: NextResponse }
type GuardOk = { ok: true; session: Session; user: GuardUser; /** Registra quién actúa para el historial. Debe llamarlo la propia ruta (el contexto no se propaga desde la guarda). */ enter: () => void }

/**
 * Guarda de las rutas del panel: confirma la sesión, relee el usuario desde la base (un baneo o un cambio de
 * permisos se aplica en el acto, no cuando vence el token) y comprueba el permiso pedido.
 * Además deja registrado quién actúa, para el historial de cambios.
 *
 *   const g = await adminGuard("cursos")
 *   if (!g.ok) return g.response
 *   g.enter()
 */
export async function adminGuard(perm: Permission = "any"): Promise<GuardFail | GuardOk> {
  const session = await auth()
  const forbidden = (status = 403, error = "Forbidden"): GuardFail => ({ ok: false, response: NextResponse.json({ error }, { status }) })

  if (!session?.user?.id) return forbidden(401, "No autenticado")
  if (!isPanelRole(session.user.role)) return forbidden()

  const user = await baseDb.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, status: true, permissions: true },
  })
  if (!user || user.status === "banned" || !isPanelRole(user.role)) return forbidden()
  if (!can(user, perm)) return forbidden(403, "No tenés permiso para esta acción")

  const actor = { id: user.id, name: user.name, role: user.role }
  return {
    ok: true, session, enter: () => setActor(actor),
    user: { id: user.id, name: user.name, email: user.email, role: user.role, permissions: user.permissions },
  }
}
