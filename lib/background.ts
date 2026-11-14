import { after } from "next/server"

/**
 * Corre una tarea (por ejemplo, enviar un correo) DESPUÉS de responder, sin bloquear la respuesta.
 *
 * Por qué no alcanza con `tarea().catch(() => {})` sin esperar: en Vercel, cuando la ruta ya respondió, la función
 * puede congelarse antes de que termine el pedido a Resend y el correo se pierde sin dejar rastro. `after()` mantiene la
 * función viva hasta que la tarea termina. Cualquier error se anota en el log (antes se tragaba en silencio).
 */
export function runAfterResponse(task: () => Promise<unknown>, label = "tarea en segundo plano") {
  const safe = async () => {
    try { await task() } catch (e) { console.error(`[${label}] falló:`, e) }
  }
  try {
    after(safe)
  } catch {
    // Fuera de una solicitud (scripts, pruebas): se lanza igual y se deja correr.
    void safe()
  }
}
