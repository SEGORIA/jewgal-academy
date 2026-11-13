"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { CreditCard, DollarSign, Download, Plus, RotateCcw, Search, Trash2, TrendingUp, Users } from "lucide-react"
import { ConfirmDialog, EmptyState, Field, GhostButton, Modal, PageHeader, PrimaryButton, Spinner, ToastProvider, api, card, inputStyle, useToast } from "@/components/admin/ui"
import RefundDialog from "@/components/admin/students/RefundDialog"
import { countsAsIncome, fmtDate, money } from "@/components/admin/students/types"
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/payment-methods"

type Payment = {
  id: string; amount: number; currency: string; status: string; method: string | null; note: string | null
  stripeSessionId: string | null; stripePaymentId: string | null
  paidAt: string | null; createdAt: string; userId: string; courseId: string
  user: { name: string; email: string }
  course: { title: string; slug: string }
}
type StudentLite = { id: string; name: string; email: string }
type CourseLite = { id: string; title: string; price: number; currency: string }

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  completed: { color: "var(--success)", bg: "var(--success-soft)" },
  demo: { color: "var(--gold-ink)", bg: "rgba(165,141,102,.12)" },
  pending: { color: "var(--warning)", bg: "var(--warning-soft)" },
  refunded: { color: "var(--danger)", bg: "var(--danger-soft)" },
  failed: { color: "var(--danger)", bg: "var(--danger-soft)" },
}

const methodOf = (p: Payment) => p.method ? PAYMENT_METHOD_LABELS[p.method] ?? p.method : p.stripeSessionId ? "Tarjeta (Stripe)" : p.stripePaymentId ? "PayPal" : "—"

/** Suma por moneda: "US$1.500 + GTQ 800" (no se mezclan monedas distintas en un solo número). */
function totalsLabel(list: Payment[]) {
  const by = new Map<string, number>()
  list.forEach((p) => by.set(p.currency, (by.get(p.currency) ?? 0) + p.amount))
  if (by.size === 0) return "—"
  return [...by.entries()].map(([cur, v]) => money(v, cur)).join(" + ")
}

