"use client"

import { useState } from "react"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import RevealInit from "@/components/RevealInit"
import { motion } from "framer-motion"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const steps = [
  { n: "01", title: "Escribime", desc: "Contame brevemente tu momento y qué te gustaría trabajar. No hace falta tener todo claro todavía." },
  { n: "02", title: "Primera conversación", desc: "Coordinamos un encuentro inicial, online o presencial, para conocernos y definir el enfoque." },
  { n: "03", title: "Tu proceso", desc: "Diseñamos juntas la frecuencia y duración de las sesiones según lo que tu momento necesita." },
]

export default function Coaching11Page() {
  const [form, setForm] = useState({ nombre: "", email: "", mensaje: "" })
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const errors = {
    nombre: form.nombre.trim().length < 2 ? "Ingresá tu nombre" : "",
    email: !EMAIL_RE.test(form.email) ? "Ingresá un email válido" : "",
    mensaje: form.mensaje.trim().length < 10 ? "Contame un poco más (mínimo 10 caracteres)" : "",
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
          <span className="eyebrow reveal" style={{ display: "block", marginBottom: 20, color: "#F0D5C8" }}>Coaching personal</span>
          <h1 className="reveal" style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(38px,5vw,64px)", color: "#F6EEE8", letterSpacing: ".01em", lineHeight: 1.1, marginBottom: 22 }}>
            Sesiones 1:1 con Devora
          </h1>
          <p className="reveal" style={{ color: "rgba(246,238,232,.85)", fontSize: "clamp(15px,1.6vw,17px)", lineHeight: 1.75, marginBottom: 32, maxWidth: 600 }}>
            Un espacio de acompañamiento individual — vos y Devora, trabajando tu proceso particular. No es un curso ni una certificación: es tiempo dedicado enteramente a tu transformación.
          </p>
          <div className="reveal" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="#agendar" className="btn solid">Agendar mi sesión →</a>
            <Link href="/conoce-a-devora" className="btn">Conocer a Devora</Link>
          </div>
        </div>
      </section>

      {/* ── QUÉ INCLUYE ── */}
      <section style={{ background: "var(--navy)" }}>
        <div className="wrap" style={{ padding: "clamp(56px,8vw,96px) 36px" }}>
          <div className="c11-grid">
            <div className="reveal">
              <span className="eyebrow" style={{ display: "block", marginBottom: 16 }}>Qué trabajamos juntas</span>
              <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(26px,3vw,40px)", color: "var(--text)", lineHeight: 1.2, marginBottom: 20 }}>
                Herramientas integradas, a tu ritmo
              </h2>
              <p style={{ color: "var(--on-dark)", fontSize: 15, lineHeight: 1.75, marginBottom: 24 }}>
                Cada sesión se adapta a tu proceso particular, integrando distintas herramientas según lo que necesites en ese momento.
              </p>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 14, paddingLeft: 0 }}>
                {[
                  "Logoterapia y sentido de vida",
                  "Mindfulness y regulación emocional",
                  "Sabiduría de la Cábala aplicada al coaching",
                  "Herramientas de expresión corporal y trabajo somático",
                ].map((item) => (
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
              <span className="eyebrow" style={{ display: "block", marginBottom: 20 }}>Cómo empezar</span>
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
                  <div style={{ fontSize: 10.5, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 4 }}>Modalidad</div>
                  <div style={{ fontSize: 14, color: "var(--on-dark)" }}>Online o presencial — a coordinar</div>
                </div>
                <div>
                  <div style={{ fontSize: 10.5, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 4 }}>Duración y precio</div>
                  <div style={{ fontSize: 14, color: "var(--on-dark)" }}>Se definen en la primera conversación, según tu proceso</div>
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
            <span className="eyebrow reveal" style={{ display: "block", marginBottom: 16 }}>Agendá tu sesión</span>
            <h2 className="reveal" style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(26px,3.2vw,42px)", color: "var(--text)", lineHeight: 1.2 }}>
              Escribime y coordinamos tu primera conversación
            </h2>
          </div>

          {status === "sent" ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="reveal" style={{ border: "1px solid var(--line-d)", borderRadius: 8, padding: 44, textAlign: "center" }}
            >
              <div style={{ fontFamily: "var(--serif)", fontSize: 44, color: "var(--gold-light)", marginBottom: 14 }}>✦</div>
              <h3 style={{ fontFamily: "var(--serif)", fontSize: 24, color: "var(--text)", marginBottom: 10 }}>¡Mensaje enviado!</h3>
              <p style={{ color: "var(--on-dark)", fontSize: 14.5 }}>
                Gracias por escribirme. Te voy a responder personalmente para coordinar tu primera conversación.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="reveal" noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={labelStyle} htmlFor="co-nombre">Nombre completo *</label>
                <input id="co-nombre" name="nombre" value={form.nombre} onChange={handleChange} onBlur={handleBlur}
                  placeholder="Tu nombre" className="field" style={inputStyle}
                  aria-invalid={!!(touched.nombre && errors.nombre)} />
                {touched.nombre && errors.nombre && <FieldError>{errors.nombre}</FieldError>}
              </div>

              <div>
                <label style={labelStyle} htmlFor="co-email">Correo electrónico *</label>
                <input id="co-email" name="email" type="email" value={form.email} onChange={handleChange} onBlur={handleBlur}
                  placeholder="tu@correo.com" className="field" style={inputStyle}
                  aria-invalid={!!(touched.email && errors.email)} />
                {touched.email && errors.email && <FieldError>{errors.email}</FieldError>}
              </div>

              <div>
                <label style={labelStyle} htmlFor="co-mensaje">Contame tu momento *</label>
                <textarea id="co-mensaje" name="mensaje" value={form.mensaje} onChange={handleChange} onBlur={handleBlur}
                  placeholder="¿Qué te gustaría trabajar en tus sesiones 1:1?"
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
                {status === "sending" ? "Enviando…" : "Agendar mi sesión de coaching →"}
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
