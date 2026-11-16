"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ArrowLeft, Eye, EyeOff, ExternalLink, FilePlus2, Files, Languages, Pencil, Plus, Save, Trash2 } from "lucide-react"
import ImageUpload from "@/components/admin/ImageUpload"
import MarkdownEditor from "@/components/admin/MarkdownEditor"
import { ConfirmDialog, EmptyState, Field, GhostButton, PageHeader, PrimaryButton, Spinner, ToastProvider, api, card, inputStyle, useToast } from "@/components/admin/ui"
import { slugifyPost } from "@/lib/blog"

type PageRow = {
  id: string; slug: string; title: string; titleEn: string | null; content: string; contentEn: string | null
  coverUrl: string | null; seoTitle: string | null; seoDescription: string | null; isPublished: boolean; updatedAt: string
}

type Form = {
  title: string; titleEn: string; content: string; contentEn: string; slug: string; slugTouched: boolean
  coverUrl: string; seoTitle: string; seoDescription: string; isPublished: boolean
}

const EMPTY: Form = { title: "", titleEn: "", content: "", contentEn: "", slug: "", slugTouched: false, coverUrl: "", seoTitle: "", seoDescription: "", isPublished: true }
const fromRow = (p: PageRow): Form => ({
  title: p.title, titleEn: p.titleEn ?? "", content: p.content, contentEn: p.contentEn ?? "", slug: p.slug, slugTouched: true,
  coverUrl: p.coverUrl ?? "", seoTitle: p.seoTitle ?? "", seoDescription: p.seoDescription ?? "", isPublished: p.isPublished,
})
const cleanSlugInput = (v: string) => v.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9-]+/g, "-").replace(/-{2,}/g, "-").replace(/^-/, "")
const fmt = (d: string) => new Date(d).toLocaleString("es-ES", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })

