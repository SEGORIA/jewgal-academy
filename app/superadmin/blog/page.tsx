"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Pencil, Trash2, Eye, X, Loader2, Tag, Save, GripVertical } from "lucide-react"
import { DEFAULT_BLOG_CATEGORIES } from "@/lib/blog"

type Post = {
  id: string; slug: string; title: string; category: string
  excerpt: string; content: string; isPublished: boolean
  publishedAt: string | null; createdAt: string
}

const card: React.CSSProperties = { background: "var(--surface)", border: "1px solid rgba(165,141,102,.13)", borderRadius: 14 }
const inputStyle: React.CSSProperties = { background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.2)", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: "var(--text)", outline: "none", fontFamily: "inherit", width: "100%" }
const labelStyle: React.CSSProperties = { fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--text-faint)", display: "block", marginBottom: 7 }

const emptyForm = { title: "", category: "", excerpt: "", content: "", isPublished: false }

export default function BlogAdminPage() {
  const [posts, setPosts]     = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Post | null>(null)
  const [isNew, setIsNew]     = useState(false)
  const [form, setForm]       = useState(emptyForm)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState("")
  const [categories, setCategories] = useState<string[]>(DEFAULT_BLOG_CATEGORIES)
  const [showCats, setShowCats] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fetch("/api/admin/blog")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts ?? []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

  const loadCategories = useCallback(() => {
    fetch("/api/admin/blog-categories")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d.categories) && d.categories.length) setCategories(d.categories) })
      .catch(() => {})
  }, [])

  useEffect(() => { load(); loadCategories() }, [load, loadCategories])

  function openNew() {
    setForm({ ...emptyForm, category: categories[0] ?? "" })
    setIsNew(true)
    setEditing(null)
    setError("")
  }

  function openEdit(p: Post) {
    setForm({ title: p.title, category: p.category, excerpt: p.excerpt, content: p.content, isPublished: p.isPublished })
    setEditing(p)
    setIsNew(false)
    setError("")
  }

  async function savePost() {
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) {
      setError("Completá título, resumen y contenido.")
      return
    }
    setSaving(true); setError("")
    try {
      const res = await fetch(isNew ? "/api/admin/blog" : `/api/admin/blog/${editing!.id}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "No se pudo guardar"); return }
      setEditing(null); setIsNew(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  async function deletePost(id: string) {
    if (!confirm("¿Eliminar esta entrada?")) return
    await fetch(`/api/admin/blog/${id}`, { method: "DELETE" })
    load()
  }

  async function toggleStatus(p: Post) {
    await fetch(`/api/admin/blog/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !p.isPublished }),
    })
    load()
  }

  const showEditor = isNew || !!editing

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <span style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: 8 }}>Admin</span>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 36, color: "var(--text)", marginBottom: 6 }}>Blog</h1>
          <p style={{ color: "var(--text-faint)", fontSize: 14 }}>{posts.length} entradas · {posts.filter((p) => p.isPublished).length} publicadas</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setShowCats(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid rgba(165,141,102,.2)", borderRadius: 10, padding: "11px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <Tag size={15} /> Categorías
          </button>
          <button onClick={openNew} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--gold)", color: "#2C1F14", border: "none", borderRadius: 10, padding: "11px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            <Plus size={16} /> Nueva entrada
          </button>
        </div>
      </div>

      {showCats && <CategoryManager categories={categories} onClose={() => setShowCats(false)} onSaved={(cats) => { setCategories(cats); loadCategories() }} />}

      <div style={{ display: "grid", gridTemplateColumns: showEditor ? "1fr 420px" : "1fr", gap: 20, alignItems: "start" }}>

        {/* Lista de posts */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {loading && <p style={{ color: "var(--text-faint)", fontSize: 13, padding: 12 }}>Cargando…</p>}
          {!loading && posts.length === 0 && (
            <div style={{ ...card, padding: 24, textAlign: "center" }}>
              <p style={{ color: "var(--text-dim)", fontSize: 14 }}>No hay entradas todavía.</p>
            </div>
          )}
          {posts.map((p) => (
            <div key={p.id} style={{ ...card, padding: "18px 20px", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--gold)", background: "rgba(165,141,102,.1)", borderRadius: 16, padding: "3px 10px" }}>{p.category}</span>
                  <span style={{ fontSize: 11, color: p.isPublished ? "var(--success)" : "var(--text-dim)" }}>
                    {p.isPublished ? "● Publicado" : "○ Borrador"}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-dim)", marginLeft: "auto" }}>
                    {new Date(p.publishedAt ?? p.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}
                  </span>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 5 }}>{p.title}</h3>
                <p style={{ fontSize: 13, color: "var(--text-faint)", lineHeight: 1.6 }}>{p.excerpt}</p>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button onClick={() => toggleStatus(p)} title={p.isPublished ? "Pasar a borrador" : "Publicar"} style={{ background: "none", border: "1px solid rgba(255,255,255,.08)", borderRadius: 7, padding: "7px 9px", cursor: "pointer", color: p.isPublished ? "var(--success)" : "var(--text-dim)" }}>
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

            {error && (
              <div style={{ background: "rgba(220,38,38,.1)", border: "1px solid rgba(220,38,38,.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#f87171", fontSize: 13 }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Título</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Título del artículo" style={inputStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={labelStyle}>Categoría</label>
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Estado</label>
                  <select value={form.isPublished ? "published" : "draft"} onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.value === "published" }))} style={{ ...inputStyle, cursor: "pointer" }}>
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
                <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="Escribí el artículo completo aquí… (separá párrafos con una línea en blanco)" rows={8} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => { setEditing(null); setIsNew(false) }} style={{ flex: 1, background: "var(--surface-2)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 9, padding: "11px 0", fontSize: 13, color: "var(--text-muted)", cursor: "pointer" }}>Cancelar</button>
              <button onClick={savePost} disabled={saving} style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "var(--gold)", border: "none", borderRadius: 9, padding: "11px 0", fontSize: 13, fontWeight: 700, color: "#2C1F14", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
                {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : null}
                {isNew ? "Publicar entrada" : "Guardar cambios"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CategoryManager({ categories, onClose, onSaved }: { categories: string[]; onClose: () => void; onSaved: (cats: string[]) => void }) {
  const [items, setItems] = useState<string[]>(categories)
  const [nueva, setNueva] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function add() {
    const v = nueva.trim()
    if (!v) return
    if (items.some((c) => c.toLowerCase() === v.toLowerCase())) { setError("Esa categoría ya existe."); return }
    setItems((prev) => [...prev, v])
    setNueva("")
    setError("")
  }

  function rename(i: number, value: string) {
    setItems((prev) => prev.map((c, idx) => (idx === i ? value : c)))
  }

  function remove(i: number) {
    if (items.length <= 1) { setError("Debe quedar al menos una categoría."); return }
    setItems((prev) => prev.filter((_, idx) => idx !== i))
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    setItems(next)
  }

  async function save() {
    const clean = items.map((c) => c.trim()).filter(Boolean)
    if (clean.length === 0) { setError("Debe haber al menos una categoría."); return }
    setSaving(true); setError("")
    try {
      const res = await fetch("/api/admin/blog-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: clean }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "No se pudo guardar"); return }
      onSaved(data.categories ?? clean)
      onClose()
    } catch {
      setError("Error de conexión.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(20,14,8,.72)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ ...card, width: "100%", maxWidth: 480, padding: "26px 24px", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 20, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
            <Tag size={17} style={{ color: "var(--gold)" }} /> Categorías del blog
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>
        <p style={{ fontSize: 12.5, color: "var(--text-faint)", lineHeight: 1.6, marginBottom: 18 }}>
          Se usan en el filtro del blog público y al crear entradas. Renombrar aquí no cambia la categoría ya asignada a entradas existentes.
        </p>

        {error && (
          <div style={{ background: "rgba(220,38,38,.1)", border: "1px solid rgba(220,38,38,.3)", borderRadius: 8, padding: "9px 13px", marginBottom: 14, color: "#f87171", fontSize: 13 }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {items.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <GripVertical size={15} style={{ color: "var(--text-faint)", flexShrink: 0 }} />
              <input value={c} onChange={(e) => rename(i, e.target.value)} style={{ ...inputStyle, flex: 1 }} />
              <button onClick={() => move(i, -1)} disabled={i === 0} title="Subir" style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface-2)", cursor: i === 0 ? "default" : "pointer", color: "var(--text-muted)", opacity: i === 0 ? 0.3 : 1, flexShrink: 0 }}>↑</button>
              <button onClick={() => move(i, 1)} disabled={i === items.length - 1} title="Bajar" style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface-2)", cursor: i === items.length - 1 ? "default" : "pointer", color: "var(--text-muted)", opacity: i === items.length - 1 ? 0.3 : 1, flexShrink: 0 }}>↓</button>
              <button onClick={() => remove(i)} title="Eliminar" style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid rgba(239,68,68,.25)", background: "rgba(239,68,68,.06)", cursor: "pointer", color: "var(--danger)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <input
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add() } }}
            placeholder="Nueva categoría…"
            style={{ ...inputStyle, flex: 1 }}
          />
          <button onClick={add} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface-2)", border: "1px dashed rgba(165,141,102,.4)", color: "var(--gold)", borderRadius: 9, padding: "0 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <Plus size={15} /> Agregar
          </button>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, background: "var(--surface-2)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 9, padding: "11px 0", fontSize: 13, color: "var(--text-muted)", cursor: "pointer" }}>Cancelar</button>
          <button onClick={save} disabled={saving} style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "var(--gold)", border: "none", borderRadius: 9, padding: "11px 0", fontSize: 13, fontWeight: 700, color: "#2C1F14", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={14} />}
            Guardar categorías
          </button>
        </div>
      </div>
    </div>
  )
}