const csvCell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`

function Inner() {
  const toast = useToast()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [program, setProgram] = useState("all")
  const [status, setStatus] = useState("all")
  const [search, setSearch] = useState("")
  const [adding, setAdding] = useState(false)
  const [refunding, setRefunding] = useState<Payment | null>(null)
  const [deleting, setDeleting] = useState<Payment | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const d = await api<{ payments: Payment[] }>("/api/admin/payments", { cache: "no-store" })
      setPayments(d.payments ?? [])
    } catch (e) { toast("error", (e as Error).message) }
    finally { setLoading(false) }
  }, [toast])
  useEffect(() => { load() }, [load])

  const programs = useMemo(() => {
    const m = new Map<string, string>()
    payments.forEach((p) => m.set(p.course.slug, p.course.title))
    return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1]))
  }, [payments])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return payments.filter((p) =>
      (program === "all" || p.course.slug === program) &&
      (status === "all" || p.status === status) &&
      (!q || p.user.name.toLowerCase().includes(q) || p.user.email.toLowerCase().includes(q)))
  }, [payments, program, status, search])

  const income = payments.filter((p) => countsAsIncome(p.status))
  const refunded = payments.filter((p) => p.status === "refunded")
  const pending = payments.filter((p) => p.status === "pending")
  const uniqueStudents = new Set(income.map((p) => p.userId)).size
  const avg = income.length ? income.reduce((s, p) => s + p.amount, 0) / income.length : 0

  function downloadCSV() {
    const rows: (string | number)[][] = [["Fecha", "Alumno", "Email", "Programa", "Monto", "Moneda", "Medio", "Estado", "Nota"]]
    filtered.forEach((p) => rows.push([
      fmtDate(p.paidAt ?? p.createdAt, { year: "numeric", month: "2-digit", day: "2-digit" }), p.user.name, p.user.email, p.course.title,
      p.amount, p.currency, methodOf(p), PAYMENT_STATUS_LABELS[p.status] ?? p.status, p.note ?? "",
    ]))
    const csv = "﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
    const a = document.createElement("a"); a.href = url; a.download = "pagos-jewgal.csv"; a.click()
    URL.revokeObjectURL(url)
  }

  async function markPaid(p: Payment) {
    try { await api(`/api/admin/payments/${p.id}`, { method: "PATCH", json: { status: "completed" } }); toast("ok", "Pago marcado como cobrado"); load() }
    catch (e) { toast("error", (e as Error).message) }
  }
  async function remove() {
    if (!deleting) return
    setBusy(true)
    try { await api(`/api/admin/payments/${deleting.id}`, { method: "DELETE" }); toast("ok", "Pago eliminado"); setDeleting(null); await load() }
    catch (e) { toast("error", (e as Error).message); setDeleting(null) }
    finally { setBusy(false) }
  }

  const metrics = [
    { label: "Ingresos", value: totalsLabel(income), sub: "Pagos cobrados (incluye demo)", icon: DollarSign, accent: "var(--gold-ink)" },
    { label: "Transacciones", value: String(income.length), sub: pending.length ? `${pending.length} pendiente${pending.length > 1 ? "s" : ""}` : "Sin pendientes", icon: CreditCard, accent: "var(--terra)" },
    { label: "Alumnos con pago", value: String(uniqueStudents), sub: "Personas distintas", icon: Users, accent: "var(--success)" },
    { label: "Ticket promedio", value: avg > 0 ? `$${Math.round(avg).toLocaleString("es")}` : "—", sub: refunded.length ? `${refunded.length} reembolso${refunded.length > 1 ? "s" : ""} · ${totalsLabel(refunded)}` : "Sin reembolsos", icon: TrendingUp, accent: "var(--terra)" },
  ]

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto" }}>
      <PageHeader eyebrow="Finanzas" title="Ingresos y pagos"
        subtitle="Los cobros con tarjeta o PayPal se registran solos. Las transferencias y pagos en efectivo los cargás acá con «Registrar pago»."
        actions={<>
          <GhostButton icon={<Download size={14} />} onClick={downloadCSV} disabled={!filtered.length}>Exportar CSV</GhostButton>
          <PrimaryButton icon={<Plus size={15} />} onClick={() => setAdding(true)}>Registrar pago</PrimaryButton>
        </>} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14, marginBottom: 24 }}>
        {metrics.map(({ label, value, sub, icon: Icon, accent }) => (
          <div key={label} style={{ ...card, padding: "18px 18px 16px" }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}><Icon size={17} style={{ color: accent }} /></div>
            <p style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", fontFamily: "var(--serif)", lineHeight: 1.2 }}>{loading ? "—" : value}</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>{label}</p>
            <p style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 3 }}>{sub}</p>
          </div>
        ))}
      </div>

      <div style={{ ...card, padding: "14px 18px", marginBottom: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 240px" }}>
          <Search size={15} aria-hidden style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar alumno…" aria-label="Buscar por alumno" style={{ ...inputStyle, paddingLeft: 38 }} />
        </div>
        <select aria-label="Filtrar por programa" value={program} onChange={(e) => setProgram(e.target.value)} style={{ ...inputStyle, width: "auto", cursor: "pointer" }}>
          <option value="all">Todos los programas</option>
          {programs.map(([slug, title]) => <option key={slug} value={slug}>{title}</option>)}
        </select>
        <select aria-label="Filtrar por estado" value={status} onChange={(e) => setStatus(e.target.value)} style={{ ...inputStyle, width: "auto", cursor: "pointer" }}>
          <option value="all">Todos los estados</option>
          {Object.entries(PAYMENT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {loading ? <Spinner label="Cargando transacciones…" /> : filtered.length === 0 ? (
        <EmptyState icon={<CreditCard size={28} />} title={payments.length ? "Sin resultados" : "Todavía no hay pagos"}
          text={payments.length ? "Probá con otro filtro." : "Aparecerán acá con la primera inscripción, o podés registrar uno a mano."}
          action={!payments.length ? <PrimaryButton icon={<Plus size={15} />} onClick={() => setAdding(true)}>Registrar pago</PrimaryButton> : undefined} />
      ) : (
        <div style={{ ...card, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Alumno", "Programa", "Monto", "Medio", "Estado", "Fecha", ""].map((h, i) => (
                    <th key={i} scope="col" style={{ textAlign: "left", padding: "13px 16px", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 500 }}>{h || <span className="sr-only">Acciones</span>}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const st = STATUS_STYLE[p.status] ?? { color: "var(--text-muted)", bg: "var(--surface-2)" }
                  const provider = !!(p.stripeSessionId || p.stripePaymentId)
                  return (
                    <tr key={p.id} style={{ borderBottom: "1px solid var(--border-soft)" }}>
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ fontWeight: 500, color: "var(--text)" }}>{p.user.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-faint)" }}>{p.user.email}</div>
                      </td>
                      <td style={{ padding: "13px 16px", color: "var(--text-strong)", fontSize: 13 }}>{p.course.title}</td>
                      <td style={{ padding: "13px 16px", color: "var(--text)", fontFamily: "var(--serif)", fontSize: 15, whiteSpace: "nowrap" }}>{p.amount > 0 ? money(p.amount, p.currency) : "—"}</td>
                      <td style={{ padding: "13px 16px", color: "var(--text-muted)", fontSize: 13 }} title={p.note ?? undefined}>{methodOf(p)}</td>
                      <td style={{ padding: "13px 16px" }}><span style={{ fontSize: 12, padding: "4px 11px", borderRadius: 999, fontWeight: 600, background: st.bg, color: st.color }}>{PAYMENT_STATUS_LABELS[p.status] ?? p.status}</span></td>
                      <td style={{ padding: "13px 16px", color: "var(--text-muted)", fontSize: 13, whiteSpace: "nowrap" }}>{fmtDate(p.paidAt ?? p.createdAt)}</td>
                      <td style={{ padding: "13px 12px", whiteSpace: "nowrap", textAlign: "right" }}>
                        {p.status === "pending" && <GhostButton onClick={() => markPaid(p)} style={{ padding: "6px 10px", fontSize: 12 }}>Marcar cobrado</GhostButton>}
                        {(p.status === "completed" || p.status === "demo") && <GhostButton icon={<RotateCcw size={13} />} onClick={() => setRefunding(p)} style={{ padding: "6px 10px", fontSize: 12 }}>Reembolsar</GhostButton>}
                        {!provider && <button aria-label={`Eliminar pago de ${p.user.name}`} title="Eliminar pago" onClick={() => setDeleting(p)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", padding: 7, verticalAlign: "middle" }}><Trash2 size={15} /></button>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adding && <RegisterPayment onClose={() => setAdding(false)} onDone={() => { setAdding(false); load() }} />}
      {refunding && <RefundDialog payment={{ id: refunding.id, amount: refunding.amount, currency: refunding.currency, courseTitle: refunding.course.title }} onClose={() => setRefunding(null)} onDone={() => { setRefunding(null); load() }} />}
      {deleting && (
        <ConfirmDialog danger title="Eliminar pago" confirmLabel="Eliminar" busy={busy} onCancel={() => setDeleting(null)} onConfirm={remove}
          text={<>¿Eliminar el registro de {money(deleting.amount, deleting.currency)} de <strong>{deleting.user.name}</strong>? Queda anotado en el Historial de cambios.</>} />
      )}
    </div>
  )
}

function RegisterPayment({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const toast = useToast()
  const [students, setStudents] = useState<StudentLite[]>([])
  const [courses, setCourses] = useState<CourseLite[]>([])
  const [who, setWho] = useState("")
  const [courseId, setCourseId] = useState("")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("")
  const [method, setMethod] = useState<string>("transferencia")
  const [status, setStatus] = useState<"completed" | "pending">("completed")
  const [paidAt, setPaidAt] = useState(() => new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState("")
  const [enroll, setEnroll] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api<{ students: StudentLite[]; courses: CourseLite[] }>("/api/admin/directory")
      .then((d) => { setStudents(d.students ?? []); setCourses(d.courses ?? []); setCourseId((c) => c || d.courses?.[0]?.id || "") })
      .catch((e) => toast("error", (e as Error).message))
  }, [])

  const label = (s: StudentLite) => `${s.name} · ${s.email}`
  const student = students.find((s) => label(s) === who || s.email === who.trim().toLowerCase())
  const course = courses.find((c) => c.id === courseId)

  async function submit() {
    if (!student) { toast("error", "Elegí un alumno de la lista (tiene que tener cuenta)."); return }
    const value = Number(amount === "" ? course?.price ?? NaN : amount)
    if (!Number.isFinite(value)) { toast("error", "Ingresá el monto"); return }
    setBusy(true)
    try {
      const r = await api<{ enrolled: boolean }>("/api/admin/payments", { method: "POST", json: {
        userId: student.id, courseId, amount: value, currency: currency || course?.currency || "USD", method, status,
        note: note || undefined, paidAt: status === "completed" ? paidAt : undefined, enroll,
      } })
      toast("ok", r.enrolled ? "Pago registrado y alumno inscripto" : "Pago registrado")
      onDone()
    } catch (e) { toast("error", (e as Error).message); setBusy(false) }
  }

  return (
    <Modal title="Registrar pago" onClose={onClose} width={640}
      footer={<><GhostButton onClick={onClose} disabled={busy}>Cancelar</GhostButton><PrimaryButton loading={busy} disabled={!student || !courseId} onClick={submit}>Registrar pago</PrimaryButton></>}>
      <div style={{ display: "grid", gap: 14 }}>
        <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6 }}>Para cobros recibidos fuera de la plataforma. Si la persona todavía no tiene cuenta, creala primero desde Alumnos.</p>
        <Field label="Alumno" id="rp-student" hint={who && !student ? "Escribí para buscar y elegí una opción de la lista." : undefined}>
          <input id="rp-student" list="rp-students" style={inputStyle} value={who} onChange={(e) => setWho(e.target.value)} placeholder="Nombre o email…" autoComplete="off" />
          <datalist id="rp-students">{students.map((s) => <option key={s.id} value={label(s)} />)}</datalist>
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12 }}>
          <Field label="Programa" id="rp-course">
            <select id="rp-course" style={{ ...inputStyle, cursor: "pointer" }} value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </Field>
          <Field label="Monto" id="rp-amount"><input id="rp-amount" type="number" min={0} step="0.01" style={inputStyle} value={amount} placeholder={course ? String(course.price) : "0"} onChange={(e) => setAmount(e.target.value)} /></Field>
          <Field label="Moneda" id="rp-cur"><input id="rp-cur" maxLength={3} style={{ ...inputStyle, textTransform: "uppercase" }} value={currency} placeholder={course?.currency ?? "USD"} onChange={(e) => setCurrency(e.target.value)} /></Field>
          <Field label="Medio de pago" id="rp-method">
            <select id="rp-method" style={{ ...inputStyle, cursor: "pointer" }} value={method} onChange={(e) => setMethod(e.target.value)}>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</option>)}
            </select>
          </Field>
          <Field label="Estado" id="rp-status">
            <select id="rp-status" style={{ ...inputStyle, cursor: "pointer" }} value={status} onChange={(e) => setStatus(e.target.value as "completed" | "pending")}>
              <option value="completed">Cobrado</option>
              <option value="pending">Pendiente</option>
            </select>
          </Field>
          {status === "completed" && <Field label="Fecha de cobro" id="rp-date"><input id="rp-date" type="date" style={inputStyle} value={paidAt} onChange={(e) => setPaidAt(e.target.value)} /></Field>}
        </div>
        <Field label="Nota (opcional)" id="rp-note"><input id="rp-note" style={inputStyle} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ej.: transferencia del 12/11, comprobante #4821" /></Field>
        {status === "completed" && (
          <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14, color: "var(--text-strong)", cursor: "pointer" }}>
            <input type="checkbox" checked={enroll} onChange={(e) => setEnroll(e.target.checked)} style={{ width: 18, height: 18, accentColor: "var(--terra)" }} />
            Dar acceso al programa (inscribir o reactivar al alumno)
          </label>
        )}
      </div>
    </Modal>
  )
}

export default function PagosAdminPage() { return <ToastProvider><Inner /></ToastProvider> }
