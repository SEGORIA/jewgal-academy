"use client"

import { useEffect, useState } from "react"
import { FileText, Download, ExternalLink, BookOpen, Loader2, FolderOpen } from "lucide-react"

type Material = {
  id: string; title: string; description: string | null
  type: "document" | "video" | "link"
  fileUrl: string | null; videoUrl: string | null; linkUrl: string | null
  moduleNumber: number; courseId: string; courseTitle: string
}

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid rgba(165,141,102,.14)",
  borderRadius: 14,
}

export default function MaterialesPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/me/materials")
      .then((r) => r.json())
      .then((d) => setMaterials(d.materials ?? []))
      .catch(() => setMaterials([]))
      .finally(() => setLoading(false))
  }, [])

  const courseIds = [...new Set(materials.map((m) => m.courseId))]
  const multiCourse = courseIds.length > 1

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <span style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: 10 }}>
          Aula Virtual
        </span>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 38, color: "var(--text)", marginBottom: 8 }}>
          Materiales de estudio
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
          PDFs, guías y recursos organizados por módulo.
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-dim)", padding: "40px 0" }}>
          <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Cargando materiales…
        </div>
      ) : materials.length === 0 ? (
        <div style={{ ...card, padding: "44px 32px", textAlign: "center" }}>
          <FolderOpen size={26} style={{ color: "rgba(165,141,102,.3)", margin: "0 auto 14px", display: "block" }} />
          <p style={{ color: "var(--text-muted)", fontSize: 15, marginBottom: 6 }}>Todavía no hay materiales disponibles</p>
          <p style={{ color: "var(--text-dim)", fontSize: 13 }}>Aparecerán aquí a medida que tu programa avance.</p>
        </div>
      ) : (
        courseIds.map((courseId) => {
          const courseMaterials = materials.filter((m) => m.courseId === courseId)
          const modules = [...new Set(courseMaterials.map((m) => m.moduleNumber))].sort((a, b) => a - b)
          return (
            <div key={courseId} style={{ marginBottom: 8 }}>
              {multiCourse && (
                <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 20, color: "var(--gold)", marginBottom: 20 }}>
                  {courseMaterials[0].courseTitle}
                </h2>
              )}
              {modules.map((mod) => (
                <section key={mod} style={{ marginBottom: 36 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(165,141,102,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <BookOpen size={15} style={{ color: "var(--gold)" }} />
                    </div>
                    <h3 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 18, color: "var(--text)" }}>
                      Módulo {mod}
                    </h3>
                    <div style={{ flex: 1, height: 1, background: "var(--surface-2)" }} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {courseMaterials.filter((m) => m.moduleNumber === mod).map((material) => {
                      const href = material.fileUrl || material.videoUrl || material.linkUrl || "#"
                      return (
                        <div
                          key={material.id}
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
                          <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(165,141,102,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {material.type === "document"
                              ? <FileText size={17} style={{ color: "var(--gold)" }} />
                              : <ExternalLink size={17} style={{ color: "var(--teal)" }} />
                            }
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 600, color: "var(--text)", fontSize: 14, marginBottom: 3 }}>{material.title}</p>
                            {material.description && <p style={{ color: "var(--text-faint)", fontSize: 12 }}>{material.description}</p>}
                          </div>
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "var(--gold)", transition: "opacity .2s", flexShrink: 0 }}
                            aria-label={`Abrir ${material.title}`}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = ".65")}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                          >
                            {material.type === "document" ? <Download size={18} /> : <ExternalLink size={18} />}
                          </a>
                        </div>
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>
          )
        })
      )}
    </div>
  )
}
