"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { AlertTriangle, ExternalLink, Languages, RotateCcw, Save, Search } from "lucide-react"
import { EmptyState, GhostButton, PrimaryButton, Spinner, api, card, inputStyle, useToast } from "@/components/admin/ui"
import { NAMESPACE_LABELS, namespaceOf, placeholdersOf, tagsOf, validateOverride, type Locale } from "@/lib/text-overrides"

type Entry = { key: string; es: string | null; en: string | null }
type Overrides = Partial<Record<Locale, Record<string, string>>>
type Draft = Record<Locale, Record<string, string>>

const SECTION_PAGE: Record<string, string> = {
  Home: "/", Academia: "/academia", Certificaciones: "/certificaciones", Devora: "/conoce-a-devora", Contacto: "/contacto",
  Blog: "/blog", Eventos: "/eventos", Footer: "/", Navbar: "/", Testimonials: "/", Programa: "/academia",
}
const LOCALES: { id: Locale; label: string }[] = [{ id: "es", label: "Español" }, { id: "en", label: "English" }]
const MAX_RESULTS = 120

export default function TextsEditor({ initialSection }: { initialSection?: string }) {
  const toast = useToast()
  const [catalog, setCatalog] = useState<Entry[]>([])
  const [saved, setSaved] = useState<Overrides>({})
  const [deepl, setDeepl] = useState(false)
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState<Draft>({ es: {}, en: {} })
  const [section, setSection] = useState<string>(initialSection && NAMESPACE_LABELS[initialSection] ? initialSection : "Home")
  const [search, setSearch] = useState("")
  const [onlyModified, setOnlyModified] = useState(false)
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState<string | null>(null)

  useEffect(() => {
    api<{ catalog: Entry[]; overrides: Overrides; deepl: boolean }>("/api/admin/texts", { cache: "no-store" })
      .then((d) => { setCatalog(d.catalog); setSaved(d.overrides); setDeepl(d.deepl) })
      .catch((e) => toast("error", (e as Error).message))
      .finally(() => setLoading(false))
  }, [toast])

  const original = (e: Entry, l: Locale) => e[l] ?? ""
  /** Lo que se está viendo en el campo: lo que se escribió ahora, o lo ya guardado, o el original. */
  const current = useCallback((e: Entry, l: Locale) => draft[l][e.key] ?? saved[l]?.[e.key] ?? e[l] ?? "", [draft, saved])
  const savedValue = useCallback((e: Entry, l: Locale) => saved[l]?.[e.key] ?? e[l] ?? "", [saved])
  const isModified = useCallback((e: Entry, l: Locale) => current(e, l) !== (e[l] ?? ""), [current])

  const sections = useMemo(() => {
    const by = new Map<string, Entry[]>()
    catalog.forEach((e) => by.set(namespaceOf(e.key), [...(by.get(namespaceOf(e.key)) ?? []), e]))
    const order = Object.keys(NAMESPACE_LABELS)
    return [...by.entries()].sort((a, b) => (order.indexOf(a[0]) + 1 || 99) - (order.indexOf(b[0]) + 1 || 99))
  }, [catalog])

  const modifiedCount = useCallback((entries: Entry[]) => entries.filter((e) => isModified(e, "es") || isModified(e, "en")).length, [isModified])

  const dirtyChanges = useMemo(() => {
    const list: { locale: Locale; key: string; value: string }[] = []
    for (const e of catalog) for (const l of ["es", "en"] as Locale[]) {
      const d = draft[l][e.key]
      if (d !== undefined && d.trim() !== savedValue(e, l).trim()) list.push({ locale: l, key: e.key, value: d.trim() === (e[l] ?? "").trim() ? "" : d })
    }
    return list
  }, [catalog, draft, savedValue])

  const invalid = useMemo(() => {
    const byKey = new Map(catalog.map((e) => [e.key, e]))
    return dirtyChanges.filter((c) => c.value && !validateOverride(byKey.get(c.key)?.[c.locale] ?? "", c.value).ok)
  }, [catalog, dirtyChanges])

  useEffect(() => {
    if (!dirtyChanges.length) return
    const h = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener("beforeunload", h)
    return () => window.removeEventListener("beforeunload", h)
  }, [dirtyChanges.length])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = q
      ? catalog.filter((e) => e.key.toLowerCase().includes(q) || current(e, "es").toLowerCase().includes(q) || current(e, "en").toLowerCase().includes(q))
      : (sections.find(([ns]) => ns === section)?.[1] ?? [])
    if (onlyModified) list = list.filter((e) => isModified(e, "es") || isModified(e, "en"))
    return list
  }, [catalog, sections, section, search, onlyModified, current, isModified])

  const set = (l: Locale, key: string, value: string) => setDraft((d) => ({ ...d, [l]: { ...d[l], [key]: value } }))

  async function save() {
    setSaving(true)
    try {
      const r = await api<{ overrides: Overrides }>("/api/admin/texts", { method: "PUT", json: { changes: dirtyChanges.map((c) => ({ locale: c.locale, key: c.key, value: c.value || null })) } })
      setSaved(r.overrides); setDraft({ es: {}, en: {} })
      toast("ok", `${dirtyChanges.length} cambio${dirtyChanges.length > 1 ? "s" : ""} publicado${dirtyChanges.length > 1 ? "s" : ""}. Ya se ven en el sitio.`)
    } catch (e) { toast("error", (e as Error).message) }
    finally { setSaving(false) }
  }

  async function translate(e: Entry) {
    setTranslating(e.key)
    try {
      const r = await api<{ translations: string[] }>("/api/admin/translate", { method: "POST", json: { texts: [current(e, "es")], target: "EN", preserveMarkup: true } })
      const t = r.translations[0] ?? ""
      set("en", e.key, t)
      toast("ok", "Traducción generada: revisala antes de publicar")
    } catch (err) { toast("error", (err as Error).message) }
    finally { setTranslating(null) }
  }

  if (loading) return <Spinner label="Cargando textos del sitio…" />

  const shown = visible.slice(0, MAX_RESULTS)

  return (
    <div>
      <div style={{ ...card, padding: "14px 18px", marginBottom: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 280px" }}>
          <Search size={15} aria-hidden style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar un texto en todo el sitio…" aria-label="Buscar textos" style={{ ...inputStyle, paddingLeft: 38 }} />
        </div>
        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14, color: "var(--text-strong)", cursor: "pointer" }}>
          <input type="checkbox" checked={onlyModified} onChange={(e) => setOnlyModified(e.target.checked)} style={{ width: 17, height: 17, accentColor: "var(--terra)" }} />
          Solo los que cambié
        </label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(190px, 230px) minmax(0, 1fr)", gap: 18, alignItems: "start" }} className="texts-grid">
        <nav aria-label="Secciones del sitio" style={{ ...card, padding: 8, position: "sticky", top: 80, display: "grid", gap: 2, maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
          {sections.map(([ns, entries]) => {
            const active = !search && ns === section
            const mod = modifiedCount(entries)
            return (
              <button key={ns} onClick={() => { setSection(ns); setSearch("") }} aria-current={active ? "true" : undefined}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, textAlign: "left", padding: "9px 12px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 14,
                  background: active ? "rgba(196,159,114,.16)" : "transparent", color: active ? "var(--gold-ink)" : "var(--text-strong)", fontWeight: active ? 600 : 400 }}>
                <span>{NAMESPACE_LABELS[ns] ?? ns}</span>
                <span style={{ fontSize: 12, color: "var(--text-faint)", whiteSpace: "nowrap" }}>
                  {mod > 0 && <strong style={{ color: "var(--terra)", marginRight: 6 }}>{mod}●</strong>}{entries.length}
                </span>
              </button>
            )
          })}
        </nav>

        <div style={{ minWidth: 0, paddingBottom: dirtyChanges.length ? 90 : 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
            <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 24, color: "var(--text)" }}>
              {search ? `Resultados para “${search}”` : NAMESPACE_LABELS[section] ?? section}
              <span style={{ fontSize: 14, color: "var(--text-faint)", marginLeft: 10, fontFamily: "var(--sans)" }}>{visible.length} texto{visible.length !== 1 ? "s" : ""}</span>
            </h2>
            {!search && SECTION_PAGE[section] && (
              <a href={SECTION_PAGE[section]} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "var(--gold-ink)", display: "inline-flex", gap: 6, alignItems: "center", fontWeight: 500 }}>
                <ExternalLink size={13} /> Ver esta página en el sitio
              </a>
            )}
          </div>
          {!deepl && <p style={{ fontSize: 13, color: "var(--text-faint)", marginBottom: 12, lineHeight: 1.6 }}>La traducción automática al inglés no está activada (falta la clave DEEPL_API_KEY). Podés escribir las dos versiones a mano.</p>}

          {shown.length === 0 ? (
            <EmptyState icon={<Languages size={28} />} title="No hay textos para mostrar" text={onlyModified ? "Todavía no cambiaste ningún texto en esta sección." : "Probá con otra búsqueda."} />
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {shown.map((e) => <EntryCard key={e.key} entry={e} current={current} original={original} isModified={isModified} set={set} deepl={deepl} translating={translating === e.key} onTranslate={() => translate(e)} showKey={!!search} />)}
              {visible.length > shown.length && <p style={{ fontSize: 13, color: "var(--text-faint)" }}>Se muestran los primeros {MAX_RESULTS}. Afiná la búsqueda para ver el resto.</p>}
            </div>
          )}
        </div>
      </div>

      {dirtyChanges.length > 0 && (
        <div role="region" aria-label="Cambios sin publicar" style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 120, display: "flex", justifyContent: "center", padding: "12px 16px", pointerEvents: "none" }}>
          <div style={{ pointerEvents: "auto", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between", width: "100%", maxWidth: 920, background: "var(--surface-solid)", border: "1px solid var(--gold-ink)", borderRadius: 14, padding: "12px 18px", boxShadow: "0 16px 50px rgba(0,0,0,.35)" }}>
            <span style={{ fontSize: 14, color: "var(--text)" }}>
              <strong>{dirtyChanges.length}</strong> cambio{dirtyChanges.length > 1 ? "s" : ""} sin publicar
              {invalid.length > 0 && <span style={{ color: "var(--danger)", marginLeft: 10 }}><AlertTriangle size={14} style={{ display: "inline", marginRight: 4, verticalAlign: "-2px" }} />{invalid.length} con errores</span>}
            </span>
            <span style={{ display: "flex", gap: 8 }}>
              <GhostButton onClick={() => setDraft({ es: {}, en: {} })} disabled={saving}>Descartar</GhostButton>
              <PrimaryButton icon={<Save size={15} />} loading={saving} disabled={invalid.length > 0} onClick={save}>Publicar cambios</PrimaryButton>
            </span>
          </div>
        </div>
      )}

      <style>{`@media (max-width: 860px){ .texts-grid{ grid-template-columns: minmax(0,1fr) !important } .texts-grid > nav{ position: static !important; max-height: none !important; grid-auto-flow: column; overflow-x: auto !important; grid-auto-columns: max-content } }`}</style>
    </div>
  )
}

