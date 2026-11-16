"use client"

import { useCallback, useEffect, useState } from "react"
import { CalendarDays, ChevronDown, ChevronUp, Download, Eye, EyeOff, Languages, Plus, Save, Trash2, Users } from "lucide-react"
import ImageUpload from "@/components/admin/ImageUpload"
import { ConfirmDialog, Field, GhostButton, Modal, PageHeader, PrimaryButton, Spinner, ToastProvider, api, card, hintStyle, inputStyle, useToast } from "@/components/admin/ui"
import { DEFAULT_EVENTOS, normalizeEventos, type EventoItem, type EventoPasado, type EventosData } from "@/lib/eventos"

type Reg = { id: string; name: string; email: string; phone: string | null; notes: string | null; status: "confirmed" | "waitlist" | "cancelled"; createdAt: string }
type Counts = Record<string, { confirmed: number; waitlist: number }>

const newId = () => `ev-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
const iconBtn = (disabled?: boolean): React.CSSProperties => ({ width: 34, height: 34, borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-2)", cursor: disabled ? "default" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", opacity: disabled ? 0.35 : 1 })
const STATUS_LABEL: Record<Reg["status"], string> = { confirmed: "Confirmada", waitlist: "Lista de espera", cancelled: "Cancelada" }

function Inner() {
  const toast = useToast()
  const [data, setData] = useState<EventosData>(DEFAULT_EVENTOS)
  const [saved, setSaved] = useState(JSON.stringify(DEFAULT_EVENTOS))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [counts, setCounts] = useState<Counts>({})
  const [openEn, setOpenEn] = useState<Record<string, boolean>>({})
  const [regs, setRegs] = useState<{ event: EventoItem; rows: Reg[] | null } | null>(null)
  const [toDelete, setToDelete] = useState<number | null>(null)
  const [translating, setTranslating] = useState<string | null>(null)
  const dirty = JSON.stringify(data) !== saved

  const load = useCallback(async () => {
    try {
      const [d, c] = await Promise.all([
        api<EventosData>("/api/admin/eventos", { cache: "no-store" }),
        api<{ counts: Counts }>("/api/admin/eventos/registrations", { cache: "no-store" }).catch(() => ({ counts: {} as Counts })),
      ])
      const n = normalizeEventos(d)
      setData(n); setSaved(JSON.stringify(n)); setCounts(c.counts)
    } catch (e) { toast("error", (e as Error).message) }
    finally { setLoading(false) }
  }, [toast])
  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!dirty) return
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = "" }
    window.addEventListener("beforeunload", h)
    return () => window.removeEventListener("beforeunload", h)
  }, [dirty])

  const setEvento = (i: number, patch: Partial<EventoItem>) => setData((d) => ({ ...d, upcoming: d.upcoming.map((ev, idx) => (idx === i ? { ...ev, ...patch } : ev)) }))
  const setPasado = (i: number, patch: Partial<EventoPasado>) => setData((d) => ({ ...d, past: d.past.map((p, idx) => (idx === i ? { ...p, ...patch } : p)) }))
  function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= data.upcoming.length) return
    const next = [...data.upcoming]
    ;[next[i], next[j]] = [next[j], next[i]]
    setData((d) => ({ ...d, upcoming: next }))
  }

  async function save() {
    setSaving(true)
    try {
      const body = {
        upcoming: data.upcoming.map((e) => ({ ...e, capacity: e.registration ? e.capacity ?? null : e.capacity ?? null })),
        past: data.past,
      }
      await api("/api/admin/eventos", { method: "POST", json: body })
      toast("ok", "Eventos guardados")
      setSaved(JSON.stringify(data))
    } catch (e) { toast("error", (e as Error).message) }
    finally { setSaving(false) }
  }

  async function translate(ev: EventoItem, i: number) {
    setTranslating(ev.id)
    try {
      const texts = [ev.title, ev.type, ev.location, ev.price, ev.desc]
      const d = await api<{ translations: string[] }>("/api/admin/translate", { method: "POST", json: { texts: texts.map((t) => t || " "), target: "EN" } })
      const [title, type, location, price, desc] = d.translations
      setEvento(i, { titleEn: ev.title ? title : ev.titleEn, typeEn: ev.type ? type : ev.typeEn, locationEn: ev.location ? location : ev.locationEn, priceEn: ev.price ? price : ev.priceEn, descEn: ev.desc ? desc : ev.descEn })
      toast("ok", "Borrador en inglés listo. Revisalo antes de guardar.")
    } catch (e) { toast("error", (e as Error).message) }
    finally { setTranslating(null) }
  }

  async function openRegs(ev: EventoItem) {
    setRegs({ event: ev, rows: null })
    try {
      const d = await api<{ registrations: Reg[] }>(`/api/admin/eventos/registrations?eventId=${encodeURIComponent(ev.id)}`, { cache: "no-store" })
      setRegs({ event: ev, rows: d.registrations })
    } catch (e) { toast("error", (e as Error).message); setRegs(null) }
  }

  async function setRegStatus(r: Reg, status: Reg["status"]) {
    try {
      await api("/api/admin/eventos/registrations", { method: "PATCH", json: { id: r.id, status } })
      setRegs((cur) => (cur ? { ...cur, rows: cur.rows?.map((x) => (x.id === r.id ? { ...x, status } : x)) ?? null } : cur))
      toast("ok", status === "confirmed" && r.status === "waitlist" ? "Lugar confirmado: se le avisó por correo" : "Reserva actualizada")
      const c = await api<{ counts: Counts }>("/api/admin/eventos/registrations", { cache: "no-store" }); setCounts(c.counts)
    } catch (e) { toast("error", (e as Error).message) }
  }

  async function removeReg(r: Reg) {
    try {
      await api(`/api/admin/eventos/registrations?id=${encodeURIComponent(r.id)}`, { method: "DELETE" })
      setRegs((cur) => (cur ? { ...cur, rows: cur.rows?.filter((x) => x.id !== r.id) ?? null } : cur))
      const c = await api<{ counts: Counts }>("/api/admin/eventos/registrations", { cache: "no-store" }); setCounts(c.counts)
    } catch (e) { toast("error", (e as Error).message) }
  }

  function exportCsv(ev: EventoItem, rows: Reg[]) {
    const esc = (v: string | null) => `"${(v ?? "").replace(/"/g, '""')}"`
    const lines = [["Nombre", "Email", "Teléfono", "Estado", "Comentarios", "Fecha"].join(","), ...rows.map((r) => [esc(r.name), esc(r.email), esc(r.phone), esc(STATUS_LABEL[r.status]), esc(r.notes), esc(new Date(r.createdAt).toLocaleString("es-ES"))].join(","))]
    const url = URL.createObjectURL(new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" }))
    const a = document.createElement("a"); a.href = url; a.download = `reservas-${ev.id}.csv`; a.click(); URL.revokeObjectURL(url)
  }

  if (loading) return <Spinner />

  return (
    <div style={{ maxWidth: 920, margin: "0 auto" }}>
      <PageHeader
        eyebrow="Sitio web" title="Eventos"
        subtitle="Creá, editá, ordená y ocultá los eventos de la página pública. Podés sumar foto, versión en inglés y reservas con cupo y lista de espera. El contador regresivo usa el próximo evento visible."
        actions={<PrimaryButton icon={<Save size={16} />} loading={saving} onClick={save}>{dirty ? "Guardar cambios" : "Guardado"}</PrimaryButton>}
      />
      {dirty && <p style={{ color: "var(--gold-ink)", fontSize: 13, marginTop: -14, marginBottom: 16 }}>● Hay cambios sin guardar</p>}

      <p style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 14 }}>Próximos eventos</p>
      <div style={{ display: "grid", gap: 16 }}>
        {data.upcoming.map((ev, i) => {
          const c = counts[ev.id]
          return (
            <div key={ev.id} style={{ ...card, padding: "18px 20px", opacity: ev.active ? 1 : 0.55 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 14 }}>
                <div style={{ width: 200, flexShrink: 0 }}><Field label="Fecha y hora" id={`ev-dt-${i}`}><input id={`ev-dt-${i}`} type="datetime-local" value={ev.datetime} onChange={(e) => setEvento(i, { datetime: e.target.value })} style={inputStyle} /></Field></div>
                <div style={{ flex: 1, minWidth: 220 }}><Field label="Título" id={`ev-t-${i}`}><input id={`ev-t-${i}`} value={ev.title} onChange={(e) => setEvento(i, { title: e.target.value })} placeholder="Nombre del evento" style={inputStyle} /></Field></div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Subir" style={iconBtn(i === 0)}><ChevronUp size={14} /></button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === data.upcoming.length - 1} aria-label="Bajar" style={iconBtn(i === data.upcoming.length - 1)}><ChevronDown size={14} /></button>
                  <button type="button" onClick={() => setEvento(i, { active: !ev.active })} aria-label={ev.active ? "Ocultar del sitio" : "Mostrar en el sitio"} title={ev.active ? "Ocultar del sitio" : "Mostrar en el sitio"} style={{ ...iconBtn(), color: ev.active ? "var(--gold-ink)" : "var(--text-faint)" }}>{ev.active ? <Eye size={14} /> : <EyeOff size={14} />}</button>
                  <button type="button" onClick={() => setToDelete(i)} aria-label="Eliminar evento" style={{ ...iconBtn(), color: "var(--danger)" }}><Trash2 size={14} /></button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 12 }} className="admin-form-grid-3">
                <Field label="Tipo" id={`ev-ty-${i}`}><input id={`ev-ty-${i}`} value={ev.type} onChange={(e) => setEvento(i, { type: e.target.value })} placeholder="Retiro presencial" style={inputStyle} /></Field>
                <Field label="Lugar" id={`ev-lo-${i}`}><input id={`ev-lo-${i}`} value={ev.location} onChange={(e) => setEvento(i, { location: e.target.value })} placeholder="Miami, Florida" style={inputStyle} /></Field>
                <Field label="Precio" id={`ev-pr-${i}`}><input id={`ev-pr-${i}`} value={ev.price} onChange={(e) => setEvento(i, { price: e.target.value })} placeholder="$450 · Gratis" style={inputStyle} /></Field>
                <Field label="Plazas (texto)" id={`ev-sp-${i}`}><input id={`ev-sp-${i}`} value={ev.spots} onChange={(e) => setEvento(i, { spots: e.target.value })} placeholder="20" style={inputStyle} /></Field>
              </div>
              <Field label="Descripción" id={`ev-de-${i}`}><textarea id={`ev-de-${i}`} value={ev.desc} onChange={(e) => setEvento(i, { desc: e.target.value })} rows={2} placeholder="Descripción breve del evento…" style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} /></Field>

              <div style={{ marginTop: 14 }}>
                <ImageUpload label="Foto del evento (opcional)" value={ev.imageUrl ?? ""} onChange={(u) => setEvento(i, { imageUrl: u || undefined })} folder="jewgal-eventos" aspect="16/9" hint="Se ve de fondo en el panel de la fecha. Horizontal, mínimo 800 px." />
              </div>

              {/* Reservas */}
              <div style={{ marginTop: 14, padding: "12px 14px", border: "1px solid var(--border)", borderRadius: 10, background: "var(--surface-2)", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14, color: "var(--text-strong)", cursor: "pointer" }}>
                  <input type="checkbox" checked={!!ev.registration} onChange={(e) => setEvento(i, { registration: e.target.checked })} /> Reservas en el sitio
                </label>
                {ev.registration && (
                  <>
                    <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "var(--text-muted)" }}>
                      Cupo máximo
                      <input type="number" min={1} value={ev.capacity ?? ""} placeholder="Sin tope" onChange={(e) => setEvento(i, { capacity: e.target.value === "" ? null : Number(e.target.value) })} style={{ ...inputStyle, width: 110 }} />
                    </label>
                    <GhostButton icon={<Users size={14} />} onClick={() => openRegs(ev)} disabled={dirty && !c} title={dirty && !c ? "Guardá los cambios para ver las reservas de un evento nuevo" : undefined}>
                      Reservas{c ? ` (${c.confirmed}${c.waitlist ? ` + ${c.waitlist} en espera` : ""})` : ""}
                    </GhostButton>
                  </>
                )}
                {!ev.registration && <span style={{ ...hintStyle, marginTop: 0 }}>Sin reservas, el botón lleva al formulario de contacto.</span>}
              </div>

              {/* Inglés */}
              <div style={{ marginTop: 12 }}>
                <button type="button" onClick={() => setOpenEn((o) => ({ ...o, [ev.id]: !o[ev.id] }))} aria-expanded={!!openEn[ev.id]} style={{ background: "none", border: "none", color: "var(--gold-ink)", cursor: "pointer", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6, padding: 0, fontFamily: "inherit" }}>
                  <Languages size={14} /> Versión en inglés{ev.titleEn || ev.descEn ? " ✓" : ""} {openEn[ev.id] ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
                {openEn[ev.id] && (
                  <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }} className="admin-form-grid-3">
                      <Field label="Title" id={`ev-ten-${i}`}><input id={`ev-ten-${i}`} value={ev.titleEn ?? ""} onChange={(e) => setEvento(i, { titleEn: e.target.value })} placeholder={ev.title} style={inputStyle} /></Field>
                      <Field label="Type" id={`ev-tyen-${i}`}><input id={`ev-tyen-${i}`} value={ev.typeEn ?? ""} onChange={(e) => setEvento(i, { typeEn: e.target.value })} placeholder={ev.type} style={inputStyle} /></Field>
                      <Field label="Location" id={`ev-loen-${i}`}><input id={`ev-loen-${i}`} value={ev.locationEn ?? ""} onChange={(e) => setEvento(i, { locationEn: e.target.value })} placeholder={ev.location} style={inputStyle} /></Field>
                      <Field label="Price" id={`ev-pren-${i}`}><input id={`ev-pren-${i}`} value={ev.priceEn ?? ""} onChange={(e) => setEvento(i, { priceEn: e.target.value })} placeholder={ev.price} style={inputStyle} /></Field>
                    </div>
                    <Field label="Description" id={`ev-deen-${i}`}><textarea id={`ev-deen-${i}`} value={ev.descEn ?? ""} onChange={(e) => setEvento(i, { descEn: e.target.value })} rows={2} placeholder={ev.desc} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} /></Field>
                    <div><GhostButton icon={<Languages size={14} />} loading={translating === ev.id} onClick={() => translate(ev, i)}>Traducir desde español</GhostButton></div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <button type="button" onClick={() => setData((d) => ({ ...d, upcoming: [...d.upcoming, { id: newId(), datetime: "2026-12-01T10:00", title: "", type: "Evento presencial", location: "", desc: "", spots: "", price: "", active: true, registration: false, capacity: null }] }))} style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, cursor: "pointer", background: "transparent", border: "1px dashed rgba(165,141,102,.4)", color: "var(--gold-ink)", fontSize: 13, fontWeight: 600 }}>
        <Plus size={15} /> Agregar evento
      </button>

      <p style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--text-faint)", margin: "36px 0 14px" }}>Eventos anteriores</p>
      <div style={{ display: "grid", gap: 10 }}>
        {data.past.map((p, i) => (
          <div key={i} style={{ ...card, padding: "14px 16px", display: "grid", gap: 10 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
              <div style={{ flex: 2, minWidth: 200 }}><Field label="Título" id={`pa-t-${i}`}><input id={`pa-t-${i}`} value={p.title} onChange={(e) => setPasado(i, { title: e.target.value })} placeholder="Retiro Sholem · Buenos Aires" style={inputStyle} /></Field></div>
              <div style={{ flex: 1, minWidth: 120 }}><Field label="Fecha (texto)" id={`pa-d-${i}`}><input id={`pa-d-${i}`} value={p.date} onChange={(e) => setPasado(i, { date: e.target.value })} placeholder="Marzo 2026" style={inputStyle} /></Field></div>
              <div style={{ flex: 1, minWidth: 120 }}><Field label="Lugar" id={`pa-l-${i}`}><input id={`pa-l-${i}`} value={p.location} onChange={(e) => setPasado(i, { location: e.target.value })} placeholder="Argentina" style={inputStyle} /></Field></div>
              <button type="button" onClick={() => setData((d) => ({ ...d, past: d.past.filter((_, idx) => idx !== i) }))} aria-label="Eliminar" style={{ ...iconBtn(), color: "var(--danger)", flexShrink: 0 }}><Trash2 size={14} /></button>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 2, minWidth: 200 }}><Field label="Title (English)" id={`pa-te-${i}`}><input id={`pa-te-${i}`} value={p.titleEn ?? ""} onChange={(e) => setPasado(i, { titleEn: e.target.value })} placeholder={p.title} style={inputStyle} /></Field></div>
              <div style={{ flex: 1, minWidth: 120 }}><Field label="Date (English)" id={`pa-de-${i}`}><input id={`pa-de-${i}`} value={p.dateEn ?? ""} onChange={(e) => setPasado(i, { dateEn: e.target.value })} placeholder={p.date} style={inputStyle} /></Field></div>
              <div style={{ flex: 1, minWidth: 120 }}><Field label="Location (English)" id={`pa-le-${i}`}><input id={`pa-le-${i}`} value={p.locationEn ?? ""} onChange={(e) => setPasado(i, { locationEn: e.target.value })} placeholder={p.location} style={inputStyle} /></Field></div>
            </div>
            <ImageUpload label="Foto (opcional)" value={p.imageUrl ?? ""} onChange={(u) => setPasado(i, { imageUrl: u || undefined })} folder="jewgal-eventos" aspect="4/3" />
          </div>
        ))}
      </div>
      <button type="button" onClick={() => setData((d) => ({ ...d, past: [...d.past, { title: "", date: "", location: "" }] }))} style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, cursor: "pointer", background: "transparent", border: "1px dashed rgba(165,141,102,.4)", color: "var(--gold-ink)", fontSize: 13, fontWeight: 600 }}>
        <Plus size={15} /> Agregar evento pasado
      </button>

      <div style={{ marginTop: 32, padding: "18px 20px", borderRadius: 12, background: "rgba(165,141,102,.06)", border: "1px solid rgba(165,141,102,.14)", display: "flex", gap: 14, alignItems: "flex-start" }}>
        <CalendarDays size={18} style={{ color: "var(--gold-ink)", flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
          Los eventos visibles aparecen en <strong>/eventos</strong> en el orden de esta lista. Con «Reservas en el sitio», quien se anota recibe un correo de confirmación y vos un aviso; al llegar al cupo, las nuevas reservas quedan en lista de espera y podés pasarlas a confirmadas desde «Reservas». Cuando un evento ya ocurrió, ocultalo o eliminalo y agregalo a «Eventos anteriores».
        </p>
      </div>

      {toDelete !== null && (
        <ConfirmDialog title="Eliminar evento" danger confirmLabel="Eliminar"
          text={<>¿Eliminar <strong>{data.upcoming[toDelete]?.title || "este evento"}</strong>? {counts[data.upcoming[toDelete]?.id ?? ""]?.confirmed ? "Tiene reservas: se conservan en la base pero ya no se verán acá." : ""} Se aplica al guardar.</>}
          onConfirm={() => { setData((d) => ({ ...d, upcoming: d.upcoming.filter((_, idx) => idx !== toDelete) })); setToDelete(null) }} onCancel={() => setToDelete(null)} />
      )}

      {regs && (
        <Modal title={`Reservas · ${regs.event.title}`} onClose={() => setRegs(null)} width={760}
          footer={regs.rows && regs.rows.length > 0 ? <GhostButton icon={<Download size={14} />} onClick={() => exportCsv(regs.event, regs.rows!)}>Descargar CSV</GhostButton> : undefined}>
          {regs.rows === null ? <Spinner /> : regs.rows.length === 0 ? <p style={{ color: "var(--text-muted)" }}>Todavía no hay reservas.</p> : (
            <div style={{ display: "grid", gap: 8 }}>
              {regs.event.capacity ? <p style={hintStyle}>Cupo: {regs.rows.filter((r) => r.status === "confirmed").length} de {regs.event.capacity} lugares confirmados.</p> : null}
              {regs.rows.map((r) => (
                <div key={r.id} style={{ display: "flex", gap: 12, justifyContent: "space-between", flexWrap: "wrap", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13.5, opacity: r.status === "cancelled" ? 0.55 : 1 }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ color: "var(--text)", fontWeight: 600 }}>{r.name}</p>
                    <p style={{ color: "var(--text-muted)", overflowWrap: "anywhere" }}>{r.email}{r.phone ? ` · ${r.phone}` : ""}</p>
                    {r.notes && <p style={{ color: "var(--text-faint)", fontSize: 12.5 }}>“{r.notes}”</p>}
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <select aria-label={`Estado de ${r.name}`} value={r.status} onChange={(e) => setRegStatus(r, e.target.value as Reg["status"])} style={{ ...inputStyle, width: "auto", cursor: "pointer" }}>
                      {(Object.keys(STATUS_LABEL) as Reg["status"][]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                    </select>
                    <button type="button" onClick={() => removeReg(r)} aria-label={`Eliminar la reserva de ${r.name}`} style={{ ...iconBtn(), color: "var(--danger)" }}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}

export default function EventosAdminPage() { return <ToastProvider><Inner /></ToastProvider> }
