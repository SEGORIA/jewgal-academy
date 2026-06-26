"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Eye, X } from "lucide-react"

type Post = { id: string; title: string; category: string; date: string; status: "published" | "draft"; excerpt: string; content: string }

const CATEGORIES = ["Coaching", "Cabalá", "Jewgal", "Liderazgo", "Educación"]

const INITIAL_POSTS: Post[] = [
  { id: "1", title: "¿Qué es el Life Coaching Integrativo?", category: "Coaching", date: "12 Jun 2026", status: "published", excerpt: "El coaching integrativo une logoterapia, mindfulness y herramientas espirituales…", content: "" },
  { id: "2", title: "Cabalá y bienestar: sabiduría ancestral", category: "Cabalá", date: "04 Jun 2026", status: "published", excerpt: "La Cabalá no es religión ni magia. Es un mapa del alma humana…", content: "" },
  { id: "3", title: "El Método Jewgal: movimiento consciente", category: "Jewgal", date: "28 May 2026", status: "draft", excerpt: "El movimiento como herramienta de transformación personal…", content: "" },
]

const card: React.CSSProperties = { background: "var(--surface)", border: "1px solid rgba(165,141,102,.13)", borderRadius: 14 }
const inputStyle: React.CSSProperties = { background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.2)", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: "var(--text)", outline: "none", fontFamily: "inherit", width: "100%" }
const labelStyle: React.CSSProperties = { fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--text-faint)", display: "block", marginBottom: 7 }

export default function BlogAdminPage() {
  const [posts, setPosts]     = useState<Post[]>(INITIAL_POSTS)
  const [editing, setEditing] = useState<Post | null>(null)
  const [isNew, setIsNew]     = useState(false)
  const [form, setForm]       = useState({ title: "", category: CATEGORIES[0], excerpt: "", content: "", status: "draft" as "published" | "draft" })

  function openNew() {
    setForm({ title: "", category: CATEGORIES[0], excerpt: "", content: "", status: "draft" })
    setIsNew(true)
    setEditing(null)
  }

  function openEdit(p: Post) {
    setForm({ title: p.title, category: p.category, excerpt: p.excerpt, content: p.content, status: p.status })
    setEditing(p)
    setIsNew(false)
  }

  function savePost() {
    if (isNew) {
      const np: Post = { id: Date.now().toString(), ...form, date: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) }
      setPosts((prev) => [np, ...prev])
    } else if (editing) {
      setPosts((prev) => prev.map((p) => p.id === editing.id ? { ...p, ...form } : p))
    }
    setEditing(null); setIsNew(false)
  }

  function deletePost(id: string) {
    if (confirm("¿Eliminar esta entrada?")) setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  function toggleStatus(id: string) {
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, status: p.status === "published" ? "draft" : "published" } : p))
  }

  const showEditor = isNew || !!editing

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <span style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: 8 }}>Admin</span>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 36, color: "var(--text)", marginBottom: 6 }}>Blog</h1>
          <p style={{ color: "var(--text-faint)", fontSize: 14 }}>{posts.length} entradas · {posts.filter((p) => p.status === "published").length} publicadas</p>
        </div>
        <button onClick={openNew} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--gold)", color: "#2C1F14", border: "none", borderRadius: 10, padding: "11px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          <Plus size={16} /> Nueva entrada
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: showEditor ? "1fr 420px" : "1fr", gap: 20, alignItems: "start" }}>

        {/* Lista de posts */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {posts.map((p) => (
            <div key={p.id} style={{ ...card, padding: "18px 20px", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--gold)", background: "rgba(165,141,102,.1)", borderRadius: 16, padding: "3px 10px" }}>{p.category}</span>
                  <span style={{ fontSize: 11, color: p.status === "published" ? "var(--success)" : "var(--text-dim)" }}>
                    {p.status === "published" ? "● Publicado" : "○ Borrador"}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-dim)", marginLeft: "auto" }}>{p.date}</span>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 5 }}>{p.title}</h3>
                <p style={{ fontSize: 13, color: "var(--text-faint)", lineHeight: 1.6 }}>{p.excerpt}</p>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button onClick={() => toggleStatus(p.id)} title={p.status === "published" ? "Pasar a borrador" : "Publicar"} style={{ background: "none", border: "1px solid rgba(255,255,255,.08)", borderRadius: 7, padding: "7px 9px", cursor: "pointer", color: p.status === "published" ? "var(--success)" : "var(--text-dim)" }}>
                  <Eye size={14} />
                </button>
                <button onClick={() => openEdit(p)} style={{ background: "none", border: "1px solid rgba(255,255,255,.08)", borderRadius: 7, padding: "7px 9px", cursor: "pointer", color: "var(--text-muted)" }}>
                  <Pencil size={14} />
                </button>
                <button onClick={() => deletePost(p.id)} style={{ background: "none", border: "1px solid rgba(255,255,255,.08)", borderRadius: 7, padding: "7px 9px", cursor: "pointer", color: "rgba(239,68,68,.5)" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Editor */}
        {showEditor && (
          <div style={{ ...card, padding: "26px 24px", position: "sticky", top: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 20, color: "var(--text)" }}>
                {isNew ? "Nueva entrada" : "Editar entrada"}
              </h2>
              <button onClick={() => { setEditing(null); setIsNew(false) }} style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Título</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Título del artículo" style={inputStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={labelStyle}>Categoría</label>
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Estado</label>
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "published" | "draft" }))} style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="draft">Borrador</option>
                    <option value="published">Publicado</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Resumen (excerpt)</label>
                <textarea value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} placeholder="Breve descripción del artículo…" rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
              </div>
              <div>
                <label style={labelStyle}>Contenido completo</label>
                <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="Escribí el artículo completo aquí…" rows={8} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => { setEditing(null); setIsNew(false) }} style={{ flex: 1, background: "var(--surface-2)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 9, padding: "11px 0", fontSize: 13, color: "var(--text-muted)", cursor: "pointer" }}>Cancelar</button>
              <button onClick={savePost} style={{ flex: 2, background: "var(--gold)", border: "none", borderRadius: 9, padding: "11px 0", fontSize: 13, fontWeight: 700, color: "#2C1F14", cursor: "pointer" }}>
                {isNew ? "Publicar entrada" : "Guardar cambios"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
