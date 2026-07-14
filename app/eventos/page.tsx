"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import RevealInit from "@/components/RevealInit"
import CountdownTimer from "@/components/CountdownTimer"
import { DEFAULT_SITE_CONTENT, type SiteContent } from "@/lib/site-content"

const EVENTS = [
  {
    date: { day: "14", month: "Jul", year: "2026" },
    title: "Retiro de Bienestar · Jewgal Experience",
    type: "Retiro presencial",
    location: "Miami, Florida",
    desc: "Un fin de semana de reconexión profunda: movimiento Jewgal, meditación, círculos de coaching y sabiduría de la Cábala. Plazas muy limitadas.",
    accent: "#A58D66",
    grad: "linear-gradient(135deg,#3A2410,#5C3A1E)",
    spots: 20,
    price: "$450",
    icon: "◎",
  },
  {
    date: { day: "22", month: "Jul", year: "2026" },
    title: "Masterclass Gratuita · Cabalá y Propósito",
    type: "Evento online",
    location: "Zoom · En vivo",
    desc: "Una sesión introductoria con Devora Benchimol sobre cómo la Cabalá puede transformar tu forma de entender el propósito y el liderazgo personal.",
    accent: "#CBB78B",
    grad: "linear-gradient(135deg,#332508,#4F3A12)",
    spots: 200,
    price: "Gratis",
    icon: "❂",
  },
  {
    date: { day: "05", month: "Ago", year: "2026" },
    title: "Formación Intensiva · Life Coaching Weekend",
    type: "Intensivo presencial",
    location: "Miami, Florida",
    desc: "Dos días de inmersión en herramientas prácticas de Life Coaching Integrativo. Válido como módulo optativo para alumnos de la Academia.",
    accent: "#A76D61",
    grad: "linear-gradient(135deg,#42200F,#653322)",
    spots: 30,
    price: "$280",
    icon: "⟡",
  },
  {
    date: { day: "12", month: "Sep", year: "2026" },
    title: "Encuentro Jewgal · Medellín",
    type: "Evento presencial",
    location: "Medellín, Colombia",
    desc: "Un encuentro de transformación y movimiento consciente con Devora Benchimol en Colombia: talleres de Jewgal, círculos de coaching y sabiduría de la Cábala. Plazas limitadas.",
    accent: "#C49F72",
    grad: "linear-gradient(135deg,#3A2818,#5C4026)",
    spots: 40,
    price: "Por confirmar",
    icon: "✦",
  },
]

const PAST = [
  { title: "Retiro Sholem · Buenos Aires", date: "Marzo 2026", location: "Argentina" },
  { title: "Masterclass Jewgal · Bogotá", date: "Enero 2026", location: "Colombia" },
  { title: "Taller Cábala y Crianza", date: "Noviembre 2025", location: "Miami, FL" },
]

