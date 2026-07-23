"use client"

import { useEffect, useState } from "react"
import { Video, ExternalLink, Clock, Calendar, CheckCircle2, Bell, Loader2, CalendarX } from "lucide-react"

type LiveSession = {
  id: string; title: string; description: string | null
  scheduledAt: string; durationMin: number
  joinUrl: string | null; recordingUrl: string | null; isCompleted: boolean
  courseId: string; courseTitle: string; myAttendance: string | null
}

function isRealUrl(url: string | null): boolean {
  if (!url) return false
  if (url.includes("placeholder")) return false
  if (url === "#") return false
  try { new URL(url); return true } catch { return false }
}

const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone
const TZ_LABEL = TZ.split("/").pop()?.replace(/_/g, " ") ?? TZ

function formatDate(d: Date) {
  return d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: TZ })
}
function formatTime(d: Date) {
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", timeZone: TZ })
}

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid rgba(165,141,102,.14)",
  borderRadius: 14, padding: "24px 26px",
}

export default function ClasesPage() {
  const [sessions, setSessions] = useState<LiveSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/me/live-sessions")
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions ?? []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false))
  }, [])

  const now = Date.now()
  const upcoming = sessions.filter((s) => !s.isCompleted && new Date(s.scheduledAt).getTime() >= now)
  const past = sessions.filter((s) => s.isCompleted || new Date(s.scheduledAt).getTime() < now)
  const multiCourse = new Set(sessions.map((s) => s.courseId)).size > 1

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ marginBottom: 36 }}>
        <span style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: 10 }}>
          Aula Virtual
        </span>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 38, color: "var(--text)", marginBottom: 8 }}>
          Clases en vivo
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
          Sesiones en vivo con Devora a través de Zoom · horarios en {TZ_LABEL}.
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-dim)", padding: "40px 0" }}>
          <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Cargando clases…
        </div>
      ) : sessions.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: "44px 32px" }}>
          <CalendarX size={26} style={{ color: "rgba(165,141,102,.3)", margin: "0 auto 14px", display: "block" }} />
          <p style={{ color: "var(--text-muted)", fontSize: 15, marginBottom: 6 }}>Todavía no hay clases programadas</p>
          <p style={{ color: "var(--text-dim)", fontSize: 13 }}>Cuando Devora agende una sesión, la vas a ver acá.</p>
        </div>
      ) : (
        <>
          {/* Próximas */}
          <section style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--teal)", marginBottom: 16 }}>
              Próximas sesiones
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {upcoming.map((s) => {
                const date = new Date(s.scheduledAt)
                return (
                  <div key={s.id} style={{ ...card, borderColor: "rgba(75,126,140,.2)", display: "flex", gap: 18, alignItems: "flex-start" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(75,126,140,.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Video size={19} style={{ color: "var(--teal)" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {multiCourse && <p style={{ fontSize: 11, color: "var(--gold)", marginBottom: 4, letterSpacing: ".04em" }}>{s.courseTitle}</p>}
                      <h3 style={{ fontWeight: 600, color: "var(--text)", fontSize: 15, marginBottom: 5 }}>{s.title}</h3>
                      {s.description && <p style={{ color: "var(--text-faint)", fontSize: 13, marginBottom: 12, lineHeight: 1.6 }}>{s.description}</p>}
                      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-faint)" }}>
                          <Calendar size={12} style={{ color: "var(--teal)" }} />
                          {formatDate(date)}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-faint)" }}>
                          <Clock size={12} style={{ color: "var(--teal)" }} />
                          {formatTime(date)} hs ({TZ_LABEL})
                        </span>
                      </div>
                    </div>

                    {isRealUrl(s.joinUrl) ? (
                      <a
                        href={s.joinUrl!}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "flex", alignItems: "center", gap: 7,
                          background: "var(--gold)", color: "#2C1F14",
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
                )
              })}
              {upcoming.length === 0 && (
                <p style={{ color: "var(--text-dim)", fontSize: 14 }}>No hay clases programadas por el momento.</p>
              )}
            </div>
          </section>

          {/* Pasadas */}
          {past.length > 0 && (
            <section>
              <p style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 14 }}>
                Sesiones anteriores
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {past.map((s) => (
                  <div key={s.id} style={{ ...card, display: "flex", alignItems: "center", gap: 14, opacity: 0.65, padding: "16px 22px" }}>
                    <CheckCircle2 size={16} style={{ color: "#C49F72", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      {multiCourse && <p style={{ fontSize: 10, color: "var(--gold)", marginBottom: 2 }}>{s.courseTitle}</p>}
                      <p style={{ fontWeight: 500, color: "var(--text)", fontSize: 14 }}>{s.title}</p>
                      <p style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 2 }}>
                        {formatDate(new Date(s.scheduledAt))}
                        {s.isCompleted ? " · Completada" : " · No dictada"}
                        {s.myAttendance && ` · Asistencia: ${s.myAttendance === "present" ? "Presente" : s.myAttendance === "late" ? "Tarde" : "Ausente"}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
