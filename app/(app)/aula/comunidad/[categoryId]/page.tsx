"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Pin, MessagesSquare, Loader2, Sparkles, ChevronLeft, Plus, X } from "lucide-react"

type Category = { id: string; name: string; description: string | null; course: { title: string } | null }

type Topic = {
  id: string
  title: string
  isPinned: boolean
  createdAt: string
  updatedAt: string
  user: { name: string; image: string | null }
  _count: { posts: number }
}

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid rgba(165,141,102,.14)",
  borderRadius: 14,
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "var(--bg)", border: "1px solid rgba(165,141,102,.2)",
  borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "var(--text)",
  outline: "none", fontFamily: "inherit", boxSizing: "border-box",
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diffMs / 60_000)
  if (min < 1) return "recién"
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h} h`
  return `hace ${Math.floor(h / 24)} d`
}

export default function CategoryTopicsPage() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const [category, setCategory] = useState<Category | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newBody, setNewBody] = useState("")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/me/comunidad/categories")
      .then((r) => r.json())
      .then((d) => setCategory((d.categories ?? []).find((c: Category) => c.id === categoryId) ?? null))
      .catch(() => {})
  }, [categoryId])

  function loadTopics() {
    setLoading(true)
    fetch(`/api/me/comunidad/categories/${categoryId}/topics`)
      .then((r) => r.json())
      .then((d) => setTopics(d.topics ?? []))
      .catch(() => setTopics([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadTopics() }, [categoryId])

  async function createTopic() {
    if (!newTitle.trim() || !newBody.trim() || creating) return
    setCreating(true)
    setError(null)
    try {
      const res = await fetch(`/api/me/comunidad/categories/${categoryId}/topics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim(), body: newBody.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "No se pudo crear el tema")
        return
      }
      setNewTitle("")
      setNewBody("")
      setShowNew(false)
      loadTopics()
    } catch {
      setError("Hubo un problema al crear el tema. Intentá de nuevo.")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <Link href="/aula/comunidad" style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--text-dim)", fontSize: 12.5, textDecoration: "none", marginBottom: 18 }}>
        <ChevronLeft size={14} /> Comunidad
      </Link>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 30, color: "var(--text)", marginBottom: 6 }}>
            {category?.name ?? "Categoría"}
          </h1>
          {category?.description && (
            <p style={{ color: "var(--text-muted)", fontSize: 14, maxWidth: 520 }}>{category.description}</p>
          )}
        </div>
        <button
          onClick={() => setShowNew((s) => !s)}
          style={{
            display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 10,
            border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#fff", flexShrink: 0,
            background: "linear-gradient(135deg,#A76D61 0%,#C49F72 100%)",
          }}
        >
          {showNew ? <X size={15} /> : <Plus size={15} />}
          {showNew ? "Cancelar" : "Nuevo tema"}
        </button>
      </div>

      {showNew && (
        <div style={{ ...card, padding: "18px 20px", marginBottom: 20, display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Título del tema"
            maxLength={200}
            style={inputStyle}
          />
          <textarea
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            placeholder="Contá qué querés compartir o preguntar…"
            rows={4}
            maxLength={8000}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
          />
          {error && <p style={{ color: "var(--danger, #ef4444)", fontSize: 12.5 }}>{error}</p>}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={createTopic}
              disabled={!newTitle.trim() || !newBody.trim() || creating}
              style={{
                display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 10,
                border: "none", fontSize: 13, fontWeight: 600,
                cursor: !newTitle.trim() || !newBody.trim() || creating ? "not-allowed" : "pointer",
                background: !newTitle.trim() || !newBody.trim() || creating ? "rgba(165,141,102,.15)" : "linear-gradient(135deg,#A76D61 0%,#C49F72 100%)",
                color: !newTitle.trim() || !newBody.trim() || creating ? "var(--text-dim)" : "#fff",
              }}
            >
              {creating ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : "Publicar tema"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-dim)", padding: "40px 0" }}>
          <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Cargando temas…
        </div>
      ) : topics.length === 0 ? (
        <div style={{ ...card, padding: "56px 32px", textAlign: "center" }}>
          <Sparkles size={28} style={{ color: "rgba(165,141,102,.3)", margin: "0 auto 16px", display: "block" }} />
          <p style={{ color: "var(--text-muted)", fontSize: 16, marginBottom: 8, fontFamily: "var(--serif)", fontWeight: 500 }}>
            Sin temas todavía
          </p>
          <p style={{ color: "var(--text-dim)", fontSize: 14, maxWidth: 360, margin: "0 auto" }}>
            Sé el primero en abrir una conversación en esta categoría.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {topics.map((t) => (
            <Link
              key={t.id}
              href={`/aula/comunidad/${categoryId}/${t.id}`}
              style={{ ...card, display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", textDecoration: "none", transition: "border-color .2s, box-shadow .2s" }}
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
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  {t.isPinned && <Pin size={12} style={{ color: "var(--gold)", flexShrink: 0 }} />}
                  <p style={{ fontWeight: 600, color: "var(--text)", fontSize: 14.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.title}
                  </p>
                </div>
                <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
                  {t.user.name} · {timeAgo(t.updatedAt)}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-dim)", flexShrink: 0 }}>
                <MessagesSquare size={13} />
                {t._count.posts}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