function Inner() {
  const toast = useToast()
  const [pages, setPages] = useState<PageRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<{ id: string | null; form: Form } | null>(null)
  const [saved, setSaved] = useState("")
  const [lang, setLang] = useState<"es" | "en">("es")
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [toDelete, setToDelete] = useState<PageRow | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const d = await api<{ pages: PageRow[] }>("/api/admin/pages", { cache: "no-store" })
      setPages(d.pages)
    } catch (e) { toast("error", (e as Error).message) }
    finally { setLoading(false) }
  }, [toast])
  useEffect(() => { load() }, [load])

  const dirty = editing ? JSON.stringify(editing.form) !== saved : false
  useEffect(() => {
    if (!dirty) return
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = "" }
    window.addEventListener("beforeunload", h)
    return () => window.removeEventListener("beforeunload", h)
  }, [dirty])

  const open = (id: string | null, form: Form) => { setEditing({ id, form }); setSaved(JSON.stringify(form)); setLang("es") }
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setEditing((e) => (e ? { ...e, form: { ...e.form, [k]: v } } : e))
  const close = () => { if (dirty && !window.confirm("Hay cambios sin guardar. ¿Salir igual?")) return; setEditing(null) }

  async function save() {
    if (!editing) return
    const f = editing.form
    if (!f.title.trim()) { toast("error", "Falta el título."); return }
    if (!f.content.trim()) { toast("error", "Falta el contenido."); return }
    const slug = slugifyPost(f.slug || f.title)
    const body = { title: f.title, titleEn: f.titleEn, content: f.content, contentEn: f.contentEn, coverUrl: f.coverUrl, seoTitle: f.seoTitle, seoDescription: f.seoDescription, isPublished: f.isPublished, slug }
    setSaving(true)
    try {
      const res = await api<{ page: PageRow }>(editing.id ? `/api/admin/pages/${editing.id}` : "/api/admin/pages", { method: editing.id ? "PATCH" : "POST", json: body })
      toast("ok", f.isPublished ? "Página guardada y publicada" : "Borrador guardado")
      const next = fromRow(res.page)
      setEditing({ id: res.page.id, form: next }); setSaved(JSON.stringify(next))
      await load()
    } catch (e) { toast("error", (e as Error).message) }
    finally { setSaving(false) }
  }

  async function translate() {
    if (!editing) return
    const f = editing.form
    setTranslating(true)
    try {
      const blocks = f.content.split(/\n{2,}/)
      const idx = blocks.map((b, i) => (b.trim() && !/^\s*!\[[^\]]*\]\([^)\s]+\)\s*$|^\s*(?:[-*_]\s*){3,}$/.test(b) && /\p{L}/u.test(b) ? i : -1)).filter((i) => i >= 0)
      const texts = [...(f.title.trim() ? [f.title] : []), ...idx.map((i) => blocks[i])]
      if (!texts.length) { toast("error", "Primero escribí la página en español."); return }
      const out: string[] = []
      for (let i = 0; i < texts.length; i += 40) {
        const d = await api<{ translations: string[] }>("/api/admin/translate", { method: "POST", json: { texts: texts.slice(i, i + 40), target: "EN" } })
        out.push(...d.translations)
      }
      let k = 0
      const titleEn = f.title.trim() ? out[k++] : f.titleEn
      const merged = [...blocks]
      idx.forEach((bi) => { merged[bi] = out[k++] ?? blocks[bi] })
      setEditing((e) => (e ? { ...e, form: { ...e.form, titleEn, contentEn: merged.join("\n\n") } } : e))
      toast("ok", "Borrador en inglés listo. Revisalo antes de publicar.")
    } catch (e) { toast("error", (e as Error).message) }
    finally { setTranslating(false) }
  }

  async function toggle(p: PageRow) {
    try {
      await api(`/api/admin/pages/${p.id}`, { method: "PATCH", json: { isPublished: !p.isPublished } })
      toast("ok", p.isPublished ? "Pasó a borrador" : "Página publicada")
      await load()
    } catch (e) { toast("error", (e as Error).message) }
  }

  async function remove() {
    if (!toDelete) return
    setBusy(true)
    try {
      await api(`/api/admin/pages/${toDelete.id}`, { method: "DELETE" })
      toast("ok", "Página eliminada")
      setToDelete(null)
      await load()
    } catch (e) { toast("error", (e as Error).message) }
    finally { setBusy(false) }
  }

  const live = useMemo(() => pages.filter((p) => p.isPublished).length, [pages])

  /* ── Editor ── */
  if (editing) {
    const f = editing.form
    const current = pages.find((p) => p.id === editing.id)
    return (
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 22 }}>
          <GhostButton icon={<ArrowLeft size={15} />} onClick={close}>Volver</GhostButton>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 26, color: "var(--text)", flex: "1 1 200px" }}>{editing.id ? "Editar página" : "Nueva página"}</h1>
          {dirty && <span style={{ fontSize: 12.5, color: "var(--gold-ink)" }}>● Cambios sin guardar</span>}
          {current?.isPublished && (
            <a href={`/p/${current.slug}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 38, padding: "0 14px", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text-strong)", textDecoration: "none", fontSize: 13 }}>
              <ExternalLink size={14} /> Ver en el sitio
            </a>
          )}
          <PrimaryButton icon={<Save size={15} />} loading={saving} onClick={save}>{f.isPublished ? "Guardar y publicar" : "Guardar borrador"}</PrimaryButton>
        </div>

        <div className="admin-split-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 320px", gap: 20, alignItems: "start" }}>
          <div style={{ ...card, padding: "22px 24px", display: "grid", gap: 16, minWidth: 0 }}>
            <div role="tablist" aria-label="Idioma" style={{ display: "flex", gap: 8 }}>
              {(["es", "en"] as const).map((l) => (
                <button key={l} role="tab" type="button" aria-selected={lang === l} onClick={() => setLang(l)}
                  style={{ padding: "7px 18px", borderRadius: 20, fontSize: 13, cursor: "pointer", fontFamily: "inherit", border: `1px solid ${lang === l ? "var(--gold-ink)" : "var(--border)"}`, background: lang === l ? "color-mix(in srgb, var(--gold-ink) 14%, transparent)" : "transparent", color: lang === l ? "var(--gold-ink)" : "var(--text-muted)" }}>
                  {l === "es" ? "Español" : `English${f.titleEn || f.contentEn ? " ✓" : ""}`}
                </button>
              ))}
            </div>
            {lang === "en" && (
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px" }}>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, flex: "1 1 240px" }}>Versión para quienes visitan el sitio en inglés. Lo que dejes vacío se muestra en español.</p>
                <GhostButton icon={<Languages size={14} />} loading={translating} onClick={translate}>Traducir desde español</GhostButton>
              </div>
            )}
            <Field label={lang === "es" ? "Título" : "Title (English)"} id="pg-title">
              <input id="pg-title" value={lang === "es" ? f.title : f.titleEn} maxLength={200} style={{ ...inputStyle, fontSize: 17 }} placeholder={lang === "es" ? "Título de la página" : f.title}
                onChange={(e) => { const v = e.target.value; setEditing((ed) => (ed ? { ...ed, form: lang === "es" ? { ...ed.form, title: v, ...(ed.form.slugTouched ? {} : { slug: slugifyPost(v) }) } : { ...ed.form, titleEn: v } } : ed)) }} />
            </Field>
            <MarkdownEditor
              value={lang === "es" ? f.content : f.contentEn} onChange={(v) => set(lang === "es" ? "content" : "contentEn", v)}
              label={lang === "es" ? "Contenido" : "Content (English)"} imageFolder="jewgal-paginas" showStats={false}
              placeholder={lang === "es" ? "Escribí la página acá. Separá los párrafos con una línea en blanco." : "Leave empty to show the Spanish text."}
            />
          </div>

          <div style={{ display: "grid", gap: 16, minWidth: 0 }}>
            <div style={{ ...card, padding: "18px 20px", display: "grid", gap: 14 }}>
              <Field label="Estado" id="pg-status">
                <select id="pg-status" value={f.isPublished ? "published" : "draft"} onChange={(e) => set("isPublished", e.target.value === "published")} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="published">Publicada</option>
                  <option value="draft">Borrador (no se ve en el sitio)</option>
                </select>
              </Field>
              <Field label="Enlace" id="pg-slug" hint="La página queda en /p/ + este enlace. Podés ponerla en el menú desde “Menú y pie de página”.">
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13, color: "var(--text-faint)" }}>/p/</span>
                  <input id="pg-slug" value={f.slugTouched ? f.slug : slugifyPost(f.title)} maxLength={120} style={inputStyle}
                    onChange={(e) => setEditing((ed) => (ed ? { ...ed, form: { ...ed.form, slug: cleanSlugInput(e.target.value), slugTouched: true } } : ed))}
                    onBlur={() => setEditing((ed) => (ed ? { ...ed, form: { ...ed.form, slug: slugifyPost(ed.form.slug) } } : ed))} />
                </div>
              </Field>
            </div>
            <div style={{ ...card, padding: "18px 20px" }}>
              <ImageUpload label="Imagen principal (opcional)" value={f.coverUrl} onChange={(u) => set("coverUrl", u)} folder="jewgal-paginas" aspect="16/9" hint="Se muestra arriba del texto y al compartir la página." />
            </div>
            <div style={{ ...card, padding: "18px 20px", display: "grid", gap: 14 }}>
              <Field label={`Título para Google (${f.seoTitle.length}/60)`} id="pg-seo-t">
                <input id="pg-seo-t" value={f.seoTitle} maxLength={120} onChange={(e) => set("seoTitle", e.target.value)} placeholder={f.title || "Igual que el título"} style={inputStyle} />
              </Field>
              <Field label={`Descripción para Google (${f.seoDescription.length}/160)`} id="pg-seo-d" hint="Se usa en español; en inglés, el título traducido.">
                <textarea id="pg-seo-d" value={f.seoDescription} rows={3} maxLength={300} onChange={(e) => set("seoDescription", e.target.value)} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
              </Field>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── Lista ── */
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <PageHeader
        eyebrow="Sitio web" title="Páginas propias"
        subtitle={`${pages.length} páginas · ${live} publicadas. Creá páginas nuevas (por ejemplo, “Preguntas frecuentes”, “Código de conducta”) sin tocar código y ponelas en el menú.`}
        actions={<PrimaryButton icon={<Plus size={16} />} onClick={() => open(null, EMPTY)}>Nueva página</PrimaryButton>}
      />
      {toDelete && (
        <ConfirmDialog title="Eliminar página" danger busy={busy} confirmLabel="Eliminar"
          text={<>¿Eliminar <strong>{toDelete.title}</strong>? Dejará de verse en el sitio y los enlaces que apunten a ella darán error. Podés recuperarla desde Historial.</>}
          onConfirm={remove} onCancel={() => setToDelete(null)} />
      )}
      {loading ? <Spinner /> : pages.length === 0 ? (
        <EmptyState icon={<Files size={34} />} title="Todavía no hay páginas propias" text="Una página nueva vive en /p/su-enlace, tiene versión en inglés, imagen y SEO, y se puede agregar al menú y al pie." action={<PrimaryButton icon={<FilePlus2 size={16} />} onClick={() => open(null, EMPTY)}>Crear la primera página</PrimaryButton>} />
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {pages.map((p) => (
            <div key={p.id} style={{ ...card, padding: "14px 18px", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
              <button type="button" onClick={() => open(p.id, fromRow(p))} style={{ flex: "1 1 260px", minWidth: 0, background: "none", border: "none", textAlign: "left", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: p.isPublished ? "var(--success)" : "var(--text-muted)", border: "1px solid currentColor", borderRadius: 14, padding: "2px 10px" }}>{p.isPublished ? "Publicada" : "Borrador"}</span>
                  {p.titleEn && <span style={{ fontSize: 11, color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: 14, padding: "2px 10px" }}>EN</span>}
                  <span style={{ fontSize: 12, color: "var(--text-faint)" }}>Editada {fmt(p.updatedAt)}</span>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", overflowWrap: "anywhere" }}>{p.title}</h3>
                <p style={{ fontSize: 12.5, color: "var(--text-muted)" }}>/p/{p.slug}</p>
              </button>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                {p.isPublished && <a href={`/p/${p.slug}`} target="_blank" rel="noopener noreferrer" aria-label="Ver en el sitio" title="Ver en el sitio" style={iconBtn}><ExternalLink size={14} /></a>}
                <button type="button" onClick={() => toggle(p)} aria-label={p.isPublished ? "Pasar a borrador" : "Publicar"} title={p.isPublished ? "Pasar a borrador" : "Publicar"} style={{ ...iconBtn, color: p.isPublished ? "var(--success)" : "var(--text-muted)" }}>{p.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}</button>
                <button type="button" onClick={() => open(p.id, fromRow(p))} aria-label="Editar" title="Editar" style={iconBtn}><Pencil size={14} /></button>
                <button type="button" onClick={() => setToDelete(p)} aria-label="Eliminar" title="Eliminar" style={{ ...iconBtn, color: "var(--danger)" }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const iconBtn: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, background: "none", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", color: "var(--text-muted)", textDecoration: "none" }

export default function PaginasPage() { return <ToastProvider><Inner /></ToastProvider> }
