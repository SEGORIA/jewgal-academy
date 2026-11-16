"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { CheckCircle2, Clock, Loader2 } from "lucide-react"
import { formatPrice } from "@/lib/utils"

type Offer = { id: string; title: string; description: string; durationMin: number; price: number; currency: string }
type Config = { enabled: boolean; timezone?: string; instructions?: string; offers: Offer[] }
type Day = { date: string; slots: string[] }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const field: React.CSSProperties = { width: "100%", border: "1.5px solid var(--line-d)", borderRadius: 10, padding: "12px 14px", fontSize: 15, color: "var(--text)", outline: "none", background: "var(--surface-2)", fontFamily: "inherit" }
const lbl: React.CSSProperties = { display: "block", fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--on-dark-faint)", marginBottom: 7 }
const step: React.CSSProperties = { fontSize: 11.5, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold-ink)", marginBottom: 12, display: "block" }

/**
 * Reserva de sesiones de Coaching 1:1 (oferta → día → horario → datos). Los horarios se muestran en la zona horaria de quien visita.
 * Si las reservas están apagadas o no hay ofertas activas, no dibuja nada y la página sigue con su formulario de contacto.
 */
export default function CoachingBooking() {
  const t = useTranslations("Coaching")
  const locale = useLocale()
  const loc = locale === "en" ? "en-US" : "es-ES"
  const [config, setConfig] = useState<Config | null>(null)
  const [offerId, setOfferId] = useState("")
  const [days, setDays] = useState<Day[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [nextFrom, setNextFrom] = useState<string | null>(null)
  const [date, setDate] = useState("") // fecha local de quien visita
  const [slot, setSlot] = useState("") // ISO UTC
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState<null | { status: string; when: string }>(null)

  const visitorTz = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, [])

  useEffect(() => {
    fetch(`/api/coaching/offers?locale=${locale}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d: Config) => { setConfig(d); if (d.enabled && d.offers.length === 1) setOfferId(d.offers[0].id) })
      .catch(() => setConfig({ enabled: false, offers: [] }))
  }, [locale])

  const loadSlots = useCallback(async (id: string, from?: string) => {
    setLoadingSlots(true)
    try {
      const r = await fetch(`/api/coaching/slots?offerId=${encodeURIComponent(id)}&days=21${from ? `&from=${from}` : ""}`, { cache: "no-store" })
      const d = await r.json()
      if (r.ok) {
        setDays((prev) => (from ? [...prev, ...d.days] : d.days))
        const last: string | undefined = d.days[d.days.length - 1]?.date
        if (last) { const x = new Date(`${last}T00:00:00Z`); x.setUTCDate(x.getUTCDate() + 1); setNextFrom(x.toISOString().slice(0, 10)) }
      }
    } finally { setLoadingSlots(false) }
  }, [])

  useEffect(() => {
    if (!offerId) return
    setDays([]); setDate(""); setSlot(""); setNextFrom(null); setDone(null)
    loadSlots(offerId)
  }, [offerId, loadSlots])

  // Los turnos se agrupan por el día en la zona horaria de quien visita (puede ser otro día que el de la consultora).
  const byLocalDate = useMemo(() => {
    const fmt = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }) // YYYY-MM-DD en la zona de quien visita
    const map = new Map<string, string[]>()
    for (const d of days) for (const iso of d.slots) {
      const k = fmt.format(new Date(iso))
      map.set(k, [...(map.get(k) ?? []), iso])
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => ({ date: k, slots: v.sort() }))
  }, [days])

  if (!config?.enabled) return null
  const offer = config.offers.find((o) => o.id === offerId)
  const dayLabel = (k: string) => new Intl.DateTimeFormat(loc, { weekday: "short", day: "numeric", month: "short" }).format(new Date(`${k}T12:00:00`))
  const timeLabel = (iso: string) => new Intl.DateTimeFormat(loc, { hour: "2-digit", minute: "2-digit" }).format(new Date(iso))
  const whenLabel = (iso: string) => new Intl.DateTimeFormat(loc, { dateStyle: "full", timeStyle: "short" }).format(new Date(iso))
  const slotsOfDay = byLocalDate.find((d) => d.date === date)?.slots ?? []

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim().length < 2 || !EMAIL_RE.test(email.trim())) { setError(t("bkInvalid")); return }
    setSending(true); setError("")
    try {
      const res = await fetch("/api/coaching/book", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId, startsAt: slot, name, email, phone: phone || undefined, notes: notes || undefined, locale }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const known: Record<string, string> = { slot_taken: t("bkSlotTaken"), same_day: t("bkSameDay"), rate_limited: t("bkRate") }
        setError(known[data.code as string] ?? t("bkError"))
        if (data.code === "slot_taken") { setSlot(""); loadSlots(offerId) } // el turno se ocupó: se refrescan los horarios
        return
      }
      setDone({ status: data.status, when: whenLabel(slot) })
    } catch {
      setError(t("bkError"))
    } finally { setSending(false) }
  }

  if (done) {
    const confirmed = done.status === "confirmed"
    return (
      <div role="status" style={{ border: "1px solid var(--line-d)", borderRadius: 12, padding: "36px 28px", textAlign: "center", marginBottom: 40 }}>
        <CheckCircle2 size={44} aria-hidden style={{ color: confirmed ? "var(--success)" : "var(--gold-ink)", marginBottom: 14 }} />
        <h3 style={{ fontFamily: "var(--serif)", fontSize: 26, color: "var(--text)", marginBottom: 10 }}>{confirmed ? t("bkOkTitleConfirmed") : t("bkOkTitlePending")}</h3>
        <p style={{ color: "var(--on-dark)", fontSize: 15, lineHeight: 1.65 }}>{confirmed ? t("bkOkConfirmed", { when: done.when, email: email.trim() }) : t("bkOkPending", { when: done.when, email: email.trim() })}</p>
      </div>
    )
  }

  return (
    <div style={{ marginBottom: 44 }}>
      {config.instructions && <p style={{ color: "var(--on-dark)", fontSize: 14.5, lineHeight: 1.7, marginBottom: 26, whiteSpace: "pre-line" }}>{config.instructions}</p>}

      {/* 1 · Tipo de sesión */}
      <span style={step}>1 · {t("bkChoose")}</span>
      <div role="radiogroup" aria-label={t("bkChoose")} style={{ display: "grid", gap: 10, marginBottom: 28 }}>
        {config.offers.map((o) => (
          <button key={o.id} type="button" role="radio" aria-checked={offerId === o.id} onClick={() => setOfferId(o.id)}
            style={{ textAlign: "left", cursor: "pointer", fontFamily: "inherit", border: `1.5px solid ${offerId === o.id ? "var(--gold)" : "var(--line-d)"}`, background: offerId === o.id ? "rgba(196,159,114,.1)" : "var(--surface-2)", borderRadius: 12, padding: "14px 16px", color: "var(--text)" }}>
            <span style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <strong style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 18 }}>{o.title}</strong>
              <span style={{ color: "var(--gold-ink)", fontSize: 14 }}><Clock size={13} style={{ verticalAlign: -2, marginRight: 4 }} aria-hidden />{t("bkMinutes", { n: o.durationMin })}{o.price > 0 ? ` · ${formatPrice(o.price, o.currency)}` : ""}</span>
            </span>
            {o.description && <span style={{ display: "block", color: "var(--on-dark)", fontSize: 13.5, marginTop: 6, lineHeight: 1.55 }}>{o.description}</span>}
          </button>
        ))}
      </div>

      {offer && (
        <>
          {/* 2 · Día y horario */}
          <span style={step}>2 · {t("bkPickDate")}</span>
          {loadingSlots && days.length === 0 ? (
            <p style={{ color: "var(--on-dark-faint)", display: "flex", gap: 8, alignItems: "center" }}><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> {t("bkLoading")}</p>
          ) : byLocalDate.length === 0 ? (
            <p style={{ color: "var(--on-dark)", fontSize: 14.5, lineHeight: 1.65 }}>{t("bkNoSlots")}</p>
          ) : (
            <>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                {byLocalDate.slice(0, 40).map((d) => (
                  <button key={d.date} type="button" aria-pressed={date === d.date} onClick={() => { setDate(d.date); setSlot("") }}
                    style={{ cursor: "pointer", fontFamily: "inherit", fontSize: 13, textTransform: "capitalize", borderRadius: 20, padding: "8px 14px", border: `1.5px solid ${date === d.date ? "var(--gold)" : "var(--line-d)"}`, background: date === d.date ? "var(--gold)" : "transparent", color: date === d.date ? "var(--navy)" : "var(--on-dark)" }}>
                    {dayLabel(d.date)}
                  </button>
                ))}
                {nextFrom && (
                  <button type="button" onClick={() => loadSlots(offerId, nextFrom)} disabled={loadingSlots} style={{ cursor: "pointer", fontFamily: "inherit", fontSize: 13, borderRadius: 20, padding: "8px 14px", border: "1.5px dashed var(--line-d)", background: "transparent", color: "var(--gold-ink)" }}>
                    {loadingSlots ? "…" : t("bkMore")}
                  </button>
                )}
              </div>

              {date && (
                <>
                  <span style={step}>{t("bkPickTime")}</span>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                    {slotsOfDay.map((iso) => (
                      <button key={iso} type="button" aria-pressed={slot === iso} onClick={() => setSlot(iso)}
                        style={{ cursor: "pointer", fontFamily: "inherit", fontSize: 14, borderRadius: 10, padding: "9px 16px", border: `1.5px solid ${slot === iso ? "var(--gold)" : "var(--line-d)"}`, background: slot === iso ? "var(--gold)" : "transparent", color: slot === iso ? "var(--navy)" : "var(--text)" }}>
                        {timeLabel(iso)}
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: "var(--on-dark-faint)", marginBottom: 26 }}>{t("bkTz", { tz: visitorTz.replace(/_/g, " ") })}</p>
                </>
              )}
            </>
          )}

          {/* 3 · Datos */}
          {slot && (
            <form onSubmit={submit} noValidate style={{ display: "grid", gap: 14, marginTop: 6 }}>
              <span style={step}>3 · {t("bkYourData")}</span>
              <p style={{ color: "var(--gold-ink)", fontSize: 14, marginTop: -4 }}>{t("bkSelected")}: {whenLabel(slot)}</p>
              {error && <div role="alert" style={{ background: "rgba(220,38,38,.12)", border: "1px solid rgba(220,38,38,.35)", color: "var(--danger)", borderRadius: 10, padding: "10px 14px", fontSize: 13.5 }}>{error}</div>}
              <div><label htmlFor="cb-name" style={lbl}>{t("bkName")}</label><input id="cb-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required maxLength={120} style={field} /></div>
              <div><label htmlFor="cb-email" style={lbl}>{t("bkEmail")}</label><input id="cb-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" required maxLength={200} style={field} /></div>
              <div><label htmlFor="cb-phone" style={lbl}>{t("bkPhone")}</label><input id="cb-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" maxLength={40} style={field} /></div>
              <div><label htmlFor="cb-notes" style={lbl}>{t("bkNotes")}</label><textarea id="cb-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={1000} style={{ ...field, resize: "vertical" }} /></div>
              <button type="submit" className="btn solid" disabled={sending} style={{ justifyContent: "center", opacity: sending ? 0.7 : 1 }}>
                {sending ? t("bkSending") : t("bkSubmit")}
              </button>
            </form>
          )}
        </>
      )}

      <p style={{ textAlign: "center", color: "var(--on-dark-faint)", fontSize: 13, letterSpacing: ".12em", textTransform: "uppercase", marginTop: 40 }}>— {t("bkOr")} —</p>
    </div>
  )
}
