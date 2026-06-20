"use client"

import { useState } from "react"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import RevealInit from "@/components/RevealInit"

const contactInfo = [
  {
    n: "01",
    label: "Correo electrónico",
    value: "Hola@devorabenchimol.com",
    href: "mailto:Hola@devorabenchimol.com",
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
    value: "+1 (786) 483-5893",
    href: "tel:+17864835893",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.1-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 2 .7 2.9a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.2-1.2a2 2 0 012.1-.5c.9.3 1.9.6 2.9.7A2 2 0 0122 16.9z"/>
      </svg>
    ),
  },
  {
    n: "03",
    label: "Ubicación",
    value: "Miami, Florida · EE.UU.",
    href: null,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7z"/>
        <circle cx="12" cy="9" r="2.5"/>
      </svg>
    ),
  },
]

export default function ContactoPage() {
  const [form, setForm] = useState({ nombre: "", email: "", asunto: "", mensaje: "" })
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("sending")
    /* Aquí se puede conectar Resend / un endpoint /api/contacto */
    await new Promise((r) => setTimeout(r, 1200))
    setStatus("sent")
  }

  return (
    <>
      <RevealInit />
      <Navbar />

      {/* ── HERO ── */}
      <section style={{
        background: "linear-gradient(120deg,var(--navy-2) 0%,var(--navy) 60%,#0a3140 100%)",
        paddingTop: 160, paddingBottom: 80,
        borderBottom: "1px solid var(--line-d)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-40%", right: "-5%",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle,rgba(165,141,102,.07),transparent 70%)",
          pointerEvents: "none",
        }} />
        <div className="wrap">
          <span className="eyebrow" style={{ display: "block", marginBottom: 20 }}>Escríbeme</span>
          <h1 style={{
            fontFamily: "var(--serif)", fontWeight: 500,
            fontSize: "clamp(40px,6vw,80px)", color: "#eef4f4",
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
                  <a href={c.href} style={{ fontFamily: "var(--serif)", fontSize: 20, color: "#eef4f4", textDecoration: "none", display: "block" }}>
                    {c.value}
                  </a>
                ) : (
                  <span style={{ fontFamily: "var(--serif)", fontSize: 20, color: "#eef4f4" }}>{c.value}</span>
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
                fontSize: "clamp(28px,3.4vw,44px)", color: "#eef4f4",
                lineHeight: 1.15, marginBottom: 24,
              }}>
                Cuéntame qué buscas
              </h2>
              <p style={{ color: "var(--on-dark)", fontSize: 15, lineHeight: 1.75, marginBottom: 32 }}>
                Respondo personalmente cada mensaje. Puedes escribirme sobre cualquier programa,
                una sesión de exploración gratuita o cualquier duda que tengas.
              </p>

              {/* Redes sociales */}
              <div style={{ borderTop: "1px solid var(--line-d)", paddingTop: 28 }}>
                <div style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 16 }}>
                  Sígueme
                </div>
                <div style={{ display: "flex", gap: 14 }}>
                  {[
                    { label: "Instagram", href: "https://instagram.com/devora_benchimol_",
                      icon: <><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></> },
                    { label: "YouTube", href: "https://youtube.com",
                      icon: <><rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none"/></> },
                  ].map((s) => (
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
                <h3 style={{ fontFamily: "var(--serif)", fontSize: 28, color: "#eef4f4", marginBottom: 12 }}>
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
              <form onSubmit={handleSubmit} className="reveal" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Nombre */}
                <div>
                  <label style={labelStyle}>Nombre completo *</label>
                  <input name="nombre" value={form.nombre} onChange={handleChange} required
                    placeholder="Tu nombre" style={inputStyle} />
                </div>

                {/* Email */}
                <div>
                  <label style={labelStyle}>Correo electrónico *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required
                    placeholder="tu@correo.com" style={inputStyle} />
                </div>

                {/* Asunto */}
                <div>
                  <label style={labelStyle}>¿Sobre qué quieres hablar?</label>
                  <select name="asunto" value={form.asunto} onChange={handleChange} style={inputStyle}>
                    <option value="">Selecciona un tema…</option>
                    <option value="life-coaching">Life Coaching Integrativo</option>
                    <option value="joogal-adultos">Instructor Joogal Adultos</option>
                    <option value="joogalkids">Instructor Joogalkids</option>
                    <option value="cabala">Cábala Coach</option>
                    <option value="metodo-sholem">Método Sholem</option>
                    <option value="sesion-exploratoria">Sesión exploratoria gratuita</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                {/* Mensaje */}
                <div>
                  <label style={labelStyle}>Tu mensaje *</label>
                  <textarea name="mensaje" value={form.mensaje} onChange={handleChange} required
                    placeholder="Cuéntame con qué te puedo ayudar…"
                    rows={5} style={{ ...inputStyle, resize: "vertical" }} />
                </div>

                <button
                  type="submit"
                  className="btn solid"
                  disabled={status === "sending"}
                  style={{ marginTop: 4 }}
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
  border: "1px solid var(--line-d)",
  borderRadius: 4,
  padding: "13px 16px",
  color: "#eef4f4",
  fontFamily: "var(--sans)",
  fontSize: 14,
  outline: "none",
  transition: "border-color .3s",
}
