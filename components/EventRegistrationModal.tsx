"use client"

import { useEffect, useRef, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { CheckCircle2, Loader2, X } from "lucide-react"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const field: React.CSSProperties = {
  width: "100%", border: "1.5px solid var(--line-d)", borderRadius: 12, padding: "12px 14px", fontSize: 15, color: "var(--text)",
  outline: "none", background: "var(--surface-2)", fontFamily: "inherit",
}
const lbl: React.CSSProperties = { display: "block", fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--on-dark-faint)", marginBottom: 7 }

/** Formulario de reserva de un lugar en un evento (con cupo y lista de espera). */
export default function EventRegistrationModal({ event, onClose }: { event: { id: string; title: string }; onClose: () => void }) {
  const t = useTranslations("Eventos")
  const locale = useLocale()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<null | { status: "confirmed" | "waitlist"; already: boolean }>(null)
  const firstRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    firstRef.current?.focus()
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey) }
  }, [onClose])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim().length < 2 || !EMAIL_RE.test(email.trim())) { setError(t("registerInvalid")); return }
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/eventos/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: event.id, name, email, phone: phone || undefined, notes: notes || undefined, locale }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(t("registerError")); return } // los mensajes del servidor están en español: se muestra el genérico, ya traducido
      setResult({ status: data.status, already: !!data.already })
    } catch {
      setError(t("registerError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 120, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto" }}>
      <div onClick={onClose} aria-hidden style={{ position: "fixed", inset: 0, background: "var(--scrim)", backdropFilter: "blur(6px)" }} />
      <div role="dialog" aria-modal="true" aria-label={t("registerTitle")} style={{ position: "relative", width: "100%", maxWidth: 480, background: "var(--navy)", border: "1px solid var(--line-d)", borderRadius: 18, padding: "30px 28px", boxShadow: "0 40px 120px rgba(0,0,0,.5)", margin: "auto" }}>
        <button type="button" onClick={onClose} aria-label={t("registerClose")} style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", color: "var(--on-dark)", cursor: "pointer", padding: 6, display: "flex" }}><X size={18} /></button>

        {result ? (
          <div role="status" style={{ textAlign: "center", padding: "12px 0 4px" }}>
            <CheckCircle2 size={46} aria-hidden style={{ color: result.status === "confirmed" ? "var(--success)" : "var(--gold-ink)", marginBottom: 14 }} />
            <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 26, color: "var(--text)", marginBottom: 10 }}>
              {result.status === "confirmed" ? t("registerOkTitle") : t("registerWaitTitle")}
            </h2>
            <p style={{ color: "var(--on-dark)", fontSize: 14.5, lineHeight: 1.65, marginBottom: result.already ? 8 : 22 }}>
              {result.status === "confirmed" ? t("registerOkText", { email: email.trim() }) : t("registerWaitText", { email: email.trim() })}
            </p>
            {result.already && <p style={{ color: "var(--gold-ink)", fontSize: 13, marginBottom: 22 }}>{t("registerAlready")}</p>}
            <button type="button" className="btn solid" onClick={onClose}>{t("registerClose")}</button>
          </div>
        ) : (
          <>
            <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 26, color: "var(--text)", marginBottom: 6 }}>{t("registerTitle")}</h2>
            <p style={{ color: "var(--gold-ink)", fontSize: 14, marginBottom: 22 }}>{event.title}</p>
            {error && <div role="alert" style={{ background: "rgba(220,38,38,.12)", border: "1px solid rgba(220,38,38,.35)", color: "var(--danger)", borderRadius: 10, padding: "10px 14px", fontSize: 13.5, marginBottom: 16 }}>{error}</div>}
            <form onSubmit={submit} noValidate style={{ display: "grid", gap: 14 }}>
              <div><label htmlFor="er-name" style={lbl}>{t("registerName")}</label><input id="er-name" ref={firstRef} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required maxLength={120} style={field} /></div>
              <div><label htmlFor="er-email" style={lbl}>{t("registerEmail")}</label><input id="er-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" required maxLength={200} style={field} /></div>
              <div><label htmlFor="er-phone" style={lbl}>{t("registerPhone")}</label><input id="er-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" maxLength={40} style={field} /></div>
              <div><label htmlFor="er-notes" style={lbl}>{t("registerNotes")}</label><textarea id="er-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} maxLength={500} style={{ ...field, resize: "vertical" }} /></div>
              <button type="submit" disabled={loading} className="btn solid" style={{ justifyContent: "center", opacity: loading ? 0.7 : 1 }}>
                {loading && <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />}
                {loading ? t("registerSending") : t("registerSubmit")}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
