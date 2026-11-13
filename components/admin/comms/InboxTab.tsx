"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Archive, ArchiveRestore, Inbox, Mail, MailOpen, Reply, Send, Trash2 } from "lucide-react"
import { ConfirmDialog, EmptyState, Field, GhostButton, PrimaryButton, Spinner, api, card, inputStyle, useToast } from "@/components/admin/ui"

type Msg = {
  id: string; name: string; email: string; subject: string | null; message: string; locale: string
  status: "new" | "read" | "replied" | "archived"; replyBody: string | null; repliedAt: string | null; createdAt: string
}
type Filter = "all" | "new" | "read" | "replied" | "archived"
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Todos" }, { id: "new", label: "Sin leer" }, { id: "read", label: "Leídos" }, { id: "replied", label: "Respondidos" }, { id: "archived", label: "Archivados" },
]
const STATUS_LABEL: Record<Msg["status"], string> = { new: "Nuevo", read: "Leído", replied: "Respondido", archived: "Archivado" }
const STATUS_COLOR: Record<Msg["status"], string> = { new: "var(--terra)", read: "var(--text-muted)", replied: "var(--success)", archived: "var(--text-faint)" }

const when = (iso: string) => new Date(iso).toLocaleString("es", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })

export default function InboxTab({ onUnread }: { onUnread?: (n: number) => void }) {
  const toast = useToast()
  const [messages, setMessages] = useState<Msg[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [emailOn, setEmailOn] = useState(true)
  const [replying, setReplying] = useState(false)
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)
  const [deleting, setDeleting] = useState<Msg | null>(null)

  const load = useCallback(async () => {
    try {
      const d = await api<{ messages: Msg[]; emailConfigured: boolean }>("/api/admin/contact", { cache: "no-store" })
      setMessages(d.messages); setEmailOn(d.emailConfigured)
    } catch (e) { toast("error", (e as Error).message) }
    finally { setLoading(false) }
  }, [toast])
  useEffect(() => { load() }, [load])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: messages.length, new: 0, read: 0, replied: 0, archived: 0 }
    messages.forEach((m) => { c[m.status]++ })
    return c
  }, [messages])
  useEffect(() => { onUnread?.(counts.new) }, [counts.new, onUnread])

  const list = filter === "all" ? messages.filter((m) => m.status !== "archived") : messages.filter((m) => m.status === filter)
  const selected = messages.find((m) => m.id === selectedId) ?? null

  async function setStatus(ids: string[], status: Msg["status"], silent = false) {
    setMessages((l) => l.map((m) => (ids.includes(m.id) ? { ...m, status } : m)))
    try { await api("/api/admin/contact", { method: "PATCH", json: { ids, status } }); if (!silent) toast("ok", status === "archived" ? "Mensaje archivado" : "Mensaje actualizado") }
    catch (e) { toast("error", (e as Error).message); load() }
  }

  function open(m: Msg) {
    setSelectedId(m.id); setReplying(false)
    if (m.status === "new") setStatus([m.id], "read", true)
  }

  function startReply(m: Msg) {
    setSubject(m.subject ? `Re: ${m.subject}` : "Re: tu mensaje a Jewgal Academy")
    setBody(`Hola ${m.name.split(" ")[0]},\n\n\n\nUn abrazo,\nDevora Benchimol · Jewgal Academy`)
    setReplying(true)
  }

  async function sendReply() {
    if (!selected) return
    setSending(true)
    try {
      await api("/api/admin/contact/reply", { method: "POST", json: { id: selected.id, subject, body } })
      toast("ok", `Respuesta enviada a ${selected.email}`)
      setReplying(false)
      await load()
    } catch (e) { toast("error", (e as Error).message) }
    finally { setSending(false) }
  }

  async function remove() {
    if (!deleting) return
    try { await api("/api/admin/contact", { method: "DELETE", json: { id: deleting.id } }); toast("ok", "Mensaje eliminado"); setDeleting(null); if (selectedId === deleting.id) setSelectedId(null); await load() }
    catch (e) { toast("error", (e as Error).message); setDeleting(null) }
  }

  if (loading) return <Spinner label="Cargando mensajes…" />

  return (
    <div>
      <div role="group" aria-label="Filtrar mensajes" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {FILTERS.map((f) => {
          const on = filter === f.id
          return (
            <button key={f.id} onClick={() => setFilter(f.id)} aria-pressed={on}
              style={{ padding: "7px 14px", borderRadius: 999, fontSize: 13.5, cursor: "pointer", fontWeight: on ? 600 : 500, border: `1px solid ${on ? "var(--gold-ink)" : "var(--border)"}`, background: on ? "rgba(196,159,114,.14)" : "transparent", color: on ? "var(--gold-ink)" : "var(--text-muted)" }}>
              {f.label} <span style={{ color: "var(--text-faint)", marginLeft: 4 }}>{counts[f.id] ?? 0}</span>
            </button>
          )
        })}
      </div>

      {messages.length === 0 ? (
        <EmptyState icon={<Inbox size={28} />} title="Todavía no llegaron mensajes" text="Cuando alguien escriba desde el formulario de Contacto del sitio, lo vas a ver acá y en la campana del panel." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(260px, 380px) minmax(0, 1fr)", gap: 16, alignItems: "start" }} className="inbox-grid">
          <div style={{ ...card, overflow: "hidden", maxHeight: "70vh", overflowY: "auto" }}>
            {list.length === 0 ? <p style={{ padding: 22, color: "var(--text-muted)", fontSize: 14 }}>No hay mensajes en esta vista.</p> : list.map((m) => {
              const active = m.id === selectedId
              return (
                <button key={m.id} onClick={() => open(m)} aria-current={active ? "true" : undefined}
                  style={{ display: "block", width: "100%", textAlign: "left", padding: "13px 16px", border: "none", borderBottom: "1px solid var(--border-soft)", cursor: "pointer", background: active ? "rgba(196,159,114,.14)" : "transparent", color: "inherit", font: "inherit" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontWeight: m.status === "new" ? 700 : 500, color: "var(--text)", fontSize: 14.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {m.status === "new" && <span aria-label="sin leer" style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "var(--terra)", marginRight: 8 }} />}{m.name}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-faint)", whiteSpace: "nowrap" }}>{new Date(m.createdAt).toLocaleDateString("es", { day: "numeric", month: "short" })}</span>
                  </div>
                  {m.subject && <p style={{ fontSize: 12.5, color: "var(--gold-ink)", marginBottom: 2 }}>{m.subject}</p>}
                  <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{m.message}</p>
                  {m.status !== "new" && <span style={{ fontSize: 11.5, color: STATUS_COLOR[m.status] }}>{STATUS_LABEL[m.status]}</span>}
                </button>
              )
            })}
          </div>

          <div style={{ ...card, padding: 22, minHeight: 260 }}>
            {!selected ? (
              <p style={{ color: "var(--text-muted)", fontSize: 14.5, textAlign: "center", padding: "50px 10px" }}>Elegí un mensaje de la lista para leerlo y responderlo.</p>
            ) : (
              <div style={{ display: "grid", gap: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--text)", marginBottom: 2 }}>{selected.name}</p>
                    <a href={`mailto:${selected.email}`} style={{ color: "var(--gold-ink)", fontSize: 14 }}>{selected.email}</a>
                    <p style={{ fontSize: 12.5, color: "var(--text-faint)", marginTop: 4 }}>{when(selected.createdAt)}{selected.subject ? ` · ${selected.subject}` : ""} · <span style={{ color: STATUS_COLOR[selected.status] }}>{STATUS_LABEL[selected.status]}</span></p>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "flex-start" }}>
                    <GhostButton icon={selected.status === "new" ? <MailOpen size={14} /> : <Mail size={14} />} onClick={() => setStatus([selected.id], selected.status === "new" ? "read" : "new")}>{selected.status === "new" ? "Marcar leído" : "Marcar sin leer"}</GhostButton>
                    <GhostButton icon={selected.status === "archived" ? <ArchiveRestore size={14} /> : <Archive size={14} />} onClick={() => setStatus([selected.id], selected.status === "archived" ? "read" : "archived")}>{selected.status === "archived" ? "Desarchivar" : "Archivar"}</GhostButton>
                    <GhostButton danger icon={<Trash2 size={14} />} onClick={() => setDeleting(selected)}>Eliminar</GhostButton>
                  </div>
                </div>

                <p style={{ whiteSpace: "pre-wrap", fontSize: 15.5, lineHeight: 1.75, color: "var(--text-strong)", padding: "14px 16px", background: "var(--surface-2)", borderRadius: 12 }}>{selected.message}</p>

                {selected.replyBody && (
                  <div style={{ borderLeft: "3px solid var(--success)", paddingLeft: 14 }}>
                    <p style={{ fontSize: 12.5, color: "var(--success)", marginBottom: 6 }}>Respondido el {selected.repliedAt ? when(selected.repliedAt) : ""}</p>
                    <p style={{ whiteSpace: "pre-wrap", fontSize: 14.5, lineHeight: 1.65, color: "var(--text-muted)" }}>{selected.replyBody}</p>
                  </div>
                )}

                {replying ? (
                  <div style={{ display: "grid", gap: 12, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                    <Field label="Asunto" id="rp-subject"><input id="rp-subject" style={inputStyle} value={subject} onChange={(e) => setSubject(e.target.value)} /></Field>
                    <Field label="Tu respuesta" id="rp-body" hint={emailOn ? `Se envía a ${selected.email}. Si responde, te llega a tu correo.` : "El envío de correos no está configurado: usá “Responder desde mi correo”."}>
                      <textarea id="rp-body" rows={9} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65 }} value={body} onChange={(e) => setBody(e.target.value)} />
                    </Field>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                      <GhostButton onClick={() => setReplying(false)} disabled={sending}>Cancelar</GhostButton>
                      <PrimaryButton icon={<Send size={14} />} loading={sending} disabled={!emailOn} onClick={sendReply}>Enviar respuesta</PrimaryButton>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <PrimaryButton icon={<Reply size={14} />} onClick={() => startReply(selected)} disabled={!emailOn}>Responder desde el panel</PrimaryButton>
                    <a href={`mailto:${selected.email}?subject=${encodeURIComponent(selected.subject ? `Re: ${selected.subject}` : "Re: tu mensaje a Jewgal Academy")}`} onClick={() => selected.status !== "replied" && setStatus([selected.id], "replied", true)} style={{ textDecoration: "none" }}>
                      <GhostButton type="button" icon={<Mail size={14} />}>Responder desde mi correo</GhostButton>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {deleting && <ConfirmDialog danger title="Eliminar mensaje" confirmLabel="Eliminar" onCancel={() => setDeleting(null)} onConfirm={remove}
        text={<>¿Eliminar el mensaje de <strong>{deleting.name}</strong>? Queda registrado en el Historial de cambios y se puede restaurar desde allí.</>} />}

      <style>{`@media (max-width: 860px){ .inbox-grid{ grid-template-columns: minmax(0,1fr) !important } }`}</style>
    </div>
  )
}
