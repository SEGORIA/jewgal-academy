import { db } from "./db"
import { sendAdminAlert } from "./email"

export type NotificationType = "duplicate_purchase_blocked" | "refund_synced" | "payment_received"

const SUBJECTS: Record<NotificationType, string> = {
  payment_received: "Nuevo pago recibido",
  duplicate_purchase_blocked: "Recompra bloqueada",
  refund_synced: "Reembolso procesado",
}

/**
 * Crea una notificación para el superadmin (bandeja in-app) y además la
 * envía por correo a ADMIN_EMAIL. Nunca debe romper el flujo que la dispara
 * (checkout, webhook) — cualquier error se traga silenciosamente.
 */
export async function createNotification(input: {
  type: NotificationType
  message: string
  metadata?: Record<string, unknown>
}) {
  try {
    await db.notification.create({
      data: {
        type: input.type,
        message: input.message,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      },
    })
  } catch {
    // No-op: una notificación fallida no debe afectar el checkout ni el webhook.
  }

  sendAdminAlert(SUBJECTS[input.type], input.message).catch(() => {})
}
