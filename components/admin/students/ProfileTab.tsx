"use client"

import { useState } from "react"
import { Ban, Copy, KeyRound, Mail, Save, ShieldCheck } from "lucide-react"
import { ConfirmDialog, Field, GhostButton, PrimaryButton, api, card, inputStyle, useToast } from "@/components/admin/ui"
import { fmtDate, type Student } from "./types"

type Form = { name: string; email: string; phone: string; country: string; city: string; job: string; bio: string }
const toForm = (s: Student): Form => ({
  name: s.name, email: s.email, phone: s.phone ?? "", country: s.country ?? "", city: s.city ?? "", job: s.job ?? "", bio: s.bio ?? "",
})

export default function ProfileTab({ student, onChanged }: { student: Student; onChanged: () => void }) {
  const toast = useToast()
  const [form, setForm] = useState<Form>(() => toForm(student))
  const [saving, setSaving] = useState(false)
  const [banBusy, setBanBusy] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [tempPassword, setTempPassword] = useState<string | null>(null)

  const original = toForm(student)
  const dirty = (Object.keys(form) as (keyof Form)[]).some((k) => form[k] !== original[k])
  const set = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }))
  const banned = student.status === "banned"

  async function save() {
    setSaving(true)
    try {
      await api(`/api/admin/students/${student.id}`, { method: "PATCH", json: {
        name: form.name, email: form.email, phone: form.phone || null, country: form.country || null,
        city: form.city || null, job: form.job || null, bio: form.bio || null,
      } })
      toast("ok", "Datos del alumno guardados")
      onChanged()
    } catch (e) { toast("error", (e as Error).message) }
    finally { setSaving(false) }
  }

  async function toggleBan() {
    setBanBusy(true)
    try {
      await api(`/api/admin/students/${student.id}`, { method: "PATCH", json: { status: banned ? "active" : "banned" } })
      toast("ok", banned ? "Alumno reactivado en el foro" : "Alumno suspendido del foro")
      onChanged()
    } catch (e) { toast("error", (e as Error).message) }
    finally { setBanBusy(false) }
  }

  async function resetPassword() {
    setResetting(true)
    try {
      const r = await api<{ tempPassword: string }>(`/api/admin/students/${student.id}/password`, { method: "POST" })
      setTempPassword(r.tempPassword)
      setConfirmReset(false)
    } catch (e) { toast("error", (e as Error).message); setConfirmReset(false) }
    finally { setResetting(false) }
  }

  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text); toast("ok", "Copiado") } catch { toast("error", "No se pudo copiar: seleccionalo y copialo a mano") }
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        <Field label="Nombre completo" id="st-name"><input id="st-name" style={inputStyle} value={form.name} onChange={(e) => set({ name: e.target.value })} /></Field>
        <Field label="Email" id="st-email" hint="Es también el usuario con el que ingresa."><input id="st-email" type="email" style={inputStyle} value={form.email} onChange={(e) => set({ email: e.target.value })} /></Field>
        <Field label="Teléfono / WhatsApp" id="st-phone"><input id="st-phone" style={inputStyle} value={form.phone} onChange={(e) => set({ phone: e.target.value })} /></Field>
        <Field label="País" id="st-country"><input id="st-country" style={inputStyle} value={form.country} onChange={(e) => set({ country: e.target.value })} /></Field>
        <Field label="Ciudad" id="st-city"><input id="st-city" style={inputStyle} value={form.city} onChange={(e) => set({ city: e.target.value })} /></Field>
        <Field label="Ocupación" id="st-job"><input id="st-job" style={inputStyle} value={form.job} onChange={(e) => set({ job: e.target.value })} /></Field>
      </div>
      <Field label="Sobre el alumno" id="st-bio"><textarea id="st-bio" rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} value={form.bio} onChange={(e) => set({ bio: e.target.value })} /></Field>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
        <GhostButton onClick={() => setForm(toForm(student))} disabled={!dirty || saving}>Descartar cambios</GhostButton>
        <PrimaryButton icon={<Save size={15} />} loading={saving} disabled={!dirty} onClick={save}>Guardar datos</PrimaryButton>
      </div>

      <div style={{ ...card, padding: 16, display: "grid", gap: 12 }}>
        <p style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--text-muted)" }}>Cuenta</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, fontSize: 14 }}>
          <span style={{ color: "var(--text-muted)" }}>Registrado: <strong style={{ color: "var(--text-strong)", fontWeight: 500 }}>{fmtDate(student.createdAt)}</strong></span>
          <span style={{ color: "var(--text-muted)" }}>Último ingreso: <strong style={{ color: "var(--text-strong)", fontWeight: 500 }}>{student.lastLoginAt ? fmtDate(student.lastLoginAt) : "sin registro"}</strong></span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <GhostButton icon={<KeyRound size={14} />} onClick={() => setConfirmReset(true)}>Restablecer contraseña</GhostButton>
          <a href={`mailto:${student.email}`} style={{ textDecoration: "none" }}><GhostButton type="button" icon={<Mail size={14} />}>Escribirle un email</GhostButton></a>
          <GhostButton danger={!banned} loading={banBusy} icon={banned ? <ShieldCheck size={14} /> : <Ban size={14} />} onClick={toggleBan}>
            {banned ? "Reactivar en el foro" : "Suspender del foro"}
          </GhostButton>
        </div>
        {banned && <p style={{ fontSize: 13, color: "var(--danger)" }}>Este alumno está suspendido: no puede publicar en la comunidad.</p>}
      </div>

      {confirmReset && (
        <ConfirmDialog title="Restablecer contraseña" confirmLabel="Generar contraseña nueva" busy={resetting} onCancel={() => setConfirmReset(false)} onConfirm={resetPassword}
          text={<>Se genera una contraseña temporal nueva para <strong>{student.name}</strong> y la actual deja de funcionar. Vas a verla una sola vez: tenés que hacérsela llegar.</>} />
      )}
      {tempPassword && (
        <ConfirmDialog title="Contraseña temporal generada" confirmLabel="Listo, ya la copié" onCancel={() => setTempPassword(null)} onConfirm={() => setTempPassword(null)}
          text={
            <div style={{ display: "grid", gap: 12 }}>
              <p>Compartila con {student.name} por un canal privado. No se vuelve a mostrar.</p>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <code style={{ flex: 1, padding: "10px 14px", borderRadius: 9, background: "var(--surface-2)", border: "1px solid var(--border)", fontSize: 16, letterSpacing: ".04em", wordBreak: "break-all", userSelect: "all" }}>{tempPassword}</code>
                <GhostButton icon={<Copy size={14} />} onClick={() => copy(tempPassword)}>Copiar</GhostButton>
              </div>
            </div>
          } />
      )}
    </div>
  )
}
