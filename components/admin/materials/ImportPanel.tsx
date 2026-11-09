"use client"

import { useState } from "react"
import { Loader2, Upload, Download, X, AlertCircle, CheckCircle2 } from "lucide-react"

const inputStyle: React.CSSProperties = { background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.2)", borderRadius: 9, padding: "10px 14px", fontSize: 12, color: "var(--text)", outline: "none", width: "100%", fontFamily: "ui-monospace, Menlo, Consolas, monospace" }

// Plantilla mínima pero completa: un módulo con nombre, una unidad con
// bloques de contenido, un workbook (documento), una reflexión y un quiz.
export const IMPORT_TEMPLATE = {
  format: "jewgal-materials",
  version: 1,
  modules: [
    { number: 1, title: "Nombre del módulo", description: "Qué se trabaja en este módulo" },
  ],
  materials: [
    {
      title: "Unidad 1: Título de la unidad",
      type: "lesson",
      moduleNumber: 1,
      groupLabel: "Unidades",
      estimatedMinutes: 30,
      content: [
        { type: "heading", level: 2, text: "Título de la sección" },
        { type: "paragraph", text: "Texto de la lección. Se puede repetir cuantos bloques haga falta." },
        { type: "video-youtube", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", caption: "Video de la unidad" },
        {
          type: "unit-resources",
          videos: [{ label: "Video recomendado", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }],
          readings: [{ label: "Lectura complementaria", url: "https://ejemplo.com/lectura.pdf" }],
          quotes: ["Una cita inspiradora de la unidad"],
          links: [],
        },
      ],
    },
    { title: "Workbook — Módulo 1", type: "document", moduleNumber: 1, fileUrl: "https://ejemplo.com/workbook.pdf" },
    {
      title: "Reflexión del módulo",
      type: "lesson",
      moduleNumber: 1,
      interactionKind: "reflection",
      content: [{ type: "paragraph", text: "¿Qué te llevás de este módulo?" }],
    },
    {
      title: "Evaluación del módulo",
      type: "lesson",
      moduleNumber: 1,
      interactionKind: "quiz",
      quizData: [{ question: "Pregunta de ejemplo", options: ["Opción A", "Opción B", "Opción C"], correctIndexes: [0] }],
    },
  ],
}

export default function ImportPanel({ courseId, courseTitle, onDone, onClose }: {
  courseId: string
  courseTitle: string
  onDone: () => void
  onClose: () => void
}) {
  const [text, setText] = useState("")
  const [hidden, setHidden] = useState(true)
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [success, setSuccess] = useState("")

  function downloadTemplate() {
    const blob = new Blob([JSON.stringify(IMPORT_TEMPLATE, null, 2)], { type: "application/json" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = "plantilla-materiales.json"
    a.click()
    URL.revokeObjectURL(a.href)
  }

  async function onFile(f: File) {
    setText(await f.text())
    setErrors([])
    setSuccess("")
  }

  async function run() {
    setErrors([])
    setSuccess("")
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      setErrors(["El texto no es un JSON válido. Revisá comas y comillas, o usá la plantilla."])
      return
    }
    // Acepta el archivo completo ({modules, materials}) o solo una lista de materiales.
    const obj = Array.isArray(parsed) ? { materials: parsed } : (parsed as { modules?: unknown; materials?: unknown })
    if (!obj || !Array.isArray(obj.materials) || obj.materials.length === 0) {
      setErrors(["No encontré materiales: el archivo necesita una lista \"materials\" con al menos un elemento."])
      return
    }
    const nMods = Array.isArray(obj.modules) ? obj.modules.length : 0
    if (!confirm(`Se van a AGREGAR ${obj.materials.length} material(es)${nMods ? ` y ${nMods} nombre(s) de módulo` : ""} a «${courseTitle}»${hidden ? ", todos ocultos" : ", visibles para los alumnos"}.\nNo se borra ni modifica nada de lo que ya está cargado. ¿Continuar?`)) return

    setBusy(true)
    try {
      const res = await fetch("/api/admin/materials/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, modules: obj.modules, materials: obj.materials, hidden }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErrors(data.issues?.length ? data.issues : [data.error ?? "No se pudo importar"])
        return
      }
      setSuccess(`Listo: se agregaron ${data.materials} material(es)${data.modules ? ` y ${data.modules} módulo(s) con nombre` : ""}.`)
      setText("")
      onDone()
    } catch {
      setErrors(["Error de red al importar. Probá de nuevo."])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ background: "var(--surface)", border: "1px solid rgba(165,141,102,.25)", borderRadius: 12, padding: "18px 18px", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Importar materiales</span>
        <button onClick={onClose} title="Cerrar" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)" }}><X size={16} /></button>
      </div>
      <p style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 12 }}>
        Cargá un módulo (o un programa entero) de una sola vez. Usá la plantilla como base, o pegá el archivo que exportaste de otro programa.
        Siempre se <strong>agrega al final</strong>: no se borra ni se pisa nada de lo que ya está.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
        <button onClick={downloadTemplate} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.3)", color: "var(--gold-ink)", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          <Download size={13} /> Descargar plantilla
        </button>
        <label style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface-2)", border: "1px dashed rgba(165,141,102,.4)", color: "var(--text-muted)", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          <Upload size={13} /> Elegir archivo .json
          <input type="file" accept=".json,application/json" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = "" }} />
        </label>
      </div>

      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); setErrors([]); setSuccess("") }}
        placeholder='…o pegá el JSON acá  { "modules": [...], "materials": [...] }'
        rows={8}
        style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
      />

      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text-muted)", margin: "12px 0" }}>
        <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} style={{ accentColor: "var(--gold)" }} />
        Importar todo <strong>oculto</strong> (recomendado: revisalo con la vista previa y después mostralo)
      </label>

      {errors.length > 0 && (
        <div style={{ background: "rgba(220,38,38,.08)", border: "1px solid rgba(220,38,38,.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>
          <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "#f87171", marginBottom: 6 }}><AlertCircle size={14} /> No se importó nada — corregí esto:</p>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#f87171", lineHeight: 1.6 }}>
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}
      {success && (
        <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#4a9d6f", fontWeight: 600, marginBottom: 12 }}><CheckCircle2 size={14} /> {success}</p>
      )}

      <button
        onClick={run}
        disabled={busy || !text.trim()}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%", background: "var(--gold)", color: "#2C1F14", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 12.5, fontWeight: 700, cursor: busy || !text.trim() ? "default" : "pointer", opacity: busy || !text.trim() ? 0.5 : 1 }}
      >
        {busy ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Upload size={14} />} Importar
      </button>
    </div>
  )
}
