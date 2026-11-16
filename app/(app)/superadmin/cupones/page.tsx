"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Copy, Dices, Pencil, Pause, Play, Plus, Ticket, Trash2, Users } from "lucide-react"
import {
  ConfirmDialog, EmptyState, Field, GhostButton, Modal, PageHeader, PrimaryButton, Spinner, ToastProvider,
  api, card, hintStyle, inputStyle, useToast,
} from "@/components/admin/ui"

type Coupon = {
  id: string; code: string; description: string | null; type: "percent" | "fixed"; value: number
  courseIds: string[]; maxRedemptions: number | null; redemptions: number; maxPerUser: number
  startsAt: string | null; expiresAt: string | null; isActive: boolean; createdAt: string
}
type Course = { id: string; title: string; price: number; currency: string }
type Use = { id: string; email: string; createdAt: string; course: string | null; paid: number | null; discount: number | null; currency: string | null }

type Form = {
  code: string; description: string; type: "percent" | "fixed"; value: string
  allCourses: boolean; courseIds: string[]
  maxRedemptions: string; maxPerUser: string; startsAt: string; expiresAt: string; isActive: boolean
}

const EMPTY: Form = { code: "", description: "", type: "percent", value: "20", allCourses: true, courseIds: [], maxRedemptions: "", maxPerUser: "1", startsAt: "", expiresAt: "", isActive: true }

