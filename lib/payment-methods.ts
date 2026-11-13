/** Medios de pago que se pueden registrar a mano en el panel. */
export const PAYMENT_METHODS = ["transferencia", "efectivo", "paypal", "stripe", "otro"] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  transferencia: "Transferencia bancaria",
  efectivo: "Efectivo",
  paypal: "PayPal",
  stripe: "Tarjeta (Stripe)",
  otro: "Otro medio",
}

/** Estados que puede tener un pago. "demo" es el de las inscripciones de prueba. */
export const PAYMENT_STATUSES = ["completed", "pending", "refunded", "failed"] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  completed: "Pagado",
  pending: "Pendiente",
  refunded: "Reembolsado",
  failed: "Fallido",
  demo: "Demo",
}
