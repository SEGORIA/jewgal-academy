"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { CheckCircle2, Eye, EyeOff, Link2Off, Loader2 } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { authButton, authError, authInput, authLabel, authLink, authText, authTitle } from "@/components/auth/auth-styles"

const MIN = 8

export default function ResetForm({ token, valid }: { token: string; valid: boolean }) {
  const t = useTranslations("Login")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [state, setState] = useState<"form" | "done" | "invalid">(valid ? "form" : "invalid")

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < MIN) { setError(t("resetTooShort")); return }
    if (password !== confirm) { setError(t("resetMismatch")); return }
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/password/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) })
      const data = await res.json().catch(() => ({}))
      if (res.ok) { setState("done"); return }
      if (data.code === "invalid_token") { setState("invalid"); return }
      setError(res.status === 429 ? t("forgotRateLimited") : t("resetError"))
    } catch {
      setError(t("resetError"))
    } finally {
      setLoading(false)
    }
  }

  if (state === "invalid") {
    return (
      <div role="alert" style={{ textAlign: "center" }}>
        <Link2Off size={42} aria-hidden style={{ color: "var(--danger)", marginBottom: 16 }} />
        <h1 style={authTitle}>{t("resetInvalidTitle")}</h1>
        <p style={authText}>{t("resetInvalidText")}</p>
        <Link href="/recuperar-contrasena" style={{ ...authButton, textDecoration: "none", marginBottom: 18 }}>{t("resetRequestNew")}</Link>
        <Link href="/login" style={authLink}>{t("backToLogin")}</Link>
      </div>
    )
  }

  if (state === "done") {
    return (
      <div role="status" style={{ textAlign: "center" }}>
        <CheckCircle2 size={46} aria-hidden style={{ color: "var(--success)", marginBottom: 16 }} />
        <h1 style={authTitle}>{t("resetDoneTitle")}</h1>
        <p style={authText}>{t("resetDoneText")}</p>
        <Link href="/login" style={{ ...authButton, textDecoration: "none" }}>{t("resetDoneCta")}</Link>
      </div>
    )
  }

  return (
    <>
      <h1 style={authTitle}>{t("resetTitle")}</h1>
      <p style={authText}>{t("resetSubtitle")}</p>
      {error && <div role="alert" style={authError}>{error}</div>}
      <form onSubmit={submit} noValidate style={{ display: "grid", gap: 20 }}>
        <div>
          <label htmlFor="reset-password" style={authLabel}>{t("resetNew")}</label>
          <div style={{ position: "relative" }}>
            <input
              id="reset-password" name="new-password" type={show ? "text" : "password"} autoComplete="new-password" required autoFocus
              value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...authInput, paddingRight: 46 }}
            />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? t("hidePassword") : t("showPassword")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 8, display: "flex" }}>
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="reset-confirm" style={authLabel}>{t("resetConfirm")}</label>
          <input
            id="reset-confirm" name="confirm-password" type={show ? "text" : "password"} autoComplete="new-password" required
            value={confirm} onChange={(e) => setConfirm(e.target.value)} style={authInput}
          />
        </div>
        <button type="submit" disabled={loading} style={{ ...authButton, opacity: loading ? 0.7 : 1, cursor: loading ? "wait" : "pointer" }}>
          {loading && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
          {t("resetSubmit")}
        </button>
      </form>
    </>
  )
}
