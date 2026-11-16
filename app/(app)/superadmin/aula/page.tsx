"use client"

import { useCallback, useEffect, useState } from "react"
import { ArrowDown, ArrowUp, Plus, RotateCcw, Save, Trash2 } from "lucide-react"
import { ConfirmDialog, Field, GhostButton, PageHeader, PrimaryButton, Spinner, ToastProvider, api, card, hintStyle, inputStyle, useToast } from "@/components/admin/ui"
import { DEFAULT_AULA_CONFIG, type AulaConfig } from "@/lib/aula-config"
import { DEFAULT_JEWGALKIDS, type JewgalkidsContent } from "@/lib/jewgalkids-config"
import type { BreathingPattern, Posture, ValueCard } from "@/lib/jewgalkids-content"

type Tab = "textos" | "joogalkids"
type JkTab = "breathing" | "postures" | "values"

const iconBtn: React.CSSProperties = { width: 32, height: 32, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "none", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", color: "var(--text-muted)" }

function Inner() {
  const toast = useToast()
  const [tab, setTab] = useState<Tab>("textos")
  const [loading, setLoading] = useState(true)
  const [cfg, setCfg] = useState<AulaConfig>(DEFAULT_AULA_CONFIG)
  const [cfgSaved, setCfgSaved] = useState(JSON.stringify(DEFAULT_AULA_CONFIG))
  const [jk, setJk] = useState<JewgalkidsContent>(DEFAULT_JEWGALKIDS)
  const [jkSaved, setJkSaved] = useState(JSON.stringify(DEFAULT_JEWGALKIDS))
  const [customized, setCustomized] = useState(false)
  const [jkTab, setJkTab] = useState<JkTab>("breathing")
  const [saving, setSaving] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const load = useCallback(async () => {
    try {
      const [c, j] = await Promise.all([api<{ config: AulaConfig }>("/api/admin/aula/config", { cache: "no-store" }), api<{ content: JewgalkidsContent; customized: boolean }>("/api/admin/aula/jewgalkids", { cache: "no-store" })])
      setCfg(c.config); setCfgSaved(JSON.stringify(c.config)); setJk(j.content); setJkSaved(JSON.stringify(j.content)); setCustomized(j.customized)
    } catch (e) { toast("error", (e as Error).message) }
    finally { setLoading(false) }
  }, [toast])
  useEffect(() => { load() }, [load])

  const cfgDirty = JSON.stringify(cfg) !== cfgSaved
  const jkDirty = JSON.stringify(jk) !== jkSaved
  useEffect(() => {
    if (!cfgDirty && !jkDirty) return
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = "" }
    window.addEventListener("beforeunload", h)
    return () => window.removeEventListener("beforeunload", h)
  }, [cfgDirty, jkDirty])

  async function saveCfg() {
    setSaving(true)
    try { const r = await api<{ config: AulaConfig }>("/api/admin/aula/config", { method: "PUT", json: { config: cfg } }); setCfg(r.config); setCfgSaved(JSON.stringify(r.config)); toast("ok", "Textos del aula guardados") }
    catch (e) { toast("error", (e as Error).message) }
    finally { setSaving(false) }
  }
  async function saveJk() {
    setSaving(true)
    try { const r = await api<{ content: JewgalkidsContent }>("/api/admin/aula/jewgalkids", { method: "PUT", json: { content: jk } }); setJk(r.content); setJkSaved(JSON.stringify(r.content)); setCustomized(true); toast("ok", "Contenido de Joogalkids guardado") }
    catch (e) { toast("error", (e as Error).message) }
    finally { setSaving(false) }
  }
  async function resetJk() {
    try { await api("/api/admin/aula/jewgalkids", { method: "DELETE" }); toast("ok", "Se restauró el contenido original"); setConfirmReset(false); await load() }
    catch (e) { toast("error", (e as Error).message) }
  }

  if (loading) return <Spinner />
  const setText = (k: keyof AulaConfig["texts"], v: string) => setCfg({ ...cfg, texts: { ...cfg.texts, [k]: v } })
  const move = <T,>(list: T[], i: number, d: -1 | 1): T[] => { const j = i + d; if (j < 0 || j >= list.length) return list; const n = [...list]; [n[i], n[j]] = [n[j], n[i]]; return n }

  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <PageHeader eyebrow="Aula" title="Contenido del aula" subtitle="Los textos de bienvenida, los niveles y logros que ven los alumnos, y el contenido de las herramientas de Joogalkids." />
      <div role="tablist" aria-label="Secciones" style={{ display: "flex", gap: 8, marginBottom: 22 }}>
        {([["textos", "Textos, niveles y logros"], ["joogalkids", "Joogalkids"]] as [Tab, string][]).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} type="button" onClick={() => setTab(k)} style={{ padding: "8px 18px", borderRadius: 20, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit", border: `1px solid ${tab === k ? "var(--gold-ink)" : "var(--border)"}`, background: tab === k ? "color-mix(in srgb, var(--gold-ink) 14%, transparent)" : "transparent", color: tab === k ? "var(--gold-ink)" : "var(--text-muted)" }}>{l}</button>
        ))}
      </div>

      {tab === "textos" && (
        <div style={{ display: "grid", gap: 18 }}>
          <div style={{ ...card, padding: "18px 20px", display: "grid", gap: 12 }}>
            <h2 style={{ fontSize: 13, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold-ink)" }}>Encabezado del aula</h2>
            <div className="admin-form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Texto sobre el título" id="au-eyebrow"><input id="au-eyebrow" value={cfg.texts.eyebrow} onChange={(e) => setText("eyebrow", e.target.value)} style={inputStyle} /></Field>
              <Field label="Saludo con el nombre" id="au-greet" hint="Se arma «Saludo + nombre»."><input id="au-greet" value={cfg.texts.greeting} onChange={(e) => setText("greeting", e.target.value)} style={inputStyle} /></Field>
              <Field label="Título sin nombre · parte 1" id="au-w1"><input id="au-w1" value={cfg.texts.welcome1} onChange={(e) => setText("welcome1", e.target.value)} style={inputStyle} /></Field>
              <Field label="Título sin nombre · parte destacada" id="au-w2"><input id="au-w2" value={cfg.texts.welcome2} onChange={(e) => setText("welcome2", e.target.value)} style={inputStyle} /></Field>
            </div>
            <Field label="Frase debajo del título" id="au-sub"><input id="au-sub" value={cfg.texts.subtitle} onChange={(e) => setText("subtitle", e.target.value)} style={inputStyle} /></Field>
          </div>

          <div style={{ ...card, padding: "18px 20px", display: "grid", gap: 10 }}>
            <h2 style={{ fontSize: 13, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold-ink)" }}>Niveles</h2>
            <p style={{ ...hintStyle, marginTop: 0 }}>Cada alumno ve su nivel según el avance de su programa. Cambiá los nombres (por ejemplo, para que no sean en femenino) o desde qué % arranca cada nivel. El primero empieza en 0 % y el último en 100 %.</p>
            {cfg.levels.map((l, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ width: 22, color: "var(--text-faint)", fontSize: 13 }}>{i + 1}.</span>
                <input aria-label={`Nombre del nivel ${i + 1}`} value={l.name} maxLength={40} onChange={(e) => setCfg({ ...cfg, levels: cfg.levels.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x)) })} style={inputStyle} />
                <span style={{ fontSize: 13, color: "var(--text-muted)", whiteSpace: "nowrap" }}>desde</span>
                <input aria-label={`Porcentaje inicial del nivel ${i + 1}`} type="number" min={0} max={100} disabled={i === 0 || i === 4} value={l.min} onChange={(e) => setCfg({ ...cfg, levels: cfg.levels.map((x, idx) => (idx === i ? { ...x, min: Number(e.target.value) } : x)) })} style={{ ...inputStyle, width: 90, opacity: i === 0 || i === 4 ? 0.6 : 1 }} />
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>%</span>
              </div>
            ))}
          </div>

          <div style={{ ...card, padding: "18px 20px", display: "grid", gap: 10 }}>
            <h2 style={{ fontSize: 13, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold-ink)" }}>Logros</h2>
            <p style={{ ...hintStyle, marginTop: 0 }}>El nombre y la descripción de cada logro. Las condiciones para desbloquearlos son fijas.</p>
            {Object.entries(cfg.achievements).map(([id, a]) => (
              <div key={id} className="admin-form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
                <input aria-label={`Nombre del logro ${id}`} value={a.label} maxLength={40} onChange={(e) => setCfg({ ...cfg, achievements: { ...cfg.achievements, [id]: { ...a, label: e.target.value } } })} style={inputStyle} />
                <input aria-label={`Descripción del logro ${id}`} value={a.desc} maxLength={120} onChange={(e) => setCfg({ ...cfg, achievements: { ...cfg.achievements, [id]: { ...a, desc: e.target.value } } })} style={inputStyle} />
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <PrimaryButton icon={<Save size={15} />} loading={saving} disabled={!cfgDirty} onClick={saveCfg}>Guardar</PrimaryButton>
            <GhostButton icon={<RotateCcw size={14} />} onClick={() => setCfg(DEFAULT_AULA_CONFIG)}>Volver a los originales</GhostButton>
            {cfgDirty && <span style={{ fontSize: 13, color: "var(--gold-ink)" }}>● Cambios sin guardar</span>}
          </div>
        </div>
      )}

      {tab === "joogalkids" && (
        <div style={{ display: "grid", gap: 16 }}>
          <p style={{ ...hintStyle, marginTop: 0 }}>Es el contenido de las herramientas del curso Joogalkids (respiración, posturas y valores). {customized ? "Está personalizado." : "Hoy se ve el contenido original."} Los cambios se ven en el aula al guardar.</p>
          <div role="tablist" aria-label="Herramientas" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {([["breathing", `Respiración (${jk.breathing.length})`], ["postures", `Posturas (${jk.postures.length})`], ["values", `Valores (${jk.values.length})`]] as [JkTab, string][]).map(([k, l]) => (
              <button key={k} role="tab" aria-selected={jkTab === k} type="button" onClick={() => setJkTab(k)} style={{ padding: "6px 16px", borderRadius: 18, fontSize: 13, cursor: "pointer", fontFamily: "inherit", border: `1px solid ${jkTab === k ? "var(--gold-ink)" : "var(--border)"}`, background: "transparent", color: jkTab === k ? "var(--gold-ink)" : "var(--text-muted)" }}>{l}</button>
            ))}
          </div>

          {jkTab === "breathing" && jk.breathing.map((b, i) => (
            <Item key={b.id + i} title={b.name || "Nuevo patrón"} onUp={() => setJk({ ...jk, breathing: move(jk.breathing, i, -1) })} onDown={() => setJk({ ...jk, breathing: move(jk.breathing, i, 1) })} onDelete={() => setJk({ ...jk, breathing: jk.breathing.filter((_, x) => x !== i) })} first={i === 0} last={i === jk.breathing.length - 1}>
              <Field label="Nombre" id={`br-n-${i}`}><input id={`br-n-${i}`} value={b.name} onChange={(e) => setJk({ ...jk, breathing: jk.breathing.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)) })} style={inputStyle} /></Field>
              <Field label="Descripción" id={`br-d-${i}`}><textarea id={`br-d-${i}`} rows={2} value={b.description} onChange={(e) => setJk({ ...jk, breathing: jk.breathing.map((x, k) => (k === i ? { ...x, description: e.target.value } : x)) })} style={{ ...inputStyle, resize: "vertical" }} /></Field>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }} className="admin-form-grid-2">
                {(["inhale", "hold", "exhale"] as const).map((f) => (
                  <Field key={f} label={f === "inhale" ? "Inhalar (s)" : f === "hold" ? "Sostener (s)" : "Exhalar (s)"} id={`br-${f}-${i}`}><input id={`br-${f}-${i}`} type="number" min={0} max={30} value={b[f]} onChange={(e) => setJk({ ...jk, breathing: jk.breathing.map((x, k) => (k === i ? { ...x, [f]: Number(e.target.value) } : x)) })} style={inputStyle} /></Field>
                ))}
                <Field label="Animación" id={`br-v-${i}`}><select id={`br-v-${i}`} value={b.visual} onChange={(e) => setJk({ ...jk, breathing: jk.breathing.map((x, k) => (k === i ? { ...x, visual: e.target.value as BreathingPattern["visual"] } : x)) })} style={{ ...inputStyle, cursor: "pointer" }}><option value="circle">Círculo</option><option value="balloon">Globo</option></select></Field>
              </div>
            </Item>
          ))}
          {jkTab === "breathing" && <GhostButton icon={<Plus size={14} />} onClick={() => setJk({ ...jk, breathing: [...jk.breathing, { id: `nuevo-${Date.now().toString(36)}`, name: "", description: "", inhale: 4, hold: 0, exhale: 4, visual: "circle" }] })}>Agregar patrón</GhostButton>}

          {jkTab === "postures" && jk.postures.map((p, i) => (
            <Item key={p.id + i} title={`${i + 1}. ${p.nameGeneral || "Nueva postura"}`} onUp={() => setJk({ ...jk, postures: move(jk.postures, i, -1) })} onDown={() => setJk({ ...jk, postures: move(jk.postures, i, 1) })} onDelete={() => setJk({ ...jk, postures: jk.postures.filter((_, x) => x !== i) })} first={i === 0} last={i === jk.postures.length - 1}>
              <div className="admin-form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="Nombre" id={`po-n-${i}`}><input id={`po-n-${i}`} value={p.nameGeneral} onChange={(e) => setJk({ ...jk, postures: jk.postures.map((x, k) => (k === i ? { ...x, nameGeneral: e.target.value } : x)) })} style={inputStyle} /></Field>
                <Field label="Nombre en hebreo / letra" id={`po-h-${i}`}><input id={`po-h-${i}`} value={p.nameHebrew} onChange={(e) => setJk({ ...jk, postures: jk.postures.map((x, k) => (k === i ? { ...x, nameHebrew: e.target.value } : x)) })} style={inputStyle} /></Field>
              </div>
              {([["instructions", "Cómo se hace"], ["variations", "Variaciones"], ["spiritualGeneral", "Sentido espiritual"], ["spiritualHebrew", "Sentido espiritual (versión hebreo)"]] as [keyof Posture, string][]).map(([f, l]) => (
                <Field key={f} label={l} id={`po-${f}-${i}`}><textarea id={`po-${f}-${i}`} rows={3} value={String(p[f])} onChange={(e) => setJk({ ...jk, postures: jk.postures.map((x, k) => (k === i ? { ...x, [f]: e.target.value } : x)) })} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} /></Field>
              ))}
            </Item>
          ))}
          {jkTab === "postures" && <GhostButton icon={<Plus size={14} />} onClick={() => setJk({ ...jk, postures: [...jk.postures, { id: `nueva-${Date.now().toString(36)}`, order: jk.postures.length + 1, nameGeneral: "", nameHebrew: "", instructions: "", variations: "", spiritualGeneral: "", spiritualHebrew: "" }] })}>Agregar postura</GhostButton>}

          {jkTab === "values" && jk.values.map((v, i) => (
            <Item key={v.id + i} title={v.name || "Nuevo valor"} onUp={() => setJk({ ...jk, values: move(jk.values, i, -1) })} onDown={() => setJk({ ...jk, values: move(jk.values, i, 1) })} onDelete={() => setJk({ ...jk, values: jk.values.filter((_, x) => x !== i) })} first={i === 0} last={i === jk.values.length - 1}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10 }} className="admin-form-grid-3">
                <Field label="Nombre" id={`va-n-${i}`}><input id={`va-n-${i}`} value={v.name} onChange={(e) => setJk({ ...jk, values: jk.values.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)) })} style={inputStyle} /></Field>
                <Field label="Color" id={`va-c-${i}`}><input id={`va-c-${i}`} type="color" value={v.color} onChange={(e) => setJk({ ...jk, values: jk.values.map((x, k) => (k === i ? { ...x, color: e.target.value } : x)) })} style={{ ...inputStyle, padding: 3, height: 40 }} /></Field>
                <Field label="Fondo" id={`va-b-${i}`}><input id={`va-b-${i}`} type="color" value={v.bg} onChange={(e) => setJk({ ...jk, values: jk.values.map((x, k) => (k === i ? { ...x, bg: e.target.value } : x)) })} style={{ ...inputStyle, padding: 3, height: 40 }} /></Field>
              </div>
              <Field label="Descripción" id={`va-d-${i}`}><textarea id={`va-d-${i}`} rows={2} value={v.description} onChange={(e) => setJk({ ...jk, values: jk.values.map((x, k) => (k === i ? { ...x, description: e.target.value } : x)) })} style={{ ...inputStyle, resize: "vertical" }} /></Field>
            </Item>
          ))}
          {jkTab === "values" && <GhostButton icon={<Plus size={14} />} onClick={() => setJk({ ...jk, values: [...jk.values, { id: `nuevo-${Date.now().toString(36)}`, name: "", color: "#A58D66", bg: "#F3E8D6", description: "" } as ValueCard] })}>Agregar valor</GhostButton>}

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginTop: 8 }}>
            <PrimaryButton icon={<Save size={15} />} loading={saving} disabled={!jkDirty} onClick={saveJk}>Guardar</PrimaryButton>
            {customized && <GhostButton icon={<RotateCcw size={14} />} onClick={() => setConfirmReset(true)}>Volver al contenido original</GhostButton>}
            {jkDirty && <span style={{ fontSize: 13, color: "var(--gold-ink)" }}>● Cambios sin guardar</span>}
          </div>
        </div>
      )}

      {confirmReset && <ConfirmDialog title="Volver al contenido original" confirmLabel="Restaurar" danger text="Se descartan todos los cambios hechos al contenido de Joogalkids y vuelve el original." onConfirm={resetJk} onCancel={() => setConfirmReset(false)} />}
    </div>
  )
}

function Item({ title, children, onUp, onDown, onDelete, first, last }: { title: string; children: React.ReactNode; onUp: () => void; onDown: () => void; onDelete: () => void; first: boolean; last: boolean }) {
  return (
    <div style={{ ...card, padding: "14px 18px", display: "grid", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <strong style={{ flex: 1, fontSize: 14.5, color: "var(--text)", minWidth: 0, overflowWrap: "anywhere" }}>{title}</strong>
        <button type="button" onClick={onUp} disabled={first} aria-label="Subir" style={{ ...iconBtn, opacity: first ? 0.35 : 1 }}><ArrowUp size={14} /></button>
        <button type="button" onClick={onDown} disabled={last} aria-label="Bajar" style={{ ...iconBtn, opacity: last ? 0.35 : 1 }}><ArrowDown size={14} /></button>
        <button type="button" onClick={onDelete} aria-label="Quitar" style={{ ...iconBtn, color: "var(--danger)" }}><Trash2 size={14} /></button>
      </div>
      {children}
    </div>
  )
}

export default function AulaAdminPage() { return <ToastProvider><Inner /></ToastProvider> }
