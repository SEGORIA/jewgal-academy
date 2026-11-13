"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Users, FileText, Eye, EyeOff, Plus, X, Video, Trash2, Pencil, Loader2, ExternalLink, Download, PlayCircle, ListChecks, ChevronUp, ChevronDown, Save, AlertCircle, GripVertical, Languages, BookOpen, Layers, Upload } from "lucide-react"
import { getProgramContent, getYouTubeEmbedUrl, EMPTY_PROGRAM_CONTENT, type ProgramContent } from "@/lib/program-content"
import StringListEditor from "@/components/admin/StringListEditor"
import ContentBlockEditor from "@/components/admin/materials/ContentBlockEditor"
import QuizEditor from "@/components/admin/materials/QuizEditor"
import { parseContent, parseQuizData, type ContentBlock, type QuizQuestion } from "@/lib/materials-content"
import MaterialsManager from "@/components/admin/materials/MaterialsManager"
import { TEMPLATES, TEMPLATE_ICONS, templateDefaults, templateOf, type TemplateId } from "@/components/admin/materials/templates"
import type { AdminMaterial, AdminCourseModule } from "@/components/admin/materials/types"
import { uploadToCloudinary } from "@/lib/cloudinary-upload"

const TOOL_HREF_OPTIONS = [
  { value: "", label: "Ninguna" },
  { value: "/aula/jewgalkids?tab=respiracion", label: "Joogalkids · Respiración" },
  { value: "/aula/jewgalkids?tab=posturas", label: "Joogalkids · Posturas" },
  { value: "/aula/jewgalkids?tab=valores", label: "Joogalkids · Valores" },
]

type Course = {
  id: string; title: string; titleEn: string | null; slug: string
  shortDesc: string; shortDescEn: string | null
  description: string; descriptionEn: string | null
  price: number; currency: string; isFree: boolean; isPublished: boolean; sequentialUnlock?: boolean
  totalHours: number | null; durationWeeks: number | null; thumbnail: string | null
  videoUrl: string | null; content: string | null; sortOrder?: number
  _count: { enrollments: number; materials: number; liveSessions: number }
}
type Material = AdminMaterial
type CourseModule = AdminCourseModule
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

const emptyCourseForm = { title: "", titleEn: "", shortDesc: "", shortDescEn: "", description: "", descriptionEn: "", price: "0", isFree: false, totalHours: "", durationWeeks: "", thumbnail: "" }
const emptyMatForm = {
  title: "", description: "", type: "document" as "document" | "video" | "link" | "lesson", url: "", moduleNumber: "1",
  interactionKind: "" as "" | "reflection" | "quiz",
  toolHref: "",
  estimatedMinutes: "",
  coverImageUrl: "",
  groupLabel: "",
  content: [] as ContentBlock[],
  quizData: [] as QuizQuestion[],
}
const emptySesForm = { title: "", joinUrl: "", date: "", time: "", durationMin: "90" }

