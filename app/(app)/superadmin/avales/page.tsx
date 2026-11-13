"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowDown, ArrowUp, BadgeCheck, Eye, EyeOff, Plus, RotateCcw, Save, Trash2, Upload } from "lucide-react"
import { ConfirmDialog, EmptyState, Field, GhostButton, PageHeader, PrimaryButton, Spinner, ToastProvider, api, card, inputStyle, useToast } from "@/components/admin/ui"
import { uploadToCloudinary } from "@/lib/cloudinary-upload"

type Aval = { id: string; code: string; name: string; logoUrl: string; visible: boolean }

function Inner() {
  const toast = useToast()
  const [items, setItems] = useState<Aval[]>([])
  const [defaults, setDefaults] = useState<Aval[]>([])
  const [loading, setLoading] = useState(true)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const uploadFor = useRef<string | null>(null)

  const load = useCallback(async () => {
    try {
      const d = await api<{ avales: Aval[]; defaults: Aval[] }>("/api/admin/avales", { cache: "no-store" })
      setItems(d.avales); setDefaults(d.defaults); setDirty(false)
    } catch (e) { toast("error", (e as Error).message) }
    finally { setLoading(false) }
  }, [toast])
  useEffect(() => { load() }, [load])

  // avisa si se intenta salir con cambios sin guardar
  useEffect(() => {
    if (!dirty) return
    const h = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener("beforeunload", h)
    return () => window.removeEventListener("beforeunload", h)
  }, [dirty])

  const update = (id: string, patch: Partial<Aval>) => { setItems((l) => l.map((a) => (a.id === id ? { ...a, ...patch } : a))); setDirty(true) }
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]; [next[i], next[j]] = [next[j], next[i]]
    setItems(next); setDirty(true)
  }
  const add = () => { setItems((l) => [...l, { id: Math.random().toString(36).slice(2, 10), code: "", name: "", logoUrl: "", visible: true }]); setDirty(true) }
  const remove = (id: string) => { setItems((l) => l.filter((a) => a.id !== id)); setDirty(true) }

  async function onFile(file: File | undefined) {
    const id = uploadFor.current
    if (!file || !id) return
    setUploading(id)
    try {
      const url = await uploadToCloudinary(file, "jewgal-avales", () => {})
      update(id, { logoUrl: url })
    } catch (e) { toast("error", (e as Error).message) }
    finally { setUploading(null); if (fileRef.current) fileRef.current.value = "" }
  }

  async function save() {
    setSaving(true)
    try {
      await api("/api/admin/avales", { method: "PUT", json: { avales: items } })
      toast("ok", "Avales guardados. Ya se ven en el sitio.")
      setDirty(false)
    } catch (e) { toast("error", (e as Error).message) }
    finally { setSaving(false) }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Sitio público" title="Avales y alianzas"
        subtitle="Los logos de la franja “Avales y certificaciones” de la página de inicio. Los avales de cada programa se administran en Certificados."
        actions={<>
          <GhostButton icon={<RotateCcw size={14} />} onClick={() => setConfirmReset(true)}>Volver a los originales</GhostButton>
          <GhostButton icon={<Plus size={14} />} onClick={add}>Agregar aval</GhostButton>
          <PrimaryButton icon={<Save size={15} />} loading={saving} disabled={!dirty} onClick={save}>Guardar cambios</PrimaryButton>
        </>}
      />
      <input ref={fileRef} type="file" accept="image/*" hidden aria-label="Subir logo" onChange={(e) => onFile(e.target.files?.[0])} />

      {loading ? <Spinner /> : items.length === 0 ? (
        <EmptyState icon={<BadgeCheck size={28} />} title="La franja de avales está vacía" text="Agregá los logos de las instituciones que respaldan los programas." action={<PrimaryButton icon={<Plus size={15} />} onClick={add}>Agregar aval</PrimaryButton>} />
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((a, i) => (
            <div key={a.id} style={{ ...card, padding: "14px 16px", display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", opacity: a.visible ? 1 : 0.55 }}>
              <div style={{ display: "grid", gap: 2 }}>
                <button aria-label="Subir" disabled={i === 0} onClick={() => move(i, -1)} style={arrow(i === 0)}><ArrowUp size={13} /></button>
                <button aria-label="Bajar" disabled={i === items.length - 1} onClick={() => move(i, 1)} style={arrow(i === items.length - 1)}><ArrowDown size={13} /></button>
              </div>
              <button onClick={() => { uploadFor.current = a.id; fileRef.current?.click() }} title="Cambiar logo" aria-label={`Cambiar logo de ${a.name || "aval nuevo"}`}
                style={{ width: 96, height: 56, borderRadius: 10, border: "1px dashed var(--border)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", padding: 4 }}>
                {uploading === a.id ? <span style={{ fontSize: 11, color: "#76604C" }}>Subiendo…</span> : a.logoUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={a.logoUrl} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                  : <Upload size={18} color="#76604C" />}
              </button>
              <div style={{ flex: "1 1 200px", minWidth: 0 }}><Field label="Nombre completo" id={`n-${a.id}`}><input id={`n-${a.id}`} style={inputStyle} value={a.name} onChange={(e) => update(a.id, { name: e.target.value })} placeholder="Florida Global University" /></Field></div>
              <div style={{ flex: "0 1 110px" }}><Field label="Sigla" id={`c-${a.id}`}><input id={`c-${a.id}`} style={inputStyle} value={a.code} maxLength={12} onChange={(e) => update(a.id, { code: e.target.value })} placeholder="FGU" /></Field></div>
              <div style={{ display: "flex", gap: 2 }}>
                <button title={a.visible ? "Ocultar" : "Mostrar"} onClick={() => update(a.id, { visible: !a.visible })} style={iconBtn}>{a.visible ? <Eye size={16} /> : <EyeOff size={16} />}</button>
                <button title="Quitar" onClick={() => remove(a.id)} style={{ ...iconBtn, color: "var(--danger)" }}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <p style={{ fontSize: 13, color: "var(--text-faint)", marginTop: 16, lineHeight: 1.6 }}>
        Consejo: usá logos con fondo transparente o blanco, de buena resolución. La sigla se muestra solo si el logo no carga.
      </p>

      {confirmReset && (
        <ConfirmDialog title="Volver a los avales originales" confirmLabel="Restaurar" onCancel={() => setConfirmReset(false)}
          onConfirm={() => { setItems(defaults); setDirty(true); setConfirmReset(false) }}
          text="Se reemplaza la lista actual por los 8 avales originales del sitio. Todavía tenés que guardar para publicarlo." />
      )}
    </div>
  )
}

const iconBtn: React.CSSProperties = { background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 8, borderRadius: 8, display: "flex" }
const arrow = (disabled: boolean): React.CSSProperties => ({ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: 6, padding: 3, display: "flex", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.35 : 1 })

export default function AvalesPage() { return <ToastProvider><Inner /></ToastProvider> }
