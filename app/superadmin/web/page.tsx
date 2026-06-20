"use client"

import { useState } from "react"
import { Eye, Save, ChevronDown, ChevronUp } from "lucide-react"

type Section = { id: string; label: string; visible: boolean; fields: Field[] }
type Field   = { key: string; label: string; type: "text" | "textarea" | "url" | "toggle"; value: string | boolean }

const INITIAL_SECTIONS: Section[] = [
  {
    id: "hero", label: "Hero / Portada", visible: true,
    fields: [
      { key: "headline1", label: "Línea 1 del título",    type: "text",     value: "Aprende. Integra." },
      { key: "headline2", label: "Línea 2 del título",    type: "text",     value: "Transforma." },
      { key: "subtext",   label: "Texto descriptivo",     type: "textarea", value: "Programas, certificaciones y experiencias diseñadas para desarrollar resiliencia, claridad y liderazgo consciente." },
      { key: "cta1",      label: "Botón principal",       type: "text",     value: "Explorar programas →" },
      { key: "cta2",      label: "Botón secundario",      type: "text",     value: "Conocer a Devora" },
    ],
  },
  {
    id: "stats", label: "Estadísticas (debajo del hero)", visible: true,
    fields: [
      { key: "stat1n", label: "Stat 1 — Número", type: "text", value: "40+" },
      { key: "stat1l", label: "Stat 1 — Etiqueta", type: "text", value: "Años de experiencia" },
      { key: "stat2n", label: "Stat 2 — Número", type: "text", value: "4" },
      { key: "stat2l", label: "Stat 2 — Etiqueta", type: "text", value: "Países de presencia" },
      { key: "stat3n", label: "Stat 3 — Número", type: "text", value: "5" },
      { key: "stat3l", label: "Stat 3 — Etiqueta", type: "text", value: "Programas activos" },
      { key: "stat4n", label: "Stat 4 — Número", type: "text", value: "501c3" },
      { key: "stat4l", label: "Stat 4 — Etiqueta", type: "text", value: "Organización sin fines" },
    ],
  },
  {
    id: "fundadora", label: "Sección «Conoce a Devora»", visible: true,
    fields: [
      { key: "name",     label: "Nombre",           type: "text",     value: "Devora Benchimol" },
      { key: "title",    label: "Título",            type: "text",     value: "Master Coach Internacional" },
      { key: "location", label: "Ubicación",         type: "text",     value: "Miami, FL" },
      { key: "bio",      label: "Biografía (intro)", type: "textarea", value: "Más de 40 años acompañando procesos de transformación personal en comunidades de todo el mundo." },
    ],
  },
  {
    id: "contacto", label: "Información de contacto", visible: true,
    fields: [
      { key: "email",    label: "Email",             type: "text", value: "hola@jewgalacademy.com" },
      { key: "phone",    label: "Teléfono / WhatsApp", type: "text", value: "+1 (305) 000-0000" },
      { key: "location", label: "Ciudad",            type: "text", value: "Miami, Florida · EE. UU." },
      { key: "ig",       label: "Instagram URL",     type: "url",  value: "https://instagram.com/jewgalacademy" },
      { key: "fb",       label: "Facebook URL",      type: "url",  value: "" },
      { key: "yt",       label: "YouTube URL",       type: "url",  value: "" },
    ],
  },
  {
    id: "footer", label: "Pie de página (footer)", visible: true,
    fields: [
      { key: "copy",     label: "Texto legal",       type: "text",     value: "© 2026 Jewgal Academy. Todos los derechos reservados." },
      { key: "tagline",  label: "Frase del footer",  type: "text",     value: "Hecho con amor por el equipo de Jewgal Academy." },
    ],
  },
]

const card: React.CSSProperties = { background: "rgba(255,255,255,.03)", border: "1px solid rgba(165,141,102,.13)", borderRadius: 14 }
const inputBase: React.CSSProperties = { background: "rgba(255,255,255,.05)", border: "1px solid rgba(165,141,102,.2)", borderRadius: 9, fontSize: 13, color: "#eef4f4", outline: "none", fontFamily: "inherit", width: "100%", padding: "10px 14px" }
const labelStyle: React.CSSProperties = { fontSize: 11, letterSpacing: ".15em", textTransform: "uppercase", color: "rgba(224,233,234,.4)", display: "block", marginBottom: 7 }

