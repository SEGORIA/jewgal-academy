"use client"

import { useCallback, useEffect, useState } from "react"
import { ArrowDown, ArrowUp, Eye, EyeOff, Languages, Pencil, Plus, Quote, Trash2 } from "lucide-react"
import { ConfirmDialog, EmptyState, Field, GhostButton, Modal, PageHeader, PrimaryButton, Spinner, ToastProvider, api, card, inputStyle, useToast } from "@/components/admin/ui"

type Testimonial = {
  id: string; name: string; role: string; roleEn: string | null; text: string; textEn: string | null; isVisible: boolean; order: number
}
const EMPTY = { name: "", role: "", roleEn: "", text: "", textEn: "", isVisible: true }

function Inner() {
  const toast = useToast()
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<{ id: string | null; form: typeof EMPTY } | null>(null)
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [deleting, setDeleting] = useState<Testimonial | null>(null)

  const load = useCallback(async () => {
    try {
      const d = await api<{ testimonials: Testimonial[] }>("/api/admin/testimonials", { cache: "no-store" })
      setItems(d.testimonials)
    } catch (e) { toast("error", (e as Error).message) }
    finally { setLoading(false) }
  }, [toast])
  useEffect(() => { load() }, [load])

  const openNew = () => setEditing({ id: null, form: { ...EMPTY } })
  const openEdit = (t: Testimonial) => setEditing({ id: t.id, form: { name: t.name, role: t.role, roleEn: t.roleEn ?? "", text: t.text, textEn: t.textEn ?? "", isVisible: t.isVisible } })

  async function save() {
    if (!editing) return
    setSaving(true)
    try {
      const f = editing.form
      const body = { name: f.name, role: f.role, roleEn: f.roleEn || null, text: f.text, textEn: f.textEn || null, isVisible: f.isVisible }
      if (editing.id) await api(`/api/admin/testimonials/${editing.id}`, { method: "PATCH", json: body })
      else await api("/api/admin/testimonials", { method: "POST", json: body })
      toast("ok", editing.id ? "Testimonio actualizado" : "Testimonio agregado")
      setEditing(null)
      await load()
    } catch (e) { toast("error", (e as Error).message) }
    finally { setSaving(false) }
  }

  async function translate() {
    if (!editing) return
    setTranslating(true)
    try {
      const { translations } = await api<{ translations: string[] }>("/api/admin/translate", { method: "POST", json: { texts: [editing.form.text, editing.form.role || " "], target: "EN" } })
      setEditing({ ...editing, form: { ...editing.form, textEn: translations[0] ?? "", roleEn: editing.form.role ? translations[1] ?? "" : "" } })
      toast("ok", "Traducción generada: revisala antes de guardar")
    } catch (e) { toast("error", (e as Error).message) }
    finally { setTranslating(false) }
  }

  async function toggle(t: Testimonial) {
    try { await api(`/api/admin/testimonials/${t.id}`, { method: "PATCH", json: { isVisible: !t.isVisible } }); await load() }
    catch (e) { toast("error", (e as Error).message) }
  }

  async function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]; [next[i], next[j]] = [next[j], next[i]]
    setItems(next)
    try { await api("/api/admin/testimonials", { method: "PUT", json: { ids: next.map((t) => t.id) } }) }
    catch (e) { toast("error", (e as Error).message); load() }
  }

  async function remove() {
    if (!deleting) return
    try { await api(`/api/admin/testimonials/${deleting.id}`, { method: "DELETE" }); toast("ok", "Testimonio eliminado"); setDeleting(null); await load() }
    catch (e) { toast("error", (e as Error).message) }
  }

  const f = editing?.form
  const set = (patch: Partial<typeof EMPTY>) => editing && setEditing({ ...editing, form: { ...editing.form, ...patch } })

  return (
    <div>
      <PageHeader
        eyebrow="Sitio público" title="Testimonios"
        subtitle="Las voces de alumnas y alumnos que aparecen en el carrusel de la página de inicio. Podés ordenarlos, ocultarlos y traducirlos al inglés."
        actions={<PrimaryButton icon={<Plus size={15} />} onClick={openNew}>Nuevo testimonio</PrimaryButton>}
      />

      {loading ? <Spinner /> : items.length === 0 ? (
        <EmptyState icon={<Quote size={28} />} title="Todavía no hay testimonios" text="Agregá el primero para que aparezca en la página de inicio." action={<PrimaryButton icon={<Plus size={15} />} onClick={openNew}>Nuevo testimonio</PrimaryButton>} />
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((t, i) => (
            <div key={t.id} style={{ ...card, padding: "16px 18px", display: "flex", gap: 16, alignItems: "flex-start", opacity: t.isVisible ? 1 : 0.55 }}>
              <div style={{ display: "grid", gap: 2 }}>
                <button aria-label="Subir" disabled={i === 0} onClick={() => move(i, -1)} style={arrow(i === 0)}><ArrowUp size={14} /></button>
                <button aria-label="Bajar" disabled={i === items.length - 1} onClick={() => move(i, 1)} style={arrow(i === items.length - 1)}><ArrowDown size={14} /></button>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: "var(--text-strong)", fontSize: 15, lineHeight: 1.6, fontFamily: "var(--serif)", fontStyle: "italic", marginBottom: 8 }}>“{t.text}”</p>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  <strong style={{ color: "var(--text-strong)", fontWeight: 600 }}>{t.name}</strong>{t.role ? ` · ${t.role}` : ""}
                  {t.textEn ? <span style={{ marginLeft: 10, color: "var(--gold-ink)" }}>· EN ✓</span> : <span style={{ marginLeft: 10 }}>· sin versión en inglés</span>}
                  {!t.isVisible && <span style={{ marginLeft: 10 }}>· oculto</span>}
                </p>
              </div>
              <div style={{ display: "flex", gap: 2 }}>
                <button title={t.isVisible ? "Ocultar" : "Mostrar"} onClick={() => toggle(t)} style={iconBtn}>{t.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}</button>
                <button title="Editar" onClick={() => openEdit(t)} style={iconBtn}><Pencil size={16} /></button>
                <button title="Eliminar" onClick={() => setDeleting(t)} style={{ ...iconBtn, color: "var(--danger)" }}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && f && (
        <Modal title={editing.id ? "Editar testimonio" : "Nuevo testimonio"} onClose={() => setEditing(null)} width={680}
          footer={<><GhostButton onClick={() => setEditing(null)}>Cancelar</GhostButton><PrimaryButton loading={saving} onClick={save}>Guardar</PrimaryButton></>}>
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Nombre" id="t-name"><input id="t-name" style={inputStyle} value={f.name} onChange={(e) => set({ name: e.target.value })} /></Field>
              <Field label="Programa o rol" id="t-role" hint="Ej.: Life Coaching Integrativo"><input id="t-role" style={inputStyle} value={f.role} onChange={(e) => set({ role: e.target.value })} /></Field>
            </div>
            <Field label="Testimonio (español)" id="t-text"><textarea id="t-text" rows={4} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} value={f.text} onChange={(e) => set({ text: e.target.value })} /></Field>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Versión en inglés (opcional; si falta, se muestra en español)</span>
              <GhostButton icon={<Languages size={14} />} loading={translating} onClick={translate} disabled={!f.text.trim()}>Traducir con IA</GhostButton>
            </div>
            <Field label="Testimonio (inglés)" id="t-texten"><textarea id="t-texten" rows={4} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} value={f.textEn} onChange={(e) => set({ textEn: e.target.value })} /></Field>
            <Field label="Programa o rol (inglés)" id="t-roleen"><input id="t-roleen" style={inputStyle} value={f.roleEn} onChange={(e) => set({ roleEn: e.target.value })} /></Field>
            <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14, color: "var(--text-strong)", cursor: "pointer" }}>
              <input type="checkbox" checked={f.isVisible} onChange={(e) => set({ isVisible: e.target.checked })} style={{ width: 18, height: 18, accentColor: "var(--terra)" }} /> Visible en el sitio
            </label>
          </div>
        </Modal>
      )}

      {deleting && <ConfirmDialog title="Eliminar testimonio" danger confirmLabel="Eliminar" onCancel={() => setDeleting(null)} onConfirm={remove}
        text={<>¿Eliminar el testimonio de <strong>{deleting.name}</strong>? Queda registrado en el Historial de cambios y se puede restaurar desde allí.</>} />}
    </div>
  )
}

const iconBtn: React.CSSProperties = { background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 8, borderRadius: 8, display: "flex" }
const arrow = (disabled: boolean): React.CSSProperties => ({ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: 6, padding: 4, display: "flex", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.35 : 1 })

export default function TestimoniosPage() { return <ToastProvider><Inner /></ToastProvider> }
