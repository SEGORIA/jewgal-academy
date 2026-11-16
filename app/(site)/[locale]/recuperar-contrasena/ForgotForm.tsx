"use client"

import { useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Loader2, MailCheck } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { authButton, authError, authInput, authLabel, authLink, authText, authTitle } from "@/components/auth/auth-styles"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ForgotForm() {
  const t = useTranslations("Login")
  const locale = useLocale()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!EMAIL_RE.test(email.trim())) { setError(t("forgotInvalidEmail")); return }
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/password/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim(), locale }) })
      if (res.status === 429) { setError(t("forgotRateLimited")); return }
      if (!res.ok) { setError(t("forgotError")); return }
      setSent(true)
    } catch {
      setError(t("forgotError"))
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div role="status" style={{ textAlign: "center" }}>
        <MailCheck size={44} aria-hidden style={{ color: "var(--gold-ink)", marginBottom: 16 }} />
        <h1 style={authTitle}>{t("forgotSentTitle")}</h1>
        <p style={authText}>{t("forgotSentText", { email: email.trim() })}</p>
        <Link href="/login" style={authLink}>{t("backToLogin")}</Link>
      </div>
    )
  }

  return (
    <>
      <h1 style={authTitle}>{t("forgotTitle")}</h1>
      <p style={authText}>{t("forgotSubtitle")}</p>
      {error && <div role="alert" style={authError}>{error}</div>}
      <form onSubmit={submit} noValidate style={{ display: "grid", gap: 20 }}>
        <div>
          <label htmlFor="forgot-email" style={authLabel}>{t("email")}</label>
          <input
            id="forgot-email" name="email" type="email" autoComplete="email" inputMode="email" required autoFocus
            value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" style={authInput}
          />
        </div>
        <button type="submit" disabled={loading} style={{ ...authButton, opacity: loading ? 0.7 : 1, cursor: loading ? "wait" : "pointer" }}>
          {loading && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
          {loading ? t("forgotSending") : t("forgotSubmit")}
        </button>
      </form>
      <div style={{ textAlign: "center", marginTop: 24 }}>
        <Link href="/login" style={authLink}>{t("backToLogin")}</Link>
      </div>
    </>
  )
}
