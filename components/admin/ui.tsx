"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { CheckCircle2, AlertTriangle, Loader2, X } from "lucide-react"

/* Estilos y piezas compartidas por las pantallas del panel (mismo aspecto que Recursos, Blog, etc.) */

export const card: React.CSSProperties = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14 }
export const inputStyle: React.CSSProperties = {
  width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 9,
  padding: "10px 14px", fontSize: 14, color: "var(--text)", outline: "none", fontFamily: "inherit",
}
export const labelStyle: React.CSSProperties = {
  fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: 7,
}
export const hintStyle: React.CSSProperties = { fontSize: 12.5, color: "var(--text-faint)", marginTop: 6, lineHeight: 1.5 }

export function PageHeader({ eyebrow, title, subtitle, actions }: { eyebrow: string; title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 28 }}>
      <div style={{ minWidth: 0 }}>
        <span style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold-ink)", display: "block", marginBottom: 8 }}>{eyebrow}</span>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 34, color: "var(--text)", marginBottom: 6, lineHeight: 1.1 }}>{title}</h1>
        {subtitle && <p style={{ color: "var(--text-muted)", fontSize: 14, maxWidth: 720, lineHeight: 1.6 }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{actions}</div>}
    </div>
  )
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean; icon?: React.ReactNode }

export function PrimaryButton({ loading, icon, children, style, disabled, ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 20px", borderRadius: 10,
        background: "var(--grad-cta)", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
        cursor: disabled || loading ? "not-allowed" : "pointer", opacity: disabled ? 0.55 : 1, ...style,
      }}
    >
      {loading ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : icon}
      {children}
    </button>
  )
}

export function GhostButton({ loading, icon, children, style, disabled, danger, ...rest }: BtnProps & { danger?: boolean }) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "9px 16px", borderRadius: 10,
        background: "transparent", border: `1px solid ${danger ? "color-mix(in srgb, var(--danger) 45%, transparent)" : "var(--border)"}`,
        color: danger ? "var(--danger)" : "var(--text-strong)", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap",
        cursor: disabled || loading ? "not-allowed" : "pointer", opacity: disabled ? 0.55 : 1, ...style,
      }}
    >
      {loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : icon}
      {children}
    </button>
  )
}

export function Field({ label, hint, children, id }: { label: string; hint?: string; children: React.ReactNode; id?: string }) {
  return (
    <div>
      <label htmlFor={id} style={labelStyle}>{label}</label>
      {children}
      {hint && <p style={hintStyle}>{hint}</p>}
    </div>
  )
}

export function Spinner({ label = "Cargando…" }: { label?: string }) {
  return (
    <div role="status" style={{ display: "flex", gap: 10, color: "var(--text-muted)", padding: "40px 0", alignItems: "center", fontSize: 14 }}>
      <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> {label}
    </div>
  )
}

export function EmptyState({ icon, title, text, action }: { icon: React.ReactNode; title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div style={{ ...card, padding: "48px 28px", textAlign: "center" }}>
      <div style={{ color: "var(--gold-ink)", opacity: 0.55, display: "flex", justifyContent: "center", marginBottom: 14 }}>{icon}</div>
      <p style={{ color: "var(--text-strong)", fontSize: 16, fontFamily: "var(--serif)", marginBottom: 6 }}>{title}</p>
      {text && <p style={{ color: "var(--text-muted)", fontSize: 14, maxWidth: 460, margin: "0 auto", lineHeight: 1.6 }}>{text}</p>}
      {action && <div style={{ marginTop: 18 }}>{action}</div>}
    </div>
  )
}

