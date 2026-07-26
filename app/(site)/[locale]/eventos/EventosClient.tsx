"use client"

import { Link } from "@/i18n/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import RevealInit from "@/components/RevealInit"
import CountdownTimer from "@/components/CountdownTimer"
import { useTranslations } from "next-intl"
import { type SiteContent } from "@/lib/site-content"
import { fechaDisplay, type EventosData } from "@/lib/eventos"

// Estilos visuales asignados en ciclo según posición (no editables desde el admin)
const EV_STYLES = [
  { accent: "#A58D66", grad: "linear-gradient(135deg,#3A2410,#5C3A1E)", icon: "◎" },
  { accent: "#CBB78B", grad: "linear-gradient(135deg,#332508,#4F3A12)", icon: "❂" },
  { accent: "#A76D61", grad: "linear-gradient(135deg,#42200F,#653322)", icon: "⟡" },
  { accent: "#C49F72", grad: "linear-gradient(135deg,#3A2818,#5C4026)", icon: "✦" },
]

export default function EventosClient({
  initialContent,
  initialEventos,
}: {
  initialContent: SiteContent
  initialEventos: EventosData
}) {
  const t = useTranslations("Eventos")

  // Contenido y eventos llegan ya resueltos desde el servidor — el HTML sale
  // con los datos reales, sin depender de un fetch del navegador (que podía
  // fallar por caché/SW y dejar visible la lista por defecto del código).
  const content = initialContent
  const eventos = initialEventos

  const EVENTS = eventos.upcoming
    .filter((ev) => ev.active)
    .map((ev, i) => ({ ...ev, date: fechaDisplay(ev.datetime), ...EV_STYLES[i % EV_STYLES.length] }))
  const PAST = eventos.past

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

      {/* ── COUNTDOWN (próximo evento visible con fecha futura) ── */}
      <CountdownTimer eventos={eventos.upcoming} />

      {/* ── EVENTOS ── */}
      <section style={{ background: "var(--navy)" }}>
        <div className="wrap ev-wrap">
          <span className="eyebrow sec-eyebrow reveal" style={{ marginBottom: 52 }}>{t("calendarEyebrow")}</span>

          {EVENTS.length === 0 && (
            <p style={{ color: "var(--on-dark)", fontSize: 15, padding: "20px 0" }}>
              {t("empty")}
            </p>
          )}
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
                        {ev.spots} {t("spots")}
                      </div>
                      <div style={{ fontFamily: "var(--serif)", fontSize: 28, color: ev.price === "Gratis" ? "#C49F72" : ev.accent, marginBottom: 16 }}>
                        {ev.price}
                      </div>
                    </div>
                    <Link href="/contacto" className="btn solid" style={{ fontSize: 11, padding: "10px 20px", flexShrink: 0 }}>
                      {t("reserve")}
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
          <span className="eyebrow reveal" style={{ display: "block", marginBottom: 36 }}>{t("pastEyebrow")}</span>
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
          <span className="eyebrow" style={{ display: "inline-block" }}>{t("nlEyebrow")}</span>
          <h2>{t("nlTitle1")}<br/><em>{t("nlTitle2")}</em></h2>
          <p>{t("nlSubtext")}</p>
          <div className="join-actions">
            <Link href="/contacto" className="btn solid">{t("nlCta")}</Link>
            <Link href="/academia" className="btn">{t("nlPrograms")}</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
