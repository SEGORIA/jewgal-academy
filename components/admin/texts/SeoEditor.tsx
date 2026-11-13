"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ImageIcon, RotateCcw, Save, Trash2, Upload } from "lucide-react"
import { Field, GhostButton, PrimaryButton, Spinner, api, card, inputStyle, useToast } from "@/components/admin/ui"
import { uploadToCloudinary } from "@/lib/cloudinary-upload"
import type { SeoPage, SeoPageKey, SeoSettings } from "@/lib/seo"

type Loc = "es" | "en"
type Draft = { ogImage: string; pages: Record<string, Record<Loc, { title: string; description: string }>> }

const SITE = typeof window !== "undefined" ? window.location.origin : ""

/** Convierte lo guardado en lo que se ve en los campos (el valor por defecto aparece escrito, listo para editar). */
function toDraft(pages: SeoPage[], s: SeoSettings): Draft {
  const d: Draft = { ogImage: s.ogImage, pages: {} }
  for (const p of pages) {
    d.pages[p.key] = { es: { title: "", description: "" }, en: { title: "", description: "" } }
    for (const loc of ["es", "en"] as const) {
      d.pages[p.key][loc] = {
        title: s.pages[p.key]?.[loc]?.title ?? p.defaults[loc].title,
        description: s.pages[p.key]?.[loc]?.description ?? p.defaults[loc].description,
      }
    }
  }
  return d
}

/** Solo se guarda lo que difiere del valor por defecto. */
function toPayload(pages: SeoPage[], d: Draft) {
  const out: Record<string, Partial<Record<Loc, { title?: string; description?: string }>>> = {}
  for (const p of pages) {
    for (const loc of ["es", "en"] as const) {
      const t = d.pages[p.key][loc]
      const title = t.title.trim() === p.defaults[loc].title ? "" : t.title.trim()
      const description = t.description.trim() === p.defaults[loc].description ? "" : t.description.trim()
      if (title || description) (out[p.key] ??= {})[loc] = { ...(title ? { title } : {}), ...(description ? { description } : {}) }
    }
  }
  return { ogImage: d.ogImage.trim(), pages: out }
}

const lenColor = (n: number, ideal: [number, number], max: number) => (n === 0 ? "var(--danger)" : n > max ? "var(--danger)" : n >= ideal[0] && n <= ideal[1] ? "var(--success)" : "var(--warning)")

