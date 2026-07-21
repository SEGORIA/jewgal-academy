"use client"

import { useState, useEffect, useCallback } from "react"
import { Users, FileText, Eye, EyeOff, Plus, X, Video, Trash2, Pencil, Loader2, ExternalLink, Download, PlayCircle, ListChecks, ChevronUp, ChevronDown, Save, AlertCircle, GripVertical } from "lucide-react"
import { getProgramContent, getYouTubeEmbedUrl, EMPTY_PROGRAM_CONTENT, type ProgramContent } from "@/lib/program-content"

type Course = {
  id: string; title: string; slug: string; shortDesc: string; description: string
  price: number; currency: string; isFree: boolean; isPublished: boolean
  totalHours: number | null; durationWeeks: number | null; thumbnail: string | null
  videoUrl: string | null; content: string | null
  _count: { enrollments: number; materials: number; liveSessions: number }
}
type Material = {
  id: string; title: string; description: string | null; type: "document" | "video" | "link"
  fileUrl: string | null; videoUrl: string | null; linkUrl: string | null
  moduleNumber: number; isVisible: boolean
}
type LiveSession = {
  id: string; title: string; scheduledAt: string; durationMin: number
  joinUrl: string | null; recordingUrl: string | null; isCompleted: boolean
  _count: { attendances: number }
}
type StudentRow = {
  id: string; name: string; email: string
  enrollments: { courseId: string; progress: number; hoursCompleted: number; certificateNumber: string | null }[]
}

type Tab = "contenido" | "materiales" | "sesiones" | "alumnos"

