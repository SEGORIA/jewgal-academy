"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Pencil, Trash2, X, Loader2, Headphones, Upload, Eye, EyeOff } from "lucide-react"

type Resource = {
  id: string
  courseId: string | null
  title: string
  description: string | null
  type: "audio" | "video" | "document"
  fileUrl: string
  duration: number | null
  isVisible: boolean
  order: number
  createdAt: string
  course: { id: string; title: string } | null
}

type Course = { id: string; title: string }

const card: React.CSSProperties = { background: "var(--surface)", border: "1px solid rgba(165,141,102,.13)", borderRadius: 14 }
const inputStyle: React.CSSProperties = { background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.2)", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: "var(--text)", outline: "none", fontFamily: "inherit", width: "100%" }
const labelStyle: React.CSSProperties = { fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--text-faint)", display: "block", marginBottom: 7 }

const emptyForm = {
  title: "",
  description: "",
  type: "audio" as "audio" | "video" | "document",
  fileUrl: "",
  duration: "",
  courseId: "",
  order: "0",
  isVisible: true,
}

function formatDuration(s: number) {
  const m = Math.floor(s / 60); const sec = s % 60
  return `${m}:${String(sec).padStart(2, "0")}`
}

export default function RecursosAdminPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Resource | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      fetch("/api/admin/exclusive-resources").then((r) => r.json()),
      fetch("/api/admin/courses").then((r) => r.json()),
    ])
      .then(([rData, cData]) => {
        setResources(rData.resources ?? [])
        setCourses(cData.courses ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  function openNew() {
    setForm(emptyForm)
    setIsNew(true)
    setEditing(null)
    setError("")
  }

  function openEdit(r: Resource) {
    setForm({
      title: r.title,
      description: r.description ?? "",
      type: r.type,
      fileUrl: r.fileUrl,
      duration: r.duration ? String(r.duration) : "",
      courseId: r.courseId ?? "",
      order: String(r.order),
      isVisible: r.isVisible,
    })
    setEditing(r)
    setIsNew(false)
    setError("")
  }

  function closePanel() {
    setEditing(null)
    setIsNew(false)
    setError("")
  }

  // Subida firmada directa a Cloudinary
  async function handleFileUpload(file: File) {
    setUploading(true)
    setUploadProgress(0)
    setError("")
    try {
      // 1. Obtener firma del servidor
      const sigRes = await fetch("/api/admin/cloudinary-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "jewgal-recursos" }),
      })
      if (!sigRes.ok) {
        const d = await sigRes.json()
        setError(d.error ?? "Cloudinary no está configurado")
        return
      }
      const { timestamp, signature, apiKey, cloudName, folder } = await sigRes.json()

      // 2. Subir directo a Cloudinary
      const formData = new FormData()
      formData.append("file", file)
      formData.append("timestamp", String(timestamp))
      formData.append("signature", signature)
      formData.append("api_key", apiKey)
      formData.append("folder", folder)

      const xhr = new XMLHttpRequest()
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100))
      }

      const uploadResult = await new Promise<{ secure_url: string; duration?: number }>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText))
          else reject(new Error(`Error al subir: ${xhr.status}`))
        }
        xhr.onerror = () => reject(new Error("Error de red al subir"))
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`)
        xhr.send(formData)
      })

      setForm((f) => ({
        ...f,
        fileUrl: uploadResult.secure_url,
        duration: uploadResult.duration ? String(Math.round(uploadResult.duration)) : f.duration,
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir el archivo")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  async function save() {
    if (!form.title.trim() || !form.fileUrl.trim()) {
      setError("Completá título y URL del archivo.")
      return
    }
    setSaving(true); setError("")
    try {
      const body = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        type: form.type,
        fileUrl: form.fileUrl.trim(),
        duration: form.duration ? parseInt(form.duration) : null,
        courseId: form.courseId || null,
        order: parseInt(form.order) || 0,
        isVisible: form.isVisible,
      }
      const res = await fetch(
        isNew ? "/api/admin/exclusive-resources" : `/api/admin/exclusive-resources/${editing!.id}`,
        { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
      )
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "No se pudo guardar"); return }
      closePanel()
      load()
    } finally {
      setSaving(false)
    }
  }

  async function deleteResource(id: string) {
    if (!confirm("¿Eliminar este recurso?")) return
    await fetch(`/api/admin/exclusive-resources/${id}`, { method: "DELETE" })
    load()
  }

  async function toggleVisible(r: Resource) {
    await fetch(`/api/admin/exclusive-resources/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible: !r.isVisible }),
    })
    load()
  }

  const typeLabel = { audio: "Audio", video: "Video", document: "Documento" }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <span style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: 8 }}>
            Contenido
          </span>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 34, color: "var(--text)", marginBottom: 6 }}>
            Recursos exclusivos
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Meditaciones, audios y materiales complementarios para los alumnos.
          </p>
        </div>
        <button
          onClick={openNew}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 20px", borderRadius: 10,
            background: "linear-gradient(135deg,#A76D61 0%,#C49F72 100%)",
            border: "none", cursor: "pointer", color: "#fff",
            fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
          }}
        >
          <Plus size={15} /> Nuevo recurso
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isNew || editing ? "1fr 380px" : "1fr", gap: 24 }}>

        {/* Lista */}
        <div>
          {loading ? (
            <div style={{ display: "flex", gap: 10, color: "var(--text-dim)", padding: "40px 0", alignItems: "center" }}>
              <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Cargando…
            </div>
          ) : resources.length === 0 ? (
            <div style={{ ...card, padding: "48px 32px", textAlign: "center" }}>
              <Headphones size={26} style={{ color: "rgba(165,141,102,.3)", margin: "0 auto 14px", display: "block" }} />
              <p style={{ color: "var(--text-muted)", fontSize: 15 }}>Sin recursos aún. Creá el primero.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {resources.map((r) => (
                <div
                  key={r.id}
                  style={{
                    ...card, display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 18px", opacity: r.isVisible ? 1 : 0.55,
                    transition: "border-color .2s",
                  }}
                >
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: "rgba(165,141,102,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Headphones size={16} style={{ color: "var(--gold)" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", marginBottom: 2 }}>{r.title}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--text-dim)" }}>
                      <span style={{ textTransform: "uppercase", letterSpacing: ".1em" }}>{typeLabel[r.type]}</span>
                      {r.duration && <span>· {formatDuration(r.duration)}</span>}
                      {r.course && <span>· {r.course.title}</span>}
                      {!r.course && <span>· Global</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      title={r.isVisible ? "Ocultar" : "Mostrar"}
                      onClick={() => toggleVisible(r)}
                      style={{ padding: "6px 8px", borderRadius: 7, background: "transparent", border: "none", cursor: "pointer", color: "var(--text-dim)" }}
                    >
                      {r.isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                    <button
                      title="Editar"
                      onClick={() => openEdit(r)}
                      style={{ padding: "6px 8px", borderRadius: 7, background: "transparent", border: "none", cursor: "pointer", color: "var(--text-dim)" }}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      title="Eliminar"
                      onClick={() => deleteResource(r.id)}
                      style={{ padding: "6px 8px", borderRadius: 7, background: "transparent", border: "none", cursor: "pointer", color: "var(--danger, #ef4444)" }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel de edición */}
        {(isNew || editing) && (
          <div style={{ ...card, padding: "24px", alignSelf: "start", position: "sticky", top: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 20, color: "var(--text)" }}>
                {isNew ? "Nuevo recurso" : "Editar recurso"}
              </h2>
              <button onClick={closePanel} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              <div>
                <label style={labelStyle}>Título</label>
                <input
                  style={inputStyle}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ej. Meditación de apertura"
                />
              </div>

              <div>
                <label style={labelStyle}>Tipo</label>
                <select
                  style={inputStyle}
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as "audio" | "video" | "document" })}
                >
                  <option value="audio">Audio</option>
                  <option value="video">Video</option>
                  <option value="document">Documento</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Archivo</label>
                {form.fileUrl ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 9, background: "rgba(165,141,102,.06)", border: "1px solid rgba(165,141,102,.2)", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {form.fileUrl.split("/").pop()}
                    </span>
                    <button onClick={() => setForm({ ...form, fileUrl: "" })} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", flexShrink: 0 }}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                    padding: "20px 16px", borderRadius: 9, border: "1.5px dashed rgba(165,141,102,.3)",
                    cursor: uploading ? "not-allowed" : "pointer", transition: "border-color .2s",
                  }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(165,141,102,.55)" }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(165,141,102,.3)" }}
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={20} style={{ color: "var(--gold)", animation: "spin 1s linear infinite" }} />
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Subiendo… {uploadProgress}%</span>
                      </>
                    ) : (
                      <>
                        <Upload size={20} style={{ color: "var(--gold)" }} />
                        <span style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
                          Arrastrá o hacé click para subir
                          <br />
                          <span style={{ fontSize: 11, color: "var(--text-dim)" }}>MP3, MP4, PDF — hasta 100 MB</span>
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="audio/*,video/*,.pdf"
                      style={{ display: "none" }}
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file)
                      }}
                    />
                  </label>
                )}
                <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 6 }}>
                  O pegá una URL directamente:
                </p>
                <input
                  style={{ ...inputStyle, marginTop: 4 }}
                  value={form.fileUrl}
                  onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                  placeholder="https://…"
                />
              </div>

              <div>
                <label style={labelStyle}>Duración (segundos, opcional)</label>
                <input
                  style={inputStyle}
                  type="number"
                  min="0"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  placeholder="Ej. 1200 (= 20 min)"
                />
              </div>

              <div>
                <label style={labelStyle}>Descripción (opcional)</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 72, resize: "vertical" }}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Breve descripción del recurso"
                />
              </div>

              <div>
                <label style={labelStyle}>Programa (vacío = global)</label>
                <select
                  style={inputStyle}
                  value={form.courseId}
                  onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                >
                  <option value="">— Global (todos los alumnos activos) —</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Orden</label>
                  <input
                    style={inputStyle}
                    type="number"
                    min="0"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: e.target.value })}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 2 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "var(--text-muted)" }}>
                    <input
                      type="checkbox"
                      checked={form.isVisible}
                      onChange={(e) => setForm({ ...form, isVisible: e.target.checked })}
                      style={{ accentColor: "var(--gold)", width: 15, height: 15 }}
                    />
                    Visible
                  </label>
                </div>
              </div>

              {error && (
                <p style={{ fontSize: 13, color: "var(--danger, #ef4444)", padding: "8px 12px", borderRadius: 7, background: "rgba(239,68,68,.06)", border: "1px solid rgba(239,68,68,.15)" }}>
                  {error}
                </p>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  onClick={save}
                  disabled={saving}
                  style={{
                    flex: 1, padding: "11px 0", borderRadius: 10,
                    background: "linear-gradient(135deg,#A76D61 0%,#C49F72 100%)",
                    border: "none", cursor: saving ? "not-allowed" : "pointer",
                    color: "#fff", fontSize: 13, fontWeight: 600,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving && <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
                  {isNew ? "Crear recurso" : "Guardar cambios"}
                </button>
                <button
                  onClick={closePanel}
                  style={{ padding: "11px 18px", borderRadius: 10, background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.15)", cursor: "pointer", color: "var(--text-muted)", fontSize: 13 }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
