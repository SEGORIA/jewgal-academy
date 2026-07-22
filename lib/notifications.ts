import { db } from "./db"

export type NotificationType = "duplicate_purchase_blocked" | "refund_synced"

/**
 * Crea una notificación para el superadmin. Nunca debe romper el flujo que la
 * dispara (checkout, webhook) — cualquier error se traga silenciosamente.
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
}
