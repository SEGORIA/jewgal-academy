"use client"

import { useEffect, useState, useCallback } from "react"
import { Search, UserPlus, Mail, MoreHorizontal, X, Eye, Trash2, Loader2, Award, CheckCircle2 } from "lucide-react"

type Enrollment = {
  id: string
  status: string
  progress: number
  hoursCompleted: number
  completedAt: string | null
  certificateNumber: string | null
  attendance: { attended: number; held: number; rate: number | null }
  course: { title: string; slug: string; totalHours: number | null }
}

type Student = {
  id: string
  name: string
  email: string
  createdAt: string
  enrollments: Enrollment[]
  payments: { amount: number; status: string; paidAt: string | null }[]
}

const COURSES = [
  { id: "", label: "Sin programa" },
  { id: "life-coaching-integrativo", label: "Life Coaching Integrativo" },
  { id: "joogal-adultos",            label: "Instructor Jewgal Adultos" },
  { id: "joogalkids",                label: "Instructor Joogalkids" },
  { id: "metodo-sholem",             label: "Método Sholem" },
  { id: "cabala-coach",              label: "Cábala Coach" },
]

type Modal = null | { type: "add" } | { type: "detail"; student: Student } | { type: "delete"; student: Student }

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid rgba(165,141,102,.13)",
  borderRadius: 14,
}

const inputStyle: React.CSSProperties = {
  background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.2)",
  borderRadius: 9, padding: "10px 14px", fontSize: 13, color: "var(--text)",
  outline: "none", fontFamily: "inherit", width: "100%",
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase",
  color: "var(--text-faint)", display: "block", marginBottom: 7,
}

