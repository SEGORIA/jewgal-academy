"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { CalendarCheck, Check, Clock, ExternalLink, Pencil, Plus, Save, Trash2, X } from "lucide-react"
import { ConfirmDialog, EmptyState, Field, GhostButton, Modal, PageHeader, PrimaryButton, Spinner, ToastProvider, api, card, hintStyle, inputStyle, useToast } from "@/components/admin/ui"
import { DEFAULT_COACHING_SETTINGS, WEEKDAYS, type CoachingSettings, type TimeWindow } from "@/lib/coaching"

type Offer = { id: string; title: string; titleEn: string | null; description: string; descriptionEn: string | null; durationMin: number; price: number; currency: string; isActive: boolean; order: number }
type Booking = { id: string; offerTitle: string; name: string; email: string; phone: string | null; notes: string | null; startsAt: string; endsAt: string; status: "pending" | "confirmed" | "cancelled" | "completed"; meetingUrl: string | null; adminNote: string | null; createdAt: string }
type Tab = "reservas" | "ofertas" | "disponibilidad"

const STATUS: Record<Booking["status"], { label: string; color: string }> = {
  pending: { label: "Por confirmar", color: "var(--gold-ink)" },
  confirmed: { label: "Confirmada", color: "var(--success)" },
  completed: { label: "Realizada", color: "var(--text-muted)" },
  cancelled: { label: "Cancelada", color: "var(--danger)" },
}

const COMMON_TZ = ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Mexico_City", "America/Bogota", "America/Lima", "America/Santiago", "America/Argentina/Buenos_Aires", "America/Sao_Paulo", "America/Guatemala", "Europe/Madrid", "Europe/London", "Asia/Jerusalem"]

function Inner() {
  const toast = useToast()
  const [tab, setTab] = useState<Tab>("reservas")
  const [settings, setSettings] = useState<CoachingSettings>(DEFAULT_COACHING_SETTINGS)
  const [loadedSettings, setLoadedSettings] = useState("")
  const [offers, setOffers] = useState<Offer[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [scope, setScope] = useState<"upcoming" | "past" | "all">("upcoming")
  const [loading, setLoading] = useState(true)

  const loadAll = useCallback(async () => {
    try {
      const [s, o] = await Promise.all([api<{ settings: CoachingSettings }>("/api/admin/coaching/settings", { cache: "no-store" }), api<{ offers: Offer[] }>("/api/admin/coaching/offers", { cache: "no-store" })])
      setSettings(s.settings); setLoadedSettings(JSON.stringify(s.settings)); setOffers(o.offers)
    } catch (e) { toast("error", (e as Error).message) }
    finally { setLoading(false) }
  }, [toast])
  const loadBookings = useCallback(async () => {
    try { setBookings((await api<{ bookings: Booking[] }>(`/api/admin/coaching/bookings?scope=${scope}`, { cache: "no-store" })).bookings) }
    catch (e) { toast("error", (e as Error).message) }
  }, [scope, toast])
  useEffect(() => { loadAll() }, [loadAll])
  useEffect(() => { loadBookings() }, [loadBookings])

  const pending = bookings.filter((b) => b.status === "pending").length

  if (loading) return <Spinner />
  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <PageHeader eyebrow="Alumnos" title="Coaching 1:1" subtitle="Ofertas de sesiones individuales, tu disponibilidad semanal y las reservas que llegan desde el sitio." />
      <div role="tablist" aria-label="Secciones" style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
        {([["reservas", `Reservas${pending ? ` (${pending})` : ""}`], ["ofertas", "Ofertas"], ["disponibilidad", "Disponibilidad"]] as [Tab, string][]).map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} type="button" onClick={() => setTab(k)}
            style={{ padding: "8px 18px", borderRadius: 20, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit", border: `1px solid ${tab === k ? "var(--gold-ink)" : "var(--border)"}`, background: tab === k ? "color-mix(in srgb, var(--gold-ink) 14%, transparent)" : "transparent", color: tab === k ? "var(--gold-ink)" : "var(--text-muted)" }}>{label}</button>
        ))}
      </div>
      {!settings.enabled && <p style={{ background: "color-mix(in srgb, var(--gold-ink) 10%, transparent)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", fontSize: 13.5, color: "var(--text-strong)", marginBottom: 18 }}>Las reservas en línea están <strong>apagadas</strong>: la página Coaching 1:1 muestra solo el formulario de contacto. Activalas en «Disponibilidad» cuando tengas ofertas y horarios cargados.</p>}
      {tab === "reservas" && <Reservas bookings={bookings} scope={scope} setScope={setScope} tz={settings.timezone} defaultMeeting={settings.meetingUrl} reload={loadBookings} />}
      {tab === "ofertas" && <Ofertas offers={offers} reload={loadAll} />}
      {tab === "disponibilidad" && <Disponibilidad settings={settings} setSettings={setSettings} dirty={JSON.stringify(settings) !== loadedSettings} onSaved={(s) => { setSettings(s); setLoadedSettings(JSON.stringify(s)) }} />}
    </div>
  )
}

