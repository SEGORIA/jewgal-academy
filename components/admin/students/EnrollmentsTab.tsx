"use client"

import { useState } from "react"
import { Award, CheckCircle2, ChevronDown, ChevronUp, FileDown, ListChecks, PauseCircle, PlayCircle, Plus, RotateCcw, Trash2, XCircle } from "lucide-react"
import { ConfirmDialog, Field, GhostButton, PrimaryButton, Spinner, api, card, inputStyle, useToast } from "@/components/admin/ui"
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from "@/lib/payment-methods"
import { fmtDate, type CourseOption, type Enrollment, type Student } from "./types"

type MaterialRow = {
  id: string; title: string; type: string; moduleNumber: number; isVisible: boolean
  completedAt: string | null; quizScore: number | null; quizTotal: number | null
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "Activa", color: "var(--success)", bg: "var(--success-soft)" },
  completed: { label: "Completada", color: "var(--gold-ink)", bg: "rgba(196,159,114,.14)" },
  paused: { label: "Pausada", color: "var(--warning)", bg: "var(--warning-soft)" },
  cancelled: { label: "Cancelada", color: "var(--danger)", bg: "var(--danger-soft)" },
}

export function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? { label: status, color: "var(--text-muted)", bg: "var(--surface-2)" }
  return <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 999, color: m.color, background: m.bg, whiteSpace: "nowrap" }}>{m.label}</span>
}

type Props = { student: Student; courses: CourseOption[]; onChanged: () => void; startEnrolling?: boolean }

export default function EnrollmentsTab({ student, courses, onChanged, startEnrolling }: Props) {
  const [enrolling, setEnrolling] = useState(!!startEnrolling)
  const free = courses.filter((c) => !student.enrollments.some((e) => e.courseId === c.id && (e.status === "active" || e.status === "completed")))

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {student.enrollments.length === 0 && !enrolling && (
        <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6 }}>Este alumno todavía no está inscripto en ningún programa.</p>
      )}
      {student.enrollments.map((en) => <EnrollmentCard key={en.id} en={en} onChanged={onChanged} />)}

      {enrolling ? (
        <EnrollForm studentId={student.id} courses={free} onCancel={() => setEnrolling(false)} onDone={() => { setEnrolling(false); onChanged() }} />
      ) : (
        <div>
          <GhostButton icon={<Plus size={14} />} onClick={() => setEnrolling(true)} disabled={free.length === 0}>
            Inscribir en un programa
          </GhostButton>
          {free.length === 0 && <span style={{ marginLeft: 10, fontSize: 12.5, color: "var(--text-faint)" }}>Ya está en todos los programas disponibles.</span>}
        </div>
      )}
    </div>
  )
}

function EnrollForm({ studentId, courses, onCancel, onDone }: { studentId: string; courses: CourseOption[]; onCancel: () => void; onDone: () => void }) {
  const toast = useToast()
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "")
  const [withPayment, setWithPayment] = useState(false)
  const course = courses.find((c) => c.id === courseId)
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState<string>("transferencia")
  const [note, setNote] = useState("")
  const [busy, setBusy] = useState(false)

  async function submit() {
    setBusy(true)
    try {
      const payment = withPayment ? { amount: Number(amount || course?.price || 0), currency: course?.currency ?? "USD", method, note: note || undefined } : undefined
      await api("/api/admin/enrollments", { method: "POST", json: { userId: studentId, courseId, payment } })
      toast("ok", withPayment ? "Alumno inscripto y pago registrado" : "Alumno inscripto")
      onDone()
    } catch (e) { toast("error", (e as Error).message) }
    finally { setBusy(false) }
  }

  return (
    <div style={{ ...card, padding: 18, display: "grid", gap: 14 }}>
      <p style={{ fontFamily: "var(--serif)", fontSize: 17, color: "var(--text)" }}>Inscribir en un programa</p>
      <Field label="Programa" id="enr-course">
        <select id="enr-course" style={{ ...inputStyle, cursor: "pointer" }} value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </Field>
      <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14, color: "var(--text-strong)", cursor: "pointer" }}>
        <input type="checkbox" checked={withPayment} onChange={(e) => setWithPayment(e.target.checked)} style={{ width: 18, height: 18, accentColor: "var(--terra)" }} />
        Registrar también un pago recibido (si no, queda como cortesía o beca)
      </label>
      {withPayment && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          <Field label={`Monto (${course?.currency ?? "USD"})`} id="enr-amount">
            <input id="enr-amount" type="number" min={0} step="0.01" style={inputStyle} value={amount} placeholder={course?.price != null ? String(course.price) : "0"} onChange={(e) => setAmount(e.target.value)} />
          </Field>
          <Field label="Medio de pago" id="enr-method">
            <select id="enr-method" style={{ ...inputStyle, cursor: "pointer" }} value={method} onChange={(e) => setMethod(e.target.value)}>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</option>)}
            </select>
          </Field>
          <div style={{ gridColumn: "1 / -1" }}>
            <Field label="Nota (opcional)" id="enr-note"><input id="enr-note" style={inputStyle} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ej.: comprobante enviado por WhatsApp" /></Field>
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <GhostButton onClick={onCancel} disabled={busy}>Cancelar</GhostButton>
        <PrimaryButton loading={busy} disabled={!courseId} onClick={submit}>Inscribir</PrimaryButton>
      </div>
    </div>
  )
}

