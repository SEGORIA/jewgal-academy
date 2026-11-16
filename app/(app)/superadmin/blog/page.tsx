"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ArrowLeft, CalendarClock, ExternalLink, Eye, EyeOff, FileText, GripVertical,
  Languages, Pencil, Plus, Save, Search, Tag, Trash2, X,
} from "lucide-react"
import ImageUpload from "@/components/admin/ImageUpload"
import MarkdownEditor from "@/components/admin/MarkdownEditor"
import {
  ConfirmDialog, EmptyState, Field, GhostButton, Modal, PageHeader, PrimaryButton, Spinner, ToastProvider,
  api, card, inputStyle, useToast,
} from "@/components/admin/ui"
import { DEFAULT_BLOG_CATEGORIES, DEFAULT_POST_AUTHOR, MAX_POST_TAGS, normalizeTags, slugifyPost } from "@/lib/blog"

type Post = {
  id: string; slug: string; title: string; category: string; excerpt: string; content: string
  isPublished: boolean; publishedAt: string | null; createdAt: string; updatedAt: string
  coverUrl: string | null; author: string | null; tags: string[]
  titleEn: string | null; excerptEn: string | null; contentEn: string | null
  seoTitle: string | null; seoDescription: string | null
}

type Form = {
  title: string; slug: string; slugTouched: boolean; category: string; excerpt: string; content: string
  coverUrl: string; author: string; tags: string[]
  titleEn: string; excerptEn: string; contentEn: string
  seoTitle: string; seoDescription: string
  isPublished: boolean; publishedAt: string // "YYYY-MM-DDTHH:mm" en hora local, vacío = ahora
}

type Status = "draft" | "scheduled" | "published"

function statusOf(p: Pick<Post, "isPublished" | "publishedAt">): Status {
  if (!p.isPublished) return "draft"
  if (p.publishedAt && new Date(p.publishedAt).getTime() > Date.now()) return "scheduled"
  return "published"
}

const STATUS_META: Record<Status, { label: string; color: string }> = {
  draft: { label: "Borrador", color: "var(--text-muted)" },
  scheduled: { label: "Programado", color: "var(--gold-ink)" },
  published: { label: "Publicado", color: "var(--success)" },
}

const pad = (n: number) => String(n).padStart(2, "0")
function toLocalInput(iso: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
const fmtDateTime = (d: Date | string) => new Date(d).toLocaleString("es-ES", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })

const emptyForm = (category: string): Form => ({
  title: "", slug: "", slugTouched: false, category, excerpt: "", content: "", coverUrl: "", author: "", tags: [],
  titleEn: "", excerptEn: "", contentEn: "", seoTitle: "", seoDescription: "", isPublished: false, publishedAt: "",
})

const formFromPost = (p: Post): Form => ({
  title: p.title, slug: p.slug, slugTouched: true, category: p.category, excerpt: p.excerpt, content: p.content,
  coverUrl: p.coverUrl ?? "", author: p.author ?? "", tags: p.tags ?? [],
  titleEn: p.titleEn ?? "", excerptEn: p.excerptEn ?? "", contentEn: p.contentEn ?? "",
  seoTitle: p.seoTitle ?? "", seoDescription: p.seoDescription ?? "",
  isPublished: p.isPublished, publishedAt: toLocalInput(p.publishedAt),
})

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color, border: `1px solid color-mix(in srgb, ${color} 40%, transparent)`, borderRadius: 14, padding: "2px 10px", whiteSpace: "nowrap" }}>
      {children}
    </span>
  )
}

/* ───────────────────────────── Pantalla principal ───────────────────────────── */

