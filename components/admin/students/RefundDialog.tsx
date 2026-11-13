"use client"

import { useState } from "react"
import { ConfirmDialog, api, useToast } from "@/components/admin/ui"
import { money } from "./types"

type Target = { id: string; amount: number; currency: string; courseTitle: string }

/** Diálogo compartido (ficha del alumno y pantalla de Pagos) para registrar un reembolso. */
export default function RefundDialog({ payment, onClose, onDone }: { payment: Target; onClose: () => void; onDone: () => void }) {
  const toast = useToast()
  const [revoke, setRevoke] = useState(true)
  const [busy, setBusy] = useState(false)

  async function refund() {
    setBusy(true)
    try {
      const r = await api<{ accessRevoked: boolean }>(`/api/admin/payments/${payment.id}`, { method: "PATCH", json: { status: "refunded", revokeAccess: revoke } })
      toast("ok", r.accessRevoked ? "Pago reembolsado y acceso al programa cancelado" : "Pago marcado como reembolsado")
      onDone()
    } catch (e) { toast("error", (e as Error).message); setBusy(false) }
  }

  return (
    <ConfirmDialog danger title="Registrar reembolso" confirmLabel="Marcar como reembolsado" busy={busy} onCancel={onClose} onConfirm={refund}
      text={
        <div style={{ display: "grid", gap: 12 }}>
          <p>Se marca como reembolsado el pago de <strong>{money(payment.amount, payment.currency)}</strong> por “{payment.courseTitle}”.</p>
          <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>Esto solo lo registra en la plataforma. Si se cobró con tarjeta o PayPal, el dinero se devuelve desde el panel de ese proveedor.</p>
          <label style={{ display: "flex", gap: 10, alignItems: "center", cursor: "pointer" }}>
            <input type="checkbox" checked={revoke} onChange={(e) => setRevoke(e.target.checked)} style={{ width: 18, height: 18, accentColor: "var(--terra)" }} />
            También cancelar el acceso del alumno a ese programa
          </label>
        </div>
      } />
  )
}
