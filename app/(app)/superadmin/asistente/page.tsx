"use client"

import { useEffect, useState } from "react"
import { Activity, MessageSquare, Save, Search } from "lucide-react"
import { EmptyState, Field, GhostButton, Modal, PageHeader, PrimaryButton, Spinner, ToastProvider, api, card, hintStyle, inputStyle, useToast } from "@/components/admin/ui"
import { DEFAULT_AI_SETTINGS, type AiSettings } from "@/lib/ai-settings-core"

type Stats = { conversations: number; messages7d: number; students7d: number }
type Conv = { id: string; title: string | null; updatedAt: string; student: string; email: string; messages: number }
type Thread = { id: string; title: string | null; student: string; email: string; messages: { id: string; role: string; content: string; createdAt: string }[] }

const fmt = (d: string) => new Date(d).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })

function Inner() {
  const toast = useToast()
  const [settings, setSettings] = useState<AiSettings>(DEFAULT_AI_SETTINGS)
  const [saved, setSaved] = useState(JSON.stringify(DEFAULT_AI_SETTINGS))
  const [configured, setConfigured] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [convs, setConvs] = useState<Conv[]>([])
  const [q, setQ] = useState("")
  const [thread, setThread] = useState<Thread | "loading" | null>(null)
  const [test, setTest] = useState<{ ok: boolean; message: string; ms?: number } | null>(null)
  const [testing, setTesting] = useState(false)

  async function probar() {
    setTesting(true); setTest(null)
    try { setTest(await api<{ ok: boolean; message: string; ms?: number }>("/api/admin/ai/test", { method: "POST" })) }
    catch (e) { setTest({ ok: false, message: (e as Error).message }) }
    finally { setTesting(false) }
  }

  useEffect(() => {
    api<{ settings: AiSettings; configured: boolean; stats: Stats }>("/api/admin/ai/settings", { cache: "no-store" })
      .then((d) => { setSettings(d.settings); setSaved(JSON.stringify(d.settings)); setConfigured(d.configured); setStats(d.stats) })
      .catch((e) => toast("error", (e as Error).message))
      .finally(() => setLoading(false))
  }, [toast])

  useEffect(() => {
    const id = setTimeout(async () => {
      try { setConvs((await api<{ conversations: Conv[] }>(`/api/admin/ai/conversations?q=${encodeURIComponent(q)}`, { cache: "no-store" })).conversations) }
      catch (e) { toast("error", (e as Error).message) }
    }, q ? 300 : 0)
    return () => clearTimeout(id)
  }, [q, toast])

  async function save() {
    setSaving(true)
    try {
      const r = await api<{ settings: AiSettings }>("/api/admin/ai/settings", { method: "PUT", json: { settings } })
      setSettings(r.settings); setSaved(JSON.stringify(r.settings)); toast("ok", "Configuración del asistente guardada")
    } catch (e) { toast("error", (e as Error).message) }
    finally { setSaving(false) }
  }

  async function open(id: string) {
    setThread("loading")
    try { setThread((await api<{ conversation: Thread }>(`/api/admin/ai/conversations/${id}`)).conversation) }
    catch (e) { toast("error", (e as Error).message); setThread(null) }
  }

  if (loading) return <Spinner />
  const dirty = JSON.stringify(settings) !== saved
  const set = (p: Partial<AiSettings>) => setSettings({ ...settings, ...p })

  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <PageHeader eyebrow="Aula" title="Asistente de IA" subtitle="Pausalo, limitá cuántos mensajes puede mandar cada alumno por día, agregale instrucciones propias y revisá cómo lo usan." />
      {!configured && <p role="alert" style={{ background: "color-mix(in srgb, var(--danger) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--danger) 35%, transparent)", borderRadius: 10, padding: "10px 14px", fontSize: 13.5, color: "var(--text-strong)", marginBottom: 18 }}>La clave de la IA (GROQ_API_KEY) no está configurada en este entorno: el asistente no puede responder aunque esté activado.</p>}

      <div style={{ ...card, padding: "14px 18px", marginBottom: 20, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <GhostButton icon={<Activity size={14} />} loading={testing} onClick={probar} disabled={!configured}>Probar conexión con la IA</GhostButton>
        <p role="status" aria-live="polite" style={{ flex: "1 1 260px", fontSize: 13.5, lineHeight: 1.55, margin: 0, color: test ? (test.ok ? "var(--success)" : "var(--danger)") : "var(--text-muted)" }}>
          {test
            ? `${test.ok ? "✓ " : "✗ "}${test.message}${test.ok && test.ms ? ` · ${(test.ms / 1000).toFixed(1)} s` : ""}`
            : "Hace una consulta mínima a la IA para comprobar que la clave y el modelo funcionan en este momento."}
        </p>
      </div>

      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 20 }}>
          {([["Conversaciones", stats.conversations], ["Mensajes (7 días)", stats.messages7d], ["Alumnos activos (7 días)", stats.students7d]] as const).map(([l, v]) => (
            <div key={l} style={{ ...card, padding: "14px 18px" }}><p style={{ fontFamily: "var(--serif)", fontSize: 28, color: "var(--text)", lineHeight: 1 }}>{v}</p><p style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: ".08em", textTransform: "uppercase", marginTop: 6 }}>{l}</p></div>
          ))}
        </div>
      )}

      <div style={{ ...card, padding: "20px 22px", display: "grid", gap: 16, marginBottom: 28 }}>
        <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 15, color: "var(--text)", cursor: "pointer", fontWeight: 600 }}>
          <input type="checkbox" checked={settings.enabled} onChange={(e) => set({ enabled: e.target.checked })} /> Asistente activado
        </label>
        {!settings.enabled && <p style={{ ...hintStyle, marginTop: -6 }}>Pausado: los alumnos ven un aviso de que está en pausa y no se gasta cuota de la IA.</p>}
        <div className="admin-form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="Mensajes por alumno cada 24 h" id="ai-limit" hint="0 = sin límite."><input id="ai-limit" type="number" min={0} max={1000} value={settings.dailyLimit} onChange={(e) => set({ dailyLimit: Number(e.target.value) })} style={inputStyle} /></Field>
          <Field label="Largo máximo de cada respuesta" id="ai-tokens" hint="En tokens (≈ 0,75 palabras). 2048 es lo habitual."><input id="ai-tokens" type="number" min={256} max={4096} step={128} value={settings.maxTokens} onChange={(e) => set({ maxTokens: Number(e.target.value) })} style={inputStyle} /></Field>
        </div>
        <Field label="Instrucciones propias de la academia" id="ai-extra" hint="Se suman a las reglas del asistente (tono cálido, no es terapia, derivar crisis…), que siempre tienen prioridad. Ejemplos: «Mencioná las clases en vivo de los jueves», «Respondé más breve».">
          <textarea id="ai-extra" rows={5} maxLength={3000} value={settings.extraInstructions} onChange={(e) => set({ extraInstructions: e.target.value })} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
        </Field>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <PrimaryButton icon={<Save size={15} />} loading={saving} onClick={save} disabled={!dirty}>Guardar</PrimaryButton>
          {dirty && <span style={{ fontSize: 13, color: "var(--gold-ink)" }}>● Cambios sin guardar</span>}
        </div>
      </div>

      <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 22, color: "var(--text)", marginBottom: 6 }}>Conversaciones</h2>
      <p style={{ ...hintStyle, marginTop: 0, marginBottom: 14 }}>Las conversaciones son privadas de cada alumno: revisalas solo para mejorar el servicio.</p>
      <div style={{ position: "relative", maxWidth: 360, marginBottom: 14 }}>
        <Search size={15} aria-hidden style={{ position: "absolute", left: 12, top: 12, color: "var(--text-faint)" }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o correo…" aria-label="Buscar conversaciones" style={{ ...inputStyle, paddingLeft: 36 }} />
      </div>
      {convs.length === 0 ? <EmptyState icon={<MessageSquare size={32} />} title="Sin conversaciones" text="Cuando los alumnos usen el asistente, sus conversaciones aparecen acá." /> : (
        <div style={{ display: "grid", gap: 8 }}>
          {convs.map((c) => (
            <button key={c.id} type="button" onClick={() => open(c.id)} style={{ ...card, padding: "12px 16px", textAlign: "left", cursor: "pointer", fontFamily: "inherit", display: "flex", gap: 12, justifyContent: "space-between", flexWrap: "wrap" }}>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 14, color: "var(--text)", fontWeight: 600 }}>{c.student} <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>· {c.email}</span></span>
                <span style={{ display: "block", fontSize: 13, color: "var(--text-muted)", overflowWrap: "anywhere" }}>{c.title || "Sin título"}</span>
              </span>
              <span style={{ fontSize: 12.5, color: "var(--text-faint)", whiteSpace: "nowrap" }}>{c.messages} mensajes · {fmt(c.updatedAt)}</span>
            </button>
          ))}
        </div>
      )}

      {thread && (
        <Modal title={thread === "loading" ? "Conversación" : `${thread.student} · ${thread.title || "Conversación"}`} onClose={() => setThread(null)} width={720}>
          {thread === "loading" ? <Spinner /> : (
            <div style={{ display: "grid", gap: 10, maxHeight: "60vh", overflowY: "auto" }}>
              {thread.messages.map((m) => (
                <div key={m.id} style={{ justifySelf: m.role === "user" ? "end" : "start", maxWidth: "88%", background: m.role === "user" ? "color-mix(in srgb, var(--gold-ink) 14%, transparent)" : "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 14px" }}>
                  <p style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 4 }}>{m.role === "user" ? "Alumno" : "Asistente"} · {fmt(m.createdAt)}</p>
                  <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.6, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{m.content}</p>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}

export default function AsistentePage() { return <ToastProvider><Inner /></ToastProvider> }
