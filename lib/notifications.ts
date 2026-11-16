import { db } from "./db"
import { runAfterResponse } from "./background"
import { sendAdminAlert } from "./email"

export type NotificationType = "duplicate_purchase_blocked" | "refund_synced" | "payment_received" | "forum_reply" | "contact_message" | "event_registration" | "coaching_booking"

const SUBJECTS: Record<NotificationType, string> = {
  payment_received: "Nuevo pago recibido",
  duplicate_purchase_blocked: "Recompra bloqueada",
  refund_synced: "Reembolso procesado",
  forum_reply: "Nueva respuesta en el foro",
  contact_message: "Nuevo mensaje de contacto",
  event_registration: "Nueva reserva de evento",
  coaching_booking: "Nueva reserva de Coaching 1:1",
}

/**
 * Crea una notificación. Sin `userId` (comportamiento original, sin cambios
 * para checkout/webhooks) es una notificación admin/global — bandeja in-app
 * de Devora + email a ADMIN_EMAIL. Con `userId` es una notificación dirigida
 * a ese alumno — solo in-app, no dispara el email de admin.
 * Nunca debe romper el flujo que la dispara — cualquier error se traga.
 */
export async function createNotification(input: {
  type: NotificationType
  message: string
  metadata?: Record<string, unknown>
  userId?: string | null
}) {
  try {
    await db.notification.create({
      data: {
        type: input.type,
        message: input.message,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        userId: input.userId ?? null,
      },
    })
  } catch {
    // No-op: una notificación fallida no debe afectar el checkout, el webhook ni el foro.
  }

  if (!input.userId) {
    // En un mensaje de contacto, "Responder" en el correo de aviso le contesta directo a quien escribió.
    const email = input.metadata?.email
    const replyTo = (input.type === "contact_message" || input.type === "coaching_booking") && typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined
    runAfterResponse(() => sendAdminAlert(SUBJECTS[input.type], input.message, replyTo), "alerta al administrador")
  }
}
