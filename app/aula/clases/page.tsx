"use client"

import { Video, ExternalLink, Clock, Calendar, CheckCircle2, Bell } from "lucide-react"

const mockSessions = [
  {
    id: "1",
    title: "Introducción al Life Coaching Integrativo",
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    joinUrl: null as string | null,
    isCompleted: false,
    description: "Primera sesión del módulo 1. Exploraremos los fundamentos del coaching integrativo.",
  },
  {
    id: "2",
    title: "Herramientas de Mindfulness",
    scheduledAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    joinUrl: null as string | null,
    isCompleted: false,
    description: "Prácticas de mindfulness aplicadas al coaching personal.",
  },
  {
    id: "3",
    title: "Introducción a la Cabalá Coach",
    scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    joinUrl: null as string | null,
    isCompleted: true,
    description: "Sesión completada. La grabación estará disponible próximamente.",
  },
]

function isRealUrl(url: string | null): boolean {
  if (!url) return false
  if (url.includes("placeholder")) return false
  if (url === "#") return false
  try { new URL(url); return true } catch { return false }
}

function formatDate(d: Date) {
  return d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
}
function formatTime(d: Date) {
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
}

const card: React.CSSProperties = {
  background: "rgba(255,255,255,.03)",
  border: "1px solid rgba(165,141,102,.14)",
  borderRadius: 14, padding: "24px 26px",
}

export default function ClasesPage() {
  const upcoming = mockSessions.filter((s) => !s.isCompleted)
  const past     = mockSessions.filter((s) => s.isCompleted)

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ marginBottom: 36 }}>
        <span style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold,#A58D66)", display: "block", marginBottom: 10 }}>
          Aula Virtual
        </span>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 38, color: "#eef4f4", marginBottom: 8 }}>
          Clases en vivo
        </h1>
        <p style={{ color: "rgba(224,233,234,.5)", fontSize: 15 }}>
          Sesiones en vivo con Devora a través de Zoom.
        </p>
      </div>

      {/* Próximas */}
      <section style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "#4B7E8C", marginBottom: 16 }}>
          Próximas sesiones
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {upcoming.map((s) => (
            <div key={s.id} style={{ ...card, borderColor: "rgba(75,126,140,.2)", display: "flex", gap: 18, alignItems: "flex-start" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(75,126,140,.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Video size={19} style={{ color: "#4B7E8C" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontWeight: 600, color: "#eef4f4", fontSize: 15, marginBottom: 5 }}>{s.title}</h3>
                <p style={{ color: "rgba(224,233,234,.45)", fontSize: 13, marginBottom: 12, lineHeight: 1.6 }}>{s.description}</p>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(224,233,234,.4)" }}>
                    <Calendar size={12} style={{ color: "#4B7E8C" }} />
                    {formatDate(s.scheduledAt)}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(224,233,234,.4)" }}>
                    <Clock size={12} style={{ color: "#4B7E8C" }} />
                    {formatTime(s.scheduledAt)} hs
                  </span>
                </div>
              </div>

              {/* CTA: solo activo si el link es real */}
              {isRealUrl(s.joinUrl) ? (
                <a
                  href={s.joinUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    background: "var(--gold,#A58D66)", color: "#081E29",
                    fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase",
                    textDecoration: "none", padding: "10px 18px", borderRadius: 8,
                    flexShrink: 0, transition: "opacity .2s",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = ".85")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                >
                  <ExternalLink size={13} /> Unirme
                </a>
              ) : (
                <div style={{
                  display: "flex", alignItems: "center", gap: 7,
                  border: "1px solid rgba(165,141,102,.2)", color: "rgba(165,141,102,.6)",
                  fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase",
                  padding: "10px 16px", borderRadius: 8, flexShrink: 0,
                }}>
                  <Bell size={12} /> Link pronto
                </div>
              )}
            </div>
          ))}
          {upcoming.length === 0 && (
            <p style={{ color: "rgba(224,233,234,.35)", fontSize: 14 }}>No hay clases programadas por el momento.</p>
          )}
        </div>
      </section>

      {/* Pasadas */}
      {past.length > 0 && (
        <section>
          <p style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(224,233,234,.3)", marginBottom: 14 }}>
            Sesiones anteriores
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {past.map((s) => (
              <div key={s.id} style={{ ...card, display: "flex", alignItems: "center", gap: 14, opacity: 0.6, padding: "16px 22px" }}>
                <CheckCircle2 size={16} style={{ color: "#6BBF8E", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 500, color: "#eef4f4", fontSize: 14 }}>{s.title}</p>
                  <p style={{ fontSize: 12, color: "rgba(224,233,234,.4)", marginTop: 2 }}>{formatDate(s.scheduledAt)} · Completada</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
