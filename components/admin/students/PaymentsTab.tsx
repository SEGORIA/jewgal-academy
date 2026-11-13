"use client"

import { useState } from "react"
import { Plus, Receipt, RotateCcw, Trash2 } from "lucide-react"
import { ConfirmDialog, EmptyState, Field, GhostButton, PrimaryButton, api, card, inputStyle, useToast } from "@/components/admin/ui"
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/payment-methods"
import RefundDialog from "./RefundDialog"
import { countsAsIncome, fmtDate, money, type CourseOption, type Student, type StudentPayment } from "./types"

const STATUS_COLOR: Record<string, string> = {
  completed: "var(--success)", demo: "var(--text-muted)", pending: "var(--warning)", refunded: "var(--danger)", failed: "var(--danger)",
}

export default function PaymentsTab({ student, courses, onChanged }: { student: Student; courses: CourseOption[]; onChanged: () => void }) {
  const toast = useToast()
  const [adding, setAdding] = useState(false)
  const [refunding, setRefunding] = useState<StudentPayment | null>(null)
  const [deleting, setDeleting] = useState<StudentPayment | null>(null)
  const [busy, setBusy] = useState(false)

  const total = student.payments.filter((p) => countsAsIncome(p.status)).reduce((s, p) => s + p.amount, 0)

  async function changeStatus(p: StudentPayment, status: "completed" | "pending") {
    try { await api(`/api/admin/payments/${p.id}`, { method: "PATCH", json: { status } }); toast("ok", status === "completed" ? "Pago marcado como cobrado" : "Pago marcado como pendiente"); onChanged() }
    catch (e) { toast("error", (e as Error).message) }
  }

  async function remove() {
    if (!deleting) return
    setBusy(true)
    try { await api(`/api/admin/payments/${deleting.id}`, { method: "DELETE" }); toast("ok", "Pago eliminado"); setDeleting(null); onChanged() }
    catch (e) { toast("error", (e as Error).message); setDeleting(null) }
    finally { setBusy(false) }
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Total cobrado: <strong style={{ color: "var(--success)", fontSize: 16 }}>{total > 0 ? money(total) : "—"}</strong></p>
        {!adding && <GhostButton icon={<Plus size={14} />} onClick={() => setAdding(true)}>Registrar pago</GhostButton>}
      </div>

      {adding && <AddPayment studentId={student.id} courses={courses} onCancel={() => setAdding(false)} onDone={() => { setAdding(false); onChanged() }} />}

      {student.payments.length === 0 && !adding ? (
        <EmptyState icon={<Receipt size={26} />} title="Sin pagos registrados" text="Registrá una transferencia, un pago en efectivo u otro cobro hecho fuera de la plataforma." />
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {student.payments.map((p) => (
            <div key={p.id} style={{ ...card, padding: "12px 14px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                <p style={{ fontSize: 14, color: "var(--text)", fontWeight: 500 }}>{p.course.title}</p>
                <p style={{ fontSize: 12.5, color: "var(--text-faint)" }}>
                  {fmtDate(p.paidAt ?? p.createdAt)} · {p.method ? PAYMENT_METHOD_LABELS[p.method] ?? p.method : "Pasarela de pago"}
                  {p.note ? ` · ${p.note}` : ""}
                </p>
              </div>
              <strong style={{ fontSize: 15, color: "var(--text-strong)" }}>{money(p.amount, p.currency)}</strong>
              <span style={{ fontSize: 12, fontWeight: 600, color: STATUS_COLOR[p.status] ?? "var(--text-muted)", minWidth: 84, textAlign: "right" }}>{PAYMENT_STATUS_LABELS[p.status] ?? p.status}</span>
              <div style={{ display: "flex", gap: 4 }}>
                {p.status === "pending" && <GhostButton onClick={() => changeStatus(p, "completed")} style={{ padding: "6px 10px", fontSize: 12 }}>Marcar cobrado</GhostButton>}
                {(p.status === "completed" || p.status === "demo") && (
                  <GhostButton icon={<RotateCcw size={13} />} onClick={() => setRefunding(p)} style={{ padding: "6px 10px", fontSize: 12 }}>Reembolsar</GhostButton>
                )}
                <button aria-label="Eliminar pago" title="Eliminar pago" onClick={() => setDeleting(p)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", padding: 7, display: "flex" }}><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {refunding && (
        <RefundDialog payment={{ id: refunding.id, amount: refunding.amount, currency: refunding.currency, courseTitle: refunding.course.title }}
          onClose={() => setRefunding(null)} onDone={() => { setRefunding(null); onChanged() }} />
      )}
      {deleting && (
        <ConfirmDialog danger title="Eliminar pago" confirmLabel="Eliminar" busy={busy} onCancel={() => setDeleting(null)} onConfirm={remove}
          text={<>¿Eliminar el registro de {money(deleting.amount, deleting.currency)} de “{deleting.course.title}”? Queda anotado en el Historial de cambios. Los pagos de Stripe/PayPal no se pueden eliminar: se marcan como reembolsados.</>} />
      )}
    </div>
  )
}

function AddPayment({ studentId, courses, onCancel, onDone }: { studentId: string; courses: CourseOption[]; onCancel: () => void; onDone: () => void }) {
  const toast = useToast()
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "")
  const course = courses.find((c) => c.id === courseId)
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("")
  const [method, setMethod] = useState<string>("transferencia")
  const [status, setStatus] = useState<"completed" | "pending">("completed")
  const [paidAt, setPaidAt] = useState(() => new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState("")
  const [enroll, setEnroll] = useState(true)
  const [busy, setBusy] = useState(false)

  async function submit() {
    const value = Number(amount === "" ? course?.price ?? NaN : amount)
    if (!Number.isFinite(value)) { toast("error", "Ingresá el monto"); return }
    setBusy(true)
    try {
      const r = await api<{ enrolled: boolean }>("/api/admin/payments", { method: "POST", json: {
        userId: studentId, courseId, amount: value, currency: currency || course?.currency || "USD",
        method, status, note: note || undefined, paidAt: status === "completed" ? paidAt : undefined, enroll,
      } })
      toast("ok", r.enrolled ? "Pago registrado y alumno inscripto" : "Pago registrado")
      onDone()
    } catch (e) { toast("error", (e as Error).message) }
    finally { setBusy(false) }
  }

  return (
    <div style={{ ...card, padding: 18, display: "grid", gap: 14 }}>
      <p style={{ fontFamily: "var(--serif)", fontSize: 17, color: "var(--text)" }}>Registrar pago manual</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12 }}>
        <Field label="Programa" id="pay-course">
          <select id="pay-course" style={{ ...inputStyle, cursor: "pointer" }} value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </Field>
        <Field label="Monto" id="pay-amount"><input id="pay-amount" type="number" min={0} step="0.01" style={inputStyle} value={amount} placeholder={course?.price != null ? String(course.price) : "0"} onChange={(e) => setAmount(e.target.value)} /></Field>
        <Field label="Moneda" id="pay-cur"><input id="pay-cur" maxLength={3} style={{ ...inputStyle, textTransform: "uppercase" }} value={currency} placeholder={course?.currency ?? "USD"} onChange={(e) => setCurrency(e.target.value)} /></Field>
        <Field label="Medio de pago" id="pay-method">
          <select id="pay-method" style={{ ...inputStyle, cursor: "pointer" }} value={method} onChange={(e) => setMethod(e.target.value)}>
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</option>)}
          </select>
        </Field>
        <Field label="Estado" id="pay-status">
          <select id="pay-status" style={{ ...inputStyle, cursor: "pointer" }} value={status} onChange={(e) => setStatus(e.target.value as "completed" | "pending")}>
            <option value="completed">Cobrado</option>
            <option value="pending">Pendiente</option>
          </select>
        </Field>
        {status === "completed" && <Field label="Fecha de cobro" id="pay-date"><input id="pay-date" type="date" style={inputStyle} value={paidAt} onChange={(e) => setPaidAt(e.target.value)} /></Field>}
      </div>
      <Field label="Nota (opcional)" id="pay-note"><input id="pay-note" style={inputStyle} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ej.: transferencia del 12/11, comprobante #4821" /></Field>
      {status === "completed" && (
        <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14, color: "var(--text-strong)", cursor: "pointer" }}>
          <input type="checkbox" checked={enroll} onChange={(e) => setEnroll(e.target.checked)} style={{ width: 18, height: 18, accentColor: "var(--terra)" }} />
          Dar acceso al programa (inscribir o reactivar al alumno)
        </label>
      )}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <GhostButton onClick={onCancel} disabled={busy}>Cancelar</GhostButton>
        <PrimaryButton loading={busy} disabled={!courseId} onClick={submit}>Registrar pago</PrimaryButton>
      </div>
    </div>
  )
}
