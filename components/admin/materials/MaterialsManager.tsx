"use client"

import { useMemo, useState } from "react"
import {
  GripVertical, ChevronUp, ChevronDown, ChevronRight, Copy, Eye, EyeOff, Pencil, Trash2, ExternalLink,
  BookOpen, Download, Plus, Loader2, Check, X, Upload, FileDown, FileText, Layers,
  CloudUpload,
} from "lucide-react"
import type { AdminMaterial, AdminCourseModule } from "./types"
import ImportPanel from "./ImportPanel"
import { TEMPLATES, TEMPLATE_ICONS, type TemplateId } from "./templates"
import { uploadToCloudinary } from "@/lib/cloudinary-upload"

type UploadItem = { id: number; name: string; pct: number; status: "uploading" | "done" | "error"; error?: string }

// Nombre legible a partir del archivo: "workbook_modulo-3.pdf" -> "workbook modulo 3"
function cleanName(file: string) {
  return file.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim() || "Material"
}

const inputStyle: React.CSSProperties = { background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.2)", borderRadius: 9, padding: "8px 12px", fontSize: 13, color: "var(--text)", outline: "none", fontFamily: "inherit", width: "100%" }
const toolBtn: React.CSSProperties = { display: "flex", alignItems: "center", gap: 7, background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.3)", color: "var(--gold)", borderRadius: 8, padding: "9px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "none" }
const iconBtn: React.CSSProperties = { background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", padding: 4, display: "flex", alignItems: "center" }

type Props = {
  courseId: string
  courseTitle: string
  materials: AdminMaterial[]
  modules: AdminCourseModule[]
  loading: boolean
  setMaterials: (m: AdminMaterial[]) => void
  /** Recarga materiales, módulos y contadores del programa */
  onReload: () => void
  onEdit: (m: AdminMaterial) => void
  onAdd: (moduleNumber: number, template?: TemplateId) => void
}

type Group = { number: number; title: string | null; description: string | null; items: AdminMaterial[] }

export default function MaterialsManager({ courseId, courseTitle, materials, modules, loading, setMaterials, onReload, onEdit, onAdd }: Props) {
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set())
  const [dragId, setDragId] = useState<string | null>(null)
  const [drop, setDrop] = useState<{ module: number; index: number } | null>(null)
  const [showImport, setShowImport] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [renaming, setRenaming] = useState<number | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [newModuleTitle, setNewModuleTitle] = useState<string | null>(null)
  const [savingModule, setSavingModule] = useState(false)
  const [menuFor, setMenuFor] = useState<number | null>(null)
  const [fileDropModule, setFileDropModule] = useState<number | null>(null)
  const [uploads, setUploads] = useState<UploadItem[]>([])

  const groups: Group[] = useMemo(() => {
    const numbers = new Set<number>([...modules.map((m) => m.number), ...materials.map((m) => m.moduleNumber)])
    return [...numbers].sort((a, b) => a - b).map((n) => {
      const named = modules.find((m) => m.number === n)
      return { number: n, title: named?.title ?? null, description: named?.description ?? null, items: materials.filter((m) => m.moduleNumber === n) }
    })
  }, [modules, materials])

  const nextModuleNumber = (groups[groups.length - 1]?.number ?? 0) + 1
  const firstMaterial = groups.flatMap((g) => g.items)[0]

  function toggleCollapsed(n: number) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(n)) next.delete(n)
      else next.add(n)
      return next
    })
  }

  /* ── Mover: arrastrar y soltar / flechas ── */
  async function commitMove(id: string, toModule: number, toIndex: number) {
    const moved = materials.find((m) => m.id === id)
    if (!moved) return
    const fromModule = moved.moduleNumber
    const src = materials.filter((m) => m.moduleNumber === fromModule)
    const srcIdx = src.findIndex((m) => m.id === id)
    const srcWithout = src.filter((m) => m.id !== id)

    let insertAt = toIndex
    if (fromModule === toModule && srcIdx < toIndex) insertAt = toIndex - 1
    if (fromModule === toModule && insertAt === srcIdx) return

    const dstBase = fromModule === toModule ? srcWithout : materials.filter((m) => m.moduleNumber === toModule)
    const newDst = [...dstBase.slice(0, insertAt), { ...moved, moduleNumber: toModule }, ...dstBase.slice(insertAt)]

    const changes = new Map<string, { moduleNumber: number; order: number }>()
    newDst.forEach((m, i) => changes.set(m.id, { moduleNumber: toModule, order: i }))
    if (fromModule !== toModule) srcWithout.forEach((m, i) => changes.set(m.id, { moduleNumber: fromModule, order: i }))

    const next = materials
      .map((m) => (changes.has(m.id) ? { ...m, ...changes.get(m.id)! } : m))
      .sort((a, b) => a.moduleNumber - b.moduleNumber || a.order - b.order)
    setMaterials(next)

    try {
      const res = await fetch("/api/admin/materials/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, items: [...changes].map(([mid, c]) => ({ id: mid, ...c })) }),
      })
      if (!res.ok) throw new Error()
    } catch {
      alert("No se pudo guardar el nuevo orden. Se restaura la lista.")
      onReload()
    }
  }

  function moveByArrow(m: AdminMaterial, dir: -1 | 1) {
    const list = materials.filter((x) => x.moduleNumber === m.moduleNumber)
    const i = list.findIndex((x) => x.id === m.id)
    if (dir === -1 && i > 0) commitMove(m.id, m.moduleNumber, i - 1)
    if (dir === 1 && i < list.length - 1) commitMove(m.id, m.moduleNumber, i + 2)
  }

  function endDrag() {
    setDragId(null)
    setDrop(null)
  }

  /* ── Arrastrar archivos de la computadora sobre un módulo ──
     PDF / Word / PowerPoint -> documento · video -> lección con el video ·
     imágenes -> una presentación con esas diapositivas. Quedan ocultas (borrador). */
  const isFileDrag = (e: React.DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files")

  async function createFromUpload(body: Record<string, unknown>) {
    const res = await fetch("/api/admin/materials", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, isVisible: false, ...body }),
    })
    if (!res.ok) throw new Error("No se pudo crear el material")
  }

  async function handleFiles(moduleNumber: number, files: File[]) {
    if (!files.length) return
    const items: UploadItem[] = files.map((f, i) => ({ id: Date.now() + i, name: f.name, pct: 0, status: "uploading" }))
    setUploads((prev) => [...prev, ...items])
    const patch = (id: number, p: Partial<UploadItem>) => setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...p } : u)))
    const idOf = (f: File) => items[files.indexOf(f)].id

    const images = files.filter((f) => f.type.startsWith("image/")).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
    const videos = files.filter((f) => f.type.startsWith("video/"))
    const docs = files.filter((f) => !f.type.startsWith("image/") && !f.type.startsWith("video/"))

    for (const f of docs) {
      try {
        const url = await uploadToCloudinary(f, "jewgal-materiales", (pct) => patch(idOf(f), { pct }))
        await createFromUpload({ title: cleanName(f.name), type: "document", fileUrl: url, moduleNumber, estimatedMinutes: 30 })
        patch(idOf(f), { pct: 100, status: "done" })
      } catch (e) { patch(idOf(f), { status: "error", error: e instanceof Error ? e.message : "Error" }) }
    }
    for (const f of videos) {
      try {
        const url = await uploadToCloudinary(f, "jewgal-lecciones-video", (pct) => patch(idOf(f), { pct }))
        await createFromUpload({ title: cleanName(f.name), type: "lesson", groupLabel: "Unidades", moduleNumber, estimatedMinutes: 15, content: [{ type: "video-cloudinary", url }] })
        patch(idOf(f), { pct: 100, status: "done" })
      } catch (e) { patch(idOf(f), { status: "error", error: e instanceof Error ? e.message : "Error" }) }
    }
    if (images.length) {
      const urls: string[] = []
      try {
        for (const f of images) { urls.push(await uploadToCloudinary(f, "jewgal-lecciones-slides", (pct) => patch(idOf(f), { pct }))); patch(idOf(f), { pct: 100, status: "done" }) }
        await createFromUpload({ title: `Presentación — Módulo ${moduleNumber}`, type: "lesson", moduleNumber, estimatedMinutes: 15, content: [{ type: "slides", images: urls.slice(0, 120) }] })
      } catch (e) {
        for (const f of images.slice(urls.length)) patch(idOf(f), { status: "error", error: e instanceof Error ? e.message : "Error" })
      }
    }
    onReload()
    setTimeout(() => setUploads((prev) => prev.filter((u) => u.status === "error")), 4000)
  }

  /* ── Acciones por material ── */
  async function toggleVisible(m: AdminMaterial) {
    setBusyId(m.id)
    try {
      const res = await fetch(`/api/admin/materials/${m.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isVisible: !m.isVisible }),
      })
      if (!res.ok) alert("No se pudo cambiar la visibilidad. Probá de nuevo.")
    } finally {
      setBusyId(null)
      onReload()
    }
  }

  async function duplicate(m: AdminMaterial) {
    setBusyId(m.id)
    try {
      const res = await fetch(`/api/admin/materials/${m.id}/duplicate`, { method: "POST" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.material) { alert(data.error ?? "No se pudo duplicar"); return }
      onReload()
      onEdit(data.material as AdminMaterial) // abre la copia lista para editar
    } finally {
      setBusyId(null)
    }
  }

  async function remove(m: AdminMaterial) {
    if (!confirm(`¿Eliminar "${m.title}"? No se puede deshacer.`)) return
    setBusyId(m.id)
    try {
      const res = await fetch(`/api/admin/materials/${m.id}`, { method: "DELETE" })
      if (!res.ok) alert("No se pudo eliminar")
    } finally {
      setBusyId(null)
      onReload()
    }
  }

  async function setModuleVisibility(g: Group, isVisible: boolean) {
    if (g.items.length === 0) return
    const res = await fetch("/api/admin/materials/visibility", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, ids: g.items.map((i) => i.id), isVisible }),
    })
    if (!res.ok) alert("No se pudo cambiar la visibilidad del módulo")
    onReload()
  }

  /* ── Módulos con nombre ── */
  async function saveModule(number: number, title: string, description: string | null) {
    if (!title.trim()) return false
    setSavingModule(true)
    try {
      const res = await fetch("/api/admin/course-modules", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, number, title: title.trim(), description }),
      })
      if (!res.ok) { alert("No se pudo guardar el módulo"); return false }
      onReload()
      return true
    } finally {
      setSavingModule(false)
    }
  }

  const previewHref = firstMaterial ? `/superadmin/cursos/preview/${firstMaterial.id}` : null
  const totalHidden = materials.filter((m) => !m.isVisible).length

  return (
    <div>
      {/* Barra de herramientas */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <p style={{ fontSize: 13, color: "var(--text-faint)" }}>
          {materials.length} material{materials.length === 1 ? "" : "es"} · {groups.length} módulo{groups.length === 1 ? "" : "s"}
          {totalHidden > 0 && <span style={{ color: "#c0564f", marginLeft: 8 }}>· {totalHidden} oculto{totalHidden === 1 ? "" : "s"} para el alumno</span>}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {previewHref ? (
            <a href={previewHref} target="_blank" rel="noopener noreferrer" style={toolBtn}><ExternalLink size={14} /> Vista previa del alumno</a>
          ) : null}
          <a href={`/api/admin/materials/export?courseId=${courseId}`} download style={toolBtn} title="Descarga todo el contenido de este programa (respaldo o para copiarlo a otro programa)">
            <FileDown size={14} /> Exportar
          </a>
          <button onClick={() => setShowImport((v) => !v)} style={toolBtn}><Upload size={14} /> Importar</button>
          <button onClick={() => setNewModuleTitle(newModuleTitle === null ? "" : null)} style={toolBtn}><Layers size={14} /> Agregar módulo</button>
        </div>
      </div>

      {materials.length > 0 && uploads.length === 0 && (
        <p style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "var(--text-dim)", margin: "-4px 0 14px" }}>
          <CloudUpload size={13} style={{ color: "var(--gold)" }} /> Tip: arrastrá archivos (PDF, video, imágenes) sobre un módulo y se cargan solos como borrador.
        </p>
      )}

      {uploads.length > 0 && (
        <div style={{ background: "var(--surface)", border: "1px solid rgba(165,141,102,.25)", borderRadius: 12, padding: "12px 14px", marginBottom: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)" }}>Cargando archivos…</p>
          {uploads.map((u) => (
            <div key={u.id}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: u.status === "error" ? "var(--danger)" : "var(--text-muted)" }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>{u.name}</span>
                <span>{u.status === "done" ? "Listo ✓ (queda oculto: revisalo y mostralo)" : u.status === "error" ? (u.error ?? "Error") : `${u.pct}%`}</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: "var(--surface-2)", marginTop: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${u.pct}%`, background: u.status === "error" ? "var(--danger)" : "var(--gold)", transition: "width .2s" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {showImport && (
        <ImportPanel courseId={courseId} courseTitle={courseTitle} onClose={() => setShowImport(false)} onDone={onReload} />
      )}

      {newModuleTitle !== null && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", background: "var(--surface)", border: "1px solid rgba(165,141,102,.25)", borderRadius: 12, padding: "12px 14px", marginBottom: 14 }}>
          <span style={{ fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--gold)", fontSize: 13 }}>Módulo {nextModuleNumber}</span>
          <input
            autoFocus value={newModuleTitle} onChange={(e) => setNewModuleTitle(e.target.value)} placeholder="Nombre del módulo"
            onKeyDown={async (e) => { if (e.key === "Enter" && (await saveModule(nextModuleNumber, newModuleTitle, null))) setNewModuleTitle(null) }}
            style={{ ...inputStyle, flex: 1, minWidth: 180 }}
          />
          <button
            disabled={savingModule || !newModuleTitle.trim()}
            onClick={async () => { if (await saveModule(nextModuleNumber, newModuleTitle, null)) setNewModuleTitle(null) }}
            style={{ ...toolBtn, background: "var(--gold)", color: "#2C1F14", opacity: savingModule || !newModuleTitle.trim() ? 0.5 : 1 }}
          >
            {savingModule ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Plus size={13} />} Crear módulo
          </button>
          <button onClick={() => setNewModuleTitle(null)} style={{ ...iconBtn, padding: 8 }} title="Cancelar"><X size={15} /></button>
        </div>
      )}

      {loading ? (
        <p style={{ color: "var(--text-faint)", fontSize: 13, padding: "20px 0" }}>Cargando…</p>
      ) : groups.length === 0 ? (
        <div style={{ padding: "40px 0", textAlign: "center" }}>
          <FileText size={26} style={{ color: "rgba(165,141,102,.2)", margin: "0 auto 12px", display: "block" }} />
          <p style={{ color: "var(--text-dim)", fontSize: 14, marginBottom: 14 }}>Este programa todavía no tiene módulos ni materiales.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => setNewModuleTitle("")} style={toolBtn}><Layers size={14} /> Crear el primer módulo</button>
            <button onClick={() => setShowImport(true)} style={toolBtn}><Upload size={14} /> Importar desde archivo</button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {groups.map((g) => {
            const isCollapsed = collapsed.has(g.number)
            const hiddenCount = g.items.filter((i) => !i.isVisible).length
            const dropHere = dragId && drop?.module === g.number
            return (
              <section
                key={g.number}
                onDragOver={(e) => {
                  if (isFileDrag(e)) { e.preventDefault(); if (fileDropModule !== g.number) setFileDropModule(g.number); return }
                  if (!dragId) return; e.preventDefault(); if (drop?.module !== g.number) setDrop({ module: g.number, index: g.items.length })
                }}
                onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFileDropModule((cur) => (cur === g.number ? null : cur)) }}
                onDrop={(e) => {
                  e.preventDefault()
                  if (isFileDrag(e)) { setFileDropModule(null); handleFiles(g.number, Array.from(e.dataTransfer.files)); return }
                  if (dragId && drop) commitMove(dragId, drop.module, drop.index); endDrag()
                }}
                style={{ position: "relative", background: "var(--surface)", border: `1px ${fileDropModule === g.number ? "dashed" : "solid"} ${dropHere || fileDropModule === g.number ? "var(--gold)" : "rgba(165,141,102,.16)"}`, borderRadius: 12, transition: "border-color .15s" }}
              >
                {fileDropModule === g.number && (
                  <div style={{ position: "absolute", inset: 0, zIndex: 5, borderRadius: 12, background: "rgba(246,241,231,.92)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, pointerEvents: "none" }}>
                    <CloudUpload size={28} style={{ color: "var(--gold)" }} />
                    <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Soltá los archivos para cargarlos en el Módulo {g.number}</p>
                    <p style={{ fontSize: 12, color: "var(--text-dim)" }}>PDF y documentos · videos · imágenes (= diapositivas)</p>
                  </div>
                )}
                {/* Encabezado del módulo */}
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, padding: "12px 14px", background: "rgba(165,141,102,.07)" }}>
                  <button onClick={() => toggleCollapsed(g.number)} style={{ ...iconBtn, padding: 2 }} title={isCollapsed ? "Expandir" : "Contraer"}>
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <span style={{ fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--gold)", fontSize: 13, flexShrink: 0 }}>Módulo {g.number}</span>

                  {renaming === g.number ? (
                    <>
                      <input
                        autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={async (e) => {
                          if (e.key === "Enter" && (await saveModule(g.number, renameValue, g.description))) setRenaming(null)
                          if (e.key === "Escape") setRenaming(null)
                        }}
                        style={{ ...inputStyle, flex: 1, minWidth: 160 }}
                      />
                      <button onClick={async () => { if (await saveModule(g.number, renameValue, g.description)) setRenaming(null) }} style={{ ...iconBtn, color: "#4a9d6f" }} title="Guardar"><Check size={16} /></button>
                      <button onClick={() => setRenaming(null)} style={iconBtn} title="Cancelar"><X size={16} /></button>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 14, fontWeight: 600, color: g.title ? "var(--text)" : "var(--text-faint)", flex: 1, minWidth: 120 }}>
                        {g.title ?? "Sin nombre"}
                      </span>
                      <button onClick={() => { setRenaming(g.number); setRenameValue(g.title ?? "") }} style={iconBtn} title={g.title ? "Renombrar módulo" : "Ponerle nombre al módulo"}><Pencil size={13} /></button>
                    </>
                  )}

                  <span style={{ fontSize: 11.5, color: "var(--text-faint)" }}>
                    {g.items.length} unidad{g.items.length === 1 ? "" : "es"}{hiddenCount > 0 && <span style={{ color: "#c0564f" }}> · {hiddenCount} oculta{hiddenCount === 1 ? "" : "s"}</span>}
                  </span>
                  {g.items.length > 0 && (
                    <button
                      onClick={() => setModuleVisibility(g, hiddenCount > 0)}
                      style={{ ...iconBtn, gap: 5, fontSize: 11.5, fontWeight: 600, color: hiddenCount > 0 ? "#4a9d6f" : "var(--text-faint)" }}
                      title={hiddenCount > 0 ? "Hacer visibles todas las unidades de este módulo" : "Ocultar todas las unidades de este módulo"}
                    >
                      {hiddenCount > 0 ? <Eye size={14} /> : <EyeOff size={14} />} {hiddenCount > 0 ? "Mostrar todo" : "Ocultar todo"}
                    </button>
                  )}
                  <div style={{ position: "relative" }}>
                    <button onClick={() => setMenuFor(menuFor === g.number ? null : g.number)} style={{ ...toolBtn, padding: "6px 12px", background: "var(--gold)", color: "#2C1F14" }}>
                      <Plus size={13} /> Agregar <ChevronDown size={12} />
                    </button>
                    {menuFor === g.number && (
                      <>
                        <div onClick={() => setMenuFor(null)} style={{ position: "fixed", inset: 0, zIndex: 20 }} />
                        <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 21, width: 300, maxWidth: "80vw", background: "var(--surface)", border: "1px solid rgba(165,141,102,.3)", borderRadius: 12, boxShadow: "0 12px 32px rgba(60,40,20,.18)", padding: 6 }}>
                          <p style={{ fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-faint)", padding: "8px 10px 4px" }}>¿Qué querés agregar al Módulo {g.number}?</p>
                          {TEMPLATES.map((t) => {
                            const Icon = TEMPLATE_ICONS[t.id]
                            return (
                              <button key={t.id} onClick={() => { setMenuFor(null); onAdd(g.number, t.id) }}
                                style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", background: "none", border: "none", borderRadius: 8, padding: "9px 10px", cursor: "pointer" }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(165,141,102,.12)" }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "none" }}>
                                <span style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(165,141,102,.14)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold)", flexShrink: 0 }}><Icon size={16} /></span>
                                <span><span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{t.label}</span><span style={{ display: "block", fontSize: 11.5, color: "var(--text-dim)" }}>{t.hint}</span></span>
                              </button>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Unidades */}
                {!isCollapsed && (
                  <div style={{ padding: "8px 10px 10px", display: "flex", flexDirection: "column", gap: 0, minHeight: 36 }}>
                    {g.items.length === 0 && (
                      <p style={{ fontSize: 12.5, color: "var(--text-dim)", padding: "10px 6px" }}>
                        Módulo vacío — arrastrá archivos (PDF, video, imágenes) hasta acá o tocá «Agregar».
                      </p>
                    )}
                    {g.items.map((m, i) => (
                      <div key={m.id}>
                        {dragId && drop?.module === g.number && drop.index === i && <DropLine />}
                        <div
                          draggable
                          onDragStart={(e) => { setDragId(m.id); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", m.id) }}
                          onDragEnd={endDrag}
                          onDragOver={(e) => {
                            if (!dragId) return
                            e.preventDefault(); e.stopPropagation()
                            const r = e.currentTarget.getBoundingClientRect()
                            const index = e.clientY > r.top + r.height / 2 ? i + 1 : i
                            if (drop?.module !== g.number || drop.index !== index) setDrop({ module: g.number, index })
                          }}
                          style={{
                            display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, padding: "9px 10px", margin: "2px 0",
                            background: "var(--surface-2)", borderRadius: 9,
                            opacity: dragId === m.id ? 0.35 : m.isVisible ? 1 : 0.55,
                          }}
                        >
                          <span title="Arrastrá para reordenar o mover a otro módulo" style={{ cursor: "grab", color: "var(--text-faint)", display: "flex", flexShrink: 0 }}><GripVertical size={15} /></span>
                          <div style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}>
                            <button onClick={() => moveByArrow(m, -1)} disabled={i === 0} title="Subir" style={{ ...iconBtn, padding: 0, height: 14, opacity: i === 0 ? 0.25 : 1, cursor: i === 0 ? "default" : "pointer" }}><ChevronUp size={13} /></button>
                            <button onClick={() => moveByArrow(m, 1)} disabled={i === g.items.length - 1} title="Bajar" style={{ ...iconBtn, padding: 0, height: 14, opacity: i === g.items.length - 1 ? 0.25 : 1, cursor: i === g.items.length - 1 ? "default" : "pointer" }}><ChevronDown size={13} /></button>
                          </div>
                          {m.type === "document" ? <Download size={15} style={{ color: "var(--gold)", flexShrink: 0 }} /> : m.type === "lesson" ? <BookOpen size={15} style={{ color: "var(--gold)", flexShrink: 0 }} /> : <ExternalLink size={15} style={{ color: "var(--teal)", flexShrink: 0 }} />}
                          <div style={{ flex: 1, minWidth: 140 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</p>
                            <p style={{ fontSize: 11.5, color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {m.groupLabel ? `${m.groupLabel} · ` : ""}{m.type}{m.interactionKind ? ` · ${m.interactionKind === "quiz" ? "quiz" : "reflexión"}` : ""}
                              {!m.isVisible && <span style={{ marginLeft: 6, color: "#c0564f", fontWeight: 600 }}>· Oculto para el alumno</span>}
                            </p>
                          </div>
                          {busyId === m.id ? (
                            <Loader2 size={15} style={{ animation: "spin 1s linear infinite", color: "var(--text-faint)" }} />
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                              <a href={`/superadmin/cursos/preview/${m.id}`} target="_blank" rel="noopener noreferrer" title="Ver como el alumno" style={iconBtn}><ExternalLink size={14} /></a>
                              <button onClick={() => toggleVisible(m)} title={m.isVisible ? "Visible para el alumno — tocá para ocultar" : "Oculto para el alumno — tocá para mostrar"} style={{ ...iconBtn, color: m.isVisible ? "var(--success)" : "var(--text-dim)" }}>
                                {m.isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
                              </button>
                              <button onClick={() => duplicate(m)} title="Duplicar (la copia queda oculta, lista para editar)" style={iconBtn}><Copy size={14} /></button>
                              <button onClick={() => onEdit(m)} title="Editar" style={iconBtn}><Pencil size={14} /></button>
                              <button onClick={() => remove(m)} title="Eliminar" style={{ ...iconBtn, color: "rgba(239,68,68,.55)" }}><Trash2 size={14} /></button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {dragId && drop?.module === g.number && drop.index === g.items.length && g.items.length > 0 && <DropLine />}
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}

function DropLine() {
  return <div style={{ height: 3, borderRadius: 2, background: "var(--gold)", margin: "1px 4px" }} />
}
