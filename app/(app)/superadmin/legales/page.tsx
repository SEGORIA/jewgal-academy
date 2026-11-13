"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ArrowDown, ArrowUp, CalendarDays, ExternalLink, ListOrdered, Plus, RotateCcw, Save, Trash2 } from "lucide-react"
import { ConfirmDialog, Field, GhostButton, PageHeader, PrimaryButton, Spinner, ToastProvider, api, card, inputStyle, useToast } from "@/components/admin/ui"
import type { LegalContent, LegalDoc, LegalLocale } from "@/lib/legal-defaults"

const DOCS: { doc: LegalDoc; label: string; path: string }[] = [
  { doc: "terminos", label: "Términos de uso", path: "/terminos" },
  { doc: "privacidad", label: "Política de privacidad", path: "/politica-privacidad" },
]
const LOCALES: { id: LegalLocale; label: string }[] = [{ id: "es", label: "Español" }, { id: "en", label: "English" }]

type Loaded = { content: Record<LegalLocale, LegalContent>; customized: Record<LegalLocale, boolean>; defaults: Record<LegalLocale, LegalContent> }

const MONTHS = {
  es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
}
const todayLabel = (loc: LegalLocale) => {
  const d = new Date()
  return loc === "es" ? `Última actualización: ${d.getDate()} de ${MONTHS.es[d.getMonth()]} de ${d.getFullYear()}` : `Last updated: ${MONTHS.en[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

function Inner() {
  const toast = useToast()
  const [doc, setDoc] = useState<LegalDoc>("terminos")
  const [loc, setLoc] = useState<LegalLocale>("es")
  const [data, setData] = useState<Loaded | null>(null)
  const [draft, setDraft] = useState<LegalContent | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmSwitch, setConfirmSwitch] = useState<null | (() => void)>(null)

  const load = useCallback(async (d: LegalDoc) => {
    setData(null)
    try {
      const r = await api<Loaded>(`/api/admin/legal?doc=${d}`, { cache: "no-store" })
      setData(r)
    } catch (e) { toast("error", (e as Error).message) }
  }, [toast])
  useEffect(() => { load(doc) }, [doc, load])
  useEffect(() => { if (data) setDraft(structuredClone(data.content[loc])) }, [data, loc])

  const dirty = useMemo(() => !!data && !!draft && JSON.stringify(draft) !== JSON.stringify(data.content[loc]), [data, draft, loc])
  useEffect(() => {
    if (!dirty) return
    const h = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener("beforeunload", h)
    return () => window.removeEventListener("beforeunload", h)
  }, [dirty])

  const guarded = (fn: () => void) => { if (dirty) setConfirmSwitch(() => fn); else fn() }

  if (!data || !draft) return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <PageHeader eyebrow="Sitio público" title="Páginas legales" />
      <Spinner />
    </div>
  )

  const set = (patch: Partial<LegalContent>) => setDraft((d) => d && ({ ...d, ...patch }))
  const setSection = (i: number, patch: Partial<LegalContent["sections"][number]>) => setDraft((d) => d && ({ ...d, sections: d.sections.map((s, j) => (j === i ? { ...s, ...patch } : s)) }))
  const move = (i: number, dir: -1 | 1) => setDraft((d) => {
    if (!d) return d
    const j = i + dir
    if (j < 0 || j >= d.sections.length) return d
    const next = [...d.sections]; [next[i], next[j]] = [next[j], next[i]]
    return { ...d, sections: next }
  })
  const renumber = () => setDraft((d) => d && ({ ...d, sections: d.sections.map((s, i) => ({ ...s, title: `${i + 1}. ${s.title.replace(/^\s*\d+\s*[.)-]\s*/, "")}` })) }))

  async function save() {
    if (!draft) return
    setSaving(true)
    try {
      await api("/api/admin/legal", { method: "PUT", json: { doc, locale: loc, content: draft } })
      toast("ok", "Página guardada. Ya está publicada en el sitio.")
      await load(doc)
    } catch (e) { toast("error", (e as Error).message) }
    finally { setSaving(false) }
  }

  async function resetToOriginal() {
    setSaving(true)
    try {
      await api("/api/admin/legal", { method: "PUT", json: { doc, locale: loc, content: null } })
      toast("ok", "Se restauró el texto original")
      setConfirmReset(false)
      await load(doc)
    } catch (e) { toast("error", (e as Error).message) }
    finally { setSaving(false) }
  }

  const current = DOCS.find((d) => d.doc === doc)!
  const publicUrl = `${loc === "en" ? "/en" : ""}${current.path}`

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", paddingBottom: dirty ? 90 : 0 }}>
      <PageHeader
        eyebrow="Sitio público" title="Páginas legales"
        subtitle="Editá los Términos de uso y la Política de privacidad. Cada idioma se guarda por separado. Antes de publicar cambios de fondo conviene que los revise quien asesora legalmente a la academia."
        actions={<a href={publicUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}><GhostButton type="button" icon={<ExternalLink size={14} />}>Ver página publicada</GhostButton></a>}
      />

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "space-between", marginBottom: 18 }}>
        <div role="tablist" aria-label="Documento" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {DOCS.map((d) => (
            <button key={d.doc} role="tab" aria-selected={doc === d.doc} onClick={() => guarded(() => setDoc(d.doc))}
              style={pill(doc === d.doc)}>{d.label}</button>
          ))}
        </div>
        <div role="tablist" aria-label="Idioma" style={{ display: "flex", gap: 6 }}>
          {LOCALES.map((l) => (
            <button key={l.id} role="tab" aria-selected={loc === l.id} onClick={() => guarded(() => setLoc(l.id))} style={pill(loc === l.id)}>
              {l.label}{data.customized[l.id] && <span title="Editado" style={{ color: "var(--terra)", marginLeft: 6 }}>●</span>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ ...card, padding: 20, display: "grid", gap: 16, marginBottom: 18 }}>
        <p style={{ fontFamily: "var(--serif)", fontSize: 19, color: "var(--text)" }}>Encabezado</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
          <Field label="Título · línea 1" id="lg-t1"><input id="lg-t1" style={inputStyle} value={draft.title1} onChange={(e) => set({ title1: e.target.value })} /></Field>
          <Field label="Título · línea 2 (resaltada)" id="lg-t2"><input id="lg-t2" style={inputStyle} value={draft.title2} onChange={(e) => set({ title2: e.target.value })} /></Field>
        </div>
        <Field label="Fecha de última actualización" id="lg-up" hint="Se muestra debajo del título. Actualizala cada vez que hagas un cambio de fondo.">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input id="lg-up" style={{ ...inputStyle, flex: "1 1 280px" }} value={draft.updated} onChange={(e) => set({ updated: e.target.value })} />
            <GhostButton type="button" icon={<CalendarDays size={14} />} onClick={() => set({ updated: todayLabel(loc) })}>Poner fecha de hoy</GhostButton>
          </div>
        </Field>
        <Field label="Introducción" id="lg-intro"><textarea id="lg-intro" rows={4} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} value={draft.intro} onChange={(e) => set({ intro: e.target.value })} /></Field>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <p style={{ fontFamily: "var(--serif)", fontSize: 19, color: "var(--text)" }}>Secciones <span style={{ fontSize: 14, color: "var(--text-faint)", fontFamily: "var(--sans)" }}>{draft.sections.length}</span></p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <GhostButton icon={<ListOrdered size={14} />} onClick={renumber} title="Vuelve a numerar los títulos: 1., 2., 3.…">Renumerar títulos</GhostButton>
          <GhostButton icon={<Plus size={14} />} onClick={() => set({ sections: [...draft.sections, { title: `${draft.sections.length + 1}. `, content: "" }] })}>Agregar sección</GhostButton>
        </div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {draft.sections.map((s, i) => (
          <div key={i} style={{ ...card, padding: 16, display: "grid", gap: 12 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div style={{ display: "grid", gap: 2 }}>
                <button aria-label="Subir sección" disabled={i === 0} onClick={() => move(i, -1)} style={arrow(i === 0)}><ArrowUp size={14} /></button>
                <button aria-label="Bajar sección" disabled={i === draft.sections.length - 1} onClick={() => move(i, 1)} style={arrow(i === draft.sections.length - 1)}><ArrowDown size={14} /></button>
              </div>
              <div style={{ flex: 1 }}>
                <Field label={`Título de la sección ${i + 1}`} id={`lg-s${i}-t`}><input id={`lg-s${i}-t`} style={inputStyle} value={s.title} onChange={(e) => setSection(i, { title: e.target.value })} /></Field>
              </div>
              <button aria-label={`Eliminar la sección ${i + 1}`} title="Eliminar sección" onClick={() => set({ sections: draft.sections.filter((_, j) => j !== i) })}
                style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", padding: 9, display: "flex" }}><Trash2 size={16} /></button>
            </div>
            <Field label="Contenido" id={`lg-s${i}-c`} hint="Separá los párrafos con una línea en blanco. Para listas, empezá cada línea con “•”.">
              <textarea id={`lg-s${i}-c`} rows={Math.min(16, Math.max(4, Math.ceil(s.content.length / 80) + s.content.split("\n").length))} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65 }} value={s.content} onChange={(e) => setSection(i, { content: e.target.value })} />
            </Field>
          </div>
        ))}
      </div>

      <div style={{ ...card, padding: 18, marginTop: 18, marginBottom: 8 }}>
        <p style={{ fontFamily: "var(--serif)", fontSize: 19, color: "var(--text)", marginBottom: 14 }}>Recuadro de contacto (al final de la página)</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          <Field label="Frase" id="lg-q"><input id="lg-q" style={inputStyle} value={draft.questions} onChange={(e) => set({ questions: e.target.value })} /></Field>
          <Field label="Correo de contacto" id="lg-em" hint="Si lo cambiás, revisá también que coincida con los correos que aparecen dentro de las secciones."><input id="lg-em" type="email" style={inputStyle} value={draft.email} onChange={(e) => set({ email: e.target.value })} /></Field>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
        <GhostButton icon={<RotateCcw size={14} />} disabled={!data.customized[loc] || saving} onClick={() => setConfirmReset(true)}>Restaurar el texto original ({loc === "es" ? "español" : "inglés"})</GhostButton>
      </div>

      {dirty && (
        <div role="region" aria-label="Cambios sin guardar" style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 120, display: "flex", justifyContent: "center", padding: "12px 16px", pointerEvents: "none" }}>
          <div style={{ pointerEvents: "auto", display: "flex", gap: 14, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", width: "100%", maxWidth: 900, background: "var(--surface-solid)", border: "1px solid var(--gold-ink)", borderRadius: 14, padding: "12px 18px", boxShadow: "0 16px 50px rgba(0,0,0,.35)" }}>
            <span style={{ fontSize: 14, color: "var(--text)" }}>Cambios sin guardar en {current.label} ({loc === "es" ? "español" : "inglés"})</span>
            <span style={{ display: "flex", gap: 8 }}>
              <GhostButton onClick={() => setDraft(structuredClone(data.content[loc]))} disabled={saving}>Descartar</GhostButton>
              <PrimaryButton icon={<Save size={15} />} loading={saving} onClick={save}>Guardar y publicar</PrimaryButton>
            </span>
          </div>
        </div>
      )}

      {confirmReset && (
        <ConfirmDialog danger title="Restaurar el texto original" confirmLabel="Restaurar" busy={saving} onCancel={() => setConfirmReset(false)} onConfirm={resetToOriginal}
          text="Se descartan todas las ediciones de este documento en este idioma y vuelve el texto con el que se publicó el sitio. El cambio queda registrado en el Historial." />
      )}
      {confirmSwitch && (
        <ConfirmDialog title="Hay cambios sin guardar" confirmLabel="Descartar y cambiar" onCancel={() => setConfirmSwitch(null)}
          onConfirm={() => { const fn = confirmSwitch; setConfirmSwitch(null); fn() }}
          text="Si cambiás de documento o de idioma ahora, se pierden las modificaciones que no guardaste." />
      )}
    </div>
  )
}

const pill = (on: boolean): React.CSSProperties => ({
  padding: "8px 16px", borderRadius: 999, fontSize: 14, cursor: "pointer", fontWeight: on ? 600 : 500,
  border: `1px solid ${on ? "var(--gold-ink)" : "var(--border)"}`, background: on ? "rgba(196,159,114,.14)" : "transparent", color: on ? "var(--gold-ink)" : "var(--text-muted)",
})
const arrow = (disabled: boolean): React.CSSProperties => ({ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: 6, padding: 4, display: "flex", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.35 : 1 })

export default function LegalesPage() { return <ToastProvider><Inner /></ToastProvider> }
