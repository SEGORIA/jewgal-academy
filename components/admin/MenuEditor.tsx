"use client"

import { useEffect, useState } from "react"
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2 } from "lucide-react"
import { GhostButton, hintStyle, inputStyle, labelStyle } from "@/components/admin/ui"
import { HOME_SECTION_LABELS, isSafeHref, type HomeSection, type MenuLink, type SiteMenu } from "@/lib/site-menu"

/* Etiquetas de los enlaces de fábrica (lo que se ve hoy en el sitio); sirven de referencia cuando el texto propio está vacío. */
const FACTORY_LABELS: Record<string, [string, string]> = {
  inicio: ["Inicio", "Home"], academia: ["Academia", "Academy"], coaching: ["Coaching 1:1", "1:1 Coaching"], eventos: ["Eventos", "Events"], blog: ["Blog", "Blog"], contacto: ["Contacto", "Contact"],
  todosProgramas: ["Todos los programas", "All programs"], certificaciones: ["Certificaciones", "Certifications"], sobreDevora: ["Sobre Devora", "About Devora"], eventosRetiros: ["Eventos y retiros", "Events and retreats"],
  bibliotecaVirtual: ["Biblioteca virtual", "Virtual library"], testimonios: ["Testimonios", "Testimonials"],
}
const factoryName = (l: MenuLink) => (l.key && FACTORY_LABELS[l.key]?.[0]) || l.id

type PageOption = { slug: string; title: string }

type ListKey = keyof SiteMenu
const LISTS: { key: ListKey; title: string; hint: string }[] = [
  { key: "header", title: "Menú de arriba", hint: "Los enlaces de la barra superior (en el celular, el menú desplegable)." },
  { key: "footerAcademia", title: "Pie de página · columna «Academia»", hint: "Primera columna de enlaces del pie." },
  { key: "footerRecursos", title: "Pie de página · columna «Recursos»", hint: "Tercera columna de enlaces del pie." },
]

/** Editor del menú de arriba y de las columnas del pie: ordenar, ocultar, cambiar el texto (ES/EN) y agregar enlaces propios. */
export function MenuEditor({ menu, onChange }: { menu: SiteMenu; onChange: (m: SiteMenu) => void }) {
  const [pages, setPages] = useState<PageOption[]>([])
  useEffect(() => {
    fetch("/api/admin/pages").then((r) => r.json()).then((d: { pages?: (PageOption & { isPublished: boolean })[] }) => setPages((d.pages ?? []).filter((p) => p.isPublished))).catch(() => {})
  }, [])

  const setList = (key: ListKey, links: MenuLink[]) => onChange({ ...menu, [key]: links })

  return (
    <div style={{ display: "grid", gap: 26 }}>
      <p style={{ ...hintStyle, marginTop: 0 }}>
        Los textos en blanco usan el de siempre (ya traducido). Los enlaces de fábrica se pueden ocultar y reordenar pero no borrar; los propios sí. El menú es el mismo en español e inglés: el texto en inglés de cada enlace se completa acá.
      </p>
      {LISTS.map(({ key, title, hint }) => (
        <LinkList key={key} title={title} hint={hint} links={menu[key]} pages={pages} onChange={(l) => setList(key, l)} />
      ))}
    </div>
  )
}