type CardProps = {
  entry: Entry
  current: (e: Entry, l: Locale) => string
  original: (e: Entry, l: Locale) => string
  isModified: (e: Entry, l: Locale) => boolean
  set: (l: Locale, key: string, value: string) => void
  deepl: boolean
  translating: boolean
  onTranslate: () => void
  showKey: boolean
}

function EntryCard({ entry, current, original, isModified, set, deepl, translating, onTranslate, showKey }: CardProps) {
  const protectedParts = [...new Set([...placeholdersOf(entry.es ?? ""), ...tagsOf(entry.es ?? "")])]
  const anyModified = isModified(entry, "es") || isModified(entry, "en")
  return (
    <div style={{ ...card, padding: 16, borderColor: anyModified ? "rgba(196,159,114,.45)" : undefined }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
        <code style={{ fontSize: 12, color: "var(--text-faint)", wordBreak: "break-all" }}>{showKey ? entry.key : entry.key.split(".").slice(1).join(".")}</code>
        {protectedParts.length > 0 && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Conservar: <code>{protectedParts.join("  ")}</code></span>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
        {LOCALES.map(({ id, label }) => {
          const value = current(entry, id)
          const orig = original(entry, id)
          const modified = isModified(entry, id)
          const check = validateOverride(orig, value)
          const fieldId = `t-${id}-${entry.key}`
          return (
            <div key={id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 8 }}>
                <label htmlFor={fieldId} style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                  {label}{modified && <span style={{ color: "var(--terra)", marginLeft: 8, letterSpacing: 0, textTransform: "none" }}>● modificado</span>}
                </label>
                <span style={{ display: "flex", gap: 6 }}>
                  {id === "en" && deepl && (
                    <button onClick={onTranslate} disabled={translating} title="Traducir el español al inglés" style={miniBtn}><Languages size={12} /> {translating ? "Traduciendo…" : "Traducir"}</button>
                  )}
                  {modified && <button onClick={() => set(id, entry.key, orig)} title="Volver al texto original" style={miniBtn}><RotateCcw size={12} /> Original</button>}
                </span>
              </div>
              <textarea id={fieldId} value={value} rows={Math.min(12, Math.max(2, Math.ceil(value.length / 52)))} onChange={(e) => set(id, entry.key, e.target.value)}
                aria-invalid={!check.ok} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.55, borderColor: check.ok ? undefined : "var(--danger)" }} />
              {!check.ok && <p role="alert" style={{ fontSize: 12.5, color: "var(--danger)", marginTop: 6, lineHeight: 1.5 }}>{check.error}</p>}
              {modified && check.ok && orig !== value && (
                <details style={{ marginTop: 6 }}>
                  <summary style={{ fontSize: 12, color: "var(--text-faint)", cursor: "pointer" }}>Ver el texto original</summary>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.55 }}>{orig}</p>
                </details>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const miniBtn: React.CSSProperties = { display: "inline-flex", gap: 5, alignItems: "center", padding: "3px 9px", fontSize: 12, borderRadius: 7, border: "1px solid var(--border)", background: "transparent", color: "var(--text-strong)", cursor: "pointer" }
