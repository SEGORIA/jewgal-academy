"use client"

import { useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { authButton, authError, authText, authTitle } from "@/components/auth/auth-styles"

const TEXT = {
  es: { confirm: "Sí, cancelar mi sesión", cancelling: "Cancelando…", doneTitle: "Sesión cancelada", doneText: "Liberamos el horario. Si querés reservar otro, podés hacerlo cuando quieras.", error: "No se pudo cancelar. Probá de nuevo o escribinos." },
  en: { confirm: "Yes, cancel my session", cancelling: "Cancelling…", doneTitle: "Session cancelled", doneText: "We freed up the time slot. You can book another one whenever you like.", error: "It couldn't be cancelled. Please try again or write to us." },
} as const

export default function CancelBooking({ id, token, locale }: { id: string; token: string; locale: "es" | "en" }) {
  const t = TEXT[locale]
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle")

  async function cancel() {
    setState("loading")
    try {
      const res = await fetch("/api/coaching/cancel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, token }) })
      setState(res.ok ? "done" : "error")
    } catch { setState("error") }
  }

  if (state === "done") {
    return (
      <div role="status" style={{ textAlign: "center" }}>
        <CheckCircle2 size={44} aria-hidden style={{ color: "var(--success)", marginBottom: 14 }} />
        <h2 style={authTitle}>{t.doneTitle}</h2>
        <p style={authText}>{t.doneText}</p>
      </div>
    )
  }
  return (
    <>
      {state === "error" && <div role="alert" style={authError}>{t.error}</div>}
      <button type="button" onClick={cancel} disabled={state === "loading"} style={{ ...authButton, opacity: state === "loading" ? 0.7 : 1 }}>
        {state === "loading" && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
        {state === "loading" ? t.cancelling : t.confirm}
      </button>
    </>
  )
}