function Inner() {
  const toast = useToast()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>(DEFAULT_BLOG_CATEGORIES)
  const [showCats, setShowCats] = useState(false)
  const [editor, setEditor] = useState<{ post: Post | null } | null>(null)
  const [filter, setFilter] = useState<"all" | Status>("all")
  const [query, setQuery] = useState("")
  const [toDelete, setToDelete] = useState<Post | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const d = await api<{ posts: Post[] }>("/api/admin/blog", { cache: "no-store" })
      setPosts(d.posts ?? [])
    } catch (e) { toast("error", (e as Error).message) }
    finally { setLoading(false) }
  }, [toast])

  const loadCategories = useCallback(async () => {
    try {
      const d = await api<{ categories?: string[] }>("/api/admin/blog-categories")
      if (Array.isArray(d.categories) && d.categories.length) setCategories(d.categories)
    } catch { /* se queda con las de siempre */ }
  }, [])

  useEffect(() => { load(); loadCategories() }, [load, loadCategories])

  const counts = useMemo(() => {
    const c = { all: posts.length, draft: 0, scheduled: 0, published: 0 }
    for (const p of posts) c[statusOf(p)]++
    return c
  }, [posts])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts.filter((p) => (filter === "all" || statusOf(p) === filter) && (!q || `${p.title} ${p.excerpt} ${p.category} ${(p.tags ?? []).join(" ")}`.toLowerCase().includes(q)))
  }, [posts, filter, query])

  async function togglePublish(p: Post) {
    try {
      await api(`/api/admin/blog/${p.id}`, { method: "PATCH", json: { isPublished: !p.isPublished } })
      toast("ok", p.isPublished ? "Pasó a borrador" : "Entrada publicada")
      await load()
    } catch (e) { toast("error", (e as Error).message) }
  }

  async function remove() {
    if (!toDelete) return
    setBusy(true)
    try {
      await api(`/api/admin/blog/${toDelete.id}`, { method: "DELETE" })
      toast("ok", "Entrada eliminada")
      setToDelete(null)
      await load()
    } catch (e) { toast("error", (e as Error).message) }
    finally { setBusy(false) }
  }

  if (editor) {
    return (
      <PostEditor
        post={editor.post}
        categories={categories}
        onClose={() => setEditor(null)}
        onSaved={async (saved) => { await load(); setEditor({ post: saved }) }}
      />
    )
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <PageHeader
        eyebrow="Admin"
        title="Blog"
        subtitle={`${counts.all} entradas · ${counts.published} publicadas${counts.scheduled ? ` · ${counts.scheduled} programadas` : ""}${counts.draft ? ` · ${counts.draft} borradores` : ""}`}
        actions={
          <>
            <GhostButton icon={<Tag size={15} />} onClick={() => setShowCats(true)}>Categorías</GhostButton>
            <PrimaryButton icon={<Plus size={16} />} onClick={() => setEditor({ post: null })}>Nueva entrada</PrimaryButton>
          </>
        }
      />

      {showCats && <CategoryManager categories={categories} onClose={() => setShowCats(false)} onSaved={(cats) => { setCategories(cats); loadCategories() }} />}
      {toDelete && (
        <ConfirmDialog
          title="Eliminar entrada"
          danger busy={busy} confirmLabel="Eliminar"
          text={<>¿Eliminar <strong>{toDelete.title}</strong>? Dejará de verse en el sitio. Podés recuperarla desde Historial.</>}
          onConfirm={remove} onCancel={() => setToDelete(null)}
        />
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 18 }}>
        {(["all", "published", "scheduled", "draft"] as const).map((f) => (
          <button
            key={f} type="button" onClick={() => setFilter(f)} aria-pressed={filter === f}
            style={{
              padding: "7px 16px", borderRadius: 20, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
              border: `1px solid ${filter === f ? "var(--gold-ink)" : "var(--border)"}`,
              background: filter === f ? "color-mix(in srgb, var(--gold-ink) 14%, transparent)" : "transparent",
              color: filter === f ? "var(--gold-ink)" : "var(--text-muted)",
            }}
          >
            {f === "all" ? "Todas" : f === "published" ? "Publicadas" : f === "scheduled" ? "Programadas" : "Borradores"} · {counts[f]}
          </button>
        ))}
        <div style={{ position: "relative", marginLeft: "auto", minWidth: 220, flex: "0 1 280px" }}>
          <Search size={15} aria-hidden style={{ position: "absolute", left: 12, top: 12, color: "var(--text-faint)" }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar entradas…" aria-label="Buscar entradas" style={{ ...inputStyle, paddingLeft: 36 }} />
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<FileText size={34} />} title="Todavía no hay entradas"
          text="Escribí tu primer artículo: podés agregarle portada, etiquetas, versión en inglés y programarlo para que se publique solo."
          action={<PrimaryButton icon={<Plus size={16} />} onClick={() => setEditor({ post: null })}>Nueva entrada</PrimaryButton>}
        />
      ) : visible.length === 0 ? (
        <EmptyState icon={<Search size={30} />} title="Sin resultados" text="Ninguna entrada coincide con ese filtro o búsqueda." />
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {visible.map((p) => {
            const st = statusOf(p)
            const live = st === "published"
            return (
              <div key={p.id} style={{ ...card, padding: "14px 16px", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ width: 92, height: 62, borderRadius: 8, overflow: "hidden", background: "var(--surface-2)", border: "1px solid var(--border)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {p.coverUrl
                    // eslint-disable-next-line @next/next/no-img-element -- miniatura de una URL externa cualquiera
                    ? <img src={p.coverUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <FileText size={20} style={{ color: "var(--text-faint)" }} aria-hidden />}
                </div>
                <button type="button" onClick={() => setEditor({ post: p })} style={{ flex: "1 1 260px", minWidth: 0, background: "none", border: "none", textAlign: "left", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                    <Badge color="var(--gold-ink)">{p.category}</Badge>
                    <Badge color={STATUS_META[st].color}>{STATUS_META[st].label}</Badge>
                    {p.titleEn && <Badge color="var(--text-muted)">EN</Badge>}
                    <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
                      {st === "scheduled" ? `Sale el ${fmtDateTime(p.publishedAt!)}` : fmtDateTime(p.publishedAt ?? p.createdAt)}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 3, overflowWrap: "anywhere" }}>{p.title}</h3>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.excerpt}</p>
                </button>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  {live && (
                    <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" title="Ver en el sitio" aria-label="Ver en el sitio" style={iconBtn("var(--text-muted)")}>
                      <ExternalLink size={14} />
                    </a>
                  )}
                  <button type="button" onClick={() => togglePublish(p)} title={p.isPublished ? "Pasar a borrador" : "Publicar ahora"} aria-label={p.isPublished ? "Pasar a borrador" : "Publicar ahora"} style={iconBtn(p.isPublished ? "var(--success)" : "var(--text-muted)")}>
                    {p.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button type="button" onClick={() => setEditor({ post: p })} title="Editar" aria-label="Editar" style={iconBtn("var(--text-muted)")}><Pencil size={14} /></button>
                  <button type="button" onClick={() => setToDelete(p)} title="Eliminar" aria-label="Eliminar" style={iconBtn("var(--danger)")}><Trash2 size={14} /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const iconBtn = (color: string): React.CSSProperties => ({
  display: "inline-flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, background: "none",
  border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", color, textDecoration: "none",
})

/* ───────────────────────────── Editor de una entrada ───────────────────────────── */

const RE_SKIP_TRANSLATE = /^\s*!\[[^\]]*\]\([^)\s]+\)\s*$|^\s*(?:[-*_]\s*){3,}$|^\s*```/

function PostEditor({ post, categories, onClose, onSaved }: {
  post: Post | null; categories: string[]; onClose: () => void; onSaved: (p: Post) => void | Promise<void>
}) {
  const toast = useToast()
  const isNew = !post
  const initial = useMemo(() => (post ? formFromPost(post) : emptyForm(categories[0] ?? "")), [post, categories])
  const [form, setForm] = useState<Form>(initial)
  const [lang, setLang] = useState<"es" | "en">("es")
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [tagText, setTagText] = useState("")
  const [confirmExit, setConfirmExit] = useState(false)
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(initial))
  const [now] = useState(() => Date.now()) // momento en que se abrió el editor: sirve para saber si la fecha elegida es futura

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }))
  const dirty = JSON.stringify(form) !== savedSnapshot

  useEffect(() => {
    if (!dirty) return
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = "" }
    window.addEventListener("beforeunload", h)
    return () => window.removeEventListener("beforeunload", h)
  }, [dirty])

  const contentKey = lang === "es" ? "content" : "contentEn"
  const titleKey = lang === "es" ? "title" : "titleEn"
  const excerptKey = lang === "es" ? "excerpt" : "excerptEn"
  const content = form[contentKey]

  /* — Etiquetas — */
  function addTags(raw: string) {
    const next = normalizeTags([...form.tags, ...raw.split(",")])
    set("tags", next)
    setTagText("")
  }

  /* — Traducción — */
  async function translateFromSpanish() {
    if (!form.title.trim() && !form.excerpt.trim() && !form.content.trim()) { toast("error", "Primero escribí el artículo en español."); return }
    setTranslating(true)
    try {
      const translate = async (texts: string[]) => {
        const out: string[] = []
        for (let i = 0; i < texts.length; i += 40) {
          const d = await api<{ translations: string[] }>("/api/admin/translate", { method: "POST", json: { texts: texts.slice(i, i + 40), target: "EN" } })
          out.push(...d.translations)
        }
        return out
      }
      const topTexts: string[] = []
      const topKeys: ("titleEn" | "excerptEn")[] = []
      if (form.title.trim()) { topTexts.push(form.title); topKeys.push("titleEn") }
      if (form.excerpt.trim()) { topTexts.push(form.excerpt); topKeys.push("excerptEn") }
      const top = topTexts.length ? await translate(topTexts) : []

      const blocks = form.content.split(/\n{2,}/)
      const idx = blocks.map((b, i) => (b.trim() && !RE_SKIP_TRANSLATE.test(b) && /\p{L}/u.test(b) ? i : -1)).filter((i) => i >= 0)
      const done = idx.length ? await translate(idx.map((i) => blocks[i])) : []
      const merged = [...blocks]
      idx.forEach((bi, k) => { merged[bi] = done[k] ?? blocks[bi] })

      const patch: Partial<Form> = {}
      topKeys.forEach((k, i) => { patch[k] = top[i] ?? "" })
      if (form.content.trim()) patch.contentEn = merged.join("\n\n")
      setForm((f) => ({ ...f, ...patch }))
      toast("ok", "Borrador en inglés listo. Revisalo antes de publicar.")
    } catch (e) { toast("error", (e as Error).message) }
    finally { setTranslating(false) }
  }

  /* — Guardar — */
  const scheduledAt = form.publishedAt ? new Date(form.publishedAt) : null
  const willSchedule = form.isPublished && !!scheduledAt && scheduledAt.getTime() > now
  const wasLive = post ? post.isPublished : false
  const saveLabel = !form.isPublished ? (isNew ? "Guardar borrador" : "Guardar cambios") : willSchedule ? "Programar" : wasLive ? "Guardar cambios" : "Publicar"

  async function save() {
    if (!form.title.trim()) { toast("error", "Falta el título."); return }
    if (!form.excerpt.trim()) { toast("error", "Falta el resumen."); return }
    if (!form.content.trim()) { toast("error", "Falta el contenido."); return }
    if (!form.category) { toast("error", "Elegí una categoría."); return }
    if (form.isPublished && form.publishedAt && Number.isNaN(new Date(form.publishedAt).getTime())) { toast("error", "La fecha de publicación no es válida."); return }

    const body: Record<string, unknown> = {
      title: form.title, category: form.category, excerpt: form.excerpt, content: form.content,
      isPublished: form.isPublished,
      coverUrl: form.coverUrl, author: form.author, tags: form.tags,
      titleEn: form.titleEn, excerptEn: form.excerptEn, contentEn: form.contentEn,
      seoTitle: form.seoTitle, seoDescription: form.seoDescription,
    }
    if (form.isPublished && form.publishedAt) body.publishedAt = new Date(form.publishedAt).toISOString()
    const slug = slugifyPost(form.slug)
    if (isNew) { if (slug) body.slug = slug }
    else if (slug && slug !== post!.slug) body.slug = slug

    setSaving(true)
    try {
      const res = await api<{ post: Post }>(isNew ? "/api/admin/blog" : `/api/admin/blog/${post!.id}`, { method: isNew ? "POST" : "PATCH", json: body })
      toast("ok", willSchedule ? "Entrada programada" : form.isPublished ? (wasLive ? "Cambios guardados" : "Entrada publicada") : "Borrador guardado")
      setSavedSnapshot(JSON.stringify(form))
      await onSaved(res.post)
    } catch (e) { toast("error", (e as Error).message) }
    finally { setSaving(false) }
  }

  function back() { if (dirty) setConfirmExit(true); else onClose() }

  const liveUrl = post && statusOf(post) === "published" ? `/blog/${post.slug}` : null
  const serpTitle = form.seoTitle.trim() || form.title.trim() || "Título del artículo"
  const serpDesc = form.seoDescription.trim() || form.excerpt.trim() || "Descripción del artículo"
  const slugValue = form.slugTouched ? form.slug : slugifyPost(form.title)

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto" }}>
      {confirmExit && (
        <ConfirmDialog
          title="Hay cambios sin guardar" confirmLabel="Salir sin guardar" danger
          text="Si salís ahora, se pierden los cambios de esta entrada."
          onConfirm={onClose} onCancel={() => setConfirmExit(false)}
        />
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 22 }}>
        <GhostButton icon={<ArrowLeft size={15} />} onClick={back}>Volver</GhostButton>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 26, color: "var(--text)", flex: "1 1 200px", minWidth: 0 }}>
          {isNew ? "Nueva entrada" : "Editar entrada"}
        </h1>
        {dirty && <span style={{ fontSize: 12.5, color: "var(--gold-ink)" }}>● Cambios sin guardar</span>}
        {liveUrl && (
          <a href={liveUrl} target="_blank" rel="noopener noreferrer" style={{ ...iconBtn("var(--text-strong)"), width: "auto", padding: "0 14px", gap: 7, fontSize: 13, height: 38 }}>
            <ExternalLink size={14} /> Ver en el sitio
          </a>
        )}
        <PrimaryButton icon={<Save size={15} />} loading={saving} onClick={save}>{saveLabel}</PrimaryButton>
      </div>

      <div className="admin-split-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: 20, alignItems: "start" }}>
        {/* ── Texto ── */}
        <div style={{ ...card, padding: "22px 24px", display: "grid", gap: 16, minWidth: 0 }}>
          <div role="tablist" aria-label="Idioma del texto" style={{ display: "flex", gap: 8 }}>
            {(["es", "en"] as const).map((l) => (
              <button
                key={l} role="tab" type="button" aria-selected={lang === l} onClick={() => setLang(l)}
                style={{
                  padding: "7px 18px", borderRadius: 20, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                  border: `1px solid ${lang === l ? "var(--gold-ink)" : "var(--border)"}`,
                  background: lang === l ? "color-mix(in srgb, var(--gold-ink) 14%, transparent)" : "transparent",
                  color: lang === l ? "var(--gold-ink)" : "var(--text-muted)",
                }}
              >
                {l === "es" ? "Español" : `English${form.titleEn || form.contentEn ? " ✓" : ""}`}
              </button>
            ))}
          </div>

          {lang === "en" && (
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px" }}>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, flex: "1 1 260px" }}>
                Versión para quienes visitan el sitio en inglés. Lo que dejes vacío se muestra en español.
              </p>
              <GhostButton icon={<Languages size={14} />} loading={translating} onClick={translateFromSpanish}>Traducir desde español</GhostButton>
            </div>
          )}

          <Field label={lang === "es" ? "Título" : "Title (English)"} id="post-title">
            <input
              id="post-title" value={form[titleKey]} maxLength={200} style={{ ...inputStyle, fontSize: 17 }}
              placeholder={lang === "es" ? "Título del artículo" : form.title || "Article title"}
              onChange={(e) => {
                const v = e.target.value
                setForm((f) => ({ ...f, [titleKey]: v, ...(lang === "es" && !f.slugTouched ? { slug: slugifyPost(v) } : {}) }))
              }}
            />
          </Field>

          <Field label={lang === "es" ? "Resumen" : "Summary (English)"} hint="Aparece en el listado y debajo del título. Ideal: 1 o 2 frases." id="post-excerpt">
            <textarea id="post-excerpt" value={form[excerptKey]} rows={3} maxLength={600} onChange={(e) => set(excerptKey, e.target.value)} placeholder={lang === "es" ? "Breve descripción del artículo…" : form.excerpt} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
          </Field>

          <MarkdownEditor
            value={content} onChange={(v) => set(contentKey, v)}
            label={lang === "es" ? "Contenido" : "Content (English)"}
            ariaLabel={lang === "es" ? "Contenido del artículo" : "Article content (English)"}
            placeholder={lang === "es" ? "Escribí el artículo acá. Separá los párrafos con una línea en blanco." : form.content ? "Leave empty to show the Spanish text." : ""}
          />
        </div>

        {/* ── Barra lateral ── */}
        <div style={{ display: "grid", gap: 16, minWidth: 0 }}>
          <div style={{ ...card, padding: "18px 20px", display: "grid", gap: 14 }}>
            <h2 style={sideTitle}><CalendarClock size={15} /> Publicación</h2>
            <Field label="Estado" id="post-status">
              <select id="post-status" value={form.isPublished ? "published" : "draft"} onChange={(e) => set("isPublished", e.target.value === "published")} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="draft">Borrador (no se ve en el sitio)</option>
                <option value="published">Publicado</option>
              </select>
            </Field>
            {form.isPublished && (
              <Field
                label="Fecha y hora" id="post-date"
                hint={willSchedule ? `Programada: se publicará sola el ${fmtDateTime(scheduledAt!)}.` : form.publishedAt ? `Visible desde el ${fmtDateTime(scheduledAt!)}.` : "Vacío = se publica al guardar. Elegí una fecha futura para programarla."}
              >
                <input id="post-date" type="datetime-local" value={form.publishedAt} onChange={(e) => set("publishedAt", e.target.value)} style={inputStyle} />
              </Field>
            )}
          </div>

          <div style={{ ...card, padding: "18px 20px" }}>
            <ImageUpload label="Portada" value={form.coverUrl} onChange={(u) => set("coverUrl", u)} folder="jewgal-blog" aspect="16/9" hint="Se ve en el listado, en el artículo y al compartirlo en redes. Ideal: 1600×900." />
          </div>

          <div style={{ ...card, padding: "18px 20px", display: "grid", gap: 14 }}>
            <h2 style={sideTitle}><Tag size={15} /> Organización</h2>
            <Field label="Categoría" id="post-cat">
              <select id="post-cat" value={form.category} onChange={(e) => set("category", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                {!categories.includes(form.category) && form.category && <option value={form.category}>{form.category}</option>}
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Etiquetas" hint={`Escribí y apretá Enter o coma. Hasta ${MAX_POST_TAGS}.`} id="post-tags">
              {form.tags.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                  {form.tags.map((t) => (
                    <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12.5, color: "var(--text-strong)", border: "1px solid var(--border)", borderRadius: 14, padding: "3px 6px 3px 11px" }}>
                      #{t}
                      <button type="button" onClick={() => set("tags", form.tags.filter((x) => x !== t))} aria-label={`Quitar la etiqueta ${t}`} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: 2 }}><X size={12} /></button>
                    </span>
                  ))}
                </div>
              )}
              <input
                id="post-tags" value={tagText} disabled={form.tags.length >= MAX_POST_TAGS} placeholder="mindfulness, liderazgo…" style={inputStyle}
                onChange={(e) => { const v = e.target.value; if (v.includes(",")) addTags(v); else setTagText(v) }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (tagText.trim()) addTags(tagText) } else if (e.key === "Backspace" && !tagText && form.tags.length) set("tags", form.tags.slice(0, -1)) }}
                onBlur={() => { if (tagText.trim()) addTags(tagText) }}
              />
            </Field>
            <Field label="Autoría" hint="Vacío = Devora Benchimol." id="post-author">
              <input id="post-author" value={form.author} maxLength={80} onChange={(e) => set("author", e.target.value)} placeholder={DEFAULT_POST_AUTHOR} style={inputStyle} />
            </Field>
          </div>

          <div style={{ ...card, padding: "18px 20px", display: "grid", gap: 14 }}>
            <h2 style={sideTitle}><Search size={15} /> Buscadores (SEO)</h2>
            <Field label="Enlace del artículo" id="post-slug" hint={!isNew && post?.isPublished ? "Cambiarlo rompe los enlaces que ya compartiste." : "Se arma solo con el título; podés ajustarlo."}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, color: "var(--text-faint)" }}>/blog/</span>
                <input
                  id="post-slug" value={slugValue} maxLength={120} style={inputStyle}
                  onChange={(e) => setForm((f) => ({ ...f, slug: cleanSlugInput(e.target.value), slugTouched: true }))}
                  onBlur={() => setForm((f) => ({ ...f, slug: slugifyPost(f.slug) }))}
                />
              </div>
            </Field>
            <Field label={`Título para Google (${form.seoTitle.length}/60)`} id="post-seo-title">
              <input id="post-seo-title" value={form.seoTitle} maxLength={120} onChange={(e) => set("seoTitle", e.target.value)} placeholder={form.title || "Igual que el título"} style={inputStyle} />
            </Field>
            <Field label={`Descripción para Google (${form.seoDescription.length}/160)`} id="post-seo-desc" hint="Los campos de buscadores se usan en español; en inglés se toma el título y resumen en inglés.">
              <textarea id="post-seo-desc" value={form.seoDescription} rows={3} maxLength={300} onChange={(e) => set("seoDescription", e.target.value)} placeholder={form.excerpt || "Igual que el resumen"} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
            </Field>
            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px" }} aria-label="Vista previa en Google">
              <p style={{ fontSize: 11.5, color: "var(--text-faint)", marginBottom: 3, overflowWrap: "anywhere" }}>jewgalacademy.com › blog › {slugValue || "…"}</p>
              <p style={{ fontSize: 15, color: "var(--gold-ink)", lineHeight: 1.3, marginBottom: 3 }}>{serpTitle.slice(0, 70)}</p>
              <p style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.45 }}>{serpDesc.slice(0, 160)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Mientras se escribe el enlace: minúsculas, sin tildes y guiones simples (el guion final se limpia al salir del campo). */
const cleanSlugInput = (v: string) =>
  v.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9-]+/g, "-").replace(/-{2,}/g, "-").replace(/^-/, "")

const sideTitle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8, fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold-ink)", fontWeight: 600 }

/* ───────────────────────────── Categorías ───────────────────────────── */

function CategoryManager({ categories, onClose, onSaved }: { categories: string[]; onClose: () => void; onSaved: (cats: string[]) => void }) {
  const toast = useToast()
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
  const rename = (i: number, value: string) => setItems((prev) => prev.map((c, idx) => (idx === i ? value : c)))
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
      const data = await api<{ categories?: string[] }>("/api/admin/blog-categories", { method: "POST", json: { categories: clean } })
      toast("ok", "Categorías guardadas")
      onSaved(data.categories ?? clean)
      onClose()
    } catch (e) { setError((e as Error).message) }
    finally { setSaving(false) }
  }

  return (
    <Modal
      title="Categorías del blog" onClose={onClose} width={520}
      footer={<><GhostButton onClick={onClose}>Cancelar</GhostButton><PrimaryButton icon={<Save size={14} />} loading={saving} onClick={save}>Guardar categorías</PrimaryButton></>}
    >
      <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 16 }}>
        Se usan en el filtro del blog público y al crear entradas. Renombrar acá no cambia la categoría ya asignada a entradas existentes.
      </p>
      {error && <p role="alert" style={{ background: "color-mix(in srgb, var(--danger) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--danger) 40%, transparent)", borderRadius: 8, padding: "9px 13px", marginBottom: 14, color: "var(--danger)", fontSize: 13 }}>{error}</p>}
      <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
        {items.map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <GripVertical size={15} aria-hidden style={{ color: "var(--text-faint)", flexShrink: 0 }} />
            <input value={c} onChange={(e) => rename(i, e.target.value)} aria-label={`Categoría ${i + 1}`} style={{ ...inputStyle, flex: 1, minWidth: 0 }} />
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Subir" style={{ ...iconBtn("var(--text-muted)"), width: 30, height: 30, opacity: i === 0 ? 0.3 : 1 }}>↑</button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Bajar" style={{ ...iconBtn("var(--text-muted)"), width: 30, height: 30, opacity: i === items.length - 1 ? 0.3 : 1 }}>↓</button>
            <button type="button" onClick={() => remove(i)} aria-label="Eliminar" style={{ ...iconBtn("var(--danger)"), width: 30, height: 30 }}><Trash2 size={13} /></button>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={nueva} onChange={(e) => setNueva(e.target.value)} placeholder="Nueva categoría…" aria-label="Nueva categoría" style={{ ...inputStyle, flex: 1 }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add() } }}
        />
        <GhostButton icon={<Plus size={15} />} onClick={add}>Agregar</GhostButton>
      </div>
    </Modal>
  )
}

export default function BlogAdminPage() { return <ToastProvider><Inner /></ToastProvider> }