/* ───────── Reservas ───────── */
function Reservas({ bookings, scope, setScope, tz, defaultMeeting, reload }: { bookings: Booking[]; scope: "upcoming" | "past" | "all"; setScope: (s: "upcoming" | "past" | "all") => void; tz: string; defaultMeeting: string; reload: () => void }) {
  const toast = useToast()
  const [sel, setSel] = useState<Booking | null>(null)
  const [url, setUrl] = useState("")
  const [note, setNote] = useState("")
  const [notify, setNotify] = useState(true)
  const [busy, setBusy] = useState(false)
  const [del, setDel] = useState<Booking | null>(null)
  const when = (iso: string) => { const t = new Intl.DateTimeFormat("es-ES", { timeZone: tz, dateStyle: "full", timeStyle: "short" }).format(new Date(iso)); return t.charAt(0).toUpperCase() + t.slice(1) }

  const open = (b: Booking) => { setSel(b); setUrl(b.meetingUrl ?? defaultMeeting); setNote(b.adminNote ?? ""); setNotify(true) }

  async function patch(body: Record<string, unknown>, okMsg: string) {
    if (!sel) return
    setBusy(true)
    try {
      const r = await api<{ booking: Booking }>(`/api/admin/coaching/bookings/${sel.id}`, { method: "PATCH", json: { ...body, notify } })
      toast("ok", okMsg)
      setSel(r.booking); await reload()
    } catch (e) { toast("error", (e as Error).message) }
    finally { setBusy(false) }
  }

  async function remove() {
    if (!del) return
    try { await api(`/api/admin/coaching/bookings/${del.id}`, { method: "DELETE" }); toast("ok", "Reserva eliminada"); setDel(null); await reload() }
    catch (e) { toast("error", (e as Error).message) }
  }

  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {([["upcoming", "Próximas"], ["past", "Pasadas"], ["all", "Todas"]] as const).map(([k, l]) => (
          <button key={k} type="button" aria-pressed={scope === k} onClick={() => setScope(k)} style={{ padding: "6px 14px", borderRadius: 18, fontSize: 13, cursor: "pointer", fontFamily: "inherit", border: `1px solid ${scope === k ? "var(--gold-ink)" : "var(--border)"}`, background: "transparent", color: scope === k ? "var(--gold-ink)" : "var(--text-muted)" }}>{l}</button>
        ))}
      </div>
      {bookings.length === 0 ? <EmptyState icon={<CalendarCheck size={32} />} title="No hay reservas" text="Cuando alguien reserve una sesión desde la página Coaching 1:1, aparece acá y te llega un aviso." /> : (
        <div style={{ display: "grid", gap: 10 }}>
          {bookings.map((b) => (
            <button key={b.id} type="button" onClick={() => open(b)} style={{ ...card, padding: "14px 18px", textAlign: "left", cursor: "pointer", fontFamily: "inherit", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", opacity: b.status === "cancelled" ? 0.6 : 1 }}>
              <div style={{ flex: "1 1 260px", minWidth: 0 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>{when(b.startsAt)}</p>
                <p style={{ fontSize: 13.5, color: "var(--text-strong)" }}>{b.name} · {b.offerTitle}</p>
                <p style={{ fontSize: 12.5, color: "var(--text-muted)", overflowWrap: "anywhere" }}>{b.email}{b.phone ? ` · ${b.phone}` : ""}</p>
              </div>
              <span style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: STATUS[b.status].color, border: "1px solid currentColor", borderRadius: 14, padding: "2px 10px", whiteSpace: "nowrap" }}>{STATUS[b.status].label}</span>
            </button>
          ))}
        </div>
      )}

      {sel && (
        <Modal title="Reserva de Coaching 1:1" onClose={() => setSel(null)} width={620}
          footer={<><GhostButton danger icon={<Trash2 size={14} />} onClick={() => setDel(sel)}>Eliminar</GhostButton><PrimaryButton loading={busy} icon={<Save size={14} />} onClick={() => patch({ meetingUrl: url, adminNote: note }, "Guardado")}>Guardar enlace y notas</PrimaryButton></>}>
          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>{when(sel.startsAt)}</p>
              <p style={{ fontSize: 13.5, color: "var(--text-strong)" }}>{sel.name} · {sel.offerTitle}</p>
              <p style={{ fontSize: 13, color: "var(--text-muted)", overflowWrap: "anywhere" }}><a href={`mailto:${sel.email}`} style={{ color: "var(--gold-ink)" }}>{sel.email}</a>{sel.phone ? ` · ${sel.phone}` : ""}</p>
              {sel.notes && <p style={{ fontSize: 13.5, color: "var(--text-strong)", marginTop: 8, padding: "8px 12px", background: "var(--surface-2)", borderRadius: 8 }}>“{sel.notes}”</p>}
              <p style={{ marginTop: 8 }}><span style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: STATUS[sel.status].color, border: "1px solid currentColor", borderRadius: 14, padding: "2px 10px" }}>{STATUS[sel.status].label}</span></p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {sel.status !== "confirmed" && <GhostButton icon={<Check size={14} />} loading={busy} onClick={() => patch({ status: "confirmed", meetingUrl: url }, "Reserva confirmada")}>Confirmar</GhostButton>}
              {sel.status === "confirmed" && <GhostButton icon={<Check size={14} />} loading={busy} onClick={() => patch({ status: "completed" }, "Marcada como realizada")}>Marcar como realizada</GhostButton>}
              {sel.status !== "cancelled" && <GhostButton danger icon={<X size={14} />} loading={busy} onClick={() => patch({ status: "cancelled" }, "Reserva cancelada")}>Cancelar sesión</GhostButton>}
            </div>
            <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13.5, color: "var(--text-strong)", cursor: "pointer" }}><input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} /> Avisar por correo al confirmar o cancelar</label>
            <Field label="Enlace de la videollamada" id="bk-url" hint="Se manda en el correo de confirmación. Vacío = el enlace por defecto de «Disponibilidad».">
              <div style={{ display: "flex", gap: 8 }}>
                <input id="bk-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://zoom.us/j/…" style={inputStyle} />
                {url && <a href={url} target="_blank" rel="noopener noreferrer" aria-label="Abrir el enlace" style={{ display: "inline-flex", alignItems: "center", padding: "0 12px", border: "1px solid var(--border)", borderRadius: 9, color: "var(--text-muted)" }}><ExternalLink size={14} /></a>}
              </div>
            </Field>
            <Field label="Notas internas" id="bk-note"><textarea id="bk-note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Solo las ves vos." style={{ ...inputStyle, resize: "vertical" }} /></Field>
          </div>
        </Modal>
      )}
      {del && <ConfirmDialog title="Eliminar reserva" danger confirmLabel="Eliminar" text={<>¿Eliminar la reserva de <strong>{del.name}</strong>? Esto libera el horario sin avisarle a la persona. Para avisarle, usá «Cancelar sesión».</>} onConfirm={remove} onCancel={() => setDel(null)} />}
    </>
  )
}

