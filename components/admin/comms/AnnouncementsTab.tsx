"use client"

import { useEffect, useMemo, useState } from "react"
import { Megaphone, Send, X } from "lucide-react"
import { ConfirmDialog, EmptyState, Field, GhostButton, PrimaryButton, Spinner, api, card, inputStyle, useToast } from "@/components/admin/ui"

type Course = { id: string; title: string }
type Student = { id: string; name: string; email: string }
type Announcement = { id: string; title: string; body: string; linkUrl: string | null; audience: string; channels: string; recipients: number; emailsSent: number; emailsFailed: number; createdByName: string | null; createdAt: string }
type AudienceKind = "all" | "courses" | "users"

const when = (iso: string) => new Date(iso).toLocaleString("es", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })

function audienceLabel(raw: string, courses: Course[]) {
  try {
    const a = JSON.parse(raw) as { type: string; courseIds?: string[]; userIds?: string[] }
    if (a.type === "all") return "Todos los alumnos"
    if (a.type === "courses") return `Programas: ${(a.courseIds ?? []).map((id) => courses.find((c) => c.id === id)?.title ?? "(programa)").join(", ")}`
    if (a.type === "users") return `${a.userIds?.length ?? 0} alumno${(a.userIds?.length ?? 0) === 1 ? "" : "s"} elegido${(a.userIds?.length ?? 0) === 1 ? "" : "s"}`
  } catch {}
  return "—"
}