function EnrollmentCard({ en, onChanged }: { en: Enrollment; onChanged: () => void }) {
  const toast = useToast()
  const [progress, setProgress] = useState(en.progress)
  const [hours, setHours] = useState(en.hoursCompleted)
  const [busy, setBusy] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<null | "remove" | "revoke" | "reset" | "completeAll">(null)
  const [open, setOpen] = useState(false)
  const [materials, setMaterials] = useState<MaterialRow[] | null>(null)
  const done = !!en.completedAt
  const dirty = progress !== en.progress || hours !== en.hoursCompleted
  const accessOn = en.status === "active" || en.status === "completed"

  async function run<T>(key: string, fn: () => Promise<T>, okMsg?: string) {
    setBusy(key)
    try { const r = await fn(); if (okMsg) toast("ok", okMsg); onChanged(); return r }
    catch (e) { toast("error", (e as Error).message) }
    finally { setBusy(null) }
  }

  const saveMetrics = () => run("metrics", () => api("/api/admin/enrollments", { method: "PATCH", json: { enrollmentId: en.id, progress, hoursCompleted: hours } }), "Avance guardado")
  const setStatus = (status: "active" | "paused" | "cancelled") =>
    run("status", () => api("/api/admin/enrollments", { method: "PATCH", json: { enrollmentId: en.id, status } }), status === "active" ? "Acceso restablecido" : status === "paused" ? "Inscripción pausada: el alumno no puede entrar al aula" : "Inscripción cancelada")
  const certify = () => run("cert", () => api("/api/admin/enrollments/complete", { method: "POST", json: { enrollmentId: en.id } }), "Certificado emitido")
  const revoke = async () => { await run("cert", () => api("/api/admin/enrollments/complete", { method: "DELETE", json: { enrollmentId: en.id } }), "Certificado revocado"); setConfirm(null) }
  const remove = async () => { await run("remove", () => api("/api/admin/enrollments", { method: "DELETE", json: { enrollmentId: en.id } }), "Inscripción quitada"); setConfirm(null) }

  async function loadMaterials() {
    try {
      const d = await api<{ materials: MaterialRow[] }>(`/api/admin/enrollments/${en.id}/progress`, { cache: "no-store" })
      setMaterials(d.materials)
    } catch (e) { toast("error", (e as Error).message) }
  }
  async function toggleOpen() {
    const next = !open
    setOpen(next)
    if (next && !materials) await loadMaterials()
  }

  async function mark(body: unknown, key: string) {
    setBusy(key)
    // Respuesta inmediata en la casilla; si el servidor falla, se vuelve a cargar el estado real.
    const single = body as { materialId?: string; completed?: boolean }
    if (single.materialId !== undefined) {
      const now = single.completed ? new Date().toISOString() : null
      setMaterials((list) => list?.map((m) => (m.id === single.materialId ? { ...m, completedAt: now } : m)) ?? list)
    }
    try {
      const r = await api<{ progress: number; certificateIssued: boolean; certificateKept: boolean }>(`/api/admin/enrollments/${en.id}/progress`, { method: "POST", json: body })
      setProgress(r.progress)
      if (r.certificateIssued) toast("ok", "Llegó al 100%: se emitió el certificado")
      else if (r.certificateKept && r.progress < 100) toast("ok", "Avance actualizado. El certificado ya emitido se conserva (revocalo aparte si corresponde).")
      await loadMaterials()
      onChanged()
    } catch (e) { toast("error", (e as Error).message); await loadMaterials() }
    finally { setBusy(null); setConfirm(null) }
  }

  const byModule = new Map<number, MaterialRow[]>()
  materials?.forEach((m) => byModule.set(m.moduleNumber, [...(byModule.get(m.moduleNumber) ?? []), m]))

  return (
    <div style={{ ...card, padding: 16, borderColor: done ? "rgba(196,159,114,.32)" : undefined }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: "var(--serif)", fontSize: 17, color: "var(--text)", marginBottom: 4 }}>{en.course.title}</p>
          <p style={{ fontSize: 12.5, color: "var(--text-faint)" }}>
            {done && en.certificateNumber ? <><CheckCircle2 size={12} style={{ display: "inline", marginRight: 4, color: "var(--success)" }} />Certificado N° {en.certificateNumber} · {fmtDate(en.completedAt)}
              {en.certificateUrl && <> · <a href={en.certificateUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold-ink)", fontWeight: 600 }}><FileDown size={12} style={{ display: "inline", marginRight: 3 }} />Ver PDF</a></>}</> : "Sin certificado"}
          </p>
        </div>
        <StatusBadge status={en.status} />
      </div>

      <div role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Avance en ${en.course.title}`} style={{ height: 6, borderRadius: 3, background: "var(--surface-2)", overflow: "hidden", marginBottom: 12 }}>
        <div style={{ width: `${progress}%`, height: "100%", background: done ? "var(--success)" : "var(--gold)", transition: "width .3s" }} />
      </div>

      <div style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Field label="Avance %" id={`p-${en.id}`}>
          <input id={`p-${en.id}`} type="number" min={0} max={100} style={{ ...inputStyle, width: 84 }} value={progress} onChange={(e) => setProgress(Math.max(0, Math.min(100, Math.round(Number(e.target.value) || 0))))} />
        </Field>
        <Field label={`Horas${en.course.totalHours ? ` / ${en.course.totalHours}` : ""}`} id={`h-${en.id}`}>
          <input id={`h-${en.id}`} type="number" min={0} style={{ ...inputStyle, width: 96 }} value={hours} onChange={(e) => setHours(Math.max(0, Number(e.target.value) || 0))} />
        </Field>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", paddingBottom: 10 }}>
          Asistencia: <strong style={{ color: "var(--text)" }}>{en.attendance.rate !== null ? `${en.attendance.rate}%` : "—"}</strong>
          {en.attendance.held > 0 && <span style={{ color: "var(--text-faint)" }}> ({en.attendance.attended}/{en.attendance.held})</span>}
        </div>
        <PrimaryButton style={{ marginLeft: "auto" }} disabled={!dirty} loading={busy === "metrics"} onClick={saveMetrics}>Guardar</PrimaryButton>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
        <GhostButton icon={open ? <ChevronUp size={14} /> : <ChevronDown size={14} />} onClick={toggleOpen}>Avance por material</GhostButton>
        {accessOn
          ? <GhostButton icon={<PauseCircle size={14} />} loading={busy === "status"} onClick={() => setStatus("paused")}>Pausar acceso</GhostButton>
          : <GhostButton icon={<PlayCircle size={14} />} loading={busy === "status"} onClick={() => setStatus("active")}>Reactivar acceso</GhostButton>}
        {en.status !== "cancelled" && <GhostButton icon={<XCircle size={14} />} onClick={() => setStatus("cancelled")}>Cancelar</GhostButton>}
        {done
          ? <GhostButton icon={<Award size={14} />} loading={busy === "cert"} onClick={() => setConfirm("revoke")}>Revocar certificado</GhostButton>
          : <GhostButton icon={<Award size={14} />} loading={busy === "cert"} onClick={certify}>Certificar</GhostButton>}
        <GhostButton danger icon={<Trash2 size={14} />} onClick={() => setConfirm("remove")} style={{ marginLeft: "auto" }}>Quitar inscripción</GhostButton>
      </div>

      {open && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
          {!materials ? <Spinner label="Cargando materiales…" /> : materials.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Este programa todavía no tiene materiales cargados.</p>
          ) : (
            <>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                <GhostButton icon={<ListChecks size={14} />} loading={busy === "all"} onClick={() => setConfirm("completeAll")}>Marcar todo como completado</GhostButton>
                <GhostButton icon={<RotateCcw size={14} />} onClick={() => setConfirm("reset")}>Reiniciar avance</GhostButton>
              </div>
              <div style={{ display: "grid", gap: 14 }}>
                {[...byModule.entries()].map(([mod, list]) => (
                  <div key={mod}>
                    <p style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 6 }}>Módulo {mod}</p>
                    <div style={{ display: "grid", gap: 2 }}>
                      {list.map((m) => (
                        <label key={m.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "7px 8px", borderRadius: 8, cursor: "pointer", fontSize: 14, color: m.isVisible ? "var(--text-strong)" : "var(--text-faint)" }}>
                          <input type="checkbox" checked={!!m.completedAt} disabled={busy === `m-${m.id}`}
                            onChange={(e) => mark({ materialId: m.id, completed: e.target.checked }, `m-${m.id}`)}
                            style={{ width: 17, height: 17, accentColor: "var(--terra)", flexShrink: 0 }} />
                          <span style={{ flex: 1, minWidth: 0 }}>{m.title}{!m.isVisible && <em style={{ marginLeft: 8, fontSize: 12 }}>(oculto: no cuenta para el avance)</em>}</span>
                          {m.quizScore != null && m.quizTotal != null && <span style={{ fontSize: 12, color: "var(--text-faint)" }}>Quiz {m.quizScore}/{m.quizTotal}</span>}
                          {m.completedAt && <span style={{ fontSize: 12, color: "var(--text-faint)" }}>{fmtDate(m.completedAt, { day: "numeric", month: "short" })}</span>}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {confirm === "remove" && (
        <ConfirmDialog danger title="Quitar inscripción" confirmLabel="Quitar" busy={busy === "remove"} onCancel={() => setConfirm(null)} onConfirm={remove}
          text={<>¿Quitar a este alumno de <strong>{en.course.title}</strong>? Pierde el acceso al aula de este programa. Sus pagos y su avance por material se conservan. {en.certificateNumber && "Tiene un certificado emitido: revocalo antes de quitar la inscripción."}</>} />
      )}
      {confirm === "revoke" && (
        <ConfirmDialog danger title="Revocar certificado" confirmLabel="Revocar" busy={busy === "cert"} onCancel={() => setConfirm(null)} onConfirm={revoke}
          text={<>Se anula el certificado N° <strong>{en.certificateNumber}</strong> y la inscripción vuelve a “Activa”. El PDF ya emitido deja de estar asociado al alumno.</>} />
      )}
      {confirm === "completeAll" && (
        <ConfirmDialog title="Marcar todo como completado" confirmLabel="Marcar todo" busy={busy === "all"} onCancel={() => setConfirm(null)} onConfirm={() => mark({ all: "complete" }, "all")}
          text="Se marcan como completados todos los materiales visibles del programa. Al llegar al 100% se emite el certificado automáticamente." />
      )}
      {confirm === "reset" && (
        <ConfirmDialog danger title="Reiniciar avance" confirmLabel="Reiniciar" busy={busy === "all"} onCancel={() => setConfirm(null)} onConfirm={() => mark({ all: "reset" }, "all")}
          text="Se borra el avance de todos los materiales de este programa (también los resultados de los quiz). Un certificado ya emitido se conserva." />
      )}
    </div>
  )
}