/* ───────── Ofertas ───────── */
const EMPTY_OFFER = { title: "", titleEn: "", description: "", descriptionEn: "", durationMin: "60", price: "0", currency: "USD", isActive: true, order: "0" }

function Ofertas({ offers, reload }: { offers: Offer[]; reload: () => void }) {
  const toast = useToast()
  const [edit, setEdit] = useState<{ id: string | null; f: typeof EMPTY_OFFER } | null>(null)
  const [saving, setSaving] = useState(false)
  const [del, setDel] = useState<Offer | null>(null)

  async function save() {
    if (!edit) return
    const f = edit.f
    setSaving(true)
    try {
      const body = { title: f.title, titleEn: f.titleEn, description: f.description, descriptionEn: f.descriptionEn, durationMin: Number(f.durationMin), price: Number(f.price) || 0, currency: f.currency, isActive: f.isActive, order: Number(f.order) || 0 }
      if (edit.id) await api(`/api/admin/coaching/offers/${edit.id}`, { method: "PATCH", json: body })
      else await api("/api/admin/coaching/offers", { method: "POST", json: body })
      toast("ok", edit.id ? "Oferta actualizada" : "Oferta creada")
      setEdit(null); await reload()
    } catch (e) { toast("error", (e as Error).message) }
    finally { setSaving(false) }
  }
  async function remove() {
    if (!del) return
    try { await api(`/api/admin/coaching/offers/${del.id}`, { method: "DELETE" }); toast("ok", "Oferta eliminada"); setDel(null); await reload() }
    catch (e) { toast("error", (e as Error).message) }
  }
  const set = (patch: Partial<typeof EMPTY_OFFER>) => setEdit((e) => (e ? { ...e, f: { ...e.f, ...patch } } : e))

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}><PrimaryButton icon={<Plus size={15} />} onClick={() => setEdit({ id: null, f: EMPTY_OFFER })}>Nueva oferta</PrimaryButton></div>
      {offers.length === 0 ? <EmptyState icon={<Clock size={32} />} title="Todavía no hay ofertas" text="Una oferta es un tipo de sesión (por ejemplo, «Sesión individual · 60 min»). Quien reserva elige una." /> : (
        <div style={{ display: "grid", gap: 10 }}>
          {offers.map((o) => (
            <div key={o.id} style={{ ...card, padding: "14px 18px", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", opacity: o.isActive ? 1 : 0.55 }}>
              <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>{o.title} {!o.isActive && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>· oculta</span>}</p>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{o.durationMin} min · {o.price > 0 ? `${o.price} ${o.currency}` : "Sin precio visible"}</p>
              </div>
              <GhostButton icon={<Pencil size={14} />} onClick={() => setEdit({ id: o.id, f: { title: o.title, titleEn: o.titleEn ?? "", description: o.description, descriptionEn: o.descriptionEn ?? "", durationMin: String(o.durationMin), price: String(o.price), currency: o.currency, isActive: o.isActive, order: String(o.order) } })} aria-label="Editar" />
              <GhostButton danger icon={<Trash2 size={14} />} onClick={() => setDel(o)} aria-label="Eliminar" />
            </div>
          ))}
        </div>
      )}
      {edit && (
        <Modal title={edit.id ? "Editar oferta" : "Nueva oferta"} onClose={() => setEdit(null)} width={600} footer={<><GhostButton onClick={() => setEdit(null)}>Cancelar</GhostButton><PrimaryButton loading={saving} onClick={save}>{edit.id ? "Guardar" : "Crear oferta"}</PrimaryButton></>}>
          <div style={{ display: "grid", gap: 14 }}>
            <Field label="Nombre" id="of-t"><input id="of-t" value={edit.f.title} onChange={(e) => set({ title: e.target.value })} placeholder="Sesión individual" style={inputStyle} /></Field>
            <Field label="Descripción" id="of-d"><textarea id="of-d" value={edit.f.description} onChange={(e) => set({ description: e.target.value })} rows={2} placeholder="Para qué sirve y qué incluye." style={{ ...inputStyle, resize: "vertical" }} /></Field>
            <div className="admin-form-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <Field label="Duración (min)" id="of-m"><input id="of-m" type="number" min={15} step={15} value={edit.f.durationMin} onChange={(e) => set({ durationMin: e.target.value })} style={inputStyle} /></Field>
              <Field label="Precio" id="of-p" hint="0 = no se muestra."><input id="of-p" type="number" min={0} value={edit.f.price} onChange={(e) => set({ price: e.target.value })} style={inputStyle} /></Field>
              <Field label="Moneda" id="of-c"><input id="of-c" value={edit.f.currency} maxLength={3} onChange={(e) => set({ currency: e.target.value.toUpperCase() })} style={inputStyle} /></Field>
            </div>
            <Field label="Name (English)" id="of-te"><input id="of-te" value={edit.f.titleEn} onChange={(e) => set({ titleEn: e.target.value })} placeholder={edit.f.title} style={inputStyle} /></Field>
            <Field label="Description (English)" id="of-de"><textarea id="of-de" value={edit.f.descriptionEn} onChange={(e) => set({ descriptionEn: e.target.value })} rows={2} placeholder={edit.f.description} style={{ ...inputStyle, resize: "vertical" }} /></Field>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
              <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14, color: "var(--text-strong)", cursor: "pointer" }}><input type="checkbox" checked={edit.f.isActive} onChange={(e) => set({ isActive: e.target.checked })} /> Se puede reservar</label>
              <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "var(--text-muted)" }}>Orden <input type="number" min={0} value={edit.f.order} onChange={(e) => set({ order: e.target.value })} style={{ ...inputStyle, width: 80 }} /></label>
            </div>
            <p style={hintStyle}>El pago de la sesión se coordina aparte (por ahora no se cobra online en la reserva).</p>
          </div>
        </Modal>
      )}
      {del && <ConfirmDialog title="Eliminar oferta" danger confirmLabel="Eliminar" text={<>¿Eliminar <strong>{del.title}</strong>? Las reservas que ya tiene se conservan. Para que deje de ofrecerse sin borrarla, desmarcá «Se puede reservar».</>} onConfirm={remove} onCancel={() => setDel(null)} />}
    </>
  )
}