export default function CursosAdminPage() {
  const searchParams = useSearchParams()
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
  const [editingMatId, setEditingMatId] = useState<string | null>(null)
  const [matForm, setMatForm] = useState(emptyMatForm)
  const [savingMat, setSavingMat] = useState(false)
  const [matError, setMatError] = useState("")
  const [matTemplate, setMatTemplate] = useState<TemplateId>("unit")
  const [matVisible, setMatVisible] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const autoTitleRef = useRef("")
  const [courseModules, setCourseModules] = useState<CourseModule[]>([])
  const matFormRef = useRef<HTMLDivElement>(null)

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

  // Opciones del selector de módulo: los que ya existen (con nombre o con
  // materiales) + uno nuevo al final — ya no hay un tope fijo de módulos.
  const moduleOptions = (() => {
    const nums = new Set<number>([1, ...courseModules.map((m) => m.number), ...materials.map((m) => m.moduleNumber)])
    const current = Number(matForm.moduleNumber)
    if (current) nums.add(current)
    const list = [...nums].sort((a, b) => a - b).map((n) => ({ number: n, title: courseModules.find((m) => m.number === n)?.title ?? null, isNew: false }))
    list.push({ number: Math.max(...nums) + 1, title: null, isNew: true })
    return list
  })()

  // El formulario es un panel lateral: mientras está abierto no se desplaza la página de atrás.
  useEffect(() => {
    if (!showAddMat) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    matFormRef.current?.scrollTo({ top: 0 })
    return () => { document.body.style.overflow = prev }
  }, [showAddMat, editingMatId])

  const loadCourses = useCallback(() => {
    setLoading(true)
    fetch("/api/admin/courses").then((r) => r.json()).then((d) => setCourses(d.courses || [])).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadCourses()
    setLoadingStudents(true)
    fetch("/api/admin/students").then((r) => r.json()).then((d) => setStudents(d.students || [])).finally(() => setLoadingStudents(false))
  }, [loadCourses])

  // Deep-link desde la vista previa del alumno: ?course=<id> selecciona el
  // curso y abre la pestaña de materiales; ?editMaterial=<id> además abre
  // el panel de edición de ese material apenas se cargan sus materiales.
  const courseParam = searchParams.get("course")
  const editMaterialParam = searchParams.get("editMaterial")
  useEffect(() => {
    if (!courseParam || courses.length === 0) return
    if (courses.some((c) => c.id === courseParam)) {
      setSelectedId(courseParam)
      setTab("materiales")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseParam, courses])

  useEffect(() => {
    if (!editMaterialParam || materials.length === 0) return
    const target = materials.find((m) => m.id === editMaterialParam)
    if (target) openEditMaterial(target)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMaterialParam, materials])

  const loadMaterials = useCallback((courseId: string) => {
    setLoadingMat(true)
    Promise.all([
      fetch(`/api/admin/materials?courseId=${courseId}`).then((r) => r.json()),
      fetch(`/api/admin/course-modules?courseId=${courseId}`).then((r) => r.json()),
    ])
      .then(([m, c]) => { setMaterials(m.materials || []); setCourseModules(c.courseModules || []) })
      .finally(() => setLoadingMat(false))
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
      title: c.title, titleEn: c.titleEn || "",
      shortDesc: c.shortDesc, shortDescEn: c.shortDescEn || "",
      description: c.description, descriptionEn: c.descriptionEn || "",
      price: String(c.price), isFree: c.isFree,
      totalHours: c.totalHours != null ? String(c.totalHours) : "",
      durationWeeks: c.durationWeeks != null ? String(c.durationWeeks) : "",
      thumbnail: c.thumbnail || "",
    })
    setEditingCourseId(c.id)
    setCourseError("")
    setShowCourseForm(true)
  }

  const [translatingCourse, setTranslatingCourse] = useState(false)

  async function translateCourseToEnglish() {
    if (!courseForm.title.trim() && !courseForm.shortDesc.trim() && !courseForm.description.trim()) return
    setTranslatingCourse(true)
    setCourseError("")
    try {
      const res = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: [courseForm.title, courseForm.shortDesc, courseForm.description], target: "EN" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "No se pudo traducir")
      const [titleEn, shortDescEn, descriptionEn] = data.translations as string[]
      setCourseForm((f) => ({ ...f, titleEn, shortDescEn, descriptionEn }))
    } catch (e) {
      setCourseError(e instanceof Error ? e.message : "Error al traducir")
    } finally {
      setTranslatingCourse(false)
    }
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
      titleEn: courseForm.titleEn.trim() || null,
      shortDesc: courseForm.shortDesc.trim(),
      shortDescEn: courseForm.shortDescEn.trim() || null,
      description: courseForm.description.trim(),
      descriptionEn: courseForm.descriptionEn.trim() || null,
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

  // Cambia el orden de aparición de los programas en el sitio (renumera toda la lista de 10 en 10).
  async function moveCourse(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= courses.length) return
    const next = [...courses]
    ;[next[i], next[j]] = [next[j], next[i]]
    await Promise.all(next.map((c, idx) => (c.sortOrder === (idx + 1) * 10 ? null : fetch(`/api/admin/courses/${c.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sortOrder: (idx + 1) * 10 }),
    }))))
    loadCourses()
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

  // "Agregar" desde un módulo: ya llega con el módulo y el tipo elegidos, y el
  // formulario arranca con los valores que corresponden a ese tipo.
  function openNewMaterial(moduleNumber?: number, template: TemplateId = "unit") {
    const mod = moduleNumber ?? materials[materials.length - 1]?.moduleNumber ?? 1
    const d = templateDefaults(template, mod, unitCountIn(mod))
    autoTitleRef.current = d.title
    setMatForm({ ...emptyMatForm, ...d, moduleNumber: String(mod) })
    setMatTemplate(template)
    setMatVisible(true)
    setShowAdvanced(false)
    setEditingMatId(null)
    setMatError("")
    setShowAddMat(true)
  }

  function unitCountIn(mod: number) {
    return materials.filter((m) => m.moduleNumber === mod && /^Unidad\s+\d+/i.test(m.title)).length
  }

  // Cambiar el tipo mientras se crea: aplica los valores del tipo y conserva lo que ya se escribió.
  function applyTemplate(id: TemplateId) {
    const mod = Number(matForm.moduleNumber) || 1
    const d = templateDefaults(id, mod, unitCountIn(mod))
    const keepTitle = matForm.title.trim() && matForm.title !== autoTitleRef.current
    autoTitleRef.current = d.title
    setMatForm((f) => ({ ...f, ...d, title: keepTitle ? f.title : d.title, moduleNumber: f.moduleNumber, description: f.description, url: f.url }))
    setMatTemplate(id)
    setMatError("")
  }

  function closeMatForm() {
    setShowAddMat(false)
    setEditingMatId(null)
    setMatError("")
  }

  function openEditMaterial(m: Material) {
    const url = m.type === "document" ? m.fileUrl : m.type === "video" ? m.videoUrl : m.type === "link" ? m.linkUrl : ""
    setMatForm({
      title: m.title,
      description: m.description || "",
      type: m.type,
      url: url || "",
      moduleNumber: String(m.moduleNumber),
      interactionKind: (m.interactionKind as "" | "reflection" | "quiz") || "",
      toolHref: m.toolHref || "",
      estimatedMinutes: m.estimatedMinutes != null ? String(m.estimatedMinutes) : "",
      coverImageUrl: m.coverImageUrl || "",
      groupLabel: m.groupLabel || "",
      content: parseContent(m.content),
      quizData: parseQuizData(m.quizData),
    })
    setMatTemplate(templateOf({ type: m.type, interactionKind: m.interactionKind, content: parseContent(m.content) }))
    setMatVisible(m.isVisible)
    setShowAdvanced(false)
    setEditingMatId(m.id)
    setMatError("")
    setShowAddMat(true)
  }

  // Los materiales "lesson" viven en bloques de contenido, no en un
  // adjunto único — no exigimos URL para ese tipo (los demás sí, como
  // siempre).
  async function saveMaterial() {
    if (!selected || !matForm.title.trim()) return
    if (matForm.type !== "lesson" && !matForm.url.trim()) { setMatError("Falta el archivo: pegá un link o subí el archivo."); return }
    if (matForm.interactionKind === "quiz" && matForm.quizData.length === 0) { setMatError("Agregá al menos una pregunta al examen."); return }
    if (matForm.content.some((b) => b.type === "slides" && b.images.length === 0)) { setMatError("La presentación necesita al menos una imagen. Subí las diapositivas o quitá ese bloque."); return }
    setSavingMat(true)
    try {
      const payload: Record<string, unknown> = {
        title: matForm.title.trim(),
        description: matForm.description.trim() || null,
        type: matForm.type,
        moduleNumber: Number(matForm.moduleNumber) || 1,
        interactionKind: matForm.interactionKind || null,
        toolHref: matForm.toolHref || null,
        estimatedMinutes: matForm.estimatedMinutes.trim() ? Number(matForm.estimatedMinutes) : null,
        coverImageUrl: matForm.coverImageUrl.trim() || null,
        groupLabel: matForm.groupLabel.trim() || null,
        content: matForm.content.length ? matForm.content : null,
        quizData: matForm.quizData.length ? matForm.quizData : null,
        isVisible: matVisible,
      }
      if (matForm.type !== "lesson") {
        const urlField = matForm.type === "document" ? "fileUrl" : matForm.type === "video" ? "videoUrl" : "linkUrl"
        payload[urlField] = matForm.url.trim()
      }
      const res = await fetch(editingMatId ? `/api/admin/materials/${editingMatId}` : "/api/admin/materials", {
        method: editingMatId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingMatId ? payload : { ...payload, courseId: selected.id }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setMatError(d.error ? `${d.error}. Revisá los campos (los links deben empezar con https://).` : "No se pudo guardar. Probá de nuevo.")
        return
      }
      setMatError("")
      setShowAddMat(false)
      setEditingMatId(null)
      setMatForm(emptyMatForm)
      loadMaterials(selected.id)
      loadCourses()
    } finally {
      setSavingMat(false)
    }
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
          <span style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold-ink)", display: "block", marginBottom: 8 }}>Admin</span>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 36, color: "var(--text)", marginBottom: 6 }}>Programas</h1>
          <p style={{ color: "var(--text-faint)", fontSize: 14 }}>Gestioná contenido, sesiones y alumnos de cada programa.</p>
        </div>
        <button onClick={openNewCourse} style={btnPrimary("var(--gold)")}>
          <Plus size={16} /> Nuevo programa
        </button>
      </div>

      <div className="admin-split-grid" style={{ display: "grid", gridTemplateColumns: selected || showCourseForm ? "300px 1fr" : "1fr", gap: 20, alignItems: "start" }}>

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
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</span>
                  <button onClick={(e) => { e.stopPropagation(); moveCourse(i, -1) }} title="Subir (aparece antes en el sitio)" aria-label={`Subir ${p.title}`} disabled={i === 0}
                    style={{ background: "none", border: "none", cursor: i === 0 ? "default" : "pointer", color: "var(--text-faint)", padding: 2, opacity: i === 0 ? 0.3 : 1 }}>
                    <ChevronUp size={15} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); moveCourse(i, 1) }} title="Bajar (aparece después en el sitio)" aria-label={`Bajar ${p.title}`} disabled={i === courses.length - 1}
                    style={{ background: "none", border: "none", cursor: i === courses.length - 1 ? "default" : "pointer", color: "var(--text-faint)", padding: 2, opacity: i === courses.length - 1 ? 0.3 : 1 }}>
                    <ChevronDown size={15} />
                  </button>
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

              {/* Versión en inglés — opcional, cae al texto en español si queda vacía */}
              <div style={{ border: "1px solid rgba(165,141,102,.18)", borderRadius: 12, padding: 14, background: "var(--surface-2)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold-ink)", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                    <Languages size={13} /> Versión en inglés
                  </span>
                  <button
                    type="button"
                    onClick={translateCourseToEnglish}
                    disabled={translatingCourse}
                    style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid rgba(165,141,102,.35)", borderRadius: 7, padding: "6px 12px", fontSize: 11.5, color: "var(--gold-ink)", cursor: translatingCourse ? "default" : "pointer" }}
                  >
                    {translatingCourse ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Languages size={13} />}
                    {translatingCourse ? "Traduciendo…" : "Traducir con IA"}
                  </button>
                </div>
                <p style={{ fontSize: 11.5, color: "var(--text-dim)", marginBottom: 12, lineHeight: 1.5 }}>
                  Opcional — si dejás estos campos vacíos, el sitio en inglés muestra el texto en español. &quot;Traducir con IA&quot; genera un primer borrador que podés editar antes de guardar.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Title</label>
                    <input value={courseForm.titleEn} onChange={(e) => setCourseForm((f) => ({ ...f, titleEn: e.target.value }))} placeholder="English title" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Short summary</label>
                    <input value={courseForm.shortDescEn} onChange={(e) => setCourseForm((f) => ({ ...f, shortDescEn: e.target.value }))} placeholder="One line for program cards" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Full description</label>
                    <textarea value={courseForm.descriptionEn} onChange={(e) => setCourseForm((f) => ({ ...f, descriptionEn: e.target.value }))} rows={4} placeholder="Description for the program page" style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
                  </div>
                </div>
              </div>

              <div className="admin-form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
              <div className="admin-form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
                <span style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold-ink)", display: "block", marginBottom: 4 }}>Gestión de programa</span>
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
                  color: tab === key ? "var(--gold-ink)" : "var(--text-faint)",
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
                <div className="admin-form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
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
                {showAddMat && (
                  <>
                    <div onClick={closeMatForm} style={{ position: "fixed", inset: 0, background: "rgba(44,31,20,.45)", zIndex: 60 }} />
                    <aside
                      ref={matFormRef}
                      style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(800px, 100vw)", background: "var(--bg)", zIndex: 61, overflowY: "auto", boxShadow: "-18px 0 44px rgba(44,31,20,.28)", borderLeft: "1px solid rgba(165,141,102,.25)" }}
                    >
                      <div style={{ padding: "22px 26px 8px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                          <div>
                            <p style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold-ink)", marginBottom: 4 }}>
                              {editingMatId ? "Editar" : "Nuevo"} · Módulo {matForm.moduleNumber}
                            </p>
                            <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 24, color: "var(--text)" }}>
                              {editingMatId ? (matForm.title || "Material") : "¿Qué querés agregar?"}
                            </h2>
                          </div>
                          <button onClick={closeMatForm} title="Cerrar" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", padding: 4 }}><X size={20} /></button>
                        </div>

                        {/* 1 · Qué se agrega */}
                        {!editingMatId && (
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(168px, 1fr))", gap: 10, marginBottom: 22 }}>
                            {TEMPLATES.map((t) => {
                              const Icon = TEMPLATE_ICONS[t.id]
                              const on = matTemplate === t.id
                              return (
                                <button key={t.id} onClick={() => applyTemplate(t.id)}
                                  style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 6, padding: "12px 14px", borderRadius: 12, cursor: "pointer", background: on ? "rgba(165,141,102,.18)" : "var(--surface)", border: `1.5px solid ${on ? "var(--gold)" : "rgba(165,141,102,.2)"}`, transition: "all .15s" }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: on ? "var(--gold-ink)" : "var(--text)" }}><Icon size={16} /> {t.label}</span>
                                  <span style={{ fontSize: 11.5, color: "var(--text-dim)", lineHeight: 1.4 }}>{t.hint}</span>
                                </button>
                              )
                            })}
                          </div>
                        )}

                        {/* 2 · Datos básicos */}
                        <div className="admin-form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 12, marginBottom: 16 }}>
                          <div><label style={labelStyle}>Título</label><input autoFocus value={matForm.title} onChange={(e) => setMatForm((f) => ({ ...f, title: e.target.value }))} placeholder="Ej. Unidad 1: Historia del coaching" style={inputStyle} /></div>
                          <div>
                            <label style={labelStyle}>Módulo</label>
                            <select value={matForm.moduleNumber} onChange={(e) => setMatForm((f) => ({ ...f, moduleNumber: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
                              {moduleOptions.map((o) => <option key={o.number} value={o.number}>Módulo {o.number}{o.title ? ` — ${o.title}` : o.isNew ? " (nuevo)" : ""}</option>)}
                            </select>
                          </div>
                        </div>

                        {/* 3 · El contenido, según el tipo */}
                        {matForm.type === "document" && (
                          <div style={{ marginBottom: 16 }}>
                            <label style={labelStyle}>Archivo</label>
                            <input value={matForm.url} onChange={(e) => setMatForm((f) => ({ ...f, url: e.target.value }))} placeholder="Pegá un link https://… o subí el archivo →" style={inputStyle} />
                            <MaterialFileUpload accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,image/*" onDone={(url) => setMatForm((f) => ({ ...f, url }))} />
                            <p style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: 8 }}>Los PDF se leen dentro de la lección; el resto se descarga.</p>
                          </div>
                        )}
                        {matForm.type === "link" && (
                          <div style={{ marginBottom: 16 }}>
                            <label style={labelStyle}>Enlace</label>
                            <input value={matForm.url} onChange={(e) => setMatForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://…" style={inputStyle} />
                          </div>
                        )}
                        {matForm.type === "video" && (
                          <div style={{ marginBottom: 16 }}>
                            <label style={labelStyle}>Video</label>
                            <input value={matForm.url} onChange={(e) => setMatForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://… (link del video)" style={inputStyle} />
                            <MaterialFileUpload accept="video/*" onDone={(url) => setMatForm((f) => ({ ...f, url }))} />
                          </div>
                        )}

                        {matForm.type === "lesson" && matForm.interactionKind !== "quiz" && (
                          <div style={{ marginBottom: 16 }}>
                            <label style={labelStyle}>
                              {matTemplate === "presentation" ? "Diapositivas" : matTemplate === "reflection" ? "Consigna y preguntas que verá el alumno" : matTemplate === "video" ? "Video" : "Contenido de la lección"}
                            </label>
                            {matTemplate === "reflection" && (
                              <p style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 10 }}>Escribí la consigna o las preguntas. Debajo, el alumno tendrá una caja para responder y guardar su reflexión.</p>
                            )}
                            {matTemplate === "presentation" && (
                              <p style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 10 }}>Subí las diapositivas como imágenes (podés elegir varias a la vez; se ordenan por nombre).</p>
                            )}
                            <ContentBlockEditor blocks={matForm.content} onChange={(content) => setMatForm((f) => ({ ...f, content }))} />
                          </div>
                        )}

                        {matForm.interactionKind === "quiz" && (
                          <div style={{ marginBottom: 16 }}>
                            <label style={labelStyle}>Preguntas del examen</label>
                            <p style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 10 }}>Se corrige solo: el alumno ve su puntaje y puede reintentar.</p>
                            <QuizEditor questions={matForm.quizData} onChange={(quizData) => setMatForm((f) => ({ ...f, quizData }))} />
                          </div>
                        )}

                        {/* 4 · Visibilidad */}
                        <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, background: matVisible ? "rgba(74,157,111,.08)" : "rgba(192,86,79,.08)", border: `1px solid ${matVisible ? "rgba(74,157,111,.3)" : "rgba(192,86,79,.3)"}`, cursor: "pointer", marginBottom: 14 }}>
                          <input type="checkbox" checked={matVisible} onChange={(e) => setMatVisible(e.target.checked)} style={{ accentColor: "var(--gold)", width: 16, height: 16 }} />
                          <span style={{ fontSize: 13, color: "var(--text)" }}>
                            <strong>{matVisible ? "Visible para el alumno" : "Oculto (borrador)"}</strong>
                            <span style={{ color: "var(--text-dim)" }}> — {matVisible ? "los alumnos inscriptos lo ven apenas guardes" : "solo lo ves vos; lo mostrás cuando esté listo"}</span>
                          </span>
                        </label>

                        {/* 5 · Opciones avanzadas */}
                        <button onClick={() => setShowAdvanced((v) => !v)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 12.5, fontWeight: 600, padding: "4px 0", marginBottom: showAdvanced ? 12 : 0 }}>
                          {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Opciones avanzadas
                          <span style={{ fontWeight: 400, color: "var(--text-faint)" }}>(descripción, minutos, grupo, portada, tipo)</span>
                        </button>
                        {showAdvanced && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "14px 16px", border: "1px solid rgba(165,141,102,.16)", borderRadius: 12, marginBottom: 8 }}>
                            <div><label style={labelStyle}>Descripción (opcional)</label><input value={matForm.description} onChange={(e) => setMatForm((f) => ({ ...f, description: e.target.value }))} placeholder="Una línea que resume el contenido" style={inputStyle} /></div>
                            <div className="admin-form-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                              <div><label style={labelStyle}>Minutos estimados</label><input type="number" min={0} value={matForm.estimatedMinutes} onChange={(e) => setMatForm((f) => ({ ...f, estimatedMinutes: e.target.value }))} placeholder="Ej: 30" style={inputStyle} /></div>
                              <div><label style={labelStyle}>Grupo en el menú</label><input value={matForm.groupLabel} onChange={(e) => setMatForm((f) => ({ ...f, groupLabel: e.target.value }))} placeholder='Ej. "Unidades"' style={inputStyle} /></div>
                              <div>
                                <label style={labelStyle}>Herramienta interactiva</label>
                                <select value={matForm.toolHref} onChange={(e) => setMatForm((f) => ({ ...f, toolHref: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
                                  {TOOL_HREF_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                              </div>
                            </div>
                            <div className="admin-form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                              <div>
                                <label style={labelStyle}>Tipo técnico</label>
                                <select value={matForm.type} onChange={(e) => setMatForm((f) => ({ ...f, type: e.target.value as typeof f.type }))} style={{ ...inputStyle, cursor: "pointer" }}>
                                  <option value="lesson">Lección (bloques de contenido)</option>
                                  <option value="document">PDF / Documento</option>
                                  <option value="link">Enlace externo</option>
                                  <option value="video">Video</option>
                                </select>
                              </div>
                              <div>
                                <label style={labelStyle}>Interacción</label>
                                <select value={matForm.interactionKind} onChange={(e) => setMatForm((f) => ({ ...f, interactionKind: e.target.value as typeof f.interactionKind }))} style={{ ...inputStyle, cursor: "pointer" }}>
                                  <option value="">Ninguna</option>
                                  <option value="reflection">Reflexión (caja para responder)</option>
                                  <option value="quiz">Examen (preguntas)</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label style={labelStyle}>Portada (opcional — ej. tapa de un workbook)</label>
                              <MaterialCoverUpload value={matForm.coverImageUrl} onChange={(url) => setMatForm((f) => ({ ...f, coverImageUrl: url }))} />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Barra de guardado siempre a la vista */}
                      <div style={{ position: "sticky", bottom: 0, padding: "14px 26px 18px", background: "var(--bg)", borderTop: "1px solid rgba(165,141,102,.2)", marginTop: 14 }}>
                        {matError && (
                          <div style={{ background: "rgba(220,38,38,.1)", border: "1px solid rgba(220,38,38,.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 10, color: "#f87171", fontSize: 13 }}>{matError}</div>
                        )}
                        <div style={{ display: "flex", gap: 10 }}>
                          <button onClick={closeMatForm} style={{ ...btnGhost, flex: 1 }}>Cancelar</button>
                          <button onClick={saveMaterial} disabled={savingMat || !matForm.title.trim()} style={{ ...btnPrimary("var(--gold)"), flex: 2, justifyContent: "center", opacity: savingMat || !matForm.title.trim() ? 0.55 : 1 }}>
                            {savingMat ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : null} {editingMatId ? "Guardar cambios" : matVisible ? "Guardar y publicar" : "Guardar borrador"}
                          </button>
                        </div>
                      </div>
                    </aside>
                  </>
                )}
                <label style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", marginBottom: 16, borderRadius: 12, cursor: "pointer", background: selected.sequentialUnlock ? "rgba(165,141,102,.12)" : "var(--surface)", border: `1px solid ${selected.sequentialUnlock ? "rgba(165,141,102,.4)" : "rgba(165,141,102,.16)"}` }}>
                  <input
                    type="checkbox"
                    checked={!!selected.sequentialUnlock}
                    onChange={async (e) => {
                      const res = await fetch(`/api/admin/courses/${selected.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sequentialUnlock: e.target.checked }) })
                      if (!res.ok) alert("No se pudo cambiar el desbloqueo progresivo")
                      loadCourses()
                    }}
                    style={{ accentColor: "var(--gold)", width: 17, height: 17, flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 13, color: "var(--text)" }}>
                    <strong>Desbloqueo progresivo</strong>
                    <span style={{ color: "var(--text-dim)" }}> — {selected.sequentialUnlock ? "el alumno accede a cada material al completar el anterior (los que siguen se ven con candado)" : "desactivado: el alumno puede abrir cualquier material en cualquier orden"}</span>
                  </span>
                </label>
                <MaterialsManager
                  courseId={selected.id}
                  courseTitle={selected.title}
                  materials={materials}
                  modules={courseModules}
                  loading={loadingMat}
                  setMaterials={setMaterials}
                  onReload={() => { loadMaterials(selected.id); loadCourses() }}
                  onEdit={openEditMaterial}
                  onAdd={openNewMaterial}
                />
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
                    <div className="admin-form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div><label style={labelStyle}>Título</label><input value={sesForm.title} onChange={(e) => setSesForm((f) => ({ ...f, title: e.target.value }))} placeholder="Módulo 1 – Intro" style={inputStyle} /></div>
                      <div><label style={labelStyle}>Link Zoom</label><input value={sesForm.joinUrl} onChange={(e) => setSesForm((f) => ({ ...f, joinUrl: e.target.value }))} placeholder="https://zoom.us/j/..." style={inputStyle} /></div>
                    </div>
                    <div className="admin-form-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
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


/* ── Subida del archivo principal de un material (PDF, documento, video):
   evita tener que subirlo a Drive/Cloudinary a mano y pegar el link. ── */
function MaterialFileUpload({ accept, onDone }: { accept: string; onDone: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")

  async function upload(file: File) {
    setUploading(true)
    setProgress(0)
    setError("")
    try {
      onDone(await uploadToCloudinary(file, "jewgal-materiales", setProgress))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir el archivo")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ marginTop: 8 }}>
      <label style={{
        display: "inline-flex", alignItems: "center", gap: 7, border: "1px dashed var(--border)", borderRadius: 8, padding: "8px 14px",
        fontSize: 12, color: "var(--text-muted)", cursor: uploading ? "wait" : "pointer",
      }}>
        {uploading ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Upload size={13} />}
        {uploading ? `Subiendo… ${progress}%` : "Subir archivo desde mi computadora"}
        <input type="file" accept={accept} disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = "" }} style={{ display: "none" }} />
      </label>
      {error && <p style={{ fontSize: 11, color: "var(--danger)", marginTop: 6 }}>{error}</p>}
    </div>
  )
}

/* ── Subida de portada de material (workbook, etc.) — mismo patrón firmado
   ya usado para diapositivas/logos, folder propio. ── */
function MaterialCoverUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  async function upload(file: File) {
    setUploading(true)
    setError("")
    try {
      const sigRes = await fetch("/api/admin/cloudinary-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "jewgal-materiales-portadas" }),
      })
      if (!sigRes.ok) {
        const d = await sigRes.json()
        setError(d.error ?? "Cloudinary no está configurado")
        return
      }
      const { timestamp, signature, apiKey, cloudName, folder } = await sigRes.json()
      const formData = new FormData()
      formData.append("file", file)
      formData.append("timestamp", String(timestamp))
      formData.append("signature", signature)
      formData.append("api_key", apiKey)
      formData.append("folder", folder)
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { method: "POST", body: formData })
      if (!res.ok) throw new Error("Error al subir")
      const data = await res.json()
      onChange(data.secure_url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir el archivo")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {value && <img src={value} alt="" style={{ width: 40, height: 52, objectFit: "cover", borderRadius: 5, border: "1px solid var(--border)" }} />}
        <label style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          border: "1px dashed var(--border)", borderRadius: 8, padding: "9px",
          fontSize: 12, color: "var(--text-muted)", cursor: uploading ? "wait" : "pointer",
        }}>
          {uploading ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Upload size={13} />}
          {uploading ? "Subiendo…" : value ? "Cambiar portada" : "Subir portada"}
          <input type="file" accept="image/*" disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = "" }} style={{ display: "none" }} />
        </label>
        {value && (
          <button onClick={() => onChange("")} title="Quitar" style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid rgba(239,68,68,.25)", background: "rgba(239,68,68,.06)", cursor: "pointer", color: "var(--danger)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={13} />
          </button>
        )}
      </div>
      {error && <p style={{ fontSize: 11, color: "var(--danger)", marginTop: 6 }}>{error}</p>}
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
            <span style={{ fontFamily: "var(--serif)", fontSize: 12, fontStyle: "italic", color: "var(--gold-ink)", flexShrink: 0, width: 20 }}>{String(i + 1).padStart(2, "0")}</span>
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
      <button onClick={addModule} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface-2)", border: "1px dashed rgba(165,141,102,.4)", color: "var(--gold-ink)", borderRadius: 9, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", alignSelf: "flex-start" }}>
        <Plus size={14} /> Agregar módulo
      </button>
    </div>
  )
}
