"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AlertTriangle, Mail, RotateCcw, Save } from "lucide-react"
import { Field, GhostButton, PrimaryButton, Spinner, api, card, inputStyle, useToast } from "@/components/admin/ui"
import { buildEmailHtml } from "@/lib/email-html"
import { SAMPLE_VARS, missingRequired, renderTemplate, unknownPlaceholders, type EmailTemplate, type TemplateKey, type TemplateMeta } from "@/lib/email-templates"

type Item = TemplateMeta & { current: EmailTemplate }

export default function TemplatesTab() {
  const toast = useToast()
  const [items, setItems] = useState<Item[] | null>(null)
  const [emailOn, setEmailOn] = useState(true)
  const [active, setActive] = useState<TemplateKey>("welcome")
  const [draft, setDraft] = useState<EmailTemplate | null>(null)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  const load = () =>
    api<{ templates: Item[]; emailConfigured: boolean }>("/api/admin/email-templates", { cache: "no-store" })
      .then((d) => { setItems(d.templates); setEmailOn(d.emailConfigured) })
      .catch((e) => toast("error", (e as Error).message))
  useEffect(() => { load() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [])

  const item = items?.find((i) => i.key === active)
  useEffect(() => { if (item) setDraft({ ...item.current }) }, [item])

  const dirty = !!item && !!draft && (draft.subject !== item.current.subject || draft.body !== item.current.body || draft.enabled !== item.current.enabled)
  useEffect(() => {
    if (!dirty) return
    const h = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener("beforeunload", h)
    return () => window.removeEventListener("beforeunload", h)
  }, [dirty])

  const problems = useMemo(() => {
    if (!item || !draft) return []
    const out: string[] = []
    const unknown = [...new Set([...unknownPlaceholders(item.key, draft.subject), ...unknownPlaceholders(item.key, draft.body)])]
    if (unknown.length) out.push(`Variables que no existen en este correo: ${unknown.map((u) => `{${u}}`).join(", ")}`)
    const missing = missingRequired(item.key, draft.body)
    if (missing.length) out.push(`El texto tiene que incluir {${missing[0]}}.`)
    if (!draft.subject.trim()) out.push("Falta el asunto.")
    return out
  }, [item, draft])

  const preview = useMemo(() => {
    if (!draft || !item) return { subject: "", html: "" }
    const vars = item.key === "newsletter" ? { ...SAMPLE_VARS } : SAMPLE_VARS
    const text = renderTemplate(draft.body, vars)
    return {
      subject: renderTemplate(draft.subject, vars),
      html: buildEmailHtml(text, {
        preheader: text.slice(0, 100),
        ...(item.key === "newsletter" ? { unsubscribeUrl: "#" } : {}),
        ...(item.key === "enrollment" ? { cta: { label: "Entrar al aula", url: "#" } } : item.key === "certificate" ? { cta: { label: "Ver mi certificado", url: "#" } } : {}),
      }),
    }
  }, [draft, item])

  function insert(name: string) {
    const ta = bodyRef.current
    if (!ta || !draft) return
    const start = ta.selectionStart ?? draft.body.length, end = ta.selectionEnd ?? start
    const next = `${draft.body.slice(0, start)}{${name}}${draft.body.slice(end)}`
    setDraft({ ...draft, body: next })
    requestAnimationFrame(() => { ta.focus(); const pos = start + name.length + 2; ta.setSelectionRange(pos, pos) })
  }

  async function save() {
    if (!item || !draft) return
    setSaving(true)
    try {
      await api("/api/admin/email-templates", { method: "PUT", json: { key: item.key, subject: draft.subject, body: draft.body, ...(item.toggleable ? { enabled: draft.enabled } : {}) } })
      toast("ok", "Plantilla guardada")
      await load()
    } catch (e) { toast("error", (e as Error).message) }
    finally { setSaving(false) }
  }

  async function test() {
    if (!item || !draft) return
    setTesting(true)
    try {
      const r = await api<{ to: string }>("/api/admin/email-test", { method: "POST", json: { kind: "template", key: item.key, subject: draft.subject, body: draft.body } })
      toast("ok", `Prueba enviada a ${r.to} (con datos de ejemplo)`)
    } catch (e) { toast("error", (e as Error).message) }
    finally { setTesting(false) }
  }

  const switchTo = (key: TemplateKey) => {
    if (dirty && !window.confirm("Tenés cambios sin guardar en esta plantilla. ¿Descartarlos?")) return
    setActive(key)
  }

  if (!items || !item || !draft) return <Spinner label="Cargando plantillas…" />

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(200px, 260px) minmax(0, 1fr)", gap: 20, alignItems: "start" }} className="tpl-grid">
      <nav aria-label="Plantillas de correo" style={{ ...card, padding: 8, display: "grid", gap: 2 }}>
        {items.map((i) => {
          const on = i.key === active
          return (
            <button key={i.key} onClick={() => switchTo(i.key)} aria-current={on ? "true" : undefined}
              style={{ textAlign: "left", padding: "10px 12px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 14, background: on ? "rgba(196,159,114,.16)" : "transparent", color: on ? "var(--gold-ink)" : "var(--text-strong)", fontWeight: on ? 600 : 400 }}>
              {i.label}
              {i.toggleable && <span style={{ display: "block", fontSize: 12, fontWeight: 400, color: i.current.enabled ? "var(--success)" : "var(--text-faint)" }}>{i.current.enabled ? "Activado" : "Desactivado"}</span>}
            </button>
          )
        })}
      </nav>

      <div style={{ display: "grid", gap: 16, minWidth: 0 }}>
        <div>
          <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 24, color: "var(--text)", marginBottom: 6 }}>{item.label}</h2>
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>{item.when}</p>
        </div>

        {item.toggleable && (
          <label style={{ ...card, padding: "14px 18px", display: "flex", gap: 12, alignItems: "center", cursor: "pointer" }}>
            <input type="checkbox" checked={draft.enabled} onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })} style={{ width: 19, height: 19, accentColor: "var(--terra)" }} />
            <span>
              <strong style={{ color: "var(--text)", fontSize: 15 }}>Enviar este correo automáticamente</strong>
              <span style={{ display: "block", fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Mientras esté desactivado, no se manda nada.</span>
            </span>
          </label>
        )}

        <div style={{ ...card, padding: 20, display: "grid", gap: 14 }}>
          <Field label="Asunto" id="tpl-subject"><input id="tpl-subject" style={inputStyle} value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} /></Field>
          <div>
            <label htmlFor="tpl-body" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: 7 }}>Texto del correo</label>
            <textarea id="tpl-body" ref={bodyRef} rows={12} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65 }} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10, alignItems: "center" }}>
              <span style={{ fontSize: 12.5, color: "var(--text-faint)" }}>Insertar:</span>
              {item.placeholders.map((p) => (
                <button key={p.name} onClick={() => insert(p.name)} title={p.desc} style={{ padding: "4px 10px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text-strong)", fontSize: 12.5, cursor: "pointer", fontFamily: "monospace" }}>{`{${p.name}}`}</button>
              ))}
            </div>
          </div>
          {problems.length > 0 && (
            <div role="alert" style={{ display: "flex", gap: 10, padding: "10px 14px", borderRadius: 10, background: "var(--danger-soft)", color: "var(--danger)", fontSize: 14, lineHeight: 1.5 }}>
              <AlertTriangle size={17} style={{ flexShrink: 0, marginTop: 2 }} /><div>{problems.map((p) => <p key={p}>{p}</p>)}</div>
            </div>
          )}
        </div>

        <div>
          <p style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>Vista previa (con datos de ejemplo)</p>
          <div style={{ ...card, overflow: "hidden" }}>
            <p style={{ padding: "10px 16px", fontSize: 14, color: "var(--text-strong)", borderBottom: "1px solid var(--border)" }}><strong>Asunto:</strong> {preview.subject}</p>
            <iframe title="Vista previa del correo" sandbox="" srcDoc={preview.html} style={{ width: "100%", height: 460, border: "none", background: "#F4EBE4", display: "block" }} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <GhostButton icon={<RotateCcw size={14} />} onClick={() => setDraft({ ...draft, subject: item.defaults.subject, body: item.defaults.body, enabled: item.toggleable ? item.defaults.enabled : true })} disabled={saving}>Volver al texto original</GhostButton>
          <GhostButton icon={<Mail size={14} />} loading={testing} onClick={test} disabled={!emailOn || problems.length > 0}>Enviarme una prueba</GhostButton>
          <PrimaryButton icon={<Save size={15} />} loading={saving} disabled={!dirty || problems.length > 0} onClick={save}>Guardar plantilla</PrimaryButton>
        </div>
        {!emailOn && <p style={{ fontSize: 13, color: "var(--warning)" }}>El envío de correos no está configurado (falta RESEND_API_KEY): las plantillas se guardan, pero no se enviará nada.</p>}
      </div>
      <style>{`@media (max-width: 860px){ .tpl-grid{ grid-template-columns: minmax(0,1fr) !important } }`}</style>
    </div>
  )
}