function LinkList({ title, hint, links, pages, onChange }: { title: string; hint: string; links: MenuLink[]; pages: PageOption[]; onChange: (l: MenuLink[]) => void }) {
  const [draft, setDraft] = useState({ label: "", labelEn: "", href: "" })
  const [err, setErr] = useState("")

  const update = (i: number, patch: Partial<MenuLink>) => onChange(links.map((l, idx) => (idx === i ? { ...l, ...patch } : l)))
  const move = (i: number, d: -1 | 1) => {
    const j = i + d
    if (j < 0 || j >= links.length) return
    const next = [...links]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  function add() {
    if (!draft.label.trim()) { setErr("Escribí el texto del enlace."); return }
    if (!isSafeHref(draft.href)) { setErr("El destino tiene que ser una ruta del sitio (por ejemplo /p/preguntas) o un enlace https, mailto o tel."); return }
    setErr("")
    const id = `c-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`
    onChange([...links, { id, href: draft.href.trim(), label: draft.label.trim(), labelEn: draft.labelEn.trim(), visible: true }])
    setDraft({ label: "", labelEn: "", href: "" })
  }

  return (
    <section aria-label={title}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{title}</h3>
      <p style={{ ...hintStyle, marginTop: 0, marginBottom: 12 }}>{hint}</p>
      <div style={{ display: "grid", gap: 8 }}>
        {links.map((l, i) => {
          const own = l.id.startsWith("c-")
          return (
            <div key={l.id} style={{ display: "grid", gridTemplateColumns: "auto minmax(0,1fr) minmax(0,1fr) auto", gap: 8, alignItems: "center", opacity: l.visible ? 1 : 0.55 }} className="admin-menu-row">
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Subir" style={arrowBtn(i === 0)}><ArrowUp size={12} /></button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === links.length - 1} aria-label="Bajar" style={arrowBtn(i === links.length - 1)}><ArrowDown size={12} /></button>
              </div>
              <input value={l.label} onChange={(e) => update(i, { label: e.target.value })} maxLength={60} aria-label={`Texto en español de ${own ? l.label : factoryName(l)}`} placeholder={own ? "Texto" : `${factoryName(l)} (el de siempre)`} style={inputStyle} />
              <input value={l.labelEn} onChange={(e) => update(i, { labelEn: e.target.value })} maxLength={60} aria-label={`Texto en inglés de ${own ? l.label : factoryName(l)}`} placeholder={own ? "Text (English)" : `${(l.key && FACTORY_LABELS[l.key]?.[1]) || factoryName(l)} (el de siempre)`} style={inputStyle} />
              <div style={{ display: "flex", gap: 4 }}>
                <button type="button" onClick={() => update(i, { visible: !l.visible })} aria-label={l.visible ? "Ocultar" : "Mostrar"} title={l.visible ? "Ocultar" : "Mostrar"} style={iconBtn}>{l.visible ? <Eye size={14} /> : <EyeOff size={14} />}</button>
                {own ? <button type="button" onClick={() => onChange(links.filter((_, idx) => idx !== i))} aria-label="Quitar el enlace" title="Quitar" style={{ ...iconBtn, color: "var(--danger)" }}><Trash2 size={14} /></button> : <span style={{ width: 34 }} />}
              </div>
              {own && <p style={{ gridColumn: "2 / span 3", fontSize: 12, color: "var(--text-faint)", marginTop: -2 }}>Destino: {l.href}</p>}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 12, padding: 12, border: "1px dashed var(--border)", borderRadius: 10, display: "grid", gap: 8 }}>
        <span style={labelStyle}>Agregar un enlace</span>
        <div className="admin-form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} maxLength={60} placeholder="Texto (español)" aria-label="Texto del enlace nuevo" style={inputStyle} />
          <input value={draft.labelEn} onChange={(e) => setDraft({ ...draft, labelEn: e.target.value })} maxLength={60} placeholder="Text (English, opcional)" aria-label="Texto en inglés del enlace nuevo" style={inputStyle} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input value={draft.href} onChange={(e) => setDraft({ ...draft, href: e.target.value })} placeholder="/p/mi-pagina  ·  https://…  ·  mailto:…" aria-label="Destino del enlace nuevo" style={{ ...inputStyle, flex: "1 1 260px" }} />
          {pages.length > 0 && (
            <select aria-label="Elegir una página propia" value="" onChange={(e) => { const p = pages.find((x) => x.slug === e.target.value); if (p) setDraft((d) => ({ ...d, href: `/p/${p.slug}`, label: d.label || p.title })) }} style={{ ...inputStyle, flex: "0 1 220px", cursor: "pointer" }}>
              <option value="">Elegir una página…</option>
              {pages.map((p) => <option key={p.slug} value={p.slug}>{p.title}</option>)}
            </select>
          )}
          <GhostButton icon={<Plus size={14} />} onClick={add}>Agregar</GhostButton>
        </div>
        {err && <p role="alert" style={{ color: "var(--danger)", fontSize: 12.5 }}>{err}</p>}
      </div>
    </section>
  )
}

/** Orden y visibilidad de las secciones de la página de inicio. */
export function HomeSectionsEditor({ sections, onChange }: { sections: HomeSection[]; onChange: (s: HomeSection[]) => void }) {
  const move = (i: number, d: -1 | 1) => {
    const j = i + d
    // La portada queda siempre arriba.
    if (j < 1 || j >= sections.length || i < 1) return
    const next = [...sections]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  return (
    <div>
      <p style={{ ...hintStyle, marginTop: 0, marginBottom: 14 }}>
        Ordená las secciones de la página de inicio y ocultá las que no quieras mostrar. La portada va siempre primera. Los enlaces como «#programas» dejan de funcionar si ocultás esa sección.
      </p>
      <div style={{ display: "grid", gap: 8 }}>
        {sections.map((s, i) => {
          const meta = HOME_SECTION_LABELS[s.id]
          const locked = s.id === "hero"
          return (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 10, opacity: s.visible ? 1 : 0.55, background: "var(--surface-2)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <button type="button" onClick={() => move(i, -1)} disabled={locked || i <= 1} aria-label={`Subir ${meta.label}`} style={arrowBtn(locked || i <= 1)}><ArrowUp size={12} /></button>
                <button type="button" onClick={() => move(i, 1)} disabled={locked || i === sections.length - 1} aria-label={`Bajar ${meta.label}`} style={arrowBtn(locked || i === sections.length - 1)}><ArrowDown size={12} /></button>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, color: "var(--text)", fontWeight: 600 }}>{i + 1}. {meta.label}</p>
                <p style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{meta.hint}</p>
              </div>
              <button type="button" disabled={locked} onClick={() => onChange(sections.map((x) => (x.id === s.id ? { ...x, visible: !x.visible } : x)))} aria-label={s.visible ? `Ocultar ${meta.label}` : `Mostrar ${meta.label}`} title={locked ? "La portada siempre se muestra" : s.visible ? "Ocultar" : "Mostrar"} style={{ ...iconBtn, opacity: locked ? 0.4 : 1, cursor: locked ? "not-allowed" : "pointer" }}>
                {s.visible ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const iconBtn: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, background: "none", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", color: "var(--text-muted)" }
const arrowBtn = (disabled: boolean): React.CSSProperties => ({ width: 22, height: 17, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "1px solid var(--border)", borderRadius: 4, cursor: disabled ? "not-allowed" : "pointer", color: "var(--text-muted)", opacity: disabled ? 0.35 : 1, padding: 0 })