export default function EventosPage() {
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT)

  useEffect(() => {
    fetch("/api/site-content")
      .then((r) => r.json())
      .then((d) => setContent(d))
      .catch(() => {})
  }, [])

  return (
    <>
      <RevealInit />
      <Navbar />

      {/* ── HERO ── */}
      <section style={{
        background: "linear-gradient(120deg,var(--navy-2) 0%,var(--navy) 55%,#2A1D12 100%)",
        paddingTop: 150, paddingBottom: 90,
        position: "relative", overflow: "hidden",
        borderBottom: "1px solid var(--line-d)",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url(/brand/pages/hero-eventos.webp)", backgroundSize: "cover", backgroundPosition: "right center", zIndex: 0 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(100deg,var(--navy-2) 0%,var(--navy) 42%,rgba(0,0,0,0) 82%)", zIndex: 1 }} />
        <div style={{ position: "absolute", top: "-30%", right: "0", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(165,141,102,.07),transparent 70%)", pointerEvents: "none", zIndex: 1 }} />
        <div className="wrap" style={{ position: "relative", zIndex: 2 }}>
          <span className="eyebrow" style={{ display: "block", marginBottom: 20 }}>{content.pages.eventos.eyebrow}</span>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(44px,6vw,78px)", color: "var(--text)", lineHeight: 1.02, letterSpacing: "-.01em", marginBottom: 22 }}>
            {content.pages.eventos.title1}<br /><em style={{ fontStyle: "normal", color: "var(--gold-light)" }}>{content.pages.eventos.title2}</em>
          </h1>
          <p style={{ color: "var(--on-dark)", fontSize: 17, maxWidth: 500, lineHeight: 1.7 }}>
            {content.pages.eventos.subtext}
          </p>
        </div>
      </section>

      {/* ── COUNTDOWN ── */}
      <CountdownTimer />

      {/* ── EVENTOS ── */}
      <section style={{ background: "var(--navy)" }}>
        <div className="wrap ev-wrap">
          <span className="eyebrow sec-eyebrow reveal" style={{ marginBottom: 52 }}>2026 · Calendario de eventos</span>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {EVENTS.map((ev) => (
              <div key={ev.title} className="reveal ev-card">
                {/* Fecha — panel lateral en desktop, barra horizontal en móvil */}
                <div className="tone-dark ev-date" style={{ background: ev.grad }}>
                  <div>
                    <span style={{ fontFamily: "var(--serif)", fontSize: 52, color: ev.accent, lineHeight: 1, fontWeight: 500, display: "block" }}>{ev.date.day}</span>
                    <span style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--on-dark)", marginTop: 4, display: "block" }}>{ev.date.month} {ev.date.year}</span>
                  </div>
                  <div className="ev-icon" style={{ color: ev.accent }}>{ev.icon}</div>
                </div>

                {/* Contenido */}
                <div className="ev-body">
                  <div className="ev-info">
                    <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, border: "1px solid var(--line-d)", borderRadius: 16, padding: "4px 12px", color: "var(--on-dark)", letterSpacing: ".12em", textTransform: "uppercase" }}>
                        {ev.type}
                      </span>
                      <span style={{ fontSize: 10, border: "1px solid var(--line-d)", borderRadius: 16, padding: "4px 12px", color: "var(--on-dark)", letterSpacing: ".12em", textTransform: "uppercase" }}>
                        📍 {ev.location}
                      </span>
                    </div>
                    <h3 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(20px,2.4vw,28px)", color: "var(--text)", marginBottom: 12, lineHeight: 1.15 }}>
                      {ev.title}
                    </h3>
                    <p style={{ color: "var(--on-dark)", fontSize: 14.5, lineHeight: 1.65, maxWidth: 560 }}>{ev.desc}</p>
                  </div>
                  <div className="ev-cta">
                    <div>
                      <div style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 4 }}>
                        {ev.spots} plazas
                      </div>
                      <div style={{ fontFamily: "var(--serif)", fontSize: 28, color: ev.price === "Gratis" ? "#C49F72" : ev.accent, marginBottom: 16 }}>
                        {ev.price}
                      </div>
                    </div>
                    <Link href="/contacto" className="btn solid" style={{ fontSize: 11, padding: "10px 20px", flexShrink: 0 }}>
                      Reservar lugar →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EVENTOS PASADOS ── */}
      <section style={{ background: "var(--navy-2)", borderTop: "1px solid var(--line-d)" }}>
        <div className="wrap" style={{ padding: "80px 36px" }}>
          <span className="eyebrow reveal" style={{ display: "block", marginBottom: 36 }}>Eventos anteriores</span>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {PAST.map((p, i) => (
              <div key={p.title} className="reveal" style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "20px 0", borderTop: "1px solid var(--line-d)",
                ...(i === PAST.length - 1 ? { borderBottom: "1px solid var(--line-d)" } : {}),
              }}>
                <div>
                  <h4 style={{ fontFamily: "var(--serif)", fontSize: 19, color: "var(--text)" }}>{p.title}</h4>
                  <span style={{ fontSize: 12, color: "var(--on-dark-faint)" }}>{p.location}</span>
                </div>
                <span style={{ fontSize: 12, color: "var(--gold)", letterSpacing: ".1em" }}>{p.date}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="join pad">
        <div className="glow" />
        <div className="wrap join-inner reveal">
          <span className="eyebrow" style={{ display: "inline-block" }}>No te pierdas nada</span>
          <h2>Suscríbete y entérate<br/><em>antes que nadie.</em></h2>
          <p>Recibe la agenda de eventos, retiros y masterclasses gratuitas directamente en tu correo.</p>
          <div className="join-actions">
            <Link href="/contacto" className="btn solid">Suscribirme →</Link>
            <Link href="/academia" className="btn">Ver programas</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
