"use client"

import { useState, useEffect, useCallback } from "react"
import { Eye, Save, ChevronDown, ChevronUp, Loader2, Info } from "lucide-react"
import { DEFAULT_SITE_CONTENT, type SiteContent } from "@/lib/site-content"

type SectionId = "hero" | "stats" | "fundadora" | "contacto" | "footer" | "pg_academia" | "pg_certificaciones" | "pg_eventos" | "pg_blog" | "pg_contacto"

const SECTION_LABELS: Record<SectionId, string> = {
  hero: "Hero / Portada",
  stats: "Estadísticas (debajo del hero)",
  fundadora: "Sección «Conoce a Devora»",
  contacto: "Información de contacto",
  footer: "Pie de página (footer)",
  pg_academia: "Página Academia — Encabezado",
  pg_certificaciones: "Página Certificaciones — Encabezado",
  pg_eventos: "Página Eventos — Encabezado",
  pg_blog: "Página Blog — Encabezado",
  pg_contacto: "Página Contacto — Encabezado",
}

const card: React.CSSProperties = { background: "var(--surface)", border: "1px solid rgba(165,141,102,.13)", borderRadius: 14 }
const inputBase: React.CSSProperties = { background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.2)", borderRadius: 9, fontSize: 13, color: "var(--text)", outline: "none", fontFamily: "inherit", width: "100%", padding: "10px 14px" }
const labelStyle: React.CSSProperties = { fontSize: 11, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--text-faint)", display: "block", marginBottom: 7 }

