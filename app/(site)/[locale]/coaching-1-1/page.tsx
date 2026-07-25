"use client"

import { useState } from "react"
import { Link } from "@/i18n/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import RevealInit from "@/components/RevealInit"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Coaching11Page() {
  const t = useTranslations("Coaching")
  const [form, setForm] = useState({ nombre: "", email: "", mensaje: "" })
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const steps = [
    { n: "01", title: t("step1Title"), desc: t("step1Desc") },
    { n: "02", title: t("step2Title"), desc: t("step2Desc") },
    { n: "03", title: t("step3Title"), desc: t("step3Desc") },
  ]

  const errors = {
    nombre: form.nombre.trim().length < 2 ? t("errName") : "",
    email: !EMAIL_RE.test(form.email) ? t("errEmail") : "",
    mensaje: form.mensaje.trim().length < 10 ? t("errMessage") : "",
  }
  const isValid = !errors.nombre && !errors.email && !errors.mensaje

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setTouched((prev) => ({ ...prev, [e.target.name]: true }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ nombre: true, email: true, mensaje: true })
    if (!isValid) return
    setStatus("sending")
    setErrorMsg("")
    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, asunto: "coaching-1-1" }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || t("errSend"))
      }
      setStatus("sent")
    } catch (err) {
      setStatus("error")
      setErrorMsg(err instanceof Error ? err.message : t("errSend"))
    }
  }

  return (
    <>
      <style>{`
        .c11-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: start; }
        @media (max-width: 780px) {
          .c11-grid { grid-template-columns: 1fr; gap: 36px; }
        }
      `}</style>

      <RevealInit />
      <Navbar />

      {/* ── HERO ── */}
      <section className="tone-dark" style={{
        background: "linear-gradient(to bottom, #1A0806 0%, #5C2218 22%, #8B3D2E 45%, #7A3028 68%, #1A0806 100%)",
        paddingTop: "clamp(100px,12vw,160px)", paddingBottom: "clamp(60px,8vw,100px)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 40%, rgba(196,140,120,.22) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div className="wrap" style={{ maxWidth: 720, position: "relative", zIndex: 1 }}>
          <span className="eyebrow reveal" style={{ display: "block", marginBottom: 20, color: "#F0D5C8" }}>{t("heroEyebrow")}</span>
          <h1 className="reveal" style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(38px,5vw,64px)", color: "#F6EEE8", letterSpacing: ".01em", lineHeight: 1.1, marginBottom: 22 }}>
            {t("heroTitle")}
          </h1>
          <p className="reveal" style={{ color: "rgba(246,238,232,.85)", fontSize: "clamp(15px,1.6vw,17px)", lineHeight: 1.75, marginBottom: 32, maxWidth: 600 }}>
            {t("heroSubtext")}
          </p>
          <div className="reveal" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="#agendar" className="btn solid">{t("heroCta1")}</a>
            <Link href="/conoce-a-devora" className="btn">{t("heroCta2")}</Link>
          </div>
        </div>
      </section>

      {/* ── QUÉ INCLUYE ── */}
      <section style={{ background: "var(--navy)" }}>
        <div className="wrap" style={{ padding: "clamp(56px,8vw,96px) 36px" }}>
          <div className="c11-grid">
            <div className="reveal">
              <span className="eyebrow" style={{ display: "block", marginBottom: 16 }}>{t("workEyebrow")}</span>
              <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(26px,3vw,40px)", color: "var(--text)", lineHeight: 1.2, marginBottom: 20 }}>
                {t("workTitle")}
              </h2>
              <p style={{ color: "var(--on-dark)", fontSize: 15, lineHeight: 1.75, marginBottom: 24 }}>
                {t("workIntro")}
              </p>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 14, paddingLeft: 0 }}>
                {[t("workItem1"), t("workItem2"), t("workItem3"), t("workItem4")].map((item) => (
                  <li key={item} style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--gold)", flexShrink: 0, transform: "translateY(-2px)" }} />
                    <span style={{ color: "var(--on-dark)", fontSize: 15 }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="reveal" style={{
              border: "1px solid var(--line-d)", borderRadius: 12,
              background: "var(--surface)", padding: "clamp(28px,3vw,36px)",
            }}>
              <span className="eyebrow" style={{ display: "block", marginBottom: 20 }}>{t("startEyebrow")}</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {steps.map((s) => (
                  <div key={s.n} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <span style={{ fontFamily: "var(--serif)", fontSize: 14, fontStyle: "italic", color: "var(--gold)", flexShrink: 0, width: 24 }}>{s.n}</span>
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{s.title}</h4>
                      <p style={{ fontSize: 13.5, color: "var(--on-dark)", lineHeight: 1.6 }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px 32px", marginTop: 28, paddingTop: 24, borderTop: "1px solid var(--line-d)" }}>
                <div>
                  <div style={{ fontSize: 10.5, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 4 }}>{t("modalityLabel")}</div>
                  <div style={{ fontSize: 14, color: "var(--on-dark)" }}>{t("modalityValue")}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10.5, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 4 }}>{t("priceLabel")}</div>
                  <div style={{ fontSize: 14, color: "var(--on-dark)" }}>{t("priceValue")}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AGENDAR / CONTACTO ── */}
      <section id="agendar" className="tone-dark" style={{
        background: "linear-gradient(to bottom, #1A0806 0%, #3A1510 25%, #6B2E22 50%, #3A1510 75%, #1A0806 100%)",
      }}>
        <div className="wrap" style={{ padding: "clamp(56px,8vw,96px) 36px", maxWidth: 640 }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <span className="eyebrow reveal" style={{ display: "block", marginBottom: 16 }}>{t("bookEyebrow")}</span>
            <h2 className="reveal" style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(26px,3.2vw,42px)", color: "var(--text)", lineHeight: 1.2 }}>
              {t("bookTitle")}
            </h2>
          </div>

          {status === "sent" ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="reveal" style={{ border: "1px solid var(--line-d)", borderRadius: 8, padding: 44, textAlign: "center" }}
            >
              <div style={{ fontFamily: "var(--serif)", fontSize: 44, color: "var(--gold-light)", marginBottom: 14 }}>✦</div>
              <h3 style={{ fontFamily: "var(--serif)", fontSize: 24, color: "var(--text)", marginBottom: 10 }}>{t("sentTitle")}</h3>
              <p style={{ color: "var(--on-dark)", fontSize: 14.5 }}>
                {t("sentText")}
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="reveal" noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={labelStyle} htmlFor="co-nombre">{t("labelName")}</label>
                <input id="co-nombre" name="nombre" value={form.nombre} onChange={handleChange} onBlur={handleBlur}
                  placeholder={t("phName")} className="field" style={inputStyle}
                  aria-invalid={!!(touched.nombre && errors.nombre)} />
                {touched.nombre && errors.nombre && <FieldError>{errors.nombre}</FieldError>}
              </div>

              <div>
                <label style={labelStyle} htmlFor="co-email">{t("labelEmail")}</label>
                <input id="co-email" name="email" type="email" value={form.email} onChange={handleChange} onBlur={handleBlur}
                  placeholder={t("phEmail")} className="field" style={inputStyle}
                  aria-invalid={!!(touched.email && errors.email)} />
                {touched.email && errors.email && <FieldError>{errors.email}</FieldError>}
              </div>

              <div>
                <label style={labelStyle} htmlFor="co-mensaje">{t("labelMessage")}</label>
                <textarea id="co-mensaje" name="mensaje" value={form.mensaje} onChange={handleChange} onBlur={handleBlur}
                  placeholder={t("phMessage")}
                  rows={5} className="field" style={{ ...inputStyle, resize: "vertical" }}
                  aria-invalid={!!(touched.mensaje && errors.mensaje)} />
                {touched.mensaje && errors.mensaje && <FieldError>{errors.mensaje}</FieldError>}
              </div>

              {status === "error" && (
                <div role="alert" style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 6, padding: "10px 14px", fontSize: 13, color: "var(--danger)" }}>
                  {errorMsg}
                </div>
              )}

              <button type="submit" className="btn solid" disabled={status === "sending"} style={{ marginTop: 4, opacity: status === "sending" ? 0.7 : 1 }}>
                {status === "sending" ? t("sending") : t("send")}
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </>
  )
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  letterSpacing: ".18em",
  textTransform: "uppercase",
  color: "var(--gold)",
  marginBottom: 8,
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--navy-2)",
  borderRadius: 4,
  padding: "13px 16px",
  color: "var(--text)",
  fontFamily: "var(--sans)",
  fontSize: 14,
  outline: "none",
  transition: "border-color .25s",
}

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" style={{ margin: "6px 0 0", fontSize: 12, color: "var(--danger)", display: "flex", alignItems: "center", gap: 5 }}>
      <span aria-hidden="true">⚠</span> {children}
    </p>
  )
}
