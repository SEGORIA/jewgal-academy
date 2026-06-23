"use client"

import { useState } from "react"
import { Users, PlayCircle, FileText, Eye, EyeOff, Plus, X, Upload, Video } from "lucide-react"

type Tab = "materiales" | "sesiones" | "alumnos"

const PROGRAMS = [
  { slug: "life-coaching-integrativo", name: "Life Coaching Integrativo", price: 1500, isFree: false, students: 0, accent: "#A58D66", published: true  },
  { slug: "joogal-adultos",            name: "Instructor Joogal Adultos", price: 0,    isFree: true,  students: 0, accent: "var(--success)", published: true  },
  { slug: "joogalkids",                name: "Instructor Joogalkids",     price: 360,  isFree: false, students: 0, accent: "#7B9FD8", published: true  },
  { slug: "metodo-sholem",             name: "Método Sholem",             price: 360,  isFree: false, students: 0, accent: "#B07FD8", published: true  },
  { slug: "cabala-coach",              name: "Cábala Coach",              price: 360,  isFree: false, students: 0, accent: "#CBB78B", published: false },
]

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid rgba(165,141,102,.13)",
  borderRadius: 14,
}

const inputStyle: React.CSSProperties = {
  background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.2)",
  borderRadius: 9, padding: "10px 14px", fontSize: 13, color: "var(--text)",
  outline: "none", fontFamily: "inherit", width: "100%",
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase",
  color: "var(--text-faint)", display: "block", marginBottom: 7,
}