export default function WebAdminPage() {
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<SectionId | null>("hero")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  const load = useCallback(() => {
    setLoading(true)
    fetch("/api/admin/site-content")
      .then((r) => r.json())
      .then((d) => setContent(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSave() {
    setSaving(true); setError("")
    try {
      const res = await fetch("/api/admin/site-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "No se pudo guardar"); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", gap: 10, color: "var(--text-dim)", padding: "60px 0" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Cargando contenido del sitio…
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <span style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: 8 }}>Admin</span>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 36, color: "var(--text)", marginBottom: 6 }}>Editor del sitio web</h1>
          <p style={{ color: "var(--text-faint)", fontSize: 14 }}>Modificá los textos e información visibles en el sitio público.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <a href="/" target="_blank" style={{ display: "flex", alignItems: "center", gap: 7, background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.2)", borderRadius: 10, padding: "11px 18px", fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>
            <Eye size={15} /> Ver sitio
          </a>
          <button onClick={handleSave} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 7, background: saved ? "var(--success)" : "var(--gold)", color: "#2C1F14", border: "none", borderRadius: 10, padding: "11px 20px", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, transition: "background .3s" }}>
            {saving ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={15} />}
            {saving ? "Guardando…" : saved ? "¡Guardado!" : "Guardar cambios"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(220,38,38,.1)", border: "1px solid rgba(220,38,38,.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#f87171", fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

        {/* ── HERO ── */}
        <div style={card}>
          <SectionHeader id="hero" expanded={expanded} setExpanded={setExpanded} />
          {expanded === "hero" && (
            <div style={{ padding: "0 22px 22px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, borderTop: "1px solid var(--surface-2)", paddingTop: 20 }}>
              <Field label="Línea 1 del título" value={content.hero.headline1} onChange={(v) => setContent((c) => ({ ...c, hero: { ...c.hero, headline1: v } }))} />
              <Field label="Línea 2 del título" value={content.hero.headline2} onChange={(v) => setContent((c) => ({ ...c, hero: { ...c.hero, headline2: v } }))} />
              <Field label="Texto descriptivo" type="textarea" span2 value={content.hero.subtext} onChange={(v) => setContent((c) => ({ ...c, hero: { ...c.hero, subtext: v } }))} />
              <Field label="Botón principal" value={content.hero.cta1} onChange={(v) => setContent((c) => ({ ...c, hero: { ...c.hero, cta1: v } }))} />
              <Field label="Botón secundario" value={content.hero.cta2} onChange={(v) => setContent((c) => ({ ...c, hero: { ...c.hero, cta2: v } }))} />
            </div>
          )}
        </div>

        {/* ── STATS ── */}
        <div style={card}>
          <SectionHeader id="stats" expanded={expanded} setExpanded={setExpanded} />
          {expanded === "stats" && (
            <div style={{ padding: "0 22px 22px", borderTop: "1px solid var(--surface-2)", paddingTop: 20 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "rgba(251,191,36,.06)", border: "1px solid rgba(251,191,36,.15)", borderRadius: 9, padding: "12px 14px", marginBottom: 16 }}>
                <Info size={15} style={{ color: "var(--warning)", flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
                  Estos valores se guardan, pero el contador animado del home todavía usa los números de código (por el efecto de conteo). Pedile a tu desarrollador que los conecte si querés editarlos en vivo.
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {content.stats.map((s, i) => (
                  <div key={i} style={{ display: "contents" }}>
                    <Field label={`Stat ${i + 1} — Número`} value={s.n} onChange={(v) => setContent((c) => ({ ...c, stats: c.stats.map((x, j) => j === i ? { ...x, n: v } : x) }))} />
                    <Field label={`Stat ${i + 1} — Etiqueta`} value={s.l} onChange={(v) => setContent((c) => ({ ...c, stats: c.stats.map((x, j) => j === i ? { ...x, l: v } : x) }))} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── FUNDADORA ── */}
        <div style={card}>
          <SectionHeader id="fundadora" expanded={expanded} setExpanded={setExpanded} />
          {expanded === "fundadora" && (
            <div style={{ padding: "0 22px 22px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, borderTop: "1px solid var(--surface-2)", paddingTop: 20 }}>
              <Field label="Nombre" value={content.fundadora.name} onChange={(v) => setContent((c) => ({ ...c, fundadora: { ...c.fundadora, name: v } }))} />
              <Field label="Título / firma" value={content.fundadora.sig} onChange={(v) => setContent((c) => ({ ...c, fundadora: { ...c.fundadora, sig: v } }))} />
              <Field label="Primer párrafo" type="textarea" span2 value={content.fundadora.p1} onChange={(v) => setContent((c) => ({ ...c, fundadora: { ...c.fundadora, p1: v } }))} />
              <Field label="Segundo párrafo" type="textarea" span2 value={content.fundadora.p2} onChange={(v) => setContent((c) => ({ ...c, fundadora: { ...c.fundadora, p2: v } }))} />
            </div>
          )}
        </div>

        {/* ── CONTACTO ── */}
        <div style={card}>
          <SectionHeader id="contacto" expanded={expanded} setExpanded={setExpanded} />
          {expanded === "contacto" && (
            <div style={{ padding: "0 22px 22px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, borderTop: "1px solid var(--surface-2)", paddingTop: 20 }}>
              <Field label="Email" value={content.contacto.email} onChange={(v) => setContent((c) => ({ ...c, contacto: { ...c.contacto, email: v } }))} />
              <Field label="Teléfono / WhatsApp" value={content.contacto.phone} onChange={(v) => setContent((c) => ({ ...c, contacto: { ...c.contacto, phone: v } }))} />
              <Field label="Ciudad" value={content.contacto.city} onChange={(v) => setContent((c) => ({ ...c, contacto: { ...c.contacto, city: v } }))} span2 />
              <Field label="Instagram URL" value={content.contacto.ig} onChange={(v) => setContent((c) => ({ ...c, contacto: { ...c.contacto, ig: v } }))} />
              <Field label="Facebook URL" value={content.contacto.fb} onChange={(v) => setContent((c) => ({ ...c, contacto: { ...c.contacto, fb: v } }))} />
              <Field label="YouTube URL" value={content.contacto.yt} onChange={(v) => setContent((c) => ({ ...c, contacto: { ...c.contacto, yt: v } }))} />
              <p style={{ gridColumn: "span 2", fontSize: 11.5, color: "var(--text-dim)" }}>Dejá una URL vacía para ocultar ese ícono de red social en el sitio.</p>
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div style={card}>
          <SectionHeader id="footer" expanded={expanded} setExpanded={setExpanded} />
          {expanded === "footer" && (
            <div style={{ padding: "0 22px 22px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, borderTop: "1px solid var(--surface-2)", paddingTop: 20 }}>
              <Field label="Frase del footer" value={content.footer.tagline} onChange={(v) => setContent((c) => ({ ...c, footer: { ...c.footer, tagline: v } }))} span2 />
              <Field label="Texto legal (después del año)" value={content.footer.copyright} onChange={(v) => setContent((c) => ({ ...c, footer: { ...c.footer, copyright: v } }))} span2 />
            </div>
          )}
        </div>

        {/* ── SEPARADOR ── */}
        <div style={{ padding: "18px 0 6px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ flex: 1, height: 1, background: "var(--surface-2)" }} />
          <span style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--text-dim)", whiteSpace: "nowrap" }}>Encabezados de páginas internas</span>
          <div style={{ flex: 1, height: 1, background: "var(--surface-2)" }} />
        </div>

        {/* ── ACADEMIA ── */}
        <div style={card}>
          <SectionHeader id="pg_academia" expanded={expanded} setExpanded={setExpanded} />
          {expanded === "pg_academia" && (
            <div style={{ padding: "0 22px 22px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, borderTop: "1px solid var(--surface-2)", paddingTop: 20 }}>
              <Field label="Eyebrow (etiqueta pequeña)" value={content.pages.academia.eyebrow} onChange={(v) => setContent((c) => ({ ...c, pages: { ...c.pages, academia: { ...c.pages.academia, eyebrow: v } } }))} />
              <Field label="Título principal" value={content.pages.academia.title} onChange={(v) => setContent((c) => ({ ...c, pages: { ...c.pages, academia: { ...c.pages.academia, title: v } } }))} />
              <Field label="Subtítulo / descripción" type="textarea" span2 value={content.pages.academia.subtext} onChange={(v) => setContent((c) => ({ ...c, pages: { ...c.pages, academia: { ...c.pages.academia, subtext: v } } }))} />
            </div>
          )}
        </div>

        {/* ── CERTIFICACIONES ── */}
        <div style={card}>
          <SectionHeader id="pg_certificaciones" expanded={expanded} setExpanded={setExpanded} />
          {expanded === "pg_certificaciones" && (
            <div style={{ padding: "0 22px 22px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, borderTop: "1px solid var(--surface-2)", paddingTop: 20 }}>
              <Field label="Eyebrow (etiqueta pequeña)" value={content.pages.certificaciones.eyebrow} onChange={(v) => setContent((c) => ({ ...c, pages: { ...c.pages, certificaciones: { ...c.pages.certificaciones, eyebrow: v } } }))} />
              <Field label="Título principal" value={content.pages.certificaciones.title} onChange={(v) => setContent((c) => ({ ...c, pages: { ...c.pages, certificaciones: { ...c.pages.certificaciones, title: v } } }))} />
              <Field label="Subtítulo / descripción" type="textarea" span2 value={content.pages.certificaciones.subtext} onChange={(v) => setContent((c) => ({ ...c, pages: { ...c.pages, certificaciones: { ...c.pages.certificaciones, subtext: v } } }))} />
            </div>
          )}
        </div>

        {/* ── EVENTOS ── */}
        <div style={card}>
          <SectionHeader id="pg_eventos" expanded={expanded} setExpanded={setExpanded} />
          {expanded === "pg_eventos" && (
            <div style={{ padding: "0 22px 22px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, borderTop: "1px solid var(--surface-2)", paddingTop: 20 }}>
              <Field label="Eyebrow (etiqueta pequeña)" value={content.pages.eventos.eyebrow} onChange={(v) => setContent((c) => ({ ...c, pages: { ...c.pages, eventos: { ...c.pages.eventos, eyebrow: v } } }))} />
              <Field label="Título — línea 1" value={content.pages.eventos.title1} onChange={(v) => setContent((c) => ({ ...c, pages: { ...c.pages, eventos: { ...c.pages.eventos, title1: v } } }))} />
              <Field label="Título — línea 2 (dorada)" value={content.pages.eventos.title2} onChange={(v) => setContent((c) => ({ ...c, pages: { ...c.pages, eventos: { ...c.pages.eventos, title2: v } } }))} />
              <Field label="Subtítulo / descripción" type="textarea" span2 value={content.pages.eventos.subtext} onChange={(v) => setContent((c) => ({ ...c, pages: { ...c.pages, eventos: { ...c.pages.eventos, subtext: v } } }))} />
            </div>
          )}
        </div>

        {/* ── BLOG ── */}
        <div style={card}>
          <SectionHeader id="pg_blog" expanded={expanded} setExpanded={setExpanded} />
          {expanded === "pg_blog" && (
            <div style={{ padding: "0 22px 22px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, borderTop: "1px solid var(--surface-2)", paddingTop: 20 }}>
              <Field label="Eyebrow (etiqueta pequeña)" value={content.pages.blog.eyebrow} onChange={(v) => setContent((c) => ({ ...c, pages: { ...c.pages, blog: { ...c.pages.blog, eyebrow: v } } }))} />
              <Field label="Título — línea 1" value={content.pages.blog.title1} onChange={(v) => setContent((c) => ({ ...c, pages: { ...c.pages, blog: { ...c.pages.blog, title1: v } } }))} />
              <Field label="Título — línea 2 (dorada)" value={content.pages.blog.title2} onChange={(v) => setContent((c) => ({ ...c, pages: { ...c.pages, blog: { ...c.pages.blog, title2: v } } }))} />
              <Field label="Subtítulo / descripción" type="textarea" span2 value={content.pages.blog.subtext} onChange={(v) => setContent((c) => ({ ...c, pages: { ...c.pages, blog: { ...c.pages.blog, subtext: v } } }))} />
            </div>
          )}
        </div>

        {/* ── CONTACTO ── */}
        <div style={card}>
          <SectionHeader id="pg_contacto" expanded={expanded} setExpanded={setExpanded} />
          {expanded === "pg_contacto" && (
            <div style={{ padding: "0 22px 22px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, borderTop: "1px solid var(--surface-2)", paddingTop: 20 }}>
              <Field label="Eyebrow (etiqueta pequeña)" value={content.pages.contacto.eyebrow} onChange={(v) => setContent((c) => ({ ...c, pages: { ...c.pages, contacto: { ...c.pages.contacto, eyebrow: v } } }))} />
              <Field label="Título — línea 1" value={content.pages.contacto.title1} onChange={(v) => setContent((c) => ({ ...c, pages: { ...c.pages, contacto: { ...c.pages.contacto, title1: v } } }))} />
              <Field label="Título — línea 2 (dorada)" value={content.pages.contacto.title2} onChange={(v) => setContent((c) => ({ ...c, pages: { ...c.pages, contacto: { ...c.pages.contacto, title2: v } } }))} />
              <Field label="Subtítulo / descripción" type="textarea" span2 value={content.pages.contacto.subtext} onChange={(v) => setContent((c) => ({ ...c, pages: { ...c.pages, contacto: { ...c.pages.contacto, subtext: v } } }))} />
            </div>
          )}
        </div>
      </div>

      <div style={{ ...card, padding: "20px 22px", marginTop: 20, borderColor: "rgba(251,191,36,.15)", background: "rgba(251,191,36,.03)" }}>
        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>
          <strong style={{ color: "var(--text-strong)" }}>Nota:</strong> Todos los textos se aplican al instante en el sitio público al guardar. Para cambios de diseño (colores, imágenes, fuentes), editá los archivos de código con Claude Code.
        </p>
      </div>
    </div>
  )
}

function SectionHeader({ id, expanded, setExpanded }: { id: SectionId; expanded: SectionId | null; setExpanded: (id: SectionId | null) => void }) {
  const isOpen = expanded === id
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 22px", cursor: "pointer" }} onClick={() => setExpanded(isOpen ? null : id)}>
      <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", flex: 1 }}>{SECTION_LABELS[id]}</span>
      {isOpen ? <ChevronUp size={16} style={{ color: "var(--text-dim)" }} /> : <ChevronDown size={16} style={{ color: "var(--text-dim)" }} />}
    </div>
  )
}

function Field({ label, value, onChange, type = "text", span2 = false }: { label: string; value: string; onChange: (v: string) => void; type?: "text" | "textarea"; span2?: boolean }) {
  return (
    <div style={{ gridColumn: span2 || type === "textarea" ? "span 2" : undefined }}>
      <label style={labelStyle}>{label}</label>
      {type === "textarea" ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} style={{ ...inputBase, resize: "vertical", lineHeight: 1.7 }} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} style={inputBase} />
      )}
    </div>
  )
}
