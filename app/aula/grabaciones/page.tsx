"use client"

import { useEffect, useState } from "react"
import { PlayCircle, Clock, Lock, Loader2 } from "lucide-react"

type LiveSession = {
  id: string; title: string; scheduledAt: string; durationMin: number
  recordingUrl: string | null; courseId: string; courseTitle: string
}

function isRealUrl(url: string | null): boolean {
  if (!url) return false
  if (url.includes("placeholder") || url === "#") return false
  try { new URL(url); return true } catch { return false }
}

function formatDuration(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return h > 0 ? `${h}h ${m > 0 ? `${m}min` : ""}`.trim() : `${m}min`
}

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid rgba(165,141,102,.14)",
  borderRadius: 14,
}

export default function GrabacionesPage() {
  const [sessions, setSessions] = useState<LiveSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/me/live-sessions")
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions ?? []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false))
  }, [])

  const available = sessions.filter((s) => isRealUrl(s.recordingUrl))
  const coming = sessions.filter((s) => !isRealUrl(s.recordingUrl))
  const multiCourse = new Set(sessions.map((s) => s.courseId)).size > 1

  if (loading) {
    return (
      <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", alignItems: "center", gap: 10, color: "var(--text-dim)", padding: "40px 0" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Cargando grabaciones…
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <span style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: 10 }}>
          Aula Virtual
        </span>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 38, color: "var(--text)", marginBottom: 8 }}>
          Grabaciones
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
          Revisá las clases pasadas cuando quieras.
        </p>
      </div>

      {/* Disponibles */}
      {available.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "#C49F72", marginBottom: 16 }}>
            Disponibles
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {available.map((rec) => (
              <a key={rec.id} href={rec.recordingUrl!} target="_blank" rel="noopener noreferrer" style={{ ...card, overflow: "hidden", display: "block", textDecoration: "none" }}>
                <div style={{ aspectRatio: "16/9", background: "linear-gradient(135deg,var(--surface-solid),var(--bg))", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(165,141,102,.2)", border: "2px solid rgba(165,141,102,.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <PlayCircle size={32} style={{ color: "var(--gold)" }} />
                  </div>
                </div>
                <div style={{ padding: "20px 24px" }}>
                  {multiCourse && <p style={{ fontSize: 11, color: "var(--gold)", marginBottom: 4 }}>{rec.courseTitle}</p>}
                  <h3 style={{ fontWeight: 600, color: "var(--text)", fontSize: 15, marginBottom: 8 }}>{rec.title}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-faint)" }}>
                    <Clock size={12} style={{ color: "var(--gold)" }} />
                    {formatDuration(rec.durationMin)}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Próximamente */}
      <section>
        <p style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 16 }}>
          Próximamente
        </p>

        {available.length === 0 && (
          <div style={{ ...card, padding: "44px 32px", textAlign: "center", marginBottom: 16, borderColor: "rgba(165,141,102,.1)" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(165,141,102,.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
              <Lock size={24} style={{ color: "var(--gold)" }} />
            </div>
            <h3 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 20, color: "var(--text)", marginBottom: 8 }}>
              {sessions.length === 0 ? "Todavía no hay clases programadas" : "Las grabaciones estarán disponibles pronto"}
            </h3>
            <p style={{ color: "var(--text-faint)", fontSize: 14, lineHeight: 1.7, maxWidth: 440, margin: "0 auto" }}>
              Después de cada clase en vivo, Devora sube la grabación aquí para que puedas revisarla cuando quieras.
            </p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {coming.map((rec) => (
            <div key={rec.id} style={{ ...card, display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", opacity: 0.45 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <PlayCircle size={18} style={{ color: "var(--text-dim)" }} />
              </div>
              <div style={{ flex: 1 }}>
                {multiCourse && <p style={{ fontSize: 10, color: "var(--gold)", marginBottom: 2 }}>{rec.courseTitle}</p>}
                <p style={{ fontWeight: 500, color: "var(--text)", fontSize: 14 }}>{rec.title}</p>
                <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>{formatDuration(rec.durationMin)}</p>
              </div>
              <span style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(165,141,102,.5)", border: "1px solid rgba(165,141,102,.2)", borderRadius: 20, padding: "4px 12px" }}>
                Pronto
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
