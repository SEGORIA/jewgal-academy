"use client"

import { useEffect, useState } from "react"
import { Headphones, Video, FileText, PlayCircle, Loader2, Sparkles } from "lucide-react"

type Resource = {
  id: string
  title: string
  description: string | null
  type: "audio" | "video" | "document"
  fileUrl: string
  duration: number | null
  order: number
  course: { id: string; title: string } | null
}

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid rgba(165,141,102,.14)",
  borderRadius: 14,
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

const typeIcon = { audio: Headphones, video: PlayCircle, document: FileText }
const typeLabel = { audio: "Audio", video: "Video", document: "Documento" }

export default function RecursosPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/me/exclusive-resources")
      .then((r) => r.json())
      .then((d) => setResources(d.resources ?? []))
      .catch(() => setResources([]))
      .finally(() => setLoading(false))
  }, [])

  const grouped = resources.reduce<Record<string, Resource[]>>((acc, r) => {
    const key = r.course?.title ?? "Recursos globales"
    if (!acc[key]) acc[key] = []
    acc[key].push(r)
    return acc
  }, {})

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <span style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: 10 }}>
          Aula Virtual
        </span>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 38, color: "var(--text)", marginBottom: 8 }}>
          Recursos exclusivos
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
          Meditaciones, audios y materiales complementarios de tu programa.
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-dim)", padding: "40px 0" }}>
          <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Cargando recursos…
        </div>
      ) : resources.length === 0 ? (
        <div style={{ ...card, padding: "56px 32px", textAlign: "center" }}>
          <Sparkles size={28} style={{ color: "rgba(165,141,102,.3)", margin: "0 auto 16px", display: "block" }} />
          <p style={{ color: "var(--text-muted)", fontSize: 16, marginBottom: 8, fontFamily: "var(--serif)", fontWeight: 500 }}>
            Próximamente
          </p>
          <p style={{ color: "var(--text-dim)", fontSize: 14, maxWidth: 360, margin: "0 auto" }}>
            Los recursos exclusivos de tu programa aparecerán aquí. Volvé pronto.
          </p>
        </div>
      ) : (
        Object.entries(grouped).map(([groupTitle, items]) => (
          <section key={groupTitle} style={{ marginBottom: 40 }}>
            {Object.keys(grouped).length > 1 && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 20, color: "var(--gold)", flexShrink: 0 }}>
                  {groupTitle}
                </h2>
                <div style={{ flex: 1, height: 1, background: "var(--surface-2)" }} />
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((resource) => {
                const Icon = typeIcon[resource.type]
                return (
                  <div
                    key={resource.id}
                    style={{ ...card, display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", transition: "border-color .2s, box-shadow .2s" }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = "rgba(165,141,102,.3)"
                      el.style.boxShadow = "0 6px 24px rgba(165,141,102,.08)"
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = "rgba(165,141,102,.14)"
                      el.style.boxShadow = "none"
                    }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(165,141,102,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={18} style={{ color: "var(--gold)" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, color: "var(--text)", fontSize: 14, marginBottom: 3 }}>{resource.title}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: ".12em" }}>
                          {typeLabel[resource.type]}
                        </span>
                        {resource.duration && (
                          <>
                            <span style={{ color: "var(--surface-2)", fontSize: 10 }}>·</span>
                            <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{formatDuration(resource.duration)}</span>
                          </>
                        )}
                        {resource.description && (
                          <>
                            <span style={{ color: "var(--surface-2)", fontSize: 10 }}>·</span>
                            <span style={{ fontSize: 12, color: "var(--text-faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{resource.description}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {resource.type === "audio" ? (
                      <audio
                        controls
                        src={resource.fileUrl}
                        style={{ height: 32, maxWidth: 200 }}
                        preload="none"
                        aria-label={resource.title}
                      />
                    ) : (
                      <a
                        href={resource.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          padding: "7px 14px", borderRadius: 8,
                          background: "rgba(165,141,102,.12)", border: "1px solid rgba(165,141,102,.2)",
                          color: "var(--gold)", fontSize: 12, fontWeight: 600,
                          textDecoration: "none", flexShrink: 0, transition: "all .2s",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(165,141,102,.22)" }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(165,141,102,.12)" }}
                      >
                        <Video size={13} />
                        Abrir
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
