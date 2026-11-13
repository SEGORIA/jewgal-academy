"use client"

import { useCallback, useEffect, useState } from "react"
import { Copy, KeyRound, Pencil, Plus, ShieldCheck, ShieldOff, Trash2, UserCog } from "lucide-react"
import { ConfirmDialog, EmptyState, Field, GhostButton, Modal, PageHeader, PrimaryButton, Spinner, ToastProvider, api, card, inputStyle, useToast } from "@/components/admin/ui"
import { PERMISSIONS } from "@/lib/permissions"

type Member = { id: string; name: string; email: string; role: "admin" | "staff"; status: string; permissions: string[]; lastLoginAt: string | null; createdAt: string }

const PRESETS: { label: string; perms: string[] }[] = [
  { label: "Contenido y programas", perms: ["cursos", "comunidad", "sitio"] },
  { label: "Atención a alumnos", perms: ["alumnos", "comunicaciones", "comunidad"] },
  { label: "Administración", perms: ["alumnos", "pagos", "certificados", "comunicaciones"] },
]

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" }) : "Nunca ingresó")

function PermissionPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 12.5, color: "var(--text-faint)" }}>Atajos:</span>
        {PRESETS.map((p) => <button key={p.label} type="button" onClick={() => onChange(p.perms)} style={{ padding: "4px 11px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text-strong)", fontSize: 12.5, cursor: "pointer" }}>{p.label}</button>)}
        <button type="button" onClick={() => onChange([])} style={{ padding: "4px 11px", borderRadius: 999, border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", fontSize: 12.5, cursor: "pointer" }}>Ninguna</button>
      </div>
      {PERMISSIONS.map((p) => (
        <label key={p.key} style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", padding: "8px 10px", borderRadius: 10, background: value.includes(p.key) ? "rgba(196,159,114,.1)" : "transparent" }}>
          <input type="checkbox" checked={value.includes(p.key)} onChange={(e) => onChange(e.target.checked ? [...value, p.key] : value.filter((x) => x !== p.key))} style={{ width: 18, height: 18, accentColor: "var(--terra)", marginTop: 2, flexShrink: 0 }} />
          <span><strong style={{ color: "var(--text)", fontSize: 14.5, fontWeight: 600 }}>{p.label}</strong><span style={{ display: "block", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>{p.desc}</span></span>
        </label>
      ))}
    </div>
  )
}

function Inner() {
  const toast = useToast()
  const [members, setMembers] = useState<Member[] | null>(null)
  const [me, setMe] = useState("")
  const [form, setForm] = useState<null | { id: string | null; name: string; email: string; role: "admin" | "staff"; permissions: string[] }>(null)
  const [saving, setSaving] = useState(false)
  const [secret, setSecret] = useState<null | { who: string; password: string }>(null)
  const [confirm, setConfirm] = useState<null | { kind: "reset" | "delete" | "suspend" | "reactivate"; m: Member }>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try { const d = await api<{ members: Member[]; me: string }>("/api/admin/team", { cache: "no-store" }); setMembers(d.members); setMe(d.me) }
    catch (e) { toast("error", (e as Error).message) }
  }, [toast])
  useEffect(() => { load() }, [load])

  async function save() {
    if (!form) return
    setSaving(true)
    try {
      if (form.id) {
        await api(`/api/admin/team/${form.id}`, { method: "PATCH", json: { name: form.name, role: form.role, ...(form.role === "staff" ? { permissions: form.permissions } : {}) } })
        toast("ok", "Cambios guardados")
      } else {
        const r = await api<{ tempPassword: string }>("/api/admin/team", { method: "POST", json: { name: form.name, email: form.email, role: form.role, permissions: form.permissions } })
        setSecret({ who: form.name, password: r.tempPassword })
      }
      setForm(null); await load()
    } catch (e) { toast("error", (e as Error).message) }
    finally { setSaving(false) }
  }

  async function runConfirm() {
    if (!confirm) return
    setBusy(true)
    const { kind, m } = confirm
    try {
      if (kind === "reset") { const r = await api<{ tempPassword: string }>(`/api/admin/team/${m.id}/password`, { method: "POST" }); setSecret({ who: m.name, password: r.tempPassword }) }
      else if (kind === "delete") { await api(`/api/admin/team/${m.id}`, { method: "DELETE" }); toast("ok", "Cuenta eliminada") }
      else { await api(`/api/admin/team/${m.id}`, { method: "PATCH", json: { status: kind === "suspend" ? "banned" : "active" } }); toast("ok", kind === "suspend" ? "Acceso suspendido" : "Acceso restablecido") }
      setConfirm(null); await load()
    } catch (e) { toast("error", (e as Error).message); setConfirm(null) }
    finally { setBusy(false) }
  }

  async function copy(text: string) { try { await navigator.clipboard.writeText(text); toast("ok", "Copiado") } catch { toast("error", "No se pudo copiar: seleccionalo a mano") } }

  const labelFor = (k: string) => PERMISSIONS.find((p) => p.key === k)?.label ?? k

  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <PageHeader eyebrow="Sistema" title="Equipo y permisos"
        subtitle="Quién puede entrar al panel y a qué áreas. Los Super administradores pueden todo (incluido este equipo, el historial y los respaldos); los colaboradores, solo las áreas que les asignes."
        actions={<PrimaryButton icon={<Plus size={15} />} onClick={() => setForm({ id: null, name: "", email: "", role: "staff", permissions: [] })}>Agregar integrante</PrimaryButton>} />

      {members === null ? <Spinner /> : members.length === 0 ? <EmptyState icon={<UserCog size={28} />} title="Sin integrantes" /> : (
        <div style={{ display: "grid", gap: 12 }}>
          {members.map((m) => {
            const banned = m.status === "banned"
            const isMe = m.id === me
            return (
              <div key={m.id} style={{ ...card, padding: "16px 20px", opacity: banned ? 0.65 : 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: "var(--serif)", fontSize: 19, color: "var(--text)", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      {m.name}
                      {isMe && <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--sans)" }}>(vos)</span>}
                      <span style={{ fontSize: 11.5, fontWeight: 600, padding: "3px 10px", borderRadius: 999, fontFamily: "var(--sans)", background: m.role === "admin" ? "rgba(196,159,114,.18)" : "var(--surface-2)", color: m.role === "admin" ? "var(--gold-ink)" : "var(--text-muted)" }}>{m.role === "admin" ? "Super administrador" : "Colaborador"}</span>
                      {banned && <span style={{ fontSize: 11.5, fontWeight: 600, padding: "3px 10px", borderRadius: 999, fontFamily: "var(--sans)", background: "var(--danger-soft)", color: "var(--danger)" }}>Suspendido</span>}
                    </p>
                    <p style={{ fontSize: 14, color: "var(--text-muted)" }}>{m.email} · Último ingreso: {when(m.lastLoginAt)}</p>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <GhostButton icon={<Pencil size={14} />} onClick={() => setForm({ id: m.id, name: m.name, email: m.email, role: m.role, permissions: m.permissions })}>Editar</GhostButton>
                    <GhostButton icon={<KeyRound size={14} />} onClick={() => setConfirm({ kind: "reset", m })}>Nueva contraseña</GhostButton>
                    {!isMe && (banned
                      ? <GhostButton icon={<ShieldCheck size={14} />} onClick={() => setConfirm({ kind: "reactivate", m })}>Reactivar</GhostButton>
                      : <GhostButton icon={<ShieldOff size={14} />} onClick={() => setConfirm({ kind: "suspend", m })}>Suspender</GhostButton>)}
                    {!isMe && <GhostButton danger icon={<Trash2 size={14} />} onClick={() => setConfirm({ kind: "delete", m })} aria-label={`Eliminar a ${m.name}`}>Eliminar</GhostButton>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                  {m.role === "admin" ? <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Acceso total al panel</span>
                    : m.permissions.length === 0 ? <span style={{ fontSize: 13, color: "var(--danger)" }}>Sin áreas asignadas: no puede hacer nada</span>
                    : m.permissions.map((p) => <span key={p} style={{ fontSize: 12.5, padding: "3px 10px", borderRadius: 999, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-strong)" }}>{labelFor(p)}</span>)}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {form && (
        <Modal title={form.id ? "Editar integrante" : "Agregar integrante"} onClose={() => setForm(null)} width={620}
          footer={<><GhostButton onClick={() => setForm(null)} disabled={saving}>Cancelar</GhostButton><PrimaryButton loading={saving} onClick={save} disabled={!form.name.trim() || (!form.id && !form.email.trim()) || (form.role === "staff" && form.permissions.length === 0)}>{form.id ? "Guardar" : "Crear cuenta"}</PrimaryButton></>}>
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 14 }}>
              <Field label="Nombre" id="tm-name"><input id="tm-name" style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="Correo" id="tm-email" hint={form.id ? "El correo no se puede cambiar." : "Es el usuario con el que va a ingresar."}><input id="tm-email" type="email" style={inputStyle} value={form.email} disabled={!!form.id} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            </div>
            <Field label="Rol" id="tm-role">
              <select id="tm-role" style={{ ...inputStyle, cursor: "pointer" }} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "admin" | "staff" })}>
                <option value="staff">Colaborador (solo las áreas que elijas)</option>
                <option value="admin">Super administrador (acceso total)</option>
              </select>
            </Field>
            {form.role === "staff"
              ? <div><p style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>Áreas a las que puede entrar</p><PermissionPicker value={form.permissions} onChange={(v) => setForm({ ...form, permissions: v })} /></div>
              : <p role="note" style={{ fontSize: 14, color: "var(--warning)", lineHeight: 1.6, padding: "10px 14px", borderRadius: 10, background: "var(--warning-soft)" }}>Un Super administrador puede ver y cambiar todo, incluidos pagos, el equipo y los respaldos. Dalo solo a personas de plena confianza.</p>}
          </div>
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog danger={confirm.kind === "delete" || confirm.kind === "suspend"} busy={busy} onCancel={() => setConfirm(null)} onConfirm={runConfirm}
          title={{ reset: "Nueva contraseña", delete: "Eliminar cuenta", suspend: "Suspender acceso", reactivate: "Reactivar acceso" }[confirm.kind]}
          confirmLabel={{ reset: "Generar contraseña", delete: "Eliminar", suspend: "Suspender", reactivate: "Reactivar" }[confirm.kind]}
          text={confirm.kind === "reset" ? <>Se genera una contraseña temporal nueva para <strong>{confirm.m.name}</strong> y la actual deja de funcionar. La vas a ver una sola vez.</>
            : confirm.kind === "delete" ? <>¿Eliminar la cuenta de <strong>{confirm.m.name}</strong>? Pierde el acceso para siempre. Si solo querés pausarla, usá “Suspender”.</>
            : confirm.kind === "suspend" ? <><strong>{confirm.m.name}</strong> no va a poder entrar al panel ni usar sus herramientas hasta que la reactives. Es inmediato.</>
            : <>Se le devuelve el acceso a <strong>{confirm.m.name}</strong> con los mismos permisos que tenía.</>} />
      )}

      {secret && (
        <ConfirmDialog title="Contraseña temporal" confirmLabel="Listo, ya la copié" onCancel={() => setSecret(null)} onConfirm={() => setSecret(null)}
          text={
            <div style={{ display: "grid", gap: 12 }}>
              <p>Hacésela llegar a {secret.who} por un canal privado. No se vuelve a mostrar; debería cambiarla desde “Mi perfil” al ingresar.</p>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <code style={{ flex: 1, padding: "10px 14px", borderRadius: 9, background: "var(--surface-2)", border: "1px solid var(--border)", fontSize: 16, letterSpacing: ".04em", wordBreak: "break-all", userSelect: "all" }}>{secret.password}</code>
                <GhostButton icon={<Copy size={14} />} onClick={() => copy(secret.password)}>Copiar</GhostButton>
              </div>
            </div>
          } />
      )}
    </div>
  )
}

export default function EquipoPage() { return <ToastProvider><Inner /></ToastProvider> }