export default function AnnouncementsTab() {
  const toast = useToast()
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [history, setHistory] = useState<Announcement[] | null>(null)
  const [emailOn, setEmailOn] = useState(true)

  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [link, setLink] = useState("")
  const [kind, setKind] = useState<AudienceKind>("all")
  const [courseIds, setCourseIds] = useState<string[]>([])
  const [userIds, setUserIds] = useState<string[]>([])
  const [pick, setPick] = useState("")
  const [viaApp, setViaApp] = useState(true)
  const [viaEmail, setViaEmail] = useState(false)
  const [count, setCount] = useState<number | null>(null)
  const [confirm, setConfirm] = useState(false)
  const [sending, setSending] = useState(false)
  const [testing, setTesting] = useState(false)

  const loadHistory = () =>
    api<{ announcements: Announcement[]; emailConfigured: boolean }>("/api/admin/announcements", { cache: "no-store" })
      .then((d) => { setHistory(d.announcements); setEmailOn(d.emailConfigured) })
      .catch((e) => toast("error", (e as Error).message))

  useEffect(() => {
    loadHistory()
    api<{ students: Student[]; courses: Course[] }>("/api/admin/directory").then((d) => { setStudents(d.students); setCourses(d.courses) }).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const audience = useMemo(() => (kind === "all" ? { type: "all" as const } : kind === "courses" ? { type: "courses" as const, courseIds } : { type: "users" as const, userIds }), [kind, courseIds, userIds])
  const audienceReady = kind === "all" || (kind === "courses" ? courseIds.length > 0 : userIds.length > 0)

  // cuántas personas recibirían el aviso (se recalcula al cambiar la audiencia)
  useEffect(() => {
    if (!audienceReady) { setCount(null); return }
    let cancelled = false
    const t = setTimeout(() => {
      api<{ count: number }>("/api/admin/announcements", { method: "PUT", json: { audience } }).then((d) => { if (!cancelled) setCount(d.count) }).catch(() => { if (!cancelled) setCount(null) })
    }, 250)
    return () => { cancelled = true; clearTimeout(t) }
  }, [audience, audienceReady])

  const matches = pick.trim().length >= 2
    ? students.filter((s) => !userIds.includes(s.id) && (s.name.toLowerCase().includes(pick.toLowerCase()) || s.email.toLowerCase().includes(pick.toLowerCase()))).slice(0, 6)
    : []

  const ready = title.trim().length >= 3 && body.trim().length >= 5 && audienceReady && (viaApp || viaEmail) && (count ?? 0) > 0

  async function send() {
    setSending(true)
    try {
      const r = await api<{ recipients: number; emailsSent: number; emailsFailed: number; emailError?: string }>("/api/admin/announcements", {
        method: "POST", json: { title, body, linkUrl: link.trim() || undefined, audience, channels: { app: viaApp, email: viaEmail } },
      })
      toast("ok", `Anuncio enviado a ${r.recipients} alumno${r.recipients === 1 ? "" : "s"}${viaEmail ? ` (${r.emailsSent} correos${r.emailsFailed ? `, ${r.emailsFailed} con error` : ""})` : ""}`)
      if (r.emailsFailed) toast("error", `${r.emailsFailed} correos no salieron: ${r.emailError ?? "error de envío"}`)
      setTitle(""); setBody(""); setLink(""); setConfirm(false)
      await loadHistory()
    } catch (e) { toast("error", (e as Error).message); setConfirm(false) }
    finally { setSending(false) }
  }

  async function test() {
    setTesting(true)
    try {
      const r = await api<{ to: string }>("/api/admin/email-test", { method: "POST", json: { kind: "announcement", title: title || "Título de prueba", body: body || "Mensaje de prueba.", linkUrl: link.trim() || undefined } })
      toast("ok", `Prueba enviada a ${r.to}`)
    } catch (e) { toast("error", (e as Error).message) }
    finally { setTesting(false) }
  }

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <div style={{ ...card, padding: 22, display: "grid", gap: 16 }}>
        <p style={{ fontFamily: "var(--serif)", fontSize: 21, color: "var(--text)" }}>Nuevo anuncio</p>
        <Field label="Título" id="an-title"><input id="an-title" style={inputStyle} maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej.: Nueva clase en vivo este jueves" /></Field>
        <Field label="Mensaje" id="an-body"><textarea id="an-body" rows={6} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65 }} maxLength={4000} value={body} onChange={(e) => setBody(e.target.value)} /></Field>
        <Field label="Enlace (opcional)" id="an-link" hint="Una página del aula (ej.: /aula/clases-en-vivo) o una dirección completa (https://…). Aparece como botón.">
          <input id="an-link" style={inputStyle} value={link} onChange={(e) => setLink(e.target.value)} placeholder="/aula/clases-en-vivo" />
        </Field>

        <fieldset style={{ border: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
          <legend style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>A quién se envía</legend>
          <div role="radiogroup" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {([["all", "Todos los alumnos"], ["courses", "Alumnos de un programa"], ["users", "Alumnos concretos"]] as const).map(([k, label]) => (
              <button key={k} role="radio" aria-checked={kind === k} onClick={() => setKind(k)}
                style={{ padding: "8px 16px", borderRadius: 999, fontSize: 14, cursor: "pointer", fontWeight: kind === k ? 600 : 500, border: `1px solid ${kind === k ? "var(--gold-ink)" : "var(--border)"}`, background: kind === k ? "rgba(196,159,114,.14)" : "transparent", color: kind === k ? "var(--gold-ink)" : "var(--text-muted)" }}>{label}</button>
            ))}
          </div>
          {kind === "courses" && (
            <div style={{ display: "grid", gap: 6 }}>
              {courses.map((c) => (
                <label key={c.id} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14.5, color: "var(--text-strong)", cursor: "pointer" }}>
                  <input type="checkbox" checked={courseIds.includes(c.id)} onChange={(e) => setCourseIds((l) => (e.target.checked ? [...l, c.id] : l.filter((x) => x !== c.id)))} style={{ width: 17, height: 17, accentColor: "var(--terra)" }} /> {c.title}
                </label>
              ))}
              <p style={{ fontSize: 12.5, color: "var(--text-faint)" }}>Llega a quienes tienen la inscripción activa o completada.</p>
            </div>
          )}
          {kind === "users" && (
            <div style={{ display: "grid", gap: 8 }}>
              <input aria-label="Buscar alumno" style={inputStyle} value={pick} onChange={(e) => setPick(e.target.value)} placeholder="Escribí un nombre o email para agregar…" />
              {matches.length > 0 && (
                <div style={{ ...card, overflow: "hidden" }}>
                  {matches.map((s) => (
                    <button key={s.id} onClick={() => { setUserIds((l) => [...l, s.id]); setPick("") }} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", border: "none", borderBottom: "1px solid var(--border-soft)", background: "transparent", color: "var(--text-strong)", cursor: "pointer", fontSize: 14 }}>
                      {s.name} <span style={{ color: "var(--text-faint)" }}>· {s.email}</span>
                    </button>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {userIds.map((id) => {
                  const s = students.find((x) => x.id === id)
                  return (
                    <span key={id} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 6px 5px 12px", borderRadius: 999, background: "var(--surface-2)", border: "1px solid var(--border)", fontSize: 13.5, color: "var(--text-strong)" }}>
                      {s?.name ?? id}
                      <button aria-label={`Quitar a ${s?.name ?? "alumno"}`} onClick={() => setUserIds((l) => l.filter((x) => x !== id))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: 2 }}><X size={14} /></button>
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </fieldset>

        <fieldset style={{ border: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
          <legend style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>Cómo se envía</legend>
          <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14.5, color: "var(--text-strong)", cursor: "pointer" }}>
            <input type="checkbox" checked={viaApp} onChange={(e) => setViaApp(e.target.checked)} style={{ width: 17, height: 17, accentColor: "var(--terra)" }} /> Aviso dentro del aula (campana de notificaciones)
          </label>
          <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14.5, color: emailOn ? "var(--text-strong)" : "var(--text-faint)", cursor: emailOn ? "pointer" : "not-allowed" }}>
            <input type="checkbox" checked={viaEmail} disabled={!emailOn} onChange={(e) => setViaEmail(e.target.checked)} style={{ width: 17, height: 17, accentColor: "var(--terra)" }} /> También por correo electrónico{!emailOn && " (el correo no está configurado)"}
          </label>
        </fieldset>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
            {audienceReady ? (count === null ? "Calculando…" : <>Lo recibirán <strong style={{ color: "var(--text)" }}>{count}</strong> alumno{count === 1 ? "" : "s"}</>) : "Elegí a quién se envía"}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {viaEmail && <GhostButton loading={testing} onClick={test} disabled={!title.trim() || !body.trim()}>Enviarme una prueba</GhostButton>}
            <PrimaryButton icon={<Send size={15} />} disabled={!ready} onClick={() => setConfirm(true)}>Enviar anuncio</PrimaryButton>
          </div>
        </div>
      </div>

      <div>
        <p style={{ fontFamily: "var(--serif)", fontSize: 21, color: "var(--text)", marginBottom: 12 }}>Anuncios enviados</p>
        {history === null ? <Spinner /> : history.length === 0 ? (
          <EmptyState icon={<Megaphone size={26} />} title="Todavía no enviaste anuncios" text="Los anuncios que mandes quedan registrados acá." />
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {history.map((a) => (
              <div key={a.id} style={{ ...card, padding: "14px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                  <strong style={{ color: "var(--text)", fontSize: 15.5 }}>{a.title}</strong>
                  <span style={{ fontSize: 12.5, color: "var(--text-faint)" }}>{when(a.createdAt)}{a.createdByName ? ` · ${a.createdByName}` : ""}</span>
                </div>
                <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", whiteSpace: "pre-line" }}>{a.body}</p>
                <p style={{ fontSize: 12.5, color: "var(--text-faint)", marginTop: 6 }}>
                  {audienceLabel(a.audience, courses)} · {a.recipients} destinatario{a.recipients === 1 ? "" : "s"} ·{" "}
                  {a.channels === "email" ? "correo" : a.channels === "app" ? "aviso en el aula" : "aula + correo"}
                  {a.channels !== "app" && <> ({a.emailsSent} enviados{a.emailsFailed ? `, ${a.emailsFailed} con error` : ""})</>}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirm && (
        <ConfirmDialog title="Enviar anuncio" confirmLabel="Enviar ahora" busy={sending} onCancel={() => setConfirm(false)} onConfirm={send}
          text={<>Se va a enviar <strong>“{title}”</strong> a <strong>{count} alumno{count === 1 ? "" : "s"}</strong> ({viaApp && viaEmail ? "aviso en el aula y correo" : viaEmail ? "por correo" : "aviso en el aula"}). Un envío no se puede deshacer.</>} />
      )}
    </div>
  )
}