const card: React.CSSProperties = { background: "var(--surface)", border: "1px solid rgba(165,141,102,.13)", borderRadius: 14 }
const inputStyle: React.CSSProperties = { background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.2)", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: "var(--text)", outline: "none", fontFamily: "inherit", width: "100%" }
const labelStyle: React.CSSProperties = { fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--text-faint)", display: "block", marginBottom: 7 }
const btnPrimary = (accent: string): React.CSSProperties => ({ display: "flex", alignItems: "center", gap: 7, background: accent, color: "#2C1F14", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" })
const btnGhost: React.CSSProperties = { background: "var(--surface-2)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 8, padding: "10px 0", fontSize: 13, color: "var(--text-muted)", cursor: "pointer" }

const ACCENTS = ["#A58D66", "#A76D61", "#C49F72", "#CBB78B", "#8FBF9F"]
const accentFor = (i: number) => ACCENTS[i % ACCENTS.length]

const emptyCourseForm = { title: "", shortDesc: "", description: "", price: "0", isFree: false, totalHours: "", durationWeeks: "", thumbnail: "" }
const emptyMatForm = { title: "", description: "", type: "document" as "document" | "video" | "link", url: "", moduleNumber: "1" }
const emptySesForm = { title: "", joinUrl: "", date: "", time: "", durationMin: "90" }

export default function CursosAdminPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>("materiales")

  const [showCourseForm, setShowCourseForm] = useState(false)
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null)
  const [courseForm, setCourseForm] = useState(emptyCourseForm)
  const [savingCourse, setSavingCourse] = useState(false)
  const [courseError, setCourseError] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [materials, setMaterials] = useState<Material[]>([])
  const [loadingMat, setLoadingMat] = useState(false)
  const [showAddMat, setShowAddMat] = useState(false)
  const [matForm, setMatForm] = useState(emptyMatForm)
  const [savingMat, setSavingMat] = useState(false)

  const [sessions, setSessions] = useState<LiveSession[]>([])
  const [loadingSes, setLoadingSes] = useState(false)
  const [showAddSes, setShowAddSes] = useState(false)
  const [sesForm, setSesForm] = useState(emptySesForm)
  const [savingSes, setSavingSes] = useState(false)

  const [students, setStudents] = useState<StudentRow[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)

  const [progContent, setProgContent] = useState<ProgramContent>(EMPTY_PROGRAM_CONTENT)
  const [videoUrlInput, setVideoUrlInput] = useState("")
  const [savingContent, setSavingContent] = useState(false)
  const [contentSaved, setContentSaved] = useState(false)
  const [contentError, setContentError] = useState("")

  const selected = courses.find((c) => c.id === selectedId) || null

  const loadCourses = useCallback(() => {
    setLoading(true)
    fetch("/api/admin/courses").then((r) => r.json()).then((d) => setCourses(d.courses || [])).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadCourses()
    setLoadingStudents(true)
    fetch("/api/admin/students").then((r) => r.json()).then((d) => setStudents(d.students || [])).finally(() => setLoadingStudents(false))
  }, [loadCourses])

  const loadMaterials = useCallback((courseId: string) => {
    setLoadingMat(true)
    fetch(`/api/admin/materials?courseId=${courseId}`).then((r) => r.json()).then((d) => setMaterials(d.materials || [])).finally(() => setLoadingMat(false))
  }, [])

  const loadSessions = useCallback((courseId: string) => {
    setLoadingSes(true)
    fetch(`/api/admin/live-sessions?courseId=${courseId}`).then((r) => r.json()).then((d) => setSessions(d.sessions || [])).finally(() => setLoadingSes(false))
  }, [])

  useEffect(() => {
    if (!selected) return
    if (tab === "materiales") loadMaterials(selected.id)
    if (tab === "sesiones") loadSessions(selected.id)
    if (tab === "contenido") {
      setProgContent(getProgramContent(selected.slug, selected.content))
      setVideoUrlInput(selected.videoUrl ?? "")
      setContentError("")
      setContentSaved(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id, tab])

  async function saveProgramContent() {
    if (!selected) return
    setSavingContent(true)
    setContentError("")
    try {
      const res = await fetch(`/api/admin/courses/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: videoUrlInput.trim() || "", content: progContent }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "No se pudo guardar")
      setContentSaved(true)
      setTimeout(() => setContentSaved(false), 2500)
      loadCourses()
    } catch (e) {
      setContentError(e instanceof Error ? e.message : "Error al guardar")
    } finally {
      setSavingContent(false)
    }
  }

  function openNewCourse() {
    setCourseForm(emptyCourseForm)
    setEditingCourseId(null)
    setCourseError("")
    setShowCourseForm(true)
  }

  function openEditCourse(c: Course) {
    setCourseForm({
      title: c.title, shortDesc: c.shortDesc, description: c.description,
      price: String(c.price), isFree: c.isFree,
      totalHours: c.totalHours != null ? String(c.totalHours) : "",
      durationWeeks: c.durationWeeks != null ? String(c.durationWeeks) : "",
      thumbnail: c.thumbnail || "",
    })
    setEditingCourseId(c.id)
    setCourseError("")
    setShowCourseForm(true)
  }

  async function saveCourse() {
    if (!courseForm.title.trim() || !courseForm.shortDesc.trim() || !courseForm.description.trim()) {
      setCourseError("Título, resumen y descripción son obligatorios.")
      return
    }
    setSavingCourse(true)
    setCourseError("")
    const payload = {
      title: courseForm.title.trim(),
      shortDesc: courseForm.shortDesc.trim(),
      description: courseForm.description.trim(),
      price: courseForm.isFree ? 0 : Number(courseForm.price) || 0,
      isFree: courseForm.isFree,
      totalHours: courseForm.totalHours ? Number(courseForm.totalHours) : null,
      durationWeeks: courseForm.durationWeeks ? Number(courseForm.durationWeeks) : null,
      thumbnail: courseForm.thumbnail.trim() || null,
    }
    try {
      const res = await fetch(editingCourseId ? `/api/admin/courses/${editingCourseId}` : "/api/admin/courses", {
        method: editingCourseId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCourseId ? payload : { ...payload, isPublished: false }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "No se pudo guardar")
      setShowCourseForm(false)
      loadCourses()
    } catch (e) {
      setCourseError(e instanceof Error ? e.message : "Error al guardar")
    } finally {
      setSavingCourse(false)
    }
  }

  async function togglePublish(c: Course) {
    await fetch(`/api/admin/courses/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !c.isPublished }),
    })
    loadCourses()
  }

  async function deleteCourse(c: Course) {
    if (!confirm(`¿Eliminar "${c.title}"? Esta acción no se puede deshacer.`)) return
    setDeletingId(c.id)
    try {
      const res = await fetch(`/api/admin/courses/${c.id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) { alert(data.error || "No se pudo eliminar"); return }
      if (selectedId === c.id) setSelectedId(null)
      loadCourses()
    } finally {
      setDeletingId(null)
    }
  }

  async function saveMaterial() {
    if (!selected || !matForm.title.trim() || !matForm.url.trim()) return
    setSavingMat(true)
    const urlField = matForm.type === "document" ? "fileUrl" : matForm.type === "video" ? "videoUrl" : "linkUrl"
    try {
      await fetch("/api/admin/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selected.id,
          title: matForm.title.trim(),
          description: matForm.description.trim() || null,
          type: matForm.type,
          [urlField]: matForm.url.trim(),
          moduleNumber: Number(matForm.moduleNumber) || 1,
        }),
      })
      setShowAddMat(false)
      setMatForm(emptyMatForm)
      loadMaterials(selected.id)
      loadCourses()
    } finally {
      setSavingMat(false)
    }
  }

  async function toggleMatVisible(m: Material) {
    if (!selected) return
    await fetch(`/api/admin/materials/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible: !m.isVisible }),
    })
    loadMaterials(selected.id)
  }

  async function deleteMaterial(m: Material) {
    if (!selected || !confirm(`¿Eliminar "${m.title}"?`)) return
    await fetch(`/api/admin/materials/${m.id}`, { method: "DELETE" })
    loadMaterials(selected.id)
    loadCourses()
  }

  async function saveSession() {
    if (!selected || !sesForm.title.trim() || !sesForm.date || !sesForm.time) return
    setSavingSes(true)
    try {
      await fetch("/api/admin/live-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selected.id,
          title: sesForm.title.trim(),
          joinUrl: sesForm.joinUrl.trim() || null,
          scheduledAt: new Date(`${sesForm.date}T${sesForm.time}`).toISOString(),
          durationMin: Number(sesForm.durationMin) || 90,
        }),
      })
      setShowAddSes(false)
      setSesForm(emptySesForm)
      loadSessions(selected.id)
      loadCourses()
    } finally {
      setSavingSes(false)
    }
  }

  async function deleteSession(s: LiveSession) {
    if (!selected || !confirm(`¿Eliminar la sesión "${s.title}"?`)) return
    await fetch(`/api/admin/live-sessions/${s.id}`, { method: "DELETE" })
    loadSessions(selected.id)
    loadCourses()
  }

  const courseStudents = selected
    ? students.filter((s) => s.enrollments.some((e) => e.courseId === selected.id))
      .map((s) => ({ ...s, enrollment: s.enrollments.find((e) => e.courseId === selected.id)! }))
    : []

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <span style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: 8 }}>Admin</span>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 36, color: "var(--text)", marginBottom: 6 }}>Programas</h1>
          <p style={{ color: "var(--text-faint)", fontSize: 14 }}>Gestioná contenido, sesiones y alumnos de cada programa.</p>
        </div>
        <button onClick={openNewCourse} style={btnPrimary("var(--gold)")}>
          <Plus size={16} /> Nuevo programa
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selected || showCourseForm ? "300px 1fr" : "1fr", gap: 20, alignItems: "start" }}>

        {/* Lista */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {loading && <p style={{ color: "var(--text-faint)", fontSize: 13, padding: 12 }}>Cargando programas…</p>}
          {!loading && courses.length === 0 && (
            <div style={{ ...card, padding: 24, textAlign: "center" }}>
              <p style={{ color: "var(--text-dim)", fontSize: 14 }}>No hay programas todavía.</p>
            </div>
          )}
          {courses.map((p, i) => {
            const accent = accentFor(i)
            return (
              <div key={p.id} onClick={() => { setSelectedId(selectedId === p.id ? null : p.id); setTab("materiales"); setShowCourseForm(false) }}
                style={{ ...card, padding: "18px 18px", cursor: "pointer", transition: "all .18s", borderColor: selectedId === p.id ? accent + "55" : "rgba(165,141,102,.13)" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: accent, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", flex: 1 }}>{p.title}</span>
                  <button onClick={(e) => { e.stopPropagation(); togglePublish(p) }} title={p.isPublished ? "Despublicar" : "Publicar"}
                    style={{ background: "none", border: "none", cursor: "pointer", color: p.isPublished ? "var(--success)" : "var(--text-dim)", padding: 2 }}>
                    {p.isPublished ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); openEditCourse(p) }} title="Editar"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", padding: 2 }}>
                    <Pencil size={14} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); deleteCourse(p) }} title="Eliminar" disabled={deletingId === p.id}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(239,68,68,.55)", padding: 2 }}>
                    {deletingId === p.id ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={14} />}
                  </button>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, color: "var(--text-faint)" }}>{p.isFree ? "Gratuito" : `$${p.price}`}</span>
                  <span style={{ fontSize: 12, color: "var(--text-dim)" }}>· {p._count.enrollments} alumnos</span>
                  <span style={{ fontSize: 12, color: "var(--text-dim)" }}>· {p._count.materials} materiales</span>
                  <span style={{ fontSize: 12, color: "var(--text-dim)" }}>· {p._count.liveSessions} sesiones</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: p.isPublished ? "var(--success)" : "var(--text-dim)" }}>
                    {p.isPublished ? "● Activo" : "○ Oculto"}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Formulario crear/editar programa */}
        {showCourseForm && (
          <div style={{ ...card, padding: "28px 26px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 22, color: "var(--text)" }}>
                {editingCourseId ? "Editar programa" : "Nuevo programa"}
              </h2>
              <button onClick={() => setShowCourseForm(false)} style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            {courseError && (
              <div style={{ background: "rgba(220,38,38,.1)", border: "1px solid rgba(220,38,38,.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#f87171", fontSize: 13 }}>
                {courseError}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Título del programa</label>
                <input value={courseForm.title} onChange={(e) => setCourseForm((f) => ({ ...f, title: e.target.value }))} placeholder="Ej: Life Coaching Integrativo" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Resumen corto</label>
                <input value={courseForm.shortDesc} onChange={(e) => setCourseForm((f) => ({ ...f, shortDesc: e.target.value }))} placeholder="Una línea para tarjetas de programa" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Descripción completa</label>
                <textarea value={courseForm.description} onChange={(e) => setCourseForm((f) => ({ ...f, description: e.target.value }))} rows={4} placeholder="Descripción para la página del programa" style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Precio (USD)</label>
                  <input type="number" min={0} disabled={courseForm.isFree} value={courseForm.price} onChange={(e) => setCourseForm((f) => ({ ...f, price: e.target.value }))} style={{ ...inputStyle, opacity: courseForm.isFree ? 0.5 : 1 }} />
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 10 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)", cursor: "pointer" }}>
                    <input type="checkbox" checked={courseForm.isFree} onChange={(e) => setCourseForm((f) => ({ ...f, isFree: e.target.checked }))} />
                    Programa gratuito
                  </label>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Horas totales</label>
                  <input type="number" min={0} value={courseForm.totalHours} onChange={(e) => setCourseForm((f) => ({ ...f, totalHours: e.target.value }))} placeholder="Ej: 40" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Duración (semanas)</label>
                  <input type="number" min={0} value={courseForm.durationWeeks} onChange={(e) => setCourseForm((f) => ({ ...f, durationWeeks: e.target.value }))} placeholder="Ej: 12" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>URL de imagen (thumbnail)</label>
                <input value={courseForm.thumbnail} onChange={(e) => setCourseForm((f) => ({ ...f, thumbnail: e.target.value }))} placeholder="https://…" style={inputStyle} />
                <p style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: 6 }}>Subí la imagen a <code>public/brand/programs/</code> y pegá la ruta acá (no hay carga de archivos todavía).</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowCourseForm(false)} style={{ ...btnGhost, flex: 1 }}>Cancelar</button>
              <button onClick={saveCourse} disabled={savingCourse} style={{ ...btnPrimary("var(--gold)"), flex: 2, justifyContent: "center", opacity: savingCourse ? 0.6 : 1 }}>
                {savingCourse ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : null}
                {editingCourseId ? "Guardar cambios" : "Crear programa"}
              </button>
            </div>
          </div>
        )}

        {/* Panel de gestión del programa seleccionado */}
        {selected && !showCourseForm && (
          <div style={{ ...card, padding: "28px 26px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22, paddingBottom: 20, borderBottom: "1px solid var(--surface-2)" }}>
              <div>
                <span style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: 4 }}>Gestión de programa</span>
                <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 22, color: "var(--text)" }}>{selected.title}</h2>
              </div>
              <button onClick={() => setSelectedId(null)} style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "var(--surface)", borderRadius: 10, padding: 4 }}>
              {([
                { key: "contenido", icon: ListChecks, label: "Contenido" },
                { key: "materiales", icon: FileText, label: "Materiales" },
                { key: "sesiones", icon: Video, label: "Clases en vivo" },
                { key: "alumnos", icon: Users, label: "Alumnos" },
              ] as { key: Tab; icon: typeof FileText; label: string }[]).map(({ key, icon: Icon, label }) => (
                <button key={key} onClick={() => setTab(key)} style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  padding: "9px 10px", borderRadius: 8, border: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: tab === key ? 600 : 400,
                  background: tab === key ? "rgba(165,141,102,.15)" : "transparent",
                  color: tab === key ? "var(--gold)" : "var(--text-faint)",
                  transition: "all .18s",
                }}>
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            {/* CONTENIDO */}
            {tab === "contenido" && (
              <div>
                {contentError && (
                  <div style={{ background: "rgba(220,38,38,.1)", border: "1px solid rgba(220,38,38,.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#f87171", fontSize: 13 }}>
                    {contentError}
                  </div>
                )}

                {/* Video de YouTube */}
                <div style={{ marginBottom: 28 }}>
                  <label style={labelStyle}><Video size={12} style={{ display: "inline", marginRight: 5, verticalAlign: -2 }} />Video del programa (link de YouTube)</label>
                  <input
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=…"
                    style={inputStyle}
                  />
                  {videoUrlInput.trim() && (
                    getYouTubeEmbedUrl(videoUrlInput) ? (
                      <div style={{ marginTop: 12, borderRadius: 10, overflow: "hidden", border: "1px solid rgba(165,141,102,.18)", maxWidth: 420, aspectRatio: "16 / 9", position: "relative" }}>
                        <iframe
                          src={getYouTubeEmbedUrl(videoUrlInput)!}
                          title="Vista previa"
                          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--warning)", marginTop: 8 }}>
                        <AlertCircle size={13} /> No parece un link válido de YouTube. Se guardará igual, pero el video no se mostrará en el sitio.
                      </p>
                    )
                  )}
                  <p style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: 8 }}>Se muestra debajo de "Sobre el programa" en la página pública. Dejá el campo vacío para no mostrar ningún video.</p>
                </div>

                {/* Chips: eyebrow / duración / modalidad / nivel */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
                  <div>
                    <label style={labelStyle}>Etiqueta (eyebrow)</label>
                    <input value={progContent.eyebrow} onChange={(e) => setProgContent((c) => ({ ...c, eyebrow: e.target.value }))} placeholder="Ej: Certificación Infantil" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Duración</label>
                    <input value={progContent.duration} onChange={(e) => setProgContent((c) => ({ ...c, duration: e.target.value }))} placeholder="Ej: 3 meses" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Modalidad</label>
                    <input value={progContent.modality} onChange={(e) => setProgContent((c) => ({ ...c, modality: e.target.value }))} placeholder="Ej: Online · Clases en vivo" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Nivel</label>
                    <input value={progContent.level} onChange={(e) => setProgContent((c) => ({ ...c, level: e.target.value }))} placeholder="Ej: Sin requisitos previos" style={inputStyle} />
                  </div>
                </div>

                {/* Qué incluye */}
                <div style={{ marginBottom: 28 }}>
                  <label style={labelStyle}>Qué incluye</label>
                  <StringListEditor items={progContent.includes} onChange={(items) => setProgContent((c) => ({ ...c, includes: items }))} placeholder="Ej: Certificado al completar" />
                </div>

                {/* Contenido del programa (módulos) */}
                <div style={{ marginBottom: 28 }}>
                  <label style={labelStyle}>Contenido del programa (módulos)</label>
                  <ModulesEditor modules={progContent.modules} onChange={(modules) => setProgContent((c) => ({ ...c, modules }))} />
                </div>

                {/* Para quién */}
                <div style={{ marginBottom: 28 }}>
                  <label style={labelStyle}>¿Para quién es este programa?</label>
                  <StringListEditor items={progContent.forWhom} onChange={(items) => setProgContent((c) => ({ ...c, forWhom: items }))} placeholder="Ej: Docentes de nivel inicial" />
                </div>

                {/* Al finalizar */}
                <div style={{ marginBottom: 28 }}>
                  <label style={labelStyle}>Al finalizar (resultado)</label>
                  <textarea
                    value={progContent.outcome}
                    onChange={(e) => setProgContent((c) => ({ ...c, outcome: e.target.value }))}
                    rows={3}
                    placeholder="Qué logrará el alumno al completar el programa…"
                    style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                  />
                </div>

                <button onClick={saveProgramContent} disabled={savingContent} style={{ ...btnPrimary(contentSaved ? "var(--success)" : "var(--gold)"), justifyContent: "center", opacity: savingContent ? 0.6 : 1 }}>
                  {savingContent ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={14} />}
                  {savingContent ? "Guardando…" : contentSaved ? "¡Guardado!" : "Guardar contenido"}
                </button>
              </div>
            )}

            {/* MATERIALES */}
            {tab === "materiales" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: "var(--text-faint)" }}>{materials.length} material{materials.length === 1 ? "" : "es"} subido{materials.length === 1 ? "" : "s"}</p>
                  <button onClick={() => setShowAddMat(!showAddMat)} style={btnPrimary("var(--gold)")}>
                    <Plus size={14} /> Agregar material
                  </button>
                </div>
                {showAddMat && (
                  <div style={{ background: "var(--surface)", border: "1px solid rgba(165,141,102,.18)", borderRadius: 12, padding: "20px 18px", marginBottom: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div><label style={labelStyle}>Título</label><input value={matForm.title} onChange={(e) => setMatForm((f) => ({ ...f, title: e.target.value }))} placeholder="Guía módulo 1" style={inputStyle} /></div>
                      <div>
                        <label style={labelStyle}>Módulo</label>
                        <select value={matForm.moduleNumber} onChange={(e) => setMatForm((f) => ({ ...f, moduleNumber: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
                          {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>Módulo {n}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={labelStyle}>Descripción (opcional)</label>
                      <input value={matForm.description} onChange={(e) => setMatForm((f) => ({ ...f, description: e.target.value }))} placeholder="Breve descripción" style={inputStyle} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={labelStyle}>Tipo</label>
                        <select value={matForm.type} onChange={(e) => setMatForm((f) => ({ ...f, type: e.target.value as typeof f.type }))} style={{ ...inputStyle, cursor: "pointer" }}>
                          <option value="document">PDF / Documento</option>
                          <option value="link">Enlace externo</option>
                          <option value="video">Video</option>
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>URL {matForm.type === "document" ? "del archivo" : matForm.type === "video" ? "del video" : "del enlace"}</label>
                        <input value={matForm.url} onChange={(e) => setMatForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://…" style={inputStyle} />
                      </div>
                    </div>
                    <p style={{ fontSize: 11.5, color: "var(--text-dim)", marginBottom: 12 }}>Sin carga de archivos aún — pegá un link (Drive, YouTube, Vimeo, etc.).</p>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => setShowAddMat(false)} style={{ ...btnGhost, flex: 1 }}>Cancelar</button>
                      <button onClick={saveMaterial} disabled={savingMat} style={{ ...btnPrimary("var(--gold)"), flex: 2, justifyContent: "center", opacity: savingMat ? 0.6 : 1 }}>
                        {savingMat ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : null} Guardar
                      </button>
                    </div>
                  </div>
                )}
                {loadingMat ? (
                  <p style={{ color: "var(--text-faint)", fontSize: 13, padding: "20px 0" }}>Cargando…</p>
                ) : materials.length === 0 ? (
                  <div style={{ padding: "40px 0", textAlign: "center" }}>
                    <FileText size={26} style={{ color: "rgba(165,141,102,.2)", margin: "0 auto 12px", display: "block" }} />
                    <p style={{ color: "var(--text-dim)", fontSize: 14 }}>No hay materiales aún</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {materials.map((m) => (
                      <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--surface-2)", borderRadius: 9, opacity: m.isVisible ? 1 : 0.5 }}>
                        {m.type === "document" ? <Download size={16} style={{ color: "var(--gold)", flexShrink: 0 }} /> : <ExternalLink size={16} style={{ color: "var(--teal)", flexShrink: 0 }} />}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{m.title}</p>
                          <p style={{ fontSize: 11.5, color: "var(--text-dim)" }}>Módulo {m.moduleNumber} · {m.type}</p>
                        </div>
                        <button onClick={() => toggleMatVisible(m)} title={m.isVisible ? "Ocultar" : "Mostrar"} style={{ background: "none", border: "none", cursor: "pointer", color: m.isVisible ? "var(--success)" : "var(--text-dim)" }}>
                          {m.isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
                        </button>
                        <button onClick={() => deleteMaterial(m)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(239,68,68,.5)" }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SESIONES */}
            {tab === "sesiones" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: "var(--text-faint)" }}>{sessions.length} sesión{sessions.length === 1 ? "" : "es"} programada{sessions.length === 1 ? "" : "s"}</p>
                  <button onClick={() => setShowAddSes(!showAddSes)} style={btnPrimary("var(--gold)")}>
                    <Plus size={14} /> Agendar sesión
                  </button>
                </div>
                {showAddSes && (
                  <div style={{ background: "var(--surface)", border: "1px solid rgba(165,141,102,.18)", borderRadius: 12, padding: "20px 18px", marginBottom: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div><label style={labelStyle}>Título</label><input value={sesForm.title} onChange={(e) => setSesForm((f) => ({ ...f, title: e.target.value }))} placeholder="Módulo 1 – Intro" style={inputStyle} /></div>
                      <div><label style={labelStyle}>Link Zoom</label><input value={sesForm.joinUrl} onChange={(e) => setSesForm((f) => ({ ...f, joinUrl: e.target.value }))} placeholder="https://zoom.us/j/..." style={inputStyle} /></div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div><label style={labelStyle}>Fecha</label><input type="date" value={sesForm.date} onChange={(e) => setSesForm((f) => ({ ...f, date: e.target.value }))} style={inputStyle} /></div>
                      <div><label style={labelStyle}>Hora</label><input type="time" value={sesForm.time} onChange={(e) => setSesForm((f) => ({ ...f, time: e.target.value }))} style={inputStyle} /></div>
                      <div><label style={labelStyle}>Duración (min)</label><input type="number" min={15} value={sesForm.durationMin} onChange={(e) => setSesForm((f) => ({ ...f, durationMin: e.target.value }))} style={inputStyle} /></div>
                    </div>
                    <p style={{ fontSize: 11.5, color: "var(--text-dim)", marginBottom: 12 }}>La fecha/hora se guarda según tu zona horaria local del navegador.</p>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => setShowAddSes(false)} style={{ ...btnGhost, flex: 1 }}>Cancelar</button>
                      <button onClick={saveSession} disabled={savingSes} style={{ ...btnPrimary("var(--gold)"), flex: 2, justifyContent: "center", opacity: savingSes ? 0.6 : 1 }}>
                        {savingSes ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : null} Guardar
                      </button>
                    </div>
                  </div>
                )}
                {loadingSes ? (
                  <p style={{ color: "var(--text-faint)", fontSize: 13, padding: "20px 0" }}>Cargando…</p>
                ) : sessions.length === 0 ? (
                  <div style={{ padding: "40px 0", textAlign: "center" }}>
                    <PlayCircle size={26} style={{ color: "rgba(165,141,102,.2)", margin: "0 auto 12px", display: "block" }} />
                    <p style={{ color: "var(--text-dim)", fontSize: 14 }}>No hay sesiones programadas</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {sessions.map((s) => (
                      <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--surface-2)", borderRadius: 9 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{s.title}</p>
                          <p style={{ fontSize: 11.5, color: "var(--text-dim)" }}>
                            {new Date(s.scheduledAt).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} · {s.durationMin} min · {s._count.attendances} asistencias
                          </p>
                        </div>
                        <span style={{ fontSize: 11, color: s.isCompleted ? "var(--success)" : "var(--text-dim)" }}>
                          {s.isCompleted ? "● Dictada" : "○ Pendiente"}
                        </span>
                        <button onClick={() => deleteSession(s)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(239,68,68,.5)" }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ALUMNOS */}
            {tab === "alumnos" && (
              loadingStudents ? (
                <p style={{ color: "var(--text-faint)", fontSize: 13, padding: "20px 0" }}>Cargando…</p>
              ) : courseStudents.length === 0 ? (
                <div style={{ padding: "40px 0", textAlign: "center" }}>
                  <Users size={26} style={{ color: "rgba(165,141,102,.2)", margin: "0 auto 12px", display: "block" }} />
                  <p style={{ color: "var(--text-dim)", fontSize: 14 }}>No hay alumnos en este programa</p>
                  <p style={{ color: "var(--text-dim)", fontSize: 13, marginTop: 4 }}>Se inscribirán desde la página pública o desde Alumnos.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {courseStudents.map((s) => (
                    <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--surface-2)", borderRadius: 9 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{s.name}</p>
                        <p style={{ fontSize: 11.5, color: "var(--text-dim)" }}>{s.email}</p>
                      </div>
                      <span style={{ fontSize: 12, color: "var(--text-faint)" }}>{s.enrollment.progress}% avance</span>
                      {s.enrollment.certificateNumber && <span style={{ fontSize: 11, color: "var(--success)" }}>● Certificado</span>}
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Editor de lista de textos (Qué incluye / Para quién) ── */
function StringListEditor({ items, onChange, placeholder }: { items: string[]; onChange: (items: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState("")

  function update(i: number, value: string) {
    onChange(items.map((it, idx) => (idx === i ? value : it)))
  }
  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i))
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  function add() {
    const v = draft.trim()
    if (!v) return
    onChange([...items, v])
    setDraft("")
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <GripVertical size={13} style={{ color: "var(--text-faint)", flexShrink: 0 }} />
          <input value={item} onChange={(e) => update(i, e.target.value)} style={{ ...inputStyle, flex: 1 }} />
          <button onClick={() => move(i, -1)} disabled={i === 0} title="Subir" style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface-2)", cursor: i === 0 ? "default" : "pointer", color: "var(--text-muted)", opacity: i === 0 ? 0.3 : 1, flexShrink: 0 }}><ChevronUp size={13} /></button>
          <button onClick={() => move(i, 1)} disabled={i === items.length - 1} title="Bajar" style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface-2)", cursor: i === items.length - 1 ? "default" : "pointer", color: "var(--text-muted)", opacity: i === items.length - 1 ? 0.3 : 1, flexShrink: 0 }}><ChevronDown size={13} /></button>
          <button onClick={() => remove(i)} title="Eliminar" style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid rgba(239,68,68,.25)", background: "rgba(239,68,68,.06)", cursor: "pointer", color: "var(--danger)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={12} /></button>
        </div>
      ))}
      <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add() } }}
          placeholder={placeholder || "Agregar…"}
          style={{ ...inputStyle, flex: 1 }}
        />
        <button onClick={add} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface-2)", border: "1px dashed rgba(165,141,102,.4)", color: "var(--gold)", borderRadius: 8, padding: "0 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
          <Plus size={13} /> Agregar
        </button>
      </div>
    </div>
  )
}

/* ── Editor de módulos (Contenido del programa) ── */
function ModulesEditor({ modules, onChange }: { modules: { title: string; items: string[] }[]; onChange: (modules: { title: string; items: string[] }[]) => void }) {
  function updateTitle(i: number, title: string) {
    onChange(modules.map((m, idx) => (idx === i ? { ...m, title } : m)))
  }
  function updateItems(i: number, items: string[]) {
    onChange(modules.map((m, idx) => (idx === i ? { ...m, items } : m)))
  }
  function remove(i: number) {
    onChange(modules.filter((_, idx) => idx !== i))
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= modules.length) return
    const next = [...modules]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  function addModule() {
    onChange([...modules, { title: "", items: [] }])
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 4 }}>
      {modules.map((mod, i) => (
        <div key={i} style={{ background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.15)", borderRadius: 10, padding: "14px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <span style={{ fontFamily: "var(--serif)", fontSize: 12, fontStyle: "italic", color: "var(--gold)", flexShrink: 0, width: 20 }}>{String(i + 1).padStart(2, "0")}</span>
            <input value={mod.title} onChange={(e) => updateTitle(i, e.target.value)} placeholder="Título del módulo" style={{ ...inputStyle, flex: 1, background: "var(--surface)" }} />
            <button onClick={() => move(i, -1)} disabled={i === 0} title="Subir" style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface)", cursor: i === 0 ? "default" : "pointer", color: "var(--text-muted)", opacity: i === 0 ? 0.3 : 1, flexShrink: 0 }}><ChevronUp size={13} /></button>
            <button onClick={() => move(i, 1)} disabled={i === modules.length - 1} title="Bajar" style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface)", cursor: i === modules.length - 1 ? "default" : "pointer", color: "var(--text-muted)", opacity: i === modules.length - 1 ? 0.3 : 1, flexShrink: 0 }}><ChevronDown size={13} /></button>
            <button onClick={() => remove(i)} title="Eliminar módulo" style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid rgba(239,68,68,.25)", background: "rgba(239,68,68,.06)", cursor: "pointer", color: "var(--danger)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={12} /></button>
          </div>
          <div style={{ paddingLeft: 26 }}>
            <StringListEditor items={mod.items} onChange={(items) => updateItems(i, items)} placeholder="Agregar tema del módulo…" />
          </div>
        </div>
      ))}
      <button onClick={addModule} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface-2)", border: "1px dashed rgba(165,141,102,.4)", color: "var(--gold)", borderRadius: 9, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", alignSelf: "flex-start" }}>
        <Plus size={14} /> Agregar módulo
      </button>
    </div>
  )
}
