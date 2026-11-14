"use client"

import { useCallback, useEffect, useState } from "react"
import { AlertTriangle, CheckCircle2, RefreshCw, Send, XCircle } from "lucide-react"
import { Field, GhostButton, PrimaryButton, Spinner, api, card, inputStyle, useToast } from "@/components/admin/ui"

type Check = { id: string; level: "ok" | "warn" | "error"; title: string; detail: string }
type Data = { checks: Check[]; from: string; account: string; status: { lastOkAt?: string; lastError?: { at: string; message: string } } }

const ICON = {
  ok: <CheckCircle2 size={20} style={{ color: "var(--success)", flexShrink: 0 }} aria-label="Correcto" />,
  warn: <AlertTriangle size={20} style={{ color: "var(--warning)", flexShrink: 0 }} aria-label="Atención" />,
  error: <XCircle size={20} style={{ color: "var(--danger)", flexShrink: 0 }} aria-label="Problema" />,
} as const

const when = (iso: string) => new Date(iso).toLocaleString("es", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })

/** Revisa que el envío de correos esté bien configurado y permite mandar una prueba a cualquier dirección. */
export default function EmailStatusTab() {
  const toast = useToast()
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(false)
  const [to, setTo] = useState("")
  const [sending, setSending] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const d = await api<Data>("/api/admin/email-status", { cache: "no-store" })
      setData(d); setTo((t) => t || d.account)
    } catch (e) { toast("error", (e as Error).message) }
    finally { setLoading(false) }
  }, [toast])
  useEffect(() => { load() }, [load])

  async function ping() {
    setSending(true)
    try {
      const r = await api<{ to: string }>("/api/admin/email-test", { method: "POST", json: { kind: "ping", to: to.trim() } })
      toast("ok", `Prueba enviada a ${r.to}. Revisá la bandeja (y la carpeta de spam).`)
      await load()
    } catch (e) { toast("error", (e as Error).message); await load() }
    finally { setSending(false) }
  }

  if (!data) return <Spinner label="Revisando el correo…" />
  const errors = data.checks.filter((c) => c.level === "error").length
  const warns = data.checks.filter((c) => c.level === "warn").length

  return (
    <div style={{ display: "grid", gap: 20, maxWidth: 860 }}>
      <div style={{ ...card, padding: "16px 20px", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between", borderColor: errors ? "var(--danger)" : warns ? "var(--warning)" : "var(--success)" }}>
        <div>
          <p style={{ fontFamily: "var(--serif)", fontSize: 21, color: "var(--text)" }}>
            {errors ? `Hay ${errors} problema${errors > 1 ? "s" : ""} que impiden o dificultan el envío` : warns ? "El envío funciona, con algunas cosas para revisar" : "El correo está bien configurado"}
          </p>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>Remitente actual: <strong style={{ color: "var(--text-strong)" }}>{data.from}</strong></p>
        </div>
        <GhostButton icon={<RefreshCw size={14} />} loading={loading} onClick={load}>Revisar de nuevo</GhostButton>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {data.checks.map((c) => (
          <div key={c.id} style={{ ...card, padding: "14px 18px", display: "flex", gap: 14, alignItems: "flex-start" }}>
            {ICON[c.level]}
            <div>
              <p style={{ color: "var(--text)", fontSize: 15.5, fontWeight: 600, marginBottom: 3 }}>{c.title}</p>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.65 }}>{c.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...card, padding: 20, display: "grid", gap: 14 }}>
        <p style={{ fontFamily: "var(--serif)", fontSize: 19, color: "var(--text)" }}>Mandar un correo de prueba</p>
        <Field label="Enviar a" id="es-to" hint="Probá con tu casilla real (Gmail, por ejemplo). Es la forma más segura de comprobar que todo llega.">
          <input id="es-to" type="email" style={inputStyle} value={to} onChange={(e) => setTo(e.target.value)} placeholder="tu-correo@gmail.com" />
        </Field>
        <div><PrimaryButton icon={<Send size={15} />} loading={sending} disabled={!to.trim()} onClick={ping}>Enviar prueba</PrimaryButton></div>
        <div style={{ paddingTop: 12, borderTop: "1px solid var(--border)", fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.7 }}>
          {data.status.lastOkAt ? <p>Último envío correcto: <strong style={{ color: "var(--success)" }}>{when(data.status.lastOkAt)}</strong></p> : <p>Todavía no se registró ningún envío correcto.</p>}
          {data.status.lastError && <p>Último error: <strong style={{ color: "var(--danger)" }}>{data.status.lastError.message}</strong> ({when(data.status.lastError.at)})</p>}
        </div>
      </div>
    </div>
  )
}
