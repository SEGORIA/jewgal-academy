"use client"

import { useEffect, useState, useCallback } from "react"
import {
  MessagesSquare, FolderKanban, Plus, X, Pencil, Trash2, Eye, EyeOff,
  Pin, PinOff, Loader2, ChevronDown, ChevronUp, Search,
} from "lucide-react"

type Category = {
  id: string
  courseId: string | null
  name: string
  description: string | null
  order: number
  isVisible: boolean
  course: { title: string } | null
  _count: { topics: number }
}

type CourseOption = { id: string; title: string }

type Topic = {
  id: string
  categoryId: string
  title: string
  isPinned: boolean
  isVisible: boolean
  createdAt: string
  updatedAt: string
  user: { name: string; email: string }
  category: { id: string; name: string }
  _count: { posts: number }
}

type Post = {
  id: string
  parentId: string | null
  body: string
  isVisible: boolean
  createdAt: string
  user: { id: string; name: string; email: string }
  _count: { likes: number }
  replies?: Post[]
}

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid rgba(165,141,102,.13)",
  borderRadius: 14,
}

const inputStyle: React.CSSProperties = {
  background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.2)",
  borderRadius: 9, padding: "9px 13px", fontSize: 13, color: "var(--text)",
  outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box",
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase",
  color: "var(--text-faint)", display: "block", marginBottom: 6,
}

const emptyCategoryForm = { id: null as string | null, courseId: "", name: "", description: "", order: 0, isVisible: true }

export default function SuperadminComunidadPage() {
  const [tab, setTab] = useState<"categorias" | "moderacion">("categorias")

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <span style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: 8 }}>Admin</span>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 36, color: "var(--text)", marginBottom: 6 }}>Comunidad</h1>
        <p style={{ color: "var(--text-faint)", fontSize: 14 }}>Categorías del foro y moderación de temas y publicaciones.</p>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "var(--surface)", borderRadius: 12, padding: 5, width: "fit-content" }}>
        {([
          { key: "categorias" as const, label: "Categorías", icon: FolderKanban },
          { key: "moderacion" as const, label: "Moderación", icon: MessagesSquare },
        ]).map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 9,
            border: "none", cursor: "pointer", fontSize: 13, fontWeight: tab === key ? 600 : 400,
            background: tab === key ? "rgba(165,141,102,.15)" : "transparent",
            color: tab === key ? "var(--gold)" : "var(--text-faint)", transition: "all .18s",
          }}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === "categorias" ? <CategoriasTab /> : <ModeracionTab />}
    </div>
  )
}

