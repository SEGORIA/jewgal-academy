"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Heart, MessageCircle, Pin, Loader2, ChevronLeft, Pencil, EyeOff, Send } from "lucide-react"

type Post = {
  id: string
  parentId: string | null
  body: string
  createdAt: string
  updatedAt: string
  user: { id: string; name: string; image: string | null }
  likes: { id: string }[]
  _count: { likes: number }
  replies?: Post[]
}

type Topic = {
  id: string
  title: string
  isPinned: boolean
  createdAt: string
  category: { id: string; name: string }
  user: { name: string; image: string | null }
}

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid rgba(165,141,102,.14)",
  borderRadius: 14,
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "var(--bg)", border: "1px solid rgba(165,141,102,.2)",
  borderRadius: 10, padding: "9px 13px", fontSize: 13.5, color: "var(--text)",
  outline: "none", fontFamily: "inherit", boxSizing: "border-box", resize: "vertical",
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

function initials(name: string) {
  return (name || "?").charAt(0).toUpperCase()
}

export default function TopicDetailPage() {
  const { categoryId, topicId } = useParams<{ categoryId: string; topicId: string }>()
  const { data: session } = useSession()
  const myId = session?.user?.id

  const [topic, setTopic] = useState<Topic | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [composer, setComposer] = useState("")
  const [sending, setSending] = useState(false)
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyBody, setReplyBody] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState("")

  function load() {
    fetch(`/api/me/comunidad/topics/${topicId}`)
      .then((r) => r.json())
      .then((d) => { setTopic(d.topic ?? null); setPosts(d.posts ?? []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [topicId])

  async function submitPost(body: string, parentId: string | null) {
    const res = await fetch(`/api/me/comunidad/topics/${topicId}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, ...(parentId ? { parentId } : {}) }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? "No se pudo publicar")
      return false
    }
    return true
  }

  async function handleSendRoot() {
    if (!composer.trim() || sending) return
    setSending(true)
    setError(null)
    const ok = await submitPost(composer.trim(), null)
    setSending(false)
    if (ok) { setComposer(""); load() }
  }

  async function handleSendReply(postId: string) {
    if (!replyBody.trim() || sending) return
    setSending(true)
    setError(null)
    const ok = await submitPost(replyBody.trim(), postId)
    setSending(false)
    if (ok) { setReplyBody(""); setReplyTo(null); load() }
  }

  async function toggleLike(postId: string) {
    await fetch(`/api/me/comunidad/posts/${postId}/like`, { method: "POST" }).catch(() => {})
    load()
  }

  async function saveEdit(postId: string) {
    if (!editBody.trim()) return
    await fetch(`/api/me/comunidad/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: editBody.trim() }),
    }).catch(() => {})
    setEditingId(null)
    load()
  }

  async function hidePost(postId: string) {
    await fetch(`/api/me/comunidad/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible: false }),
    }).catch(() => {})
    load()
  }

  function PostRow({ post, nested }: { post: Post; nested?: boolean }) {
    const liked = post.likes.length > 0
    const isOwn = post.user.id === myId
    const isEditing = editingId === post.id
    const canHide = isOwn && (!post.replies || post.replies.length === 0)

    return (
      <div style={{ display: "flex", gap: 12, marginLeft: nested ? 40 : 0 }}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%", flexShrink: 0, overflow: "hidden",
          background: "linear-gradient(135deg,#A76D61 0%,#C49F72 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, color: "#fff",
        }}>
          {post.user.image
            ? <img src={post.user.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : initials(post.user.name)
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text)" }}>{post.user.name}</span>
            <span style={{ fontSize: 11.5, color: "var(--text-dim)" }}>{timeAgo(post.createdAt)}</span>
          </div>

          {isEditing ? (
            <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 8 }}>
              <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} rows={3} maxLength={8000} style={inputStyle} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => saveEdit(post.id)} style={{ fontSize: 12, fontWeight: 600, color: "var(--gold)", background: "none", border: "none", cursor: "pointer" }}>Guardar</button>
                <button onClick={() => setEditingId(null)} style={{ fontSize: 12, color: "var(--text-dim)", background: "none", border: "none", cursor: "pointer" }}>Cancelar</button>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.6, marginTop: 4, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {post.body}
            </p>
          )}

          {!isEditing && (
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 6 }}>
              <button
                onClick={() => toggleLike(post.id)}
                style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: liked ? "var(--danger, #ef4444)" : "var(--text-dim)", fontSize: 12 }}
              >
                <Heart size={13} fill={liked ? "currentColor" : "none"} /> {post._count.likes > 0 ? post._count.likes : ""}
              </button>
              {!nested && (
                <button
                  onClick={() => { setReplyTo(replyTo === post.id ? null : post.id); setReplyBody("") }}
                  style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", fontSize: 12 }}
                >
                  <MessageCircle size={13} /> Responder
                </button>
              )}
              {isOwn && (
                <button
                  onClick={() => { setEditingId(post.id); setEditBody(post.body) }}
                  style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", fontSize: 12 }}
                >
                  <Pencil size={12} /> Editar
                </button>
              )}
              {canHide && (
                <button
                  onClick={() => hidePost(post.id)}
                  style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", fontSize: 12 }}
                >
                  <EyeOff size={12} /> Ocultar
                </button>
              )}
            </div>
          )}

          {replyTo === post.id && (
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              <textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Escribí tu respuesta…"
                rows={2}
                maxLength={8000}
                style={inputStyle}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => handleSendReply(post.id)}
                  disabled={!replyBody.trim() || sending}
                  style={{ fontSize: 12, fontWeight: 600, color: "var(--gold)", background: "none", border: "none", cursor: !replyBody.trim() || sending ? "not-allowed" : "pointer" }}
                >
                  Responder
                </button>
                <button onClick={() => setReplyTo(null)} style={{ fontSize: 12, color: "var(--text-dim)", background: "none", border: "none", cursor: "pointer" }}>Cancelar</button>
              </div>
            </div>
          )}

          {!nested && post.replies && post.replies.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
              {post.replies.map((r) => <PostRow key={r.id} post={r} nested />)}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-dim)", padding: "40px 0" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Cargando tema…
      </div>
    )
  }

  if (!topic) {
    return (
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <Link href="/aula/comunidad" style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--text-dim)", fontSize: 12.5, textDecoration: "none", marginBottom: 18 }}>
          <ChevronLeft size={14} /> Comunidad
        </Link>
        <div style={{ ...card, padding: "40px 32px", textAlign: "center", color: "var(--text-dim)" }}>
          Tema no encontrado.
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <Link href={`/aula/comunidad/${categoryId}`} style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--text-dim)", fontSize: 12.5, textDecoration: "none", marginBottom: 18 }}>
        <ChevronLeft size={14} /> {topic.category.name}
      </Link>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          {topic.isPinned && <Pin size={14} style={{ color: "var(--gold)" }} />}
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 26, color: "var(--text)" }}>{topic.title}</h1>
        </div>
        <span style={{ fontSize: 12.5, color: "var(--text-dim)" }}>
          Abierto por {topic.user.name} · {timeAgo(topic.createdAt)}
        </span>
      </div>

      <div style={{ ...card, padding: "22px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
        {posts.map((p) => <PostRow key={p.id} post={p} />)}
      </div>

      {error && (
        <div style={{
          margin: "14px 0 0", padding: "10px 14px", borderRadius: 8,
          background: "rgba(239,68,68,.06)", border: "1px solid rgba(239,68,68,.15)",
          color: "var(--danger, #ef4444)", fontSize: 13,
        }}>
          {error}
        </div>
      )}

      <div style={{ ...card, padding: "16px 18px", marginTop: 16, display: "flex", gap: 10, alignItems: "flex-end" }}>
        <textarea
          value={composer}
          onChange={(e) => setComposer(e.target.value)}
          placeholder="Agregá una respuesta al tema…"
          rows={2}
          maxLength={8000}
          style={{ ...inputStyle, flex: 1 }}
        />
        <button
          onClick={handleSendRoot}
          disabled={!composer.trim() || sending}
          style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0, border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: !composer.trim() || sending ? "not-allowed" : "pointer",
            background: !composer.trim() || sending ? "rgba(165,141,102,.1)" : "linear-gradient(135deg,#A76D61 0%,#C49F72 100%)",
            color: !composer.trim() || sending ? "var(--text-dim)" : "#fff",
          }}
          aria-label="Enviar"
        >
          {sending ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={16} />}
        </button>
      </div>
    </div>
  )
}