export default function CursosAdminPage() {
  const [programs, setPrograms]     = useState(PROGRAMS)
  const [selected, setSelected]     = useState<typeof PROGRAMS[0] | null>(null)
  const [tab, setTab]               = useState<Tab>("materiales")
  const [showAddMat, setShowAddMat] = useState(false)
  const [showAddSes, setShowAddSes] = useState(false)

  function togglePublish(slug: string) {
    setPrograms((prev) => prev.map((p) => p.slug === slug ? { ...p, published: !p.published } : p))
    if (selected?.slug === slug) setSelected((s) => s ? { ...s, published: !s.published } : null)
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <span style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: 8 }}>Admin</span>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 36, color: "var(--text)", marginBottom: 6 }}>Programas</h1>
        <p style={{ color: "var(--text-faint)", fontSize: 14 }}>Gestioná contenido, sesiones y alumnos de cada programa.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "300px 1fr" : "1fr", gap: 20, alignItems: "start" }}>

        {/* Lista */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {programs.map((p) => (
            <div key={p.slug} onClick={() => { setSelected(selected?.slug === p.slug ? null : p); setTab("materiales") }}
              style={{ ...card, padding: "18px 18px", cursor: "pointer", transition: "all .18s", borderColor: selected?.slug === p.slug ? p.accent + "55" : "rgba(165,141,102,.13)" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.accent, flexShrink: 0 }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", flex: 1 }}>{p.name}</span>
                <button onClick={(e) => { e.stopPropagation(); togglePublish(p.slug) }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: p.published ? "var(--success)" : "var(--text-dim)", padding: 2 }}>
                  {p.published ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "var(--text-faint)" }}>{p.isFree ? "Gratuito" : `$${p.price}`}</span>
                <span style={{ fontSize: 12, color: "var(--text-dim)" }}>· {p.students} alumnos</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: p.published ? "var(--success)" : "var(--text-dim)" }}>
                  {p.published ? "● Activo" : "○ Oculto"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Panel de gestión del programa seleccionado */}
        {selected && (
          <div style={{ ...card, padding: "28px 26px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22, paddingBottom: 20, borderBottom: "1px solid var(--surface-2)" }}>
              <div>
                <span style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: selected.accent, display: "block", marginBottom: 4 }}>Gestión de programa</span>
                <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 22, color: "var(--text)" }}>{selected.name}</h2>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "var(--surface)", borderRadius: 10, padding: 4 }}>
              {([
                { key: "materiales", icon: FileText,    label: "Materiales" },
                { key: "sesiones",   icon: Video,       label: "Clases en vivo" },
                { key: "alumnos",    icon: Users,       label: "Alumnos" },
              ] as { key: Tab; icon: typeof FileText; label: string }[]).map(({ key, icon: Icon, label }) => (
                <button key={key} onClick={() => setTab(key)} style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  padding: "9px 10px", borderRadius: 8, border: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: tab === key ? 600 : 400,
                  background: tab === key ? selected.accent + "22" : "transparent",
                  color: tab === key ? selected.accent : "var(--text-faint)",
                  transition: "all .18s",
                }}>
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            {/* MATERIALES */}
            {tab === "materiales" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: "var(--text-faint)" }}>0 materiales subidos</p>
                  <button onClick={() => setShowAddMat(!showAddMat)} style={{ display: "flex", alignItems: "center", gap: 7, background: selected.accent, color: "#081E29", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    <Plus size={14} /> Subir material
                  </button>
                </div>
                {showAddMat && (
                  <div style={{ background: "var(--surface)", border: "1px solid rgba(165,141,102,.18)", borderRadius: 12, padding: "20px 18px", marginBottom: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div><label style={labelStyle}>Título</label><input placeholder="Guía módulo 1" style={inputStyle} /></div>
                      <div>
                        <label style={labelStyle}>Módulo</label>
                        <select style={{ ...inputStyle, cursor: "pointer" }}>{[1,2,3,4].map((n) => <option key={n}>Módulo {n}</option>)}</select>
                      </div>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={labelStyle}>Tipo</label>
                      <select style={{ ...inputStyle, cursor: "pointer" }}>
                        <option>PDF / Documento</option><option>Enlace externo</option><option>Video</option>
                      </select>
                    </div>
                    <div style={{ border: "2px dashed rgba(165,141,102,.2)", borderRadius: 10, padding: "24px", textAlign: "center", cursor: "pointer", marginBottom: 12 }}>
                      <Upload size={20} style={{ color: "rgba(165,141,102,.5)", margin: "0 auto 8px", display: "block" }} />
                      <p style={{ fontSize: 13, color: "var(--text-dim)" }}>Arrastrá un archivo o hacé clic para seleccionar</p>
                      <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>PDF, DOCX, MP4 · Máx. 100MB</p>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => setShowAddMat(false)} style={{ flex: 1, background: "var(--surface-2)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 8, padding: "10px 0", fontSize: 13, color: "var(--text-muted)", cursor: "pointer" }}>Cancelar</button>
                      <button onClick={() => setShowAddMat(false)} style={{ flex: 2, background: selected.accent, border: "none", borderRadius: 8, padding: "10px 0", fontSize: 13, fontWeight: 700, color: "#081E29", cursor: "pointer" }}>Guardar</button>
                    </div>
                  </div>
                )}
                <div style={{ padding: "40px 0", textAlign: "center" }}>
                  <FileText size={26} style={{ color: "rgba(165,141,102,.2)", margin: "0 auto 12px", display: "block" }} />
                  <p style={{ color: "var(--text-dim)", fontSize: 14 }}>No hay materiales aún</p>
                </div>
              </div>
            )}

            {/* SESIONES */}
            {tab === "sesiones" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: "var(--text-faint)" }}>0 sesiones programadas</p>
                  <button onClick={() => setShowAddSes(!showAddSes)} style={{ display: "flex", alignItems: "center", gap: 7, background: selected.accent, color: "#081E29", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    <Plus size={14} /> Agendar sesión
                  </button>
                </div>
                {showAddSes && (
                  <div style={{ background: "var(--surface)", border: "1px solid rgba(165,141,102,.18)", borderRadius: 12, padding: "20px 18px", marginBottom: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div><label style={labelStyle}>Título</label><input placeholder="Módulo 1 – Intro" style={inputStyle} /></div>
                      <div><label style={labelStyle}>Link Zoom</label><input placeholder="https://zoom.us/j/..." style={inputStyle} /></div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div><label style={labelStyle}>Fecha</label><input type="date" style={{ ...inputStyle, colorScheme: "dark" }} /></div>
                      <div><label style={labelStyle}>Hora</label><input type="time" style={{ ...inputStyle, colorScheme: "dark" }} /></div>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => setShowAddSes(false)} style={{ flex: 1, background: "var(--surface-2)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 8, padding: "10px 0", fontSize: 13, color: "var(--text-muted)", cursor: "pointer" }}>Cancelar</button>
                      <button onClick={() => setShowAddSes(false)} style={{ flex: 2, background: selected.accent, border: "none", borderRadius: 8, padding: "10px 0", fontSize: 13, fontWeight: 700, color: "#081E29", cursor: "pointer" }}>Guardar</button>
                    </div>
                  </div>
                )}
                <div style={{ padding: "40px 0", textAlign: "center" }}>
                  <PlayCircle size={26} style={{ color: "rgba(165,141,102,.2)", margin: "0 auto 12px", display: "block" }} />
                  <p style={{ color: "var(--text-dim)", fontSize: 14 }}>No hay sesiones programadas</p>
                </div>
              </div>
            )}

            {/* ALUMNOS */}
            {tab === "alumnos" && (
              <div style={{ padding: "40px 0", textAlign: "center" }}>
                <Users size={26} style={{ color: "rgba(165,141,102,.2)", margin: "0 auto 12px", display: "block" }} />
                <p style={{ color: "var(--text-dim)", fontSize: 14 }}>No hay alumnos en este programa</p>
                <p style={{ color: "var(--text-dim)", fontSize: 13, marginTop: 4 }}>Se inscribirán desde la página pública o desde el admin.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