function CategoriasTab() {
  const [categories, setCategories] = useState<Category[]>([])
  const [courses, setCourses] = useState<CourseOption[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyCategoryForm)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [deleteError, setDeleteError] = useState<Record<string, string>>({})

  const load = useCallback(() => {
    setLoading(true)
    fetch("/api/admin/comunidad/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    fetch("/api/admin/courses")
      .then((r) => r.json())
      .then((d) => setCourses((d.courses ?? []).map((c: { id: string; title: string }) => ({ id: c.id, title: c.title }))))
      .catch(() => {})
  }, [])

  function openNew() {
    setForm(emptyCategoryForm)
    setError("")
    setShowForm(true)
  }

  function openEdit(c: Category) {
    setForm({ id: c.id, courseId: c.courseId ?? "", name: c.name, description: c.description ?? "", order: c.order, isVisible: c.isVisible })
    setError("")
    setShowForm(true)
  }

  async function saveCategory() {
    if (!form.name.trim()) { setError("El nombre es obligatorio."); return }
    setSaving(true); setError("")
    const payload = {
      courseId: form.courseId || null,
      name: form.name.trim(),
      description: form.description.trim() || null,
      order: form.order,
      isVisible: form.isVisible,
    }
    const res = await fetch(form.id ? `/api/admin/comunidad/categories/${form.id}` : "/api/admin/comunidad/categories", {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error || "No se pudo guardar la categoría."); return }
    setShowForm(false)
    setForm(emptyCategoryForm)
    load()
  }

  async function deleteCategory(id: string) {
    const res = await fetch(`/api/admin/comunidad/categories/${id}`, { method: "DELETE" })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) { setDeleteError((p) => ({ ...p, [id]: data.error || "No se pudo eliminar." })); return }
    load()
  }

  async function toggleVisible(c: Category) {
    await fetch(`/api/admin/comunidad/categories/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible: !c.isVisible }),
    }).catch(() => {})
    load()
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={showForm ? () => setShowForm(false) : openNew} style={{
          display: "flex", alignItems: "center", gap: 8,
          background: showForm ? "var(--surface-2)" : "linear-gradient(135deg,#A76D61 0%,#C49F72 100%)",
          color: showForm ? "var(--text-muted)" : "#1A0E06", border: showForm ? "1px solid rgba(255,255,255,.1)" : "none",
          borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer",
        }}>
          {showForm ? <><X size={15} /> Cancelar</> : <><Plus size={15} /> Nueva categoría</>}
        </button>
      </div>

      {showForm && (
        <div style={{ ...card, padding: "20px 22px", marginBottom: 20 }}>
          <h3 style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--text)", marginBottom: 16 }}>
            {form.id ? "Editar categoría" : "Nueva categoría"}
          </h3>
          {error && (
            <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: "var(--danger)", marginBottom: 14 }}>
              {error}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Nombre</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={inputStyle} placeholder="Ej: Preguntas generales" />
            </div>
            <div>
              <label style={labelStyle}>Programa</label>
              <select value={form.courseId} onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">General (todos los alumnos)</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Descripción (opcional)</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-end", marginBottom: 18 }}>
            <div style={{ width: 100 }}>
              <label style={labelStyle}>Orden</label>
              <input type="number" value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))} style={inputStyle} />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)", cursor: "pointer", paddingBottom: 9 }}>
              <input type="checkbox" checked={form.isVisible} onChange={(e) => setForm((f) => ({ ...f, isVisible: e.target.checked }))} />
              Visible para alumnos
            </label>
          </div>
          <button onClick={saveCategory} disabled={saving} style={{
            background: "var(--gold)", border: "none", borderRadius: 10, padding: "11px 22px",
            fontSize: 13, fontWeight: 700, color: "#2C1F14", cursor: saving ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            {saving ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Guardando…</> : "Guardar categoría"}
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-dim)", padding: "40px 0" }}>
          <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Cargando categorías…
        </div>
      ) : categories.length === 0 ? (
        <div style={{ ...card, padding: "48px 24px", textAlign: "center", color: "var(--text-dim)", fontSize: 14 }}>
          Sin categorías todavía. Creá la primera para habilitar el foro.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {categories.map((c) => (
            <div key={c.id} style={{ ...card, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{c.name}</p>
                  {!c.isVisible && (
                    <span style={{ fontSize: 10, color: "var(--text-dim)", background: "var(--surface-2)", borderRadius: 5, padding: "2px 7px" }}>Oculta</span>
                  )}
                </div>
                <span style={{ fontSize: 11.5, color: "var(--text-dim)" }}>
                  {c.course?.title ?? "General"} · {c._count.topics} {c._count.topics === 1 ? "tema" : "temas"}
                </span>
                {deleteError[c.id] && <p style={{ fontSize: 11.5, color: "var(--danger)", marginTop: 4 }}>{deleteError[c.id]}</p>}
              </div>
              <button onClick={() => toggleVisible(c)} title={c.isVisible ? "Ocultar" : "Mostrar"}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", display: "flex" }}>
                {c.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
              <button onClick={() => openEdit(c)} title="Editar"
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", display: "flex" }}>
                <Pencil size={15} />
              </button>
              <button onClick={() => deleteCategory(c.id)} title="Eliminar"
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", display: "flex" }}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ModeracionTab() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState("")
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loadingPosts, setLoadingPosts] = useState(false)

  useEffect(() => {
    fetch("/api/admin/comunidad/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => {})
  }, [])

  const loadTopics = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (categoryFilter) params.set("categoryId", categoryFilter)
    if (search.trim()) params.set("search", search.trim())
    fetch(`/api/admin/comunidad/topics?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setTopics(d.topics ?? []))
      .catch(() => setTopics([]))
      .finally(() => setLoading(false))
  }, [categoryFilter, search])

  useEffect(() => {
    const t = setTimeout(loadTopics, 250)
    return () => clearTimeout(t)
  }, [loadTopics])

  async function togglePin(t: Topic) {
    await fetch(`/api/admin/comunidad/topics/${t.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPinned: !t.isPinned }),
    }).catch(() => {})
    loadTopics()
  }

  async function toggleTopicVisible(t: Topic) {
    await fetch(`/api/admin/comunidad/topics/${t.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible: !t.isVisible }),
    }).catch(() => {})
    loadTopics()
  }

  async function deleteTopic(id: string) {
    await fetch(`/api/admin/comunidad/topics/${id}`, { method: "DELETE" }).catch(() => {})
    if (expanded === id) setExpanded(null)
    loadTopics()
  }

  async function loadPosts(id: string) {
    setLoadingPosts(true)
    try {
      const res = await fetch(`/api/admin/comunidad/topics/${id}`)
      const data = await res.json()
      setPosts(data.posts ?? [])
    } catch {
      setPosts([])
    } finally {
      setLoadingPosts(false)
    }
  }

  function toggleExpand(id: string) {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    loadPosts(id)
  }

  async function togglePostVisible(post: Post) {
    await fetch(`/api/admin/comunidad/posts/${post.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible: !post.isVisible }),
    }).catch(() => {})
    if (expanded) loadPosts(expanded)
  }

  function PostRow({ post, nested }: { post: Post; nested?: boolean }) {
    return (
      <div style={{ padding: "10px 0", borderBottom: "1px solid var(--surface-2)", marginLeft: nested ? 28 : 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)" }}>{post.user.name}</span>
              {!post.isVisible && <span style={{ fontSize: 9.5, color: "var(--text-dim)", background: "var(--surface-2)", borderRadius: 5, padding: "1px 6px" }}>Oculto</span>}
            </div>
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5, marginTop: 2, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{post.body}</p>
          </div>
          <button onClick={() => togglePostVisible(post)} title={post.isVisible ? "Ocultar" : "Mostrar"}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", display: "flex", flexShrink: 0 }}>
            {post.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        </div>
        {!nested && post.replies?.map((r) => <PostRow key={r.id} post={r} nested />)}
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por título…" style={{ ...inputStyle, paddingLeft: 34 }} />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ ...inputStyle, width: 220, cursor: "pointer" }}>
          <option value="">Todas las categorías</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-dim)", padding: "40px 0" }}>
          <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Cargando temas…
        </div>
      ) : topics.length === 0 ? (
        <div style={{ ...card, padding: "48px 24px", textAlign: "center", color: "var(--text-dim)", fontSize: 14 }}>
          Sin temas para mostrar.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {topics.map((t) => (
            <div key={t.id} style={card}>
              <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={() => toggleExpand(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", display: "flex", flexShrink: 0 }}>
                  {expanded === t.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <p style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</p>
                    {!t.isVisible && <span style={{ fontSize: 10, color: "var(--text-dim)", background: "var(--surface-2)", borderRadius: 5, padding: "2px 7px", flexShrink: 0 }}>Oculto</span>}
                  </div>
                  <span style={{ fontSize: 11.5, color: "var(--text-dim)" }}>
                    {t.category.name} · {t.user.name} · {t._count.posts} respuestas
                  </span>
                </div>
                <button onClick={() => togglePin(t)} title={t.isPinned ? "Desfijar" : "Fijar"}
                  style={{ background: "none", border: "none", cursor: "pointer", color: t.isPinned ? "var(--gold)" : "var(--text-dim)", display: "flex" }}>
                  {t.isPinned ? <PinOff size={15} /> : <Pin size={15} />}
                </button>
                <button onClick={() => toggleTopicVisible(t)} title={t.isVisible ? "Ocultar" : "Mostrar"}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", display: "flex" }}>
                  {t.isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button onClick={() => deleteTopic(t.id)} title="Eliminar tema"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", display: "flex" }}>
                  <Trash2 size={15} />
                </button>
              </div>
              {expanded === t.id && (
                <div style={{ padding: "0 18px 14px", borderTop: "1px solid var(--surface-2)" }}>
                  {loadingPosts ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-dim)", padding: "14px 0", fontSize: 12.5 }}>
                      <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Cargando publicaciones…
                    </div>
                  ) : (
                    posts.map((p) => <PostRow key={p.id} post={p} />)
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
