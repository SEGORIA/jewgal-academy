"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Eye, KeyRound, Mail, MoreHorizontal, Plus, Search, Trash2, UserPlus, Users } from "lucide-react"
import { ConfirmDialog, EmptyState, Field, GhostButton, Modal, PageHeader, PrimaryButton, Spinner, ToastProvider, api, card, inputStyle, useToast } from "@/components/admin/ui"
import StudentDetail from "@/components/admin/students/StudentDetail"
import { StatusBadge } from "@/components/admin/students/EnrollmentsTab"
import { countsAsIncome, fmtDate, money, type CourseOption, type DetailTab, type Student } from "@/components/admin/students/types"

type Filter = "all" | "enrolled" | "none" | "banned"
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "enrolled", label: "Con programa" },
  { id: "none", label: "Sin programa" },
  { id: "banned", label: "Suspendidos" },
]

function Inner() {
  const toast = useToast()
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<CourseOption[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<Filter>("all")
  const [detail, setDetail] = useState<{ id: string; tab: DetailTab } | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<Student | null>(null)
  const [busy, setBusy] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    try {
      const d = await api<{ students: Student[] }>("/api/admin/students", { cache: "no-store" })
      setStudents(d.students ?? [])
    } catch (e) { toast("error", (e as Error).message) }
    finally { setLoading(false) }
  }, [toast])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    api<{ courses: CourseOption[] }>("/api/admin/directory")
      .then((d) => setCourses(d.courses ?? []))
      .catch(() => {})
  }, [])

  // cierra el menú de acciones al hacer clic fuera o con Esc
  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(null) }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(null) }
    document.addEventListener("mousedown", onDown); document.addEventListener("keydown", onKey)
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey) }
  }, [menuOpen])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return students.filter((s) => {
      if (q && !s.name.toLowerCase().includes(q) && !s.email.toLowerCase().includes(q)) return false
      if (filter === "enrolled") return s.enrollments.length > 0
      if (filter === "none") return s.enrollments.length === 0
      if (filter === "banned") return s.status === "banned"
      return true
    })
  }, [students, search, filter])

  const income = (s: Student) => s.payments.filter((p) => countsAsIncome(p.status)).reduce((a, p) => a + p.amount, 0)
  const totalIncome = students.reduce((a, s) => a + income(s), 0)
  const enrolledCount = students.filter((s) => s.enrollments.length > 0).length
  const selected = detail ? students.find((s) => s.id === detail.id) ?? null : null

  async function remove() {
    if (!deleting) return
    setBusy(true)
    try { await api(`/api/admin/students/${deleting.id}`, { method: "DELETE" }); toast("ok", "Cuenta eliminada"); setDeleting(null); await load() }
    catch (e) { toast("error", (e as Error).message); setDeleting(null) }
    finally { setBusy(false) }
  }

  const rowAction = (id: string, tab: DetailTab) => { setDetail({ id, tab }); setMenuOpen(null) }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <PageHeader
        eyebrow="Personas" title="Alumnos"
        subtitle={loading ? "Cargando…" : `${students.length} alumno${students.length !== 1 ? "s" : ""} registrado${students.length !== 1 ? "s" : ""}. Desde la ficha de cada uno podés editar sus datos, inscribirlo, pausar su acceso, ajustar su avance y registrar pagos.`}
        actions={<PrimaryButton icon={<UserPlus size={15} />} onClick={() => setAdding(true)}>Agregar alumno</PrimaryButton>}
      />

      {!loading && (
        <div style={{ display: "flex", gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
          {[
            { label: "Total alumnos", value: String(students.length), color: "var(--gold-ink)" },
            { label: "Con inscripción", value: String(enrolledCount), color: "var(--terra)" },
            { label: "Cobrado", value: totalIncome > 0 ? money(totalIncome) : "—", color: "var(--success)" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ ...card, borderRadius: 10, padding: "12px 18px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 600, color }}>{value}</span>
              <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{label}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ ...card, padding: "14px 18px", marginBottom: 18, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 260px" }}>
          <Search size={15} aria-hidden style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o email…" aria-label="Buscar alumnos" style={{ ...inputStyle, paddingLeft: 38 }} />
        </div>
        <div role="group" aria-label="Filtrar alumnos" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {FILTERS.map((f) => {
            const on = filter === f.id
            return (
              <button key={f.id} onClick={() => setFilter(f.id)} aria-pressed={on}
                style={{ padding: "7px 14px", borderRadius: 999, fontSize: 13, cursor: "pointer", fontWeight: on ? 600 : 500,
                  border: `1px solid ${on ? "var(--gold-ink)" : "var(--border)"}`, background: on ? "rgba(196,159,114,.14)" : "transparent", color: on ? "var(--gold-ink)" : "var(--text-muted)" }}>
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      {loading ? <Spinner label="Cargando alumnos…" /> : filtered.length === 0 ? (
        <EmptyState icon={<Users size={28} />} title={search || filter !== "all" ? "Sin resultados" : "Todavía no hay alumnos"}
          text={search || filter !== "all" ? "Probá con otro nombre, email o filtro." : "Aparecerán acá cuando se inscriban, o podés agregarlos a mano."}
          action={!search && filter === "all" ? <PrimaryButton icon={<Plus size={15} />} onClick={() => setAdding(true)}>Agregar primer alumno</PrimaryButton> : undefined} />
      ) : (
        <div style={{ ...card, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Alumno", "Programas", "Registrado", "Cobrado", ""].map((h, i) => (
                    <th key={i} scope="col" style={{ textAlign: "left", padding: "13px 18px", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 500 }}>{h || <span className="sr-only">Acciones</span>}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const inc = income(s)
                  return (
                    <tr key={s.id} style={{ borderBottom: "1px solid var(--border-soft)" }}>
                      <td style={{ padding: "13px 18px" }}>
                        <button onClick={() => rowAction(s.id, "programas")} style={{ display: "flex", alignItems: "center", gap: 12, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0, color: "inherit", font: "inherit" }}>
                          <span style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(165,141,102,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "var(--gold-ink)", flexShrink: 0 }}>{s.name.charAt(0).toUpperCase()}</span>
                          <span style={{ minWidth: 0 }}>
                            <span style={{ display: "block", color: "var(--text)", fontWeight: 500 }}>{s.name}{s.status === "banned" && <em style={{ marginLeft: 8, fontSize: 11.5, color: "var(--danger)", fontStyle: "normal" }}>suspendido</em>}</span>
                            <span style={{ display: "block", color: "var(--text-faint)", fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis" }}>{s.email}</span>
                          </span>
                        </button>
                      </td>
                      <td style={{ padding: "13px 18px", maxWidth: 260 }}>
                        {s.enrollments.length === 0 ? <span style={{ color: "var(--text-faint)", fontSize: 13 }}>—</span> : (
                          <div style={{ display: "grid", gap: 4 }}>
                            {s.enrollments.slice(0, 2).map((e) => (
                              <span key={e.id} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "var(--text-strong)" }}>
                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.course.title}</span>
                                {e.status !== "active" && <StatusBadge status={e.status} />}
                              </span>
                            ))}
                            {s.enrollments.length > 2 && <span style={{ fontSize: 12, color: "var(--text-faint)" }}>+{s.enrollments.length - 2} más</span>}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "13px 18px", color: "var(--text-muted)", fontSize: 13, whiteSpace: "nowrap" }}>{fmtDate(s.createdAt)}</td>
                      <td style={{ padding: "13px 18px", color: inc > 0 ? "var(--success)" : "var(--text-faint)", fontSize: 13, whiteSpace: "nowrap" }}>{inc > 0 ? money(inc) : "—"}</td>
                      <td style={{ padding: "13px 18px", position: "relative", textAlign: "right" }}>
                        <button onClick={() => setMenuOpen(menuOpen === s.id ? null : s.id)} aria-label={`Acciones para ${s.name}`} aria-haspopup="menu" aria-expanded={menuOpen === s.id}
                          style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 6, borderRadius: 6, display: "inline-flex" }}>
                          <MoreHorizontal size={18} />
                        </button>
                        {menuOpen === s.id && (
                          <div ref={menuRef} role="menu" style={{ position: "absolute", right: 48, top: 8, background: "var(--surface-solid)", border: "1px solid var(--border)", borderRadius: 10, padding: "6px 0", zIndex: 20, minWidth: 210, boxShadow: "0 12px 40px rgba(0,0,0,.35)", textAlign: "left" }}>
                            {([
                              { label: "Ver ficha y avance", icon: Eye, run: () => rowAction(s.id, "programas") },
                              { label: "Editar datos", icon: Users, run: () => rowAction(s.id, "datos") },
                              { label: "Registrar pago", icon: Plus, run: () => rowAction(s.id, "pagos") },
                              { label: "Restablecer contraseña", icon: KeyRound, run: () => rowAction(s.id, "datos") },
                              { label: "Escribirle un email", icon: Mail, run: () => { window.location.href = `mailto:${s.email}`; setMenuOpen(null) } },
                              { label: "Eliminar cuenta", icon: Trash2, run: () => { setDeleting(s); setMenuOpen(null) }, danger: true },
                            ] as { label: string; icon: typeof Eye; run: () => void; danger?: boolean }[]).map(({ label, icon: Icon, run, danger }) => (
                              <button key={label} role="menuitem" onClick={run}
                                style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: "none", border: "none", padding: "10px 16px", fontSize: 14, cursor: "pointer", color: danger ? "var(--danger)" : "var(--text-strong)" }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")} onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>
                                <Icon size={15} /> {label}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && detail && (
        <StudentDetail key={`${selected.id}-${detail.tab}`} student={selected} courses={courses} initialTab={detail.tab} onClose={() => setDetail(null)} onChanged={load} />
      )}
      {adding && <AddStudent courses={courses} onClose={() => setAdding(false)} onDone={() => { setAdding(false); load() }} />}
      {deleting && (
        <ConfirmDialog danger title="Eliminar cuenta" confirmLabel="Eliminar cuenta" busy={busy} onCancel={() => setDeleting(null)} onConfirm={remove}
          text={<>¿Eliminar la cuenta de <strong>{deleting.name}</strong> de forma permanente? Si tiene inscripciones o pagos registrados no se puede eliminar: en ese caso quitale primero sus inscripciones y pagos.</>} />
      )}
    </div>
  )
}

function AddStudent({ courses, onClose, onDone }: { courses: CourseOption[]; onClose: () => void; onDone: () => void }) {
  const toast = useToast()
  const [form, setForm] = useState({ name: "", email: "", password: "", courseId: "" })
  const [busy, setBusy] = useState(false)
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }))

  async function submit() {
    if (!form.name.trim() || !form.email.trim() || !form.password) { toast("error", "Completá nombre, email y contraseña."); return }
    if (form.password.length < 6) { toast("error", "La contraseña debe tener al menos 6 caracteres."); return }
    setBusy(true)
    try {
      await api("/api/admin/students", { method: "POST", json: { name: form.name, email: form.email, password: form.password, courseId: form.courseId || undefined } })
      toast("ok", "Cuenta creada")
      onDone()
    } catch (e) { toast("error", (e as Error).message) }
    finally { setBusy(false) }
  }

  return (
    <Modal title="Agregar alumno" onClose={onClose} width={520}
      footer={<><GhostButton onClick={onClose} disabled={busy}>Cancelar</GhostButton><PrimaryButton loading={busy} onClick={submit}>Crear cuenta</PrimaryButton></>}>
      <div style={{ display: "grid", gap: 14 }}>
        <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6 }}>Crea la cuenta y, si querés, la inscribe en un programa. Después podés completar sus datos y registrar pagos desde su ficha.</p>
        <Field label="Nombre completo" id="add-name"><input id="add-name" style={inputStyle} value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="María García" /></Field>
        <Field label="Email" id="add-email"><input id="add-email" type="email" style={inputStyle} value={form.email} onChange={(e) => set({ email: e.target.value })} placeholder="maria@email.com" /></Field>
        <Field label="Contraseña inicial" id="add-pass" hint="Mínimo 6 caracteres. Después se puede restablecer desde su ficha."><input id="add-pass" type="text" autoComplete="off" style={inputStyle} value={form.password} onChange={(e) => set({ password: e.target.value })} /></Field>
        <Field label="Programa (opcional)" id="add-course">
          <select id="add-course" style={{ ...inputStyle, cursor: "pointer" }} value={form.courseId} onChange={(e) => set({ courseId: e.target.value })}>
            <option value="">Sin programa</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </Field>
      </div>
    </Modal>
  )
}

export default function AlumnosPage() { return <ToastProvider><Inner /></ToastProvider> }
