"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Download, Mail, Plus, Search, Send, Trash2, UserMinus } from "lucide-react"
import { ConfirmDialog, EmptyState, Field, GhostButton, Modal, PrimaryButton, Spinner, api, card, inputStyle, useToast } from "@/components/admin/ui"

type Subscriber = { email: string; date: string }
type Campaign = { id: string; title: string; recipients: number; emailsSent: number; emailsFailed: number; createdByName: string | null; createdAt: string }

const when = (iso: string) => new Date(iso).toLocaleString("es", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
const csvCell = (v: string) => `"${v.replace(/"/g, '""')}"`

export default function NewsletterTab() {
  const toast = useToast()
  const [subs, setSubs] = useState<Subscriber[] | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [emailOn, setEmailOn] = useState(true)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [adding, setAdding] = useState(false)
  const [addText, setAddText] = useState("")
  const [adBusy, setAdBusy] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [removeBusy, setRemoveBusy] = useState(false)

  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [ctaLabel, setCtaLabel] = useState("")
  const [ctaUrl, setCtaUrl] = useState("")
  const [confirm, setConfirm] = useState(false)
  const [sending, setSending] = useState(false)
  const [testing, setTesting] = useState(false)

  const load = useCallback(async () => {
    try {
      const d = await api<{ subscribers: Subscriber[]; campaigns: Campaign[]; emailConfigured: boolean }>("/api/admin/newsletter", { cache: "no-store" })
      setSubs(d.subscribers); setCampaigns(d.campaigns); setEmailOn(d.emailConfigured)
    } catch (e) { toast("error", (e as Error).message) }
  }, [toast])
  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (subs ?? []).filter((s) => !q || s.email.includes(q)).sort((a, b) => b.date.localeCompare(a.date))
  }, [subs, search])

  const allVisibleSelected = filtered.length > 0 && filtered.every((s) => selected.includes(s.email))
  const toggleAll = () => setSelected((sel) => (allVisibleSelected ? sel.filter((e) => !filtered.some((s) => s.email === e)) : [...new Set([...sel, ...filtered.map((s) => s.email)])]))

  function exportCsv() {
    const rows = [["Email", "Fecha de suscripción"], ...(subs ?? []).map((s) => [s.email, s.date.slice(0, 10)])]
    const csv = "﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
    const a = document.createElement("a"); a.href = url; a.download = "newsletter-suscriptores.csv"; a.click(); URL.revokeObjectURL(url)
  }

  async function addSubs() {
    const emails = addText.split(/[\s,;]+/).map((e) => e.trim()).filter(Boolean)
    if (!emails.length) return
    setAdBusy(true)
    try {
      const r = await api<{ added: number; existing: number; invalid: string[] }>("/api/admin/newsletter", { method: "POST", json: { emails } })
      toast("ok", `${r.added} agregado${r.added === 1 ? "" : "s"}${r.existing ? ` · ${r.existing} ya estaba${r.existing === 1 ? "" : "n"}` : ""}${r.invalid.length ? ` · ${r.invalid.length} inválido${r.invalid.length === 1 ? "" : "s"}` : ""}`)
      setAdding(false); setAddText(""); await load()
    } catch (e) { toast("error", (e as Error).message) }
    finally { setAdBusy(false) }
  }

  async function removeSelected() {
    setRemoveBusy(true)
    try {
      const r = await api<{ removed: number }>("/api/admin/newsletter", { method: "DELETE", json: { emails: selected } })
      toast("ok", `${r.removed} suscriptor${r.removed === 1 ? "" : "es"} quitado${r.removed === 1 ? "" : "s"}`)
      setSelected([]); setRemoving(false); await load()
    } catch (e) { toast("error", (e as Error).message); setRemoving(false) }
    finally { setRemoveBusy(false) }
  }

  async function send() {
    setSending(true)
    try {
      const r = await api<{ recipients: number; sent: number; failed: number; error?: string }>("/api/admin/newsletter/send", { method: "POST", json: { subject, body, ctaLabel: ctaLabel || undefined, ctaUrl: ctaUrl.trim() || undefined } })
      toast("ok", `Newsletter enviado: ${r.sent} de ${r.recipients}`)
      if (r.failed) toast("error", `${r.failed} correos no salieron: ${r.error ?? "error de envío"}`)
      setSubject(""); setBody(""); setCtaLabel(""); setCtaUrl(""); setConfirm(false); await load()
    } catch (e) { toast("error", (e as Error).message); setConfirm(false) }
    finally { setSending(false) }
  }

  async function test() {
    setTesting(true)
    try {
      const r = await api<{ to: string }>("/api/admin/email-test", { method: "POST", json: { kind: "newsletter", subject: subject || "Asunto de prueba", body: body || "Contenido de prueba del newsletter.", ctaLabel: ctaLabel || undefined, ctaUrl: ctaUrl.trim() || undefined } })
      toast("ok", `Prueba enviada a ${r.to}`)
    } catch (e) { toast("error", (e as Error).message) }
    finally { setTesting(false) }
  }

  if (subs === null) return <Spinner label="Cargando suscriptores…" />
  const ready = subject.trim().length >= 3 && body.trim().length >= 10 && subs.length > 0 && (!ctaUrl.trim() || !!ctaLabel.trim())

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <div style={{ ...card, padding: 22, display: "grid", gap: 16 }}>
        <p style={{ fontFamily: "var(--serif)", fontSize: 21, color: "var(--text)" }}>Nuevo newsletter</p>
        <Field label="Asunto" id="nl-subject"><input id="nl-subject" style={inputStyle} maxLength={150} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ej.: Novedades de noviembre en Jewgal Academy" /></Field>
        <Field label="Contenido" id="nl-body" hint="Separá los párrafos con una línea en blanco. Las direcciones web se convierten en enlaces."><textarea id="nl-body" rows={10} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65 }} maxLength={8000} value={body} onChange={(e) => setBody(e.target.value)} /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          <Field label="Texto del botón (opcional)" id="nl-cta"><input id="nl-cta" style={inputStyle} maxLength={40} value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder="Ver programas" /></Field>
          <Field label="Enlace del botón" id="nl-url"><input id="nl-url" style={inputStyle} value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="https://jewgalacademy.com/academia" /></Field>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-faint)", lineHeight: 1.6 }}>Cada correo lleva automáticamente un enlace para darse de baja. El formato (saludo y firma) se edita en Plantillas de correo.</p>
        {!emailOn && <p role="alert" style={{ fontSize: 14, color: "var(--danger)" }}>El envío de correos no está configurado (falta RESEND_API_KEY): por ahora no se puede enviar.</p>}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Lo recibirán <strong style={{ color: "var(--text)" }}>{subs.length}</strong> suscriptor{subs.length === 1 ? "" : "es"}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <GhostButton icon={<Mail size={14} />} loading={testing} onClick={test} disabled={!emailOn || !subject.trim() || !body.trim()}>Enviarme una prueba</GhostButton>
            <PrimaryButton icon={<Send size={15} />} disabled={!ready || !emailOn} onClick={() => setConfirm(true)}>Enviar newsletter</PrimaryButton>
          </div>
        </div>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
          <p style={{ fontFamily: "var(--serif)", fontSize: 21, color: "var(--text)" }}>Suscriptores <span style={{ fontSize: 14, color: "var(--text-faint)", fontFamily: "var(--sans)" }}>{subs.length}</span></p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {selected.length > 0 && <GhostButton danger icon={<UserMinus size={14} />} onClick={() => setRemoving(true)}>Quitar {selected.length} seleccionado{selected.length === 1 ? "" : "s"}</GhostButton>}
            <GhostButton icon={<Plus size={14} />} onClick={() => setAdding(true)}>Agregar</GhostButton>
            <GhostButton icon={<Download size={14} />} onClick={exportCsv} disabled={!subs.length}>Exportar CSV</GhostButton>
          </div>
        </div>
        {subs.length === 0 ? (
          <EmptyState icon={<Mail size={26} />} title="Todavía no hay suscriptores" text="Quienes se suscriban desde el pie de página del sitio aparecerán acá." />
        ) : (
          <div style={{ ...card, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 12, alignItems: "center" }}>
              <input type="checkbox" aria-label="Seleccionar todos los visibles" checked={allVisibleSelected} onChange={toggleAll} style={{ width: 17, height: 17, accentColor: "var(--terra)" }} />
              <div style={{ position: "relative", flex: 1 }}>
                <Search size={15} aria-hidden style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)" }} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar un correo…" aria-label="Buscar suscriptores" style={{ ...inputStyle, paddingLeft: 38 }} />
              </div>
            </div>
            <div style={{ maxHeight: 360, overflowY: "auto" }}>
              {filtered.map((s) => (
                <label key={s.email} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 16px", borderBottom: "1px solid var(--border-soft)", cursor: "pointer", fontSize: 14.5, color: "var(--text-strong)" }}>
                  <input type="checkbox" checked={selected.includes(s.email)} onChange={(e) => setSelected((l) => (e.target.checked ? [...l, s.email] : l.filter((x) => x !== s.email)))} style={{ width: 17, height: 17, accentColor: "var(--terra)" }} />
                  <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{s.email}</span>
                  <span style={{ fontSize: 12.5, color: "var(--text-faint)", whiteSpace: "nowrap" }}>{new Date(s.date).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })}</span>
                </label>
              ))}
              {filtered.length === 0 && <p style={{ padding: 20, color: "var(--text-muted)", fontSize: 14 }}>No hay correos que coincidan.</p>}
            </div>
          </div>
        )}
      </div>

      <div>
        <p style={{ fontFamily: "var(--serif)", fontSize: 21, color: "var(--text)", marginBottom: 12 }}>Envíos anteriores</p>
        {campaigns.length === 0 ? <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Todavía no enviaste ningún newsletter.</p> : (
          <div style={{ display: "grid", gap: 10 }}>
            {campaigns.map((c) => (
              <div key={c.id} style={{ ...card, padding: "13px 18px", display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <strong style={{ color: "var(--text)", fontSize: 15 }}>{c.title}</strong>
                <span style={{ fontSize: 13, color: "var(--text-faint)" }}>{when(c.createdAt)} · {c.emailsSent} de {c.recipients} enviados{c.emailsFailed ? ` · ${c.emailsFailed} con error` : ""}{c.createdByName ? ` · ${c.createdByName}` : ""}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {adding && (
        <Modal title="Agregar suscriptores" onClose={() => setAdding(false)} width={520}
          footer={<><GhostButton onClick={() => setAdding(false)} disabled={adBusy}>Cancelar</GhostButton><PrimaryButton loading={adBusy} disabled={!addText.trim()} onClick={addSubs}>Agregar</PrimaryButton></>}>
          <div style={{ display: "grid", gap: 12 }}>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>Pegá uno o varios correos, separados por coma, espacio o línea. Agregá solo a personas que pidieron recibir el newsletter.</p>
            <textarea aria-label="Correos a agregar" rows={7} style={{ ...inputStyle, resize: "vertical" }} value={addText} onChange={(e) => setAddText(e.target.value)} placeholder="maria@email.com, juan@email.com" />
          </div>
        </Modal>
      )}
      {removing && (
        <ConfirmDialog danger title="Quitar suscriptores" confirmLabel="Quitar" busy={removeBusy} onCancel={() => setRemoving(false)} onConfirm={removeSelected}
          text={<>¿Quitar a <strong>{selected.length}</strong> suscriptor{selected.length === 1 ? "" : "es"} de la lista? Dejan de recibir el newsletter. Se registra en el Historial.</>} />
      )}
      {confirm && (
        <ConfirmDialog title="Enviar newsletter" confirmLabel="Enviar ahora" busy={sending} onCancel={() => setConfirm(false)} onConfirm={send}
          text={<>Se va a enviar <strong>“{subject}”</strong> a <strong>{subs.length} suscriptor{subs.length === 1 ? "" : "es"}</strong>. Un envío no se puede deshacer. ¿Ya te mandaste una prueba para revisarlo?</>} />
      )}
    </div>
  )
}