const pad = (n: number) => String(n).padStart(2, "0")
const toLocalInput = (iso: string | null) => {
  if (!iso) return ""
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? "" : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
const fmtDate = (d: string | Date) => new Date(d).toLocaleString("es-ES", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
const money = (n: number, cur = "USD") => `${n.toFixed(2)} ${cur}`

type St = "active" | "paused" | "scheduled" | "expired" | "exhausted"
function statusOf(c: Coupon): St {
  const now = Date.now()
  if (!c.isActive) return "paused"
  if (c.startsAt && new Date(c.startsAt).getTime() > now) return "scheduled"
  if (c.expiresAt && new Date(c.expiresAt).getTime() < now) return "expired"
  if (c.maxRedemptions !== null && c.redemptions >= c.maxRedemptions) return "exhausted"
  return "active"
}
const ST: Record<St, { label: string; color: string }> = {
  active: { label: "Activo", color: "var(--success)" },
  paused: { label: "Pausado", color: "var(--text-muted)" },
  scheduled: { label: "Programado", color: "var(--gold-ink)" },
  expired: { label: "Vencido", color: "var(--danger)" },
  exhausted: { label: "Agotado", color: "var(--danger)" },
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
function randomCode() {
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  return "JEWGAL-" + Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("")
}

function Inner() {
  const toast = useToast()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<{ id: string | null; form: Form } | null>(null)
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState<Coupon | null>(null)
  const [busy, setBusy] = useState(false)
  const [usesOf, setUsesOf] = useState<{ coupon: Coupon; uses: Use[] | null } | null>(null)

  const load = useCallback(async () => {
    try {
      const d = await api<{ coupons: Coupon[]; courses: Course[] }>("/api/admin/coupons", { cache: "no-store" })
      setCoupons(d.coupons); setCourses(d.courses)
    } catch (e) { toast("error", (e as Error).message) }
    finally { setLoading(false) }
  }, [toast])
  useEffect(() => { load() }, [load])

  const courseName = useMemo(() => new Map(courses.map((c) => [c.id, c.title])), [courses])

  function openNew() { setEditing({ id: null, form: { ...EMPTY, code: randomCode() } }) }
  function openEdit(c: Coupon) {
    setEditing({
      id: c.id,
      form: {
        code: c.code, description: c.description ?? "", type: c.type, value: String(c.value),
        allCourses: c.courseIds.length === 0, courseIds: c.courseIds,
        maxRedemptions: c.maxRedemptions === null ? "" : String(c.maxRedemptions), maxPerUser: String(c.maxPerUser),
        startsAt: toLocalInput(c.startsAt), expiresAt: toLocalInput(c.expiresAt), isActive: c.isActive,
      },
    })
  }

  async function save() {
    if (!editing) return
    const f = editing.form
    const value = Number(f.value)
    if (!f.code.trim()) { toast("error", "Falta el código."); return }
    if (!Number.isFinite(value) || value <= 0) { toast("error", "El descuento tiene que ser mayor que 0."); return }
    if (f.type === "percent" && value > 100) { toast("error", "Un porcentaje no puede superar 100."); return }
    if (!f.allCourses && f.courseIds.length === 0) { toast("error", "Elegí al menos un programa, o marcá “Todos los programas”."); return }
    const body = {
      code: f.code, description: f.description, type: f.type, value,
      courseIds: f.allCourses ? [] : f.courseIds,
      maxRedemptions: f.maxRedemptions.trim() === "" ? null : Number(f.maxRedemptions),
      maxPerUser: Number(f.maxPerUser) || 1,
      startsAt: f.startsAt ? new Date(f.startsAt).toISOString() : null,
      expiresAt: f.expiresAt ? new Date(f.expiresAt).toISOString() : null,
      isActive: f.isActive,
    }
    setSaving(true)
    try {
      if (editing.id) await api(`/api/admin/coupons/${editing.id}`, { method: "PATCH", json: body })
      else await api("/api/admin/coupons", { method: "POST", json: body })
      toast("ok", editing.id ? "Cupón actualizado" : "Cupón creado")
      setEditing(null)
      await load()
    } catch (e) { toast("error", (e as Error).message) }
    finally { setSaving(false) }
  }

  async function toggle(c: Coupon) {
    try {
      await api(`/api/admin/coupons/${c.id}`, { method: "PATCH", json: { isActive: !c.isActive } })
      toast("ok", c.isActive ? "Cupón pausado" : "Cupón activado")
      await load()
    } catch (e) { toast("error", (e as Error).message) }
  }

  async function remove() {
    if (!toDelete) return
    setBusy(true)
    try {
      await api(`/api/admin/coupons/${toDelete.id}`, { method: "DELETE" })
      toast("ok", "Cupón eliminado")
      setToDelete(null)
      await load()
    } catch (e) { toast("error", (e as Error).message) }
    finally { setBusy(false) }
  }

  async function openUses(c: Coupon) {
    setUsesOf({ coupon: c, uses: null })
    try {
      const d = await api<{ uses: Use[] }>(`/api/admin/coupons/${c.id}`)
      setUsesOf({ coupon: c, uses: d.uses })
    } catch (e) { toast("error", (e as Error).message); setUsesOf(null) }
  }

  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text); toast("ok", "Código copiado") }
    catch { toast("error", "No se pudo copiar: seleccionalo a mano.") }
  }

  const totals = useMemo(() => ({
    active: coupons.filter((c) => statusOf(c) === "active").length,
    uses: coupons.reduce((a, c) => a + c.redemptions, 0),
  }), [coupons])

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setEditing((e) => (e ? { ...e, form: { ...e.form, [k]: v } } : e))

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <PageHeader
        eyebrow="Ingresos"
        title="Cupones de descuento"
        subtitle={`${coupons.length} cupones · ${totals.active} activos · ${totals.uses} usos en total. El descuento se aplica en el pago de los programas y lo calcula el servidor.`}
        actions={<PrimaryButton icon={<Plus size={16} />} onClick={openNew}>Nuevo cupón</PrimaryButton>}
      />

      {loading ? <Spinner /> : coupons.length === 0 ? (
        <EmptyState
          icon={<Ticket size={34} />} title="Todavía no hay cupones"
          text="Creá un código (por ejemplo, 20% para quien se anota en la preventa) y compartilo: se aplica solo al pagar. Un cupón del 100% inscribe sin cobro (becas o cortesías)."
          action={<PrimaryButton icon={<Plus size={16} />} onClick={openNew}>Crear el primer cupón</PrimaryButton>}
        />
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {coupons.map((c) => {
            const st = statusOf(c)
            return (
              <div key={c.id} style={{ ...card, padding: "16px 18px", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 280px", minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                    <button type="button" onClick={() => copy(c.code)} title="Copiar el código" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--surface-2)", border: "1px dashed var(--border)", borderRadius: 8, padding: "4px 10px", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 14, fontWeight: 700, letterSpacing: ".06em", color: "var(--text)", cursor: "pointer" }}>
                      {c.code} <Copy size={12} aria-hidden style={{ color: "var(--text-muted)" }} />
                    </button>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--gold-ink)" }}>{c.type === "percent" ? `${c.value}% de descuento` : `${money(c.value)} de descuento`}</span>
                    <span style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: ST[st].color, border: `1px solid color-mix(in srgb, ${ST[st].color} 40%, transparent)`, borderRadius: 14, padding: "2px 10px" }}>{ST[st].label}</span>
                  </div>
                  {c.description && <p style={{ fontSize: 13.5, color: "var(--text-strong)", marginBottom: 4 }}>{c.description}</p>}
                  <p style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
                    {c.courseIds.length === 0 ? "Todos los programas pagos" : c.courseIds.map((id) => courseName.get(id) ?? "Programa eliminado").join(" · ")}
                    {" · "}{c.startsAt ? `desde ${fmtDate(c.startsAt)}` : "sin fecha de inicio"}{" · "}{c.expiresAt ? `hasta ${fmtDate(c.expiresAt)}` : "no vence"}
                  </p>
                </div>
                <div style={{ textAlign: "center", minWidth: 96 }}>
                  <p style={{ fontFamily: "var(--serif)", fontSize: 24, color: "var(--text)", lineHeight: 1 }}>
                    {c.redemptions}<span style={{ fontSize: 14, color: "var(--text-muted)" }}>{c.maxRedemptions !== null ? ` / ${c.maxRedemptions}` : ""}</span>
                  </p>
                  <p style={{ fontSize: 11.5, color: "var(--text-muted)", letterSpacing: ".08em", textTransform: "uppercase", marginTop: 4 }}>usos</p>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
                  <GhostButton icon={<Users size={14} />} onClick={() => openUses(c)} disabled={c.redemptions === 0} title="Quién lo usó">Usos</GhostButton>
                  <GhostButton icon={c.isActive ? <Pause size={14} /> : <Play size={14} />} onClick={() => toggle(c)}>{c.isActive ? "Pausar" : "Activar"}</GhostButton>
                  <GhostButton icon={<Pencil size={14} />} onClick={() => openEdit(c)} aria-label="Editar" />
                  <GhostButton icon={<Trash2 size={14} />} danger onClick={() => setToDelete(c)} aria-label="Eliminar" />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Eliminar cupón" danger busy={busy} confirmLabel="Eliminar"
          text={<>¿Eliminar el cupón <strong>{toDelete.code}</strong>? {toDelete.redemptions > 0 ? `Ya se usó ${toDelete.redemptions} vez/veces: los pagos con descuento se conservan, pero se pierde el detalle de usos. Si solo querés que deje de funcionar, usá “Pausar”.` : "Dejará de funcionar."}</>}
          onConfirm={remove} onCancel={() => setToDelete(null)}
        />
      )}

      {usesOf && (
        <Modal title={`Usos de ${usesOf.coupon.code}`} onClose={() => setUsesOf(null)} width={680}>
          {usesOf.uses === null ? <Spinner /> : usesOf.uses.length === 0 ? <p style={{ color: "var(--text-muted)" }}>Todavía nadie lo usó.</p> : (
            <div style={{ display: "grid", gap: 8 }}>
              {usesOf.uses.map((u) => (
                <div key={u.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13.5 }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ color: "var(--text)", overflowWrap: "anywhere" }}>{u.email}</p>
                    <p style={{ color: "var(--text-muted)", fontSize: 12.5 }}>{u.course ?? "—"} · {fmtDate(u.createdAt)}</p>
                  </div>
                  <div style={{ textAlign: "right", color: "var(--text-muted)", fontSize: 12.5 }}>
                    {u.paid !== null && <p style={{ color: "var(--text)" }}>{u.paid === 0 ? "Sin cargo" : `Pagó ${money(u.paid, u.currency ?? "USD")}`}</p>}
                    {u.discount !== null && <p>Descuento {money(u.discount, u.currency ?? "USD")}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {editing && (
        <Modal
          title={editing.id ? "Editar cupón" : "Nuevo cupón"} onClose={() => setEditing(null)} width={640}
          footer={<><GhostButton onClick={() => setEditing(null)}>Cancelar</GhostButton><PrimaryButton loading={saving} onClick={save}>{editing.id ? "Guardar cambios" : "Crear cupón"}</PrimaryButton></>}
        >
          <div style={{ display: "grid", gap: 16 }}>
            <Field label="Código" id="cp-code" hint="Lo escribe quien compra. Letras, números y guiones; no distingue mayúsculas.">
              <div style={{ display: "flex", gap: 8 }}>
                <input id="cp-code" value={editing.form.code} onChange={(e) => set("code", e.target.value.toUpperCase().replace(/\s+/g, ""))} maxLength={40} style={{ ...inputStyle, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", letterSpacing: ".06em" }} />
                <GhostButton icon={<Dices size={14} />} onClick={() => set("code", randomCode())} title="Generar un código al azar">Generar</GhostButton>
              </div>
            </Field>
            <Field label="Descripción (solo para vos)" id="cp-desc">
              <input id="cp-desc" value={editing.form.description} onChange={(e) => set("description", e.target.value)} maxLength={200} placeholder="Ej.: Preventa de marzo" style={inputStyle} />
            </Field>

            <div className="admin-form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Tipo de descuento" id="cp-type">
                <select id="cp-type" value={editing.form.type} onChange={(e) => set("type", e.target.value as Form["type"])} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="percent">Porcentaje (%)</option>
                  <option value="fixed">Monto fijo (USD)</option>
                </select>
              </Field>
              <Field label={editing.form.type === "percent" ? "Porcentaje" : "Monto a descontar"} id="cp-value" hint={editing.form.type === "percent" && Number(editing.form.value) === 100 ? "100% inscribe sin cobro (beca / cortesía)." : undefined}>
                <input id="cp-value" type="number" min={0} step={editing.form.type === "percent" ? 1 : 0.01} value={editing.form.value} onChange={(e) => set("value", e.target.value)} style={inputStyle} />
              </Field>
            </div>

            <div>
              <span style={{ ...hintStyle, marginTop: 0, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".14em", fontSize: 11 }}>Programas donde vale</span>
              <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14, color: "var(--text-strong)", marginBottom: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={editing.form.allCourses} onChange={(e) => set("allCourses", e.target.checked)} /> Todos los programas pagos
              </label>
              {!editing.form.allCourses && (
                <div style={{ display: "grid", gap: 6, paddingLeft: 4 }}>
                  {courses.map((c) => (
                    <label key={c.id} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13.5, color: "var(--text-strong)", cursor: "pointer" }}>
                      <input
                        type="checkbox" checked={editing.form.courseIds.includes(c.id)}
                        onChange={(e) => set("courseIds", e.target.checked ? [...editing.form.courseIds, c.id] : editing.form.courseIds.filter((x) => x !== c.id))}
                      />
                      {c.title} <span style={{ color: "var(--text-muted)" }}>· {money(c.price, c.currency)}</span>
                    </label>
                  ))}
                  {courses.length === 0 && <p style={hintStyle}>No hay programas pagos todavía.</p>}
                </div>
              )}
            </div>

            <div className="admin-form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Tope de usos" id="cp-max" hint="Vacío = sin tope.">
                <input id="cp-max" type="number" min={1} step={1} value={editing.form.maxRedemptions} onChange={(e) => set("maxRedemptions", e.target.value)} placeholder="Sin tope" style={inputStyle} />
              </Field>
              <Field label="Usos por persona" id="cp-per" hint="Se cuenta por correo electrónico.">
                <input id="cp-per" type="number" min={1} step={1} value={editing.form.maxPerUser} onChange={(e) => set("maxPerUser", e.target.value)} style={inputStyle} />
              </Field>
            </div>
            <div className="admin-form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Vale desde" id="cp-from" hint="Vacío = ya.">
                <input id="cp-from" type="datetime-local" value={editing.form.startsAt} onChange={(e) => set("startsAt", e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Vence" id="cp-to" hint="Vacío = no vence.">
                <input id="cp-to" type="datetime-local" value={editing.form.expiresAt} onChange={(e) => set("expiresAt", e.target.value)} style={inputStyle} />
              </Field>
            </div>
            <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14, color: "var(--text-strong)", cursor: "pointer" }}>
              <input type="checkbox" checked={editing.form.isActive} onChange={(e) => set("isActive", e.target.checked)} /> Cupón activo
            </label>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default function CuponesPage() { return <ToastProvider><Inner /></ToastProvider> }