/* ───────── Disponibilidad ───────── */
function Disponibilidad({ settings, setSettings, dirty, onSaved }: { settings: CoachingSettings; setSettings: (s: CoachingSettings) => void; dirty: boolean; onSaved: (s: CoachingSettings) => void }) {
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const [blocked, setBlocked] = useState("")
  const set = (patch: Partial<CoachingSettings>) => setSettings({ ...settings, ...patch })
  const tzList = useMemo(() => {
    try { return [...new Set([...COMMON_TZ, ...(Intl as unknown as { supportedValuesOf: (k: string) => string[] }).supportedValuesOf("timeZone")])] } catch { return COMMON_TZ }
  }, [])

  const setDay = (d: string, windows: TimeWindow[]) => set({ weekly: { ...settings.weekly, [d]: windows } })

  async function save() {
    setSaving(true)
    try {
      const r = await api<{ settings: CoachingSettings }>("/api/admin/coaching/settings", { method: "PUT", json: { settings } })
      toast("ok", "Disponibilidad guardada"); onSaved(r.settings)
    } catch (e) { toast("error", (e as Error).message) }
    finally { setSaving(false) }
  }

  const order = [1, 2, 3, 4, 5, 6, 0]
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ ...card, padding: "18px 20px", display: "grid", gap: 14 }}>
        <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 15, color: "var(--text)", cursor: "pointer", fontWeight: 600 }}>
          <input type="checkbox" checked={settings.enabled} onChange={(e) => set({ enabled: e.target.checked })} /> Reservas en línea activadas
        </label>
        <p style={{ ...hintStyle, marginTop: 0 }}>Cuando están activadas y hay al menos una oferta, la página Coaching 1:1 permite elegir día y horario. Si no, solo muestra el formulario de contacto.</p>
        <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14, color: "var(--text-strong)", cursor: "pointer" }}>
          <input type="checkbox" checked={settings.autoConfirm} onChange={(e) => set({ autoConfirm: e.target.checked })} /> Confirmar automáticamente (si no, cada reserva queda «Por confirmar» hasta que la confirmes)
        </label>
      </div>

      <div style={{ ...card, padding: "18px 20px", display: "grid", gap: 12 }}>
        <h2 style={{ fontSize: 13, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold-ink)" }}>Horario semanal</h2>
        <Field label="Zona horaria de tus horarios" id="cs-tz" hint="Los horarios de abajo son en esta zona; cada persona los ve en la suya.">
          <input id="cs-tz" list="tz-list" value={settings.timezone} onChange={(e) => set({ timezone: e.target.value })} style={inputStyle} />
          <datalist id="tz-list">{tzList.map((z) => <option key={z} value={z} />)}</datalist>
        </Field>
        {order.map((d) => {
          const list = settings.weekly[String(d)] ?? []
          return (
            <div key={d} style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap", paddingTop: 10, borderTop: "1px solid var(--border)" }}>
              <span style={{ width: 96, fontSize: 14, color: "var(--text)", paddingTop: 9 }}>{WEEKDAYS[d]}</span>
              <div style={{ display: "grid", gap: 8, flex: 1, minWidth: 220 }}>
                {list.length === 0 && <span style={{ fontSize: 13, color: "var(--text-faint)", paddingTop: 9 }}>Sin atención</span>}
                {list.map((w, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="time" aria-label={`${WEEKDAYS[d]}: desde`} value={w.start} onChange={(e) => setDay(String(d), list.map((x, idx) => (idx === i ? { ...x, start: e.target.value } : x)))} style={{ ...inputStyle, width: 130 }} />
                    <span style={{ color: "var(--text-muted)" }}>a</span>
                    <input type="time" aria-label={`${WEEKDAYS[d]}: hasta`} value={w.end} onChange={(e) => setDay(String(d), list.map((x, idx) => (idx === i ? { ...x, end: e.target.value } : x)))} style={{ ...inputStyle, width: 130 }} />
                    <GhostButton icon={<X size={14} />} onClick={() => setDay(String(d), list.filter((_, idx) => idx !== i))} aria-label="Quitar franja" />
                  </div>
                ))}
              </div>
              <GhostButton icon={<Plus size={14} />} onClick={() => setDay(String(d), [...list, { start: "09:00", end: "12:00" }])}>Franja</GhostButton>
            </div>
          )
        })}
      </div>

      <div style={{ ...card, padding: "18px 20px", display: "grid", gap: 14 }}>
        <h2 style={{ fontSize: 13, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold-ink)" }}>Reglas de reserva</h2>
        <div className="admin-form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Los turnos arrancan cada (min)" id="cs-step"><input id="cs-step" type="number" min={15} max={120} step={5} value={settings.stepMinutes} onChange={(e) => set({ stepMinutes: Number(e.target.value) })} style={inputStyle} /></Field>
          <Field label="Descanso entre sesiones (min)" id="cs-buf"><input id="cs-buf" type="number" min={0} max={120} step={5} value={settings.bufferMinutes} onChange={(e) => set({ bufferMinutes: Number(e.target.value) })} style={inputStyle} /></Field>
          <Field label="Aviso mínimo (horas)" id="cs-notice" hint="No se puede reservar con menos anticipación."><input id="cs-notice" type="number" min={0} value={settings.minNoticeHours} onChange={(e) => set({ minNoticeHours: Number(e.target.value) })} style={inputStyle} /></Field>
          <Field label="Se puede reservar hasta (días)" id="cs-ahead"><input id="cs-ahead" type="number" min={1} max={365} value={settings.maxDaysAhead} onChange={(e) => set({ maxDaysAhead: Number(e.target.value) })} style={inputStyle} /></Field>
        </div>
        <Field label="Enlace de videollamada por defecto" id="cs-meet" hint="Zoom, Meet… Se manda en el correo de confirmación."><input id="cs-meet" value={settings.meetingUrl} onChange={(e) => set({ meetingUrl: e.target.value })} placeholder="https://…" style={inputStyle} /></Field>
        <Field label="Texto para quien reserva" id="cs-ins" hint="Se ve arriba de la reserva: cómo es la sesión, qué preparar, política de cancelación."><textarea id="cs-ins" rows={3} value={settings.instructions} onChange={(e) => set({ instructions: e.target.value })} style={{ ...inputStyle, resize: "vertical" }} /></Field>
      </div>

      <div style={{ ...card, padding: "18px 20px", display: "grid", gap: 12 }}>
        <h2 style={{ fontSize: 13, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold-ink)" }}>Días sin atención</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input type="date" aria-label="Fecha a bloquear" value={blocked} onChange={(e) => setBlocked(e.target.value)} style={{ ...inputStyle, width: 170 }} />
          <GhostButton icon={<Plus size={14} />} onClick={() => { if (blocked && !settings.blockedDates.includes(blocked)) set({ blockedDates: [...settings.blockedDates, blocked].sort() }); setBlocked("") }}>Agregar</GhostButton>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {settings.blockedDates.length === 0 && <span style={{ fontSize: 13, color: "var(--text-faint)" }}>Ninguno. Agregá feriados o vacaciones.</span>}
          {settings.blockedDates.map((d) => (
            <span key={d} style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid var(--border)", borderRadius: 14, padding: "3px 6px 3px 12px", fontSize: 13, color: "var(--text-strong)" }}>
              {d}<button type="button" aria-label={`Quitar ${d}`} onClick={() => set({ blockedDates: settings.blockedDates.filter((x) => x !== d) })} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: 2 }}><X size={12} /></button>
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <PrimaryButton icon={<Save size={15} />} loading={saving} onClick={save}>Guardar disponibilidad</PrimaryButton>
        {dirty && <span style={{ fontSize: 13, color: "var(--gold-ink)" }}>● Cambios sin guardar</span>}
      </div>
    </div>
  )
}

export default function CoachingAdminPage() { return <ToastProvider><Inner /></ToastProvider> }
