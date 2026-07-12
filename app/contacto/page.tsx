"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import RevealInit from "@/components/RevealInit"
import { DEFAULT_SITE_CONTENT, type SiteContent } from "@/lib/site-content"

function buildContactInfo(content: SiteContent) {
  return [
    {
      n: "01",
      label: "Correo electrónico",
      value: content.contacto.email,
      href: `mailto:${content.contacto.email}`,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <path d="M2 8l10 7 10-7"/>
        </svg>
      ),
    },
    {
      n: "02",
      label: "Teléfono / WhatsApp",
      value: content.contacto.phone,
      href: `tel:${content.contacto.phone.replace(/[^\d+]/g, "")}`,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.1-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 2 .7 2.9a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.2-1.2a2 2 0 012.1-.5c.9.3 1.9.6 2.9.7A2 2 0 0122 16.9z"/>
        </svg>
      ),
    },
    {
      n: "03",
      label: "Ubicación",
      value: content.contacto.city,
      href: null,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7z"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
      ),
    },
  ]
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ContactoPage() {
  const [form, setForm] = useState({ nombre: "", email: "", asunto: "", mensaje: "" })
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT)

  useEffect(() => {
    fetch("/api/site-content")
      .then((r) => r.json())
      .then((d) => setContent(d))
      .catch(() => {})
  }, [])

  const contactInfo = buildContactInfo(content)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const errors = {
    nombre: form.nombre.trim().length < 2 ? "Ingresá tu nombre" : "",
    email: !EMAIL_RE.test(form.email) ? "Ingresá un email válido" : "",
    mensaje: form.mensaje.trim().length < 10 ? "Escribí un mensaje (mínimo 10 caracteres)" : "",
  }
  const isValid = !errors.nombre && !errors.email && !errors.mensaje

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
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
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || "No se pudo enviar el mensaje")
      }
      setStatus("sent")
    } catch (err) {
      setStatus("error")
      setErrorMsg(err instanceof Error ? err.message : "No se pudo enviar el mensaje")
    }
  }

  return (
    <>
      <RevealInit />
      <Navbar />

      {/* ── HERO ── */}
      <section style={{
        background: "linear-gradient(120deg,var(--navy-2) 0%,var(--navy) 60%,#2A1D12 100%)",
        paddingTop: 160, paddingBottom: 80,
        borderBottom: "1px solid var(--line-d)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url(/brand/pages/hero-contacto.webp)", backgroundSize: "cover", backgroundPosition: "right center", zIndex: 0 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(100deg,var(--navy-2) 0%,var(--navy) 42%,rgba(0,0,0,0) 82%)", zIndex: 1 }} />
        <div style={{
          position: "absolute", top: "-40%", right: "-5%",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle,rgba(165,141,102,.07),transparent 70%)",
          pointerEvents: "none", zIndex: 1,
        }} />
        <div className="wrap" style={{ position: "relative", zIndex: 2 }}>
          <span className="eyebrow" style={{ display: "block", marginBottom: 20 }}>Escríbeme</span>
          <h1 style={{
            fontFamily: "var(--serif)", fontWeight: 500,
            fontSize: "clamp(40px,6vw,80px)", color: "var(--text)",
            lineHeight: 1.02, letterSpacing: "-.01em",
          }}>
            Estoy aquí<br /><em style={{ color: "var(--gold-light)", fontStyle: "normal" }}>para ti.</em>
          </h1>
          <p style={{ color: "var(--on-dark)", fontSize: 16, maxWidth: 440, marginTop: 22, lineHeight: 1.7 }}>
            ¿Tienes preguntas sobre los programas, quieres comenzar tu proceso de coaching o simplemente
            deseas conocer más? Escríbeme con confianza.
          </p>
        </div>
      </section>

      {/* ── INFO DE CONTACTO ── */}
      <section style={{ background: "var(--navy-2)", borderBottom: "1px solid var(--line-d)" }}>
        <div className="wrap" style={{ padding: "72px 36px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 32 }}>
            {contactInfo.map((c) => (
              <div key={c.n} className="reveal" style={{ borderTop: "1px solid var(--line-d)", paddingTop: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, color: "var(--gold-light)" }}>
                  {c.icon}
                </div>
                <div style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>
                  {c.label}
                </div>
                {c.href ? (
                  <a href={c.href} style={{ fontFamily: "var(--serif)", fontSize: 20, color: "var(--text)", textDecoration: "none", display: "block" }}>
                    {c.value}
                  </a>
                ) : (
                  <span style={{ fontFamily: "var(--serif)", fontSize: 20, color: "var(--text)" }}>{c.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORMULARIO ── */}
      <section style={{ background: "var(--navy)" }}>
        <div className="wrap" style={{ padding: "100px 36px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>

            {/* Columna izquierda: copy */}
            <div className="reveal">
              <span className="eyebrow" style={{ display: "block", marginBottom: 20 }}>Formulario</span>
              <h2 style={{
                fontFamily: "var(--serif)", fontWeight: 500,
                fontSize: "clamp(28px,3.4vw,44px)", color: "var(--text)",
                lineHeight: 1.15, marginBottom: 24,
              }}>
                Cuéntame qué buscas
              </h2>
              <p style={{ color: "var(--on-dark)", fontSize: 15, lineHeight: 1.75, marginBottom: 32 }}>
                Respondo personalmente cada mensaje. Puedes escribirme sobre cualquier programa,
                agendar una sesión de coaching personal 1:1 conmigo, pedir orientación gratuita
                para elegir un programa, o cualquier duda que tengas.
              </p>

              {/* Redes sociales */}
              <div style={{ borderTop: "1px solid var(--line-d)", paddingTop: 28 }}>
                <div style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 16 }}>
                  Sígueme
                </div>
                <div style={{ display: "flex", gap: 14 }}>
                  {[
                    content.contacto.ig && { label: "Instagram", href: content.contacto.ig,
                      icon: <><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></> },
                    content.contacto.yt && { label: "YouTube", href: content.contacto.yt,
                      icon: <><rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none"/></> },
                    content.contacto.fb && { label: "Facebook", href: content.contacto.fb,
                      icon: <><path d="M14 8h3V4h-3a4 4 0 00-4 4v2H7v4h3v6h4v-6h3l1-4h-4V8a1 1 0 011-1z"/></> },
                  ].filter((s): s is Exclude<typeof s, ""> => !!s).map((s) => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                      style={{
                        width: 42, height: 42, borderRadius: 4,
                        border: "1px solid var(--line-d)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "var(--on-dark)", transition: ".3s",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--gold)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--gold)" }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--on-dark)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--line-d)" }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">{s.icon}</svg>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Columna derecha: formulario */}
            {status === "sent" ? (
              <div className="reveal" style={{
                border: "1px solid var(--line-d)", borderRadius: 8, padding: 52,
                textAlign: "center",
              }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: 48, color: "var(--gold-light)", marginBottom: 16 }}>✦</div>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: 28, color: "var(--text)", marginBottom: 12 }}>
                  ¡Mensaje enviado!
                </h3>
                <p style={{ color: "var(--on-dark)", fontSize: 15, marginBottom: 28 }}>
                  Gracias por escribirme. Te responderé a la brevedad.
                </p>
                <button
                  onClick={() => { setForm({ nombre: "", email: "", asunto: "", mensaje: "" }); setStatus("idle") }}
                  className="btn"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="reveal" noValidate style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Nombre */}
                <div>
                  <label style={labelStyle} htmlFor="c-nombre">Nombre completo *</label>
                  <input id="c-nombre" name="nombre" value={form.nombre} onChange={handleChange} onBlur={handleBlur}
                    placeholder="Tu nombre" className="field" style={inputStyle}
                    aria-invalid={!!(touched.nombre && errors.nombre)} />
                  {touched.nombre && errors.nombre && <FieldError>{errors.nombre}</FieldError>}
                </div>

                {/* Email */}
                <div>
                  <label style={labelStyle} htmlFor="c-email">Correo electrónico *</label>
                  <input id="c-email" name="email" type="email" value={form.email} onChange={handleChange} onBlur={handleBlur}
                    placeholder="tu@correo.com" className="field" style={inputStyle}
                    aria-invalid={!!(touched.email && errors.email)} />
                  {touched.email && errors.email && <FieldError>{errors.email}</FieldError>}
                </div>

                {/* Asunto */}
                <div>
                  <label style={labelStyle} htmlFor="c-asunto">¿Sobre qué quieres hablar?</label>
                  <select id="c-asunto" name="asunto" value={form.asunto} onChange={handleChange} className="field" style={inputStyle}>
                    <option value="">Selecciona un tema…</option>
                    <option value="life-coaching">Life Coaching Integrativo</option>
                    <option value="joogal-adultos">Instructor Jewgal Adultos</option>
                    <option value="joogalkids">Instructor Joogalkids</option>
                    <option value="cabala">Cábala Coach</option>
                    <option value="metodo-sholem">Método Sholem</option>
                    <option value="coaching-1-1">Coaching personal 1:1 con Devora</option>
                    <option value="sesion-exploratoria">Orientación gratuita para elegir programa</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                {/* Mensaje */}
                <div>
                  <label style={labelStyle} htmlFor="c-mensaje">Tu mensaje *</label>
                  <textarea id="c-mensaje" name="mensaje" value={form.mensaje} onChange={handleChange} onBlur={handleBlur}
                    placeholder="Cuéntame con qué te puedo ayudar…"
                    rows={5} className="field" style={{ ...inputStyle, resize: "vertical" }}
                    aria-invalid={!!(touched.mensaje && errors.mensaje)} />
                  {touched.mensaje && errors.mensaje && <FieldError>{errors.mensaje}</FieldError>}
                </div>

                {status === "error" && (
                  <div role="alert" style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 6, padding: "10px 14px", fontSize: 13, color: "var(--danger)" }}>
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn solid"
                  disabled={status === "sending"}
                  style={{ marginTop: 4, opacity: status === "sending" ? 0.7 : 1 }}
                >
                  {status === "sending" ? "Enviando…" : "Enviar mensaje →"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── PROGRAMAS CTA ── */}
      <section className="join pad">
        <div className="glow" />
        <div className="wrap join-inner reveal">
          <span className="eyebrow" style={{ display: "inline-block" }}>Programas</span>
          <h2>¿Ya sabes qué programa <em>es para ti</em>?</h2>
          <p>Explora las formaciones disponibles y encuentra el camino que resuena con tu propósito.</p>
          <div className="join-actions">
            <Link href="/#programas" className="btn solid">Ver todos los programas →</Link>
            <Link href="/conoce-a-devora" className="btn">Conocer a Devora</Link>
          </div>
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
