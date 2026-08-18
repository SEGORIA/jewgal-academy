import { db } from "./db"
import { sendAdminAlert } from "./email"

export type NotificationType = "duplicate_purchase_blocked" | "refund_synced" | "payment_received" | "forum_reply"

const SUBJECTS: Record<NotificationType, string> = {
  payment_received: "Nuevo pago recibido",
  duplicate_purchase_blocked: "Recompra bloqueada",
  refund_synced: "Reembolso procesado",
  forum_reply: "Nueva respuesta en el foro",
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
    sendAdminAlert(SUBJECTS[input.type], input.message).catch(() => {})
  }
}