export default function SeoEditor() {
  const toast = useToast()
  const [pages, setPages] = useState<SeoPage[]>([])
  const [draft, setDraft] = useState<Draft | null>(null)
  const [initial, setInitial] = useState("")
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api<{ pages: SeoPage[]; settings: SeoSettings }>("/api/admin/seo", { cache: "no-store" })
      .then((d) => { setPages(d.pages); const dr = toDraft(d.pages, d.settings); setDraft(dr); setInitial(JSON.stringify(dr)) })
      .catch((e) => toast("error", (e as Error).message))
  }, [toast])

  const dirty = useMemo(() => !!draft && JSON.stringify(draft) !== initial, [draft, initial])
  useEffect(() => {
    if (!dirty) return
    const h = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener("beforeunload", h)
    return () => window.removeEventListener("beforeunload", h)
  }, [dirty])

  // si se llegó con #pagina (desde el botón “Editar esta página”), se baja hasta ese bloque
  useEffect(() => {
    if (!draft || !window.location.hash) return
    document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView({ block: "start" })
    // solo cuando termina de cargar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!draft])

  if (!draft) return <Spinner label="Cargando SEO…" />

  const setField = (key: SeoPageKey, loc: Loc, field: "title" | "description", value: string) =>
    setDraft((d) => d && ({ ...d, pages: { ...d.pages, [key]: { ...d.pages[key], [loc]: { ...d.pages[key][loc], [field]: value } } } }))
  const resetPage = (p: SeoPage) => setDraft((d) => d && ({ ...d, pages: { ...d.pages, [p.key]: { es: { ...p.defaults.es }, en: { ...p.defaults.en } } } }))

  async function save() {
    if (!draft) return
    setSaving(true)
    try {
      await api("/api/admin/seo", { method: "PUT", json: toPayload(pages, draft) })
      setInitial(JSON.stringify(draft))
      toast("ok", "SEO guardado. Google tarda un tiempo en reflejar los cambios.")
    } catch (e) { toast("error", (e as Error).message) }
    finally { setSaving(false) }
  }

  async function onFile(file: File | undefined) {
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadToCloudinary(file, "jewgal-seo", () => {})
      setDraft((d) => d && ({ ...d, ogImage: url }))
    } catch (e) { toast("error", (e as Error).message) }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = "" }
  }

  return (
    <div style={{ display: "grid", gap: 18, paddingBottom: dirty ? 80 : 0 }}>
      <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.65, maxWidth: 760 }}>
        Lo que aparece en Google y en las vistas previas al compartir un enlace. Un buen título tiene hasta 60 caracteres y una buena descripción, entre 70 y 160.
      </p>

      <div style={{ ...card, padding: 18, display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ width: 200, height: 105, borderRadius: 10, border: "1px dashed var(--border)", background: "var(--surface-2)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {draft.ogImage
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={draft.ogImage} alt="Imagen para compartir" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <ImageIcon size={26} color="var(--text-faint)" />}
        </div>
        <div style={{ flex: "1 1 280px", display: "grid", gap: 10 }}>
          <div>
            <p style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--text)", marginBottom: 4 }}>Imagen al compartir en redes</p>
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.6 }}>Aparece cuando alguien comparte el sitio por WhatsApp, Instagram o Facebook. Tamaño recomendado: 1200 × 630 px.</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden aria-label="Subir imagen para compartir" onChange={(e) => onFile(e.target.files?.[0])} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <GhostButton icon={<Upload size={14} />} loading={uploading} onClick={() => fileRef.current?.click()}>{draft.ogImage ? "Cambiar imagen" : "Subir imagen"}</GhostButton>
            {draft.ogImage && <GhostButton danger icon={<Trash2 size={14} />} onClick={() => setDraft((d) => d && ({ ...d, ogImage: "" }))}>Quitar</GhostButton>}
          </div>
        </div>
      </div>

      {pages.map((p) => (
        <section key={p.key} id={p.key} style={{ ...card, padding: 18, scrollMarginTop: 90 }} aria-label={`SEO de ${p.label}`}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            <h3 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 20, color: "var(--text)" }}>{p.label} <code style={{ fontSize: 12, color: "var(--text-faint)", marginLeft: 8 }}>{p.path || "/"}</code></h3>
            <GhostButton icon={<RotateCcw size={13} />} onClick={() => resetPage(p)} style={{ padding: "5px 12px", fontSize: 12 }}>Valores por defecto</GhostButton>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
            {(["es", "en"] as const).map((loc) => {
              const t = draft.pages[p.key][loc]
              const url = `${SITE}${loc === "en" ? "/en" : ""}${p.path}`.replace(/^https?:\/\//, "")
              return (
                <div key={loc} style={{ display: "grid", gap: 12 }}>
                  <p style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--text-muted)" }}>{loc === "es" ? "Español" : "English"}</p>
                  <Field label={`Título · ${t.title.length}/60`} id={`seo-${p.key}-${loc}-t`}>
                    <input id={`seo-${p.key}-${loc}-t`} style={{ ...inputStyle, borderColor: lenColor(t.title.length, [20, 60], 70) }} value={t.title} maxLength={120} onChange={(e) => setField(p.key, loc, "title", e.target.value)} />
                  </Field>
                  <Field label={`Descripción · ${t.description.length}/160`} id={`seo-${p.key}-${loc}-d`}>
                    <textarea id={`seo-${p.key}-${loc}-d`} rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.55, borderColor: lenColor(t.description.length, [70, 160], 180) }} value={t.description} maxLength={320} onChange={(e) => setField(p.key, loc, "description", e.target.value)} />
                  </Field>
                  <div aria-hidden style={{ background: "#fff", borderRadius: 10, padding: "12px 14px", border: "1px solid rgba(0,0,0,.08)" }}>
                    <p style={{ fontSize: 12, color: "#4d5156", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url}</p>
                    <p style={{ fontSize: 18, color: "#1a0dab", lineHeight: 1.3, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title || "Sin título"}</p>
                    <p style={{ fontSize: 13.5, color: "#4d5156", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{t.description || "Sin descripción"}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}

      {dirty && (
        <div role="region" aria-label="Cambios sin guardar" style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 120, display: "flex", justifyContent: "center", padding: "12px 16px", pointerEvents: "none" }}>
          <div style={{ pointerEvents: "auto", display: "flex", gap: 14, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", width: "100%", maxWidth: 920, background: "var(--surface-solid)", border: "1px solid var(--gold-ink)", borderRadius: 14, padding: "12px 18px", boxShadow: "0 16px 50px rgba(0,0,0,.35)" }}>
            <span style={{ fontSize: 14, color: "var(--text)" }}>Hay cambios sin guardar</span>
            <span style={{ display: "flex", gap: 8 }}>
              <GhostButton onClick={() => { try { setDraft(JSON.parse(initial)) } catch {} }} disabled={saving}>Descartar</GhostButton>
              <PrimaryButton icon={<Save size={15} />} loading={saving} onClick={save}>Guardar SEO</PrimaryButton>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