export default function AlumnosPage() {
  const [students, setStudents]   = useState<Student[]>([])
  const [loading,  setLoading]    = useState(true)
  const [search,   setSearch]     = useState("")
  const [modal,    setModal]      = useState<Modal>(null)
  const [menuOpen, setMenuOpen]   = useState<string | null>(null)
  const [saving,   setSaving]     = useState(false)
  const [error,    setError]      = useState("")

  const [form, setForm] = useState({ name: "", email: "", password: "", courseSlug: "" })
  const [edit, setEdit] = useState<Record<string, { progress: number; hours: number }>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  async function saveMetrics(enrollmentId: string) {
    const v = edit[enrollmentId]
    if (!v) return
    setSavingId(enrollmentId)
    const res = await fetch("/api/admin/enrollments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enrollmentId, progress: v.progress, hoursCompleted: v.hours }),
    })
    setSavingId(null)
    if (res.ok) { load(); setModal(null) }
  }

  const load = useCallback(() => {
    setLoading(true)
    fetch("/api/admin/students")
      .then((r) => r.json())
      .then((d) => setStudents(d.students ?? []))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  async function addStudent() {
    if (!form.name || !form.email || !form.password) { setError("Completá todos los campos."); return }
    if (form.password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return }
    setSaving(true); setError("")
    const courseId = form.courseSlug
      ? (await fetch(`/api/admin/students?slug=${form.courseSlug}`).then(() => null).catch(() => null), form.courseSlug)
      : undefined
    const res = await fetch("/api/admin/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password, courseId }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error || "Error al crear la cuenta"); return }
    setModal(null)
    setForm({ name: "", email: "", password: "", courseSlug: "" })
    load()
  }

  const programName = (s: Student) =>
    s.enrollments.length > 0 ? s.enrollments.map((e) => e.course.title).join(", ") : "—"

  const totalPaid = (s: Student) =>
    s.payments.reduce((sum, p) => sum + (p.status !== "pending" ? p.amount : 0), 0)

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <span style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: 8 }}>Admin</span>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 36, color: "var(--text)", marginBottom: 6 }}>Alumnos</h1>
          <p style={{ color: "var(--text-faint)", fontSize: 14 }}>
            {loading ? "Cargando…" : `${students.length} alumno${students.length !== 1 ? "s" : ""} registrado${students.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button onClick={() => { setModal({ type: "add" }); setError("") }}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--gold)", color: "#081E29", border: "none", borderRadius: 10, padding: "11px 20px", fontSize: 13, fontWeight: 700, letterSpacing: ".08em", cursor: "pointer" }}>
          <UserPlus size={16} /> Agregar alumno
        </button>
      </div>

      {/* Filtro de búsqueda */}
      <div style={{ ...card, padding: "14px 18px", marginBottom: 20 }}>
        <div style={{ position: "relative" }}>
          <Search size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email…"
            style={{ ...inputStyle, paddingLeft: 38 }} />
        </div>
      </div>

      {/* Tabla */}
      <div style={{ ...card, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "60px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "var(--text-dim)" }}>
            <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
            Cargando alumnos…
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--surface-2)" }}>
                  {["Alumno", "Email", "Programa", "Inscrito", "Pagado", ""].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "13px 18px", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "60px 0", textAlign: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(165,141,102,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <UserPlus size={24} style={{ color: "rgba(165,141,102,.5)" }} />
                        </div>
                        <div>
                          <p style={{ color: "var(--text-muted)", fontWeight: 500, marginBottom: 4 }}>{search ? "Sin resultados" : "No hay alumnos aún"}</p>
                          <p style={{ color: "var(--text-dim)", fontSize: 13 }}>
                            {search ? "Probá con otro nombre o email." : "Aparecerán aquí cuando se inscriban o las agregues manualmente."}
                          </p>
                        </div>
                        {!search && (
                          <button onClick={() => setModal({ type: "add" })}
                            style={{ background: "var(--gold)", color: "#081E29", border: "none", borderRadius: 9, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                            Agregar primer alumno
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : filtered.map((s) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid var(--surface)", transition: "background .15s" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--surface)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                  >
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(165,141,102,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "var(--gold)", flexShrink: 0 }}>
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ color: "var(--text)", fontWeight: 500 }}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 18px", color: "var(--text-muted)" }}>{s.email}</td>
                    <td style={{ padding: "14px 18px", color: "var(--text-muted)", fontSize: 12, maxWidth: 200 }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{programName(s)}</span>
                    </td>
                    <td style={{ padding: "14px 18px", color: "var(--text-faint)", fontSize: 12 }}>
                      {new Date(s.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td style={{ padding: "14px 18px", color: totalPaid(s) > 0 ? "var(--success)" : "var(--text-dim)", fontSize: 12 }}>
                      {totalPaid(s) > 0 ? `$${totalPaid(s).toLocaleString("es")}` : "—"}
                    </td>
                    <td style={{ padding: "14px 18px", position: "relative" }}>
                      <button onClick={() => setMenuOpen(menuOpen === s.id ? null : s.id)} aria-label="Acciones del alumno"
                        aria-haspopup="menu" aria-expanded={menuOpen === s.id}
                        style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", padding: 4, borderRadius: 6 }}>
                        <MoreHorizontal size={17} />
                      </button>
                      {menuOpen === s.id && (
                        <div style={{ position: "absolute", right: 48, top: 8, background: "var(--surface-solid)", border: "1px solid rgba(165,141,102,.2)", borderRadius: 10, padding: "6px 0", zIndex: 20, minWidth: 180, boxShadow: "0 12px 40px rgba(0,0,0,.5)" }}>
                          {[
                            { label: "Ver detalle",  icon: Eye,    action: () => { setModal({ type: "detail", student: s }); setMenuOpen(null) } },
                            { label: "Enviar email", icon: Mail,   action: () => { window.location.href = `mailto:${s.email}`; setMenuOpen(null) } },
                            { label: "Eliminar",     icon: Trash2, action: () => { setModal({ type: "delete", student: s }); setMenuOpen(null) }, danger: true },
                          ].map(({ label, icon: Icon, action, danger }) => (
                            <button key={label} onClick={action}
                              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: "none", border: "none", padding: "10px 16px", fontSize: 13, cursor: "pointer", color: danger ? "var(--danger)" : "var(--text-strong)", transition: "background .15s" }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                            >
                              <Icon size={15} /> {label}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODALES ── */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setModal(null)}>
          <div style={{ position: "absolute", inset: 0, background: "var(--scrim)", backdropFilter: "blur(10px)" }} />
          <div style={{ position: "relative", zIndex: 1, background: "var(--surface-solid)", border: "1px solid rgba(165,141,102,.22)", borderRadius: 18, padding: "36px 32px", width: "100%", maxWidth: 480, boxShadow: "0 48px 120px rgba(0,0,0,.6)" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setModal(null)} aria-label="Cerrar" style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer" }}><X size={20} /></button>

            {/* ADD */}
            {modal.type === "add" && (
              <>
                <h2 style={{ fontFamily: "var(--serif)", fontSize: 24, color: "var(--text)", marginBottom: 6 }}>Agregar alumno</h2>
                <p style={{ color: "var(--text-faint)", fontSize: 14, marginBottom: 24 }}>Crea una cuenta y asignala a un programa.</p>
                {error && (
                  <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: "var(--danger)", marginBottom: 16 }}>
                    {error}
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { label: "Nombre completo",   key: "name",     placeholder: "María García",     type: "text" },
                    { label: "Email",              key: "email",    placeholder: "maria@email.com",  type: "email" },
                    { label: "Contraseña inicial", key: "password", placeholder: "Mínimo 6 caracteres", type: "password" },
                  ].map(({ label, key, placeholder, type }) => (
                    <div key={key}>
                      <label style={labelStyle}>{label}</label>
                      <input type={type} placeholder={placeholder}
                        value={(form as Record<string, string>)[key]}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                        style={inputStyle} />
                    </div>
                  ))}
                  <div>
                    <label style={labelStyle}>Programa (opcional)</label>
                    <select value={form.courseSlug} onChange={(e) => setForm((f) => ({ ...f, courseSlug: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
                      {COURSES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
                  <button onClick={() => setModal(null)} style={{ flex: 1, background: "var(--surface-2)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "12px 0", fontSize: 13, color: "var(--text-muted)", cursor: "pointer" }}>
                    Cancelar
                  </button>
                  <button onClick={addStudent} disabled={saving}
                    style={{ flex: 2, background: "var(--gold)", border: "none", borderRadius: 10, padding: "12px 0", fontSize: 13, fontWeight: 700, color: "#081E29", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    {saving ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Creando…</> : "Crear cuenta"}
                  </button>
                </div>
              </>
            )}

            {/* DELETE */}
            {modal.type === "delete" && (
              <>
                <h2 style={{ fontFamily: "var(--serif)", fontSize: 24, color: "var(--danger)", marginBottom: 8 }}>Eliminar alumno</h2>
                <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>
                  Esta acción eliminará la cuenta de <strong style={{ color: "var(--text)" }}>{modal.student.name}</strong> y todas sus inscripciones. No se puede deshacer.
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setModal(null)} style={{ flex: 1, background: "var(--surface-2)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "12px 0", fontSize: 13, color: "var(--text-muted)", cursor: "pointer" }}>Cancelar</button>
                  <button onClick={() => setModal(null)} style={{ flex: 2, background: "rgba(239,68,68,.85)", border: "none", borderRadius: 10, padding: "12px 0", fontSize: 13, fontWeight: 700, color: "white", cursor: "pointer" }}>
                    Contactar al soporte
                  </button>
                </div>
                <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 12, textAlign: "center" }}>Por seguridad, la eliminación definitiva requiere confirmación por email.</p>
              </>
            )}

            {/* DETAIL */}
            {modal.type === "detail" && (
              <>
                <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24 }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(165,141,102,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "var(--gold)", flexShrink: 0 }}>
                    {modal.student.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--text)", marginBottom: 2 }}>{modal.student.name}</h2>
                    <p style={{ color: "var(--text-faint)", fontSize: 14 }}>{modal.student.email}</p>
                  </div>
                </div>

                {/* Info básica */}
                {[
                  ["Inscrito el",  new Date(modal.student.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })],
                  ["Pagos totales", totalPaid(modal.student) > 0 ? `$${totalPaid(modal.student).toLocaleString("es")}` : "Sin pago registrado"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--surface-2)" }}>
                    <span style={{ fontSize: 13, color: "var(--text-faint)" }}>{k}</span>
                    <span style={{ fontSize: 13, color: "var(--text-strong)" }}>{v}</span>
                  </div>
                ))}

                {/* Programas: avance, horas, asistencia, certificación */}
                {modal.student.enrollments.length > 0 && (
                  <div style={{ marginTop: 16, marginBottom: 4 }}>
                    <p style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(165,141,102,.5)", marginBottom: 10 }}>Programas · gestión académica</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {modal.student.enrollments.map((en) => {
                        const ev = edit[en.id] ?? { progress: en.progress, hours: en.hoursCompleted }
                        const totalH = en.course.totalHours
                        const done = !!en.completedAt
                        return (
                          <div key={en.id} style={{ padding: "13px 14px", borderRadius: 10, background: done ? "rgba(107,191,142,.06)" : "var(--surface)", border: `1px solid ${done ? "rgba(107,191,142,.2)" : "rgba(255,255,255,.07)"}` }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
                              <p style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>{en.course.title}</p>
                              {done ? (
                                <span style={{ fontSize: 10, color: "var(--success)", whiteSpace: "nowrap" }}>
                                  <CheckCircle2 size={10} style={{ display: "inline", marginRight: 4 }} />
                                  N° {en.certificateNumber}
                                </span>
                              ) : (
                                <span style={{ fontSize: 10, color: "var(--text-dim)", whiteSpace: "nowrap" }}>En curso</span>
                              )}
                            </div>

                            {/* Barra de avance */}
                            <div style={{ height: 5, borderRadius: 3, background: "var(--surface-2)", marginBottom: 12, overflow: "hidden" }}>
                              <div style={{ width: `${en.progress}%`, height: "100%", background: done ? "var(--success)" : "var(--gold)", transition: "width .3s" }} />
                            </div>

                            {/* Métricas editables + asistencia */}
                            <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
                              <label style={{ fontSize: 10, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--text-faint)", display: "flex", flexDirection: "column", gap: 3 }}>
                                Avance %
                                <input type="number" min={0} max={100} value={ev.progress}
                                  onChange={(e) => setEdit((p) => ({ ...p, [en.id]: { ...ev, progress: Math.max(0, Math.min(100, Number(e.target.value))) } }))}
                                  style={{ background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.2)", borderRadius: 6, padding: "5px 8px", fontSize: 12, color: "var(--text)", outline: "none", width: 60 }} />
                              </label>
                              <label style={{ fontSize: 10, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--text-faint)", display: "flex", flexDirection: "column", gap: 3 }}>
                                Horas{totalH ? ` / ${totalH}` : ""}
                                <input type="number" min={0} value={ev.hours}
                                  onChange={(e) => setEdit((p) => ({ ...p, [en.id]: { ...ev, hours: Math.max(0, Number(e.target.value)) } }))}
                                  style={{ background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.2)", borderRadius: 6, padding: "5px 8px", fontSize: 12, color: "var(--text)", outline: "none", width: 60 }} />
                              </label>
                              <div style={{ fontSize: 11, color: "var(--text-muted)", paddingBottom: 6 }}>
                                Asistencia<br />
                                <strong style={{ color: "var(--text)", fontSize: 13 }}>{en.attendance.rate !== null ? `${en.attendance.rate}%` : "—"}</strong>
                                {en.attendance.held > 0 && <span style={{ color: "var(--text-dim)" }}> ({en.attendance.attended}/{en.attendance.held})</span>}
                              </div>
                              <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
                                <button onClick={() => saveMetrics(en.id)} disabled={savingId === en.id}
                                  style={{ background: "var(--surface-2)", border: "1px solid rgba(255,255,255,.12)", color: "var(--text-strong)", borderRadius: 7, padding: "7px 12px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
                                  {savingId === en.id ? "…" : "Guardar"}
                                </button>
                                {!done && (
                                  <button
                                    onClick={async () => {
                                      const res = await fetch("/api/admin/enrollments/complete", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ enrollmentId: en.id }),
                                      })
                                      if (res.ok) { load(); setModal(null) }
                                    }}
                                    style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(165,141,102,.12)", border: "1px solid rgba(165,141,102,.25)", color: "var(--gold)", borderRadius: 7, padding: "7px 12px", fontSize: 11, cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}
                                  >
                                    <Award size={12} /> Certificar
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  <a href={`mailto:${modal.student.email}`} style={{ flex: 1, background: "rgba(165,141,102,.15)", border: "1px solid rgba(165,141,102,.25)", borderRadius: 10, padding: "11px 0", fontSize: 13, color: "var(--gold)", cursor: "pointer", textDecoration: "none", textAlign: "center" as const }}>
                    Enviar email
                  </a>
                  <button onClick={() => setModal(null)} style={{ flex: 1, background: "var(--gold)", border: "none", borderRadius: 10, padding: "11px 0", fontSize: 13, fontWeight: 700, color: "#081E29", cursor: "pointer" }}>Cerrar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