export default function WebAdminPage() {
  const [sections, setSections] = useState<Section[]>(INITIAL_SECTIONS)
  const [expanded, setExpanded] = useState<string | null>("hero")
  const [saved,    setSaved]    = useState(false)

  function updateField(sectionId: string, key: string, value: string | boolean) {
    setSections((prev) => prev.map((s) =>
      s.id === sectionId ? { ...s, fields: s.fields.map((f) => f.key === key ? { ...f, value } : f) } : s
    ))
  }

  function toggleVisible(sectionId: string) {
    setSections((prev) => prev.map((s) => s.id === sectionId ? { ...s, visible: !s.visible } : s))
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <span style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold,#A58D66)", display: "block", marginBottom: 8 }}>Admin</span>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 36, color: "#eef4f4", marginBottom: 6 }}>Editor del sitio web</h1>
          <p style={{ color: "rgba(224,233,234,.4)", fontSize: 14 }}>Modificá los textos e información visibles en el sitio público.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <a href="/" target="_blank" style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,.05)", border: "1px solid rgba(165,141,102,.2)", borderRadius: 10, padding: "11px 18px", fontSize: 13, color: "rgba(224,233,234,.6)", textDecoration: "none" }}>
            <Eye size={15} /> Ver sitio
          </a>
          <button onClick={handleSave} style={{ display: "flex", alignItems: "center", gap: 7, background: saved ? "#6BBF8E" : "var(--gold,#A58D66)", color: "#081E29", border: "none", borderRadius: 10, padding: "11px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "background .3s" }}>
            <Save size={15} /> {saved ? "¡Guardado!" : "Guardar cambios"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sections.map((section) => (
          <div key={section.id} style={{ ...card }}>
            {/* Header acordeón */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 22px", cursor: "pointer" }} onClick={() => setExpanded(expanded === section.id ? null : section.id)}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: section.visible ? "#6BBF8E" : "rgba(224,233,234,.2)", flexShrink: 0 }} />
              <span style={{ fontSize: 15, fontWeight: 600, color: "#eef4f4", flex: 1 }}>{section.label}</span>
              <button onClick={(e) => { e.stopPropagation(); toggleVisible(section.id) }}
                style={{ fontSize: 11, color: section.visible ? "#6BBF8E" : "rgba(224,233,234,.3)", background: "none", border: "none", cursor: "pointer", letterSpacing: ".1em" }}>
                {section.visible ? "Visible" : "Oculto"}
              </button>
              {expanded === section.id ? <ChevronUp size={16} style={{ color: "rgba(224,233,234,.3)" }} /> : <ChevronDown size={16} style={{ color: "rgba(224,233,234,.3)" }} />}
            </div>

            {/* Campos */}
            {expanded === section.id && (
              <div style={{ padding: "0 22px 22px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, borderTop: "1px solid rgba(255,255,255,.06)", paddingTop: 20 }}>
                {section.fields.map((field) => (
                  <div key={field.key} style={{ gridColumn: field.type === "textarea" ? "span 2" : undefined }}>
                    <label style={labelStyle}>{field.label}</label>
                    {field.type === "textarea" ? (
                      <textarea
                        value={field.value as string}
                        onChange={(e) => updateField(section.id, field.key, e.target.value)}
                        rows={3}
                        style={{ ...inputBase, resize: "vertical", lineHeight: 1.7 }}
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={field.value as string}
                        onChange={(e) => updateField(section.id, field.key, e.target.value)}
                        style={inputBase}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ ...card, padding: "20px 22px", marginTop: 20, borderColor: "rgba(251,191,36,.15)", background: "rgba(251,191,36,.03)" }}>
        <p style={{ fontSize: 13, color: "rgba(224,233,234,.5)", lineHeight: 1.7 }}>
          <strong style={{ color: "rgba(224,233,234,.75)" }}>Nota:</strong> Los cambios de texto se guardan en la base de datos y se aplican al sitio en el próximo deploy. Para cambios de diseño (colores, imágenes, fuentes), editá los archivos de código con Claude Code.
        </p>
      </div>
    </div>
  )
}
