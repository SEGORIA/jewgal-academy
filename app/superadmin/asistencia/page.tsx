"use client"

import { useEffect, useState, useCallback } from "react"
import { Loader2, Check, Clock, X as XIcon, Save } from "lucide-react"

type Course = { id: string; title: string; slug: string }
type Session = { id: string; title: string; scheduledAt: string; durationMin: number; isCompleted: boolean }
type Student = { enrollmentId: string; name: string; email: string; attendance: Record<string, string> }

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid rgba(165,141,102,.13)",
  borderRadius: 14,
}

const STATUSES = [
  { key: "present", label: "Presente", color: "var(--success)", Icon: Check },
  { key: "late",    label: "Tarde",    color: "var(--warning)", Icon: Clock },
  { key: "absent",  label: "Ausente",  color: "var(--danger)", Icon: XIcon },
]

export default function AsistenciaPage() {
  const [courses, setCourses]   = useState<Course[]>([])
  const [courseId, setCourseId] = useState("")
  const [sessions, setSessions] = useState<Session[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [sessionId, setSessionId] = useState("")
  const [marks, setMarks]   = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)

  useEffect(() => {
    fetch("/api/admin/attendance")
      .then((r) => r.json())
      .then((d) => setCourses(d.courses ?? []))
      .catch(() => {})
  }, [])

  const loadCourse = useCallback((id: string) => {
    if (!id) { setSessions([]); setStudents([]); setSessionId(""); return }
    setLoading(true)
    fetch(`/api/admin/attendance?courseId=${id}`)
      .then((r) => r.json())
      .then((d) => { setSessions(d.sessions ?? []); setStudents(d.students ?? []); setSessionId("") })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Al elegir sesión, precargar marcas con la asistencia ya registrada (default presente)
  useEffect(() => {
    if (!sessionId) { setMarks({}); return }
    const init: Record<string, string> = {}
    for (const s of students) init[s.enrollmentId] = s.attendance[sessionId] ?? "present"
    setMarks(init)
    setSaved(false)
  }, [sessionId, students])

  async function save() {
    if (!sessionId) return
    setSaving(true)
    const records = students.map((s) => ({ enrollmentId: s.enrollmentId, status: marks[s.enrollmentId] ?? "present" }))
    const res = await fetch("/api/admin/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ liveSessionId: sessionId, records }),
    })
    setSaving(false)
    if (res.ok) { setSaved(true); loadCourse(courseId) }
  }

  const selectedSession = sessions.find((s) => s.id === sessionId)

  return (
    <div style={{ maxWidth: 920, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <span style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: 8 }}>Admin</span>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 36, color: "var(--text)", marginBottom: 6 }}>Registro de asistencia</h1>
        <p style={{ color: "var(--text-faint)", fontSize: 14 }}>Tomá lista por sesión. El porcentaje se actualiza solo en el aula y el panel.</p>
      </div>

      {/* Selector de programa */}
      <div style={{ ...card, padding: "18px 20px", marginBottom: 18 }}>
        <label style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--text-faint)", display: "block", marginBottom: 8 }}>Programa</label>
        <select value={courseId} onChange={(e) => { setCourseId(e.target.value); loadCourse(e.target.value) }}
          style={{ background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.2)", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: "var(--text)", outline: "none", width: "100%", cursor: "pointer" }}>
          <option value="">Elegí un programa…</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ ...card, padding: "50px 0", display: "flex", justifyContent: "center", color: "var(--text-dim)" }}>
          <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
        </div>
      ) : courseId && sessions.length === 0 ? (
        <div style={{ ...card, padding: "40px 20px", textAlign: "center", color: "var(--text-faint)", fontSize: 14 }}>
          Este programa todavía no tiene sesiones en vivo cargadas.
        </div>
      ) : sessions.length > 0 ? (
        <>
          {/* Sesiones */}
          <div style={{ ...card, padding: "16px 18px", marginBottom: 18 }}>
            <p style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 12 }}>Sesión</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {sessions.map((s) => {
                const active = s.id === sessionId
                return (
                  <button key={s.id} onClick={() => setSessionId(s.id)}
                    style={{ background: active ? "rgba(165,141,102,.16)" : "var(--surface)", border: `1px solid ${active ? "var(--gold)" : "rgba(255,255,255,.08)"}`, borderRadius: 9, padding: "9px 14px", fontSize: 12.5, color: active ? "var(--gold)" : "var(--text-muted)", cursor: "pointer", fontWeight: active ? 600 : 400, textAlign: "left" }}>
                    <div>{s.title}</div>
                    <div style={{ fontSize: 10.5, color: "var(--text-dim)", marginTop: 2 }}>
                      {new Date(s.scheduledAt).toLocaleDateString("es-AR", { day: "numeric", month: "short" })} · {s.durationMin} min
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Lista de asistencia */}
          {sessionId && (
            <div style={{ ...card, padding: "20px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 18, color: "var(--text)" }}>Lista · {selectedSession?.title}</h2>
                <span style={{ fontSize: 12, color: "var(--text-faint)" }}>{students.length} alumno{students.length !== 1 ? "s" : ""}</span>
              </div>

              {students.length === 0 ? (
                <p style={{ color: "var(--text-faint)", fontSize: 14, padding: "20px 0", textAlign: "center" }}>No hay alumnos inscritos en este programa.</p>
              ) : (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {students.map((st) => (
                      <div key={st.enrollmentId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 9, background: "var(--surface)", border: "1px solid var(--surface-2)", flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 140 }}>
                          <p style={{ fontSize: 13.5, color: "var(--text)", fontWeight: 500 }}>{st.name}</p>
                          <p style={{ fontSize: 11.5, color: "var(--text-dim)" }}>{st.email}</p>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          {STATUSES.map(({ key, label, color, Icon }) => {
                            const on = (marks[st.enrollmentId] ?? "present") === key
                            return (
                              <button key={key} onClick={() => setMarks((m) => ({ ...m, [st.enrollmentId]: key }))}
                                style={{ display: "flex", alignItems: "center", gap: 5, background: on ? `${color}22` : "transparent", border: `1px solid ${on ? color : "rgba(255,255,255,.1)"}`, color: on ? color : "var(--text-faint)", borderRadius: 7, padding: "6px 10px", fontSize: 11.5, cursor: "pointer", fontWeight: on ? 600 : 400 }}>
                                <Icon size={12} /> {label}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 18 }}>
                    <button onClick={save} disabled={saving}
                      style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--gold)", color: "#2C1F14", border: "none", borderRadius: 10, padding: "11px 22px", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
                      {saving ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Guardando…</> : <><Save size={15} /> Guardar asistencia</>}
                    </button>
                    {saved && <span style={{ fontSize: 13, color: "var(--success)", display: "flex", alignItems: "center", gap: 6 }}><Check size={15} /> Asistencia guardada</span>}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
