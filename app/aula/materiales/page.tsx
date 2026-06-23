"use client"

import { FileText, Download, ExternalLink, BookOpen } from "lucide-react"

const mockMaterials = [
  { id: "1", title: "Guía de Bienvenida al Programa",          type: "document", moduleNumber: 1, fileUrl: "#", desc: "Introducción completa al Life Coaching Integrativo." },
  { id: "2", title: "Ejercicios Módulo 1: Auto-conocimiento",  type: "document", moduleNumber: 1, fileUrl: "#", desc: "12 ejercicios prácticos de auto-exploración." },
  { id: "3", title: "Lecturas recomendadas – Módulo 1",        type: "link",     moduleNumber: 1, linkUrl: "#", desc: "Bibliografía seleccionada para profundizar." },
  { id: "4", title: "Herramientas de Mindfulness – PDF",       type: "document", moduleNumber: 2, fileUrl: "#", desc: "Técnicas y prácticas de mindfulness aplicadas." },
  { id: "5", title: "Cabalá y Coaching – Introducción",        type: "document", moduleNumber: 2, fileUrl: "#", desc: "Fundamentos de la Cabalá aplicados al bienestar personal." },
]

const modules = [...new Set(mockMaterials.map((m) => m.moduleNumber))].sort()

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid rgba(165,141,102,.14)",
  borderRadius: 14,
}

export default function MaterialesPage() {
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

      {modules.map((mod) => (
        <section key={mod} style={{ marginBottom: 36 }}>
          {/* Módulo header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(165,141,102,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookOpen size={15} style={{ color: "var(--gold)" }} />
            </div>
            <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 18, color: "var(--text)" }}>
              Módulo {mod}
            </h2>
            <div style={{ flex: 1, height: 1, background: "var(--surface-2)" }} />
          </div>

          {/* Materiales */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {mockMaterials
              .filter((m) => m.moduleNumber === mod)
              .map((material) => (
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
                  {/* Icono */}
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(165,141,102,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {material.type === "document"
                      ? <FileText size={17} style={{ color: "var(--gold)" }} />
                      : <ExternalLink size={17} style={{ color: "var(--teal)" }} />
                    }
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, color: "var(--text)", fontSize: 14, marginBottom: 3 }}>{material.title}</p>
                    <p style={{ color: "var(--text-faint)", fontSize: 12 }}>{material.desc}</p>
                  </div>
                  {/* Acción */}
                  <a
                    href={material.fileUrl || material.linkUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--gold)", transition: "opacity .2s", flexShrink: 0 }}
                    aria-label={`Descargar ${material.title}`}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = ".65")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                  >
                    {material.type === "document" ? <Download size={18} /> : <ExternalLink size={18} />}
                  </a>
                </div>
              ))}
          </div>
        </section>
      ))}
    </div>
  )
}