/* Avisos breves (éxito / error) */
type Toast = { id: number; kind: "ok" | "error"; text: string }
const ToastCtx = createContext<(kind: "ok" | "error", text: string) => void>(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([])
  const seq = useRef(0)
  const push = useCallback((kind: "ok" | "error", text: string) => {
    const id = ++seq.current
    setItems((l) => [...l, { id, kind, text }])
    setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), kind === "error" ? 6000 : 3200)
  }, [])
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div aria-live="polite" style={{ position: "fixed", bottom: 24, right: 24, zIndex: 300, display: "grid", gap: 10, maxWidth: "min(420px, calc(100vw - 32px))" }}>
        {items.map((t) => (
          <div key={t.id} role={t.kind === "error" ? "alert" : "status"} style={{
            display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 16px", borderRadius: 12, fontSize: 14, lineHeight: 1.45,
            background: "var(--surface-solid)", border: `1px solid ${t.kind === "ok" ? "var(--success)" : "var(--danger)"}`,
            color: "var(--text)", boxShadow: "0 12px 40px rgba(0,0,0,.25)",
          }}>
            {t.kind === "ok" ? <CheckCircle2 size={18} style={{ color: "var(--success)", flexShrink: 0, marginTop: 1 }} /> : <AlertTriangle size={18} style={{ color: "var(--danger)", flexShrink: 0, marginTop: 1 }} />}
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

/* Ventana modal accesible (Esc cierra, el foco entra al abrir) */
export function Modal({ title, onClose, children, width = 560, footer }: { title: string; onClose: () => void; children: React.ReactNode; width?: number; footer?: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    ref.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => { window.removeEventListener("keydown", onKey); prev?.focus?.() }
  }, [onClose])
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "6vh 16px 16px", overflowY: "auto" }}>
      <div onClick={onClose} aria-hidden style={{ position: "fixed", inset: 0, background: "var(--scrim)", backdropFilter: "blur(3px)" }} />
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} style={{
        position: "relative", width: "100%", maxWidth: width, background: "var(--surface-solid)", border: "1px solid var(--border)",
        borderRadius: 16, boxShadow: "0 30px 90px rgba(0,0,0,.35)", outline: "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "18px 22px", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 22, color: "var(--text)" }}>{title}</h2>
          <button onClick={onClose} aria-label="Cerrar" style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 6, display: "flex" }}><X size={18} /></button>
        </div>
        <div style={{ padding: "20px 22px" }}>{children}</div>
        {footer && <div style={{ padding: "14px 22px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>{footer}</div>}
      </div>
    </div>
  )
}

/* Diálogo de confirmación (reemplaza a confirm(), que el navegador puede bloquear) */
export function ConfirmDialog({ title, text, confirmLabel = "Confirmar", danger, onConfirm, onCancel, busy }: {
  title: string; text: React.ReactNode; confirmLabel?: string; danger?: boolean; busy?: boolean; onConfirm: () => void; onCancel: () => void
}) {
  return (
    <Modal title={title} onClose={onCancel} width={460} footer={
      <>
        <GhostButton onClick={onCancel} disabled={busy}>Cancelar</GhostButton>
        <PrimaryButton onClick={onConfirm} loading={busy} style={danger ? { background: "var(--danger)" } : undefined}>{confirmLabel}</PrimaryButton>
      </>
    }>
      <div style={{ color: "var(--text-strong)", fontSize: 15, lineHeight: 1.6 }}>{text}</div>
    </Modal>
  )
}

/** Error de la API: conserva el estado HTTP y el cuerpo por si la pantalla necesita más que el mensaje (ej.: un conflicto). */
export class ApiError extends Error {
  status: number
  data: Record<string, unknown>
  constructor(message: string, status: number, data: Record<string, unknown>) { super(message); this.status = status; this.data = data }
}

/** fetch JSON con manejo de errores uniforme: devuelve los datos o lanza ApiError con el mensaje del servidor. */
export async function api<T = unknown>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...rest } = init ?? {}
  const res = await fetch(url, {
    ...rest,
    headers: { ...(json !== undefined ? { "Content-Type": "application/json" } : {}), ...(rest.headers ?? {}) },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError((data as { error?: string }).error || `Error ${res.status}`, res.status, data as Record<string, unknown>)
  return data as T
}
