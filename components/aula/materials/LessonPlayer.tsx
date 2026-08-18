"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Loader2, ChevronLeft, ChevronRight, ChevronDown, CheckCircle2, PartyPopper,
  Download, ExternalLink, Search, Award, Clock, Pencil,
} from "lucide-react"
import LessonBody, { type LessonMaterial, type LessonProgress } from "@/components/aula/materials/LessonBody"

export type CurriculumMaterial = {
  id: string; title: string
  type: "document" | "video" | "link" | "lesson"
  fileUrl: string | null; videoUrl: string | null; linkUrl: string | null
  moduleNumber: number; order: number; groupLabel: string | null
  interactionKind: string | null; toolHref: string | null
  estimatedMinutes: number | null
  progress: { completedAt: string | null; quizScore: number | null; quizTotal: number | null } | null
}
export type CourseModuleInfo = { id: string; number: number; title: string; description: string | null; isVisible: boolean }
export type Curriculum = {
  course: { title: string; slug: string } | null
  modules: CourseModuleInfo[]
  materials: CurriculumMaterial[]
}

type SidebarRow =
  | { kind: "item"; material: CurriculumMaterial }
  | { kind: "group"; label: string; items: CurriculumMaterial[] }

function buildRows(materials: CurriculumMaterial[]): SidebarRow[] {
  const rows: SidebarRow[] = []
  for (const m of materials) {
    const last = rows[rows.length - 1]
    if (m.groupLabel && last?.kind === "group" && last.label === m.groupLabel) {
      last.items.push(m)
    } else if (m.groupLabel) {
      rows.push({ kind: "group", label: m.groupLabel, items: [m] })
    } else {
      rows.push({ kind: "item", material: m })
    }
  }
  return rows
}

function moduleLabel(mod: number, named?: CourseModuleInfo) {
  if (named) return named.title
  return mod === 0 ? "Introducción" : `Módulo ${mod}`
}

function isPdf(m: CurriculumMaterial | null) {
  return !!m?.fileUrl && m.fileUrl.toLowerCase().split("?")[0].endsWith(".pdf")
}

const ctaStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 26px", borderRadius: 30,
  background: "linear-gradient(135deg,#A76D61 0%,#C49F72 100%)", border: "none", color: "#fff",
  fontSize: 13.5, fontWeight: 600, cursor: "pointer", textDecoration: "none",
}

type Props = {
  materialId: string
  /** Base de la API que devuelve {material, progress, curriculum} para un materialId */
  apiBase: string
  /** Base de la ruta para navegar entre materiales (anterior/siguiente/sidebar) */
  basePath: string
  /** Modo solo-lectura: oculta "marcar como completado" y no permite progreso (usado en la vista previa de superadmin) */
  readOnly?: boolean
  /** Si se pasa, agrega un botón "Editar" en el header que llama a esto con el materialId actual */
  onEditMaterial?: (materialId: string) => void
  /** Contenido extra a renderizar arriba de todo (ej. barra de "vista previa" del admin) */
  topBar?: React.ReactNode
}

export default function LessonPlayer({ materialId, apiBase, basePath, readOnly, onEditMaterial, topBar }: Props) {
  const router = useRouter()

  const [curriculum, setCurriculum] = useState<Curriculum | null>(null)
  const [detail, setDetail] = useState<LessonMaterial | null>(null)
  const [progress, setProgress] = useState<LessonProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [search, setSearch] = useState("")
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [fileSaving, setFileSaving] = useState(false)
  const [certBanner, setCertBanner] = useState<string | null>(null)

  useEffect(() => {
    if (!materialId) return
    setLoading(true)
    setNotFound(false)
    fetch(`${apiBase}/${materialId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { material: LessonMaterial; progress: LessonProgress | null; curriculum: Curriculum } | null) => {
        if (!d) { setNotFound(true); return }
        setDetail(d.material)
        setProgress(d.progress)
        setCurriculum(d.curriculum)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [materialId, apiBase])

  function applyProgress(id: string, newProgress: { completedAt: string | null; quizScore?: number | null; quizTotal?: number | null }) {
    setCurriculum((prev) =>
      prev
        ? {
            ...prev,
            materials: prev.materials.map((m) =>
              m.id === id
                ? { ...m, progress: { completedAt: newProgress.completedAt, quizScore: newProgress.quizScore ?? m.progress?.quizScore ?? null, quizTotal: newProgress.quizTotal ?? m.progress?.quizTotal ?? null } }
                : m
            ),
          }
        : prev
    )
  }

  function handleProgressChange(newProgress: LessonProgress) {
    setProgress(newProgress)
    applyProgress(materialId, newProgress)
  }

  async function markFileComplete() {
    if (readOnly) return
    setFileSaving(true)
    try {
      const res = await fetch(`${apiBase}/${materialId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      if (!res.ok) return
      const data = await res.json()
      applyProgress(materialId, { completedAt: data.progress.completedAt })
      if (data.certificateIssued && data.certificateNumber) {
        setCertBanner(data.certificateNumber)
      }
    } finally {
      setFileSaving(false)
    }
  }

  function toggleGroup(label: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-dim)", padding: "40px 0" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Cargando…
      </div>
    )
  }

  if (notFound || !curriculum || !detail) {
    return (
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <div style={{
          background: "var(--surface)", border: "1px solid rgba(165,141,102,.14)", borderRadius: 14,
          padding: "56px 32px", textAlign: "center",
        }}>
          <p style={{ color: "var(--text)", fontSize: 16, marginBottom: 8, fontFamily: "var(--serif)", fontWeight: 500 }}>
            No pudimos cargar esta lección
          </p>
          <a href={basePath} style={{ color: "var(--gold)", fontSize: 13.5, fontWeight: 600 }}>
            Volver →
          </a>
        </div>
      </div>
    )
  }

  const list = curriculum.materials
  const currentIndex = list.findIndex((m) => m.id === materialId)
  const currentItem = currentIndex >= 0 ? list[currentIndex] : null
  const prevItem = currentIndex > 0 ? list[currentIndex - 1] : null
  const nextItem = currentIndex >= 0 && currentIndex < list.length - 1 ? list[currentIndex + 1] : null
  const currentModuleNumber = currentItem?.moduleNumber ?? 0
  const namedModule = curriculum.modules.find((cm) => cm.number === currentModuleNumber)
  const moduleItems = list.filter((m) => m.moduleNumber === currentModuleNumber)
  const moduleCompleted = moduleItems.filter((m) => m.progress?.completedAt).length
  const modulePct = moduleItems.length ? Math.round((moduleCompleted / moduleItems.length) * 100) : 0

  const isFileKind = currentItem?.type === "link" || (isPdf(currentItem) && detail.content.length === 0)
  const isFileCompleted = !!currentItem?.progress?.completedAt

  const totalCompleted = list.filter((m) => m.progress?.completedAt).length
  const progressPct = list.length ? Math.round((totalCompleted / list.length) * 100) : 0
  const searchLower = search.trim().toLowerCase()
  const rows = buildRows(searchLower ? moduleItems.filter((m) => m.title.toLowerCase().includes(searchLower)) : moduleItems)

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto" }}>
      {topBar}

      {!readOnly && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <span style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold)" }}>
              {curriculum.course?.title ?? "Tu avance"}
            </span>
            <span style={{ fontSize: 12.5, color: "var(--text-dim)" }}>
              {totalCompleted} de {list.length} · {progressPct}%
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: "var(--surface-2)", overflow: "hidden" }}>
            <motion.div
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{ height: "100%", background: "linear-gradient(90deg,#A76D61,#C49F72)" }}
            />
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
        <aside style={{ width: 270, flexShrink: 0, position: "sticky", top: 20, maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}>
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 16, color: "var(--text)", marginBottom: 4 }}>
              {moduleLabel(currentModuleNumber, namedModule)}
            </p>
            {namedModule?.description && (
              <p style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5, marginBottom: 8 }}>{namedModule.description}</p>
            )}
            {!readOnly && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-faint)", marginBottom: 4 }}>
                  <span>{modulePct}% completado</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: "var(--surface-2)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${modulePct}%`, background: "var(--gold)" }} />
                </div>
              </>
            )}
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: 8, background: "var(--surface)",
            border: "1px solid rgba(165,141,102,.18)", borderRadius: 10, padding: "8px 12px", marginBottom: 16,
          }}>
            <Search size={13} style={{ color: "var(--text-faint)", flexShrink: 0 }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en este módulo…"
              style={{ border: "none", outline: "none", background: "transparent", fontSize: 12.5, color: "var(--text)", width: "100%" }}
            />
          </div>

          {rows.map((row, ri) => {
            if (row.kind === "item") return <MaterialRow key={row.material.id} m={row.material} active={row.material.id === materialId} readOnly={readOnly} onClick={() => router.push(`${basePath}/${row.material.id}`)} />
            const isOpen = !collapsedGroups.has(row.label)
            return (
              <div key={`${row.label}-${ri}`} style={{ marginBottom: 8 }}>
                <button
                  onClick={() => toggleGroup(row.label)}
                  style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", background: "none", border: "none", cursor: "pointer", padding: "6px 4px" }}
                >
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".06em" }}>{row.label}</span>
                  <div style={{ flex: 1 }} />
                  <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={12} style={{ color: "var(--text-faint)" }} />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} style={{ overflow: "hidden" }}>
                      {row.items.map((m) => <MaterialRow key={m.id} m={m} active={m.id === materialId} readOnly={readOnly} onClick={() => router.push(`${basePath}/${m.id}`)} />)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </aside>

        <div style={{ flex: 1, minWidth: 0 }}>
          {certBanner && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{
                display: "flex", alignItems: "center", gap: 12, marginBottom: 20,
                background: "rgba(74,157,111,.1)", border: "1px solid rgba(74,157,111,.3)",
                borderRadius: 12, padding: "14px 18px",
              }}
            >
              <Award size={20} style={{ color: "#4a9d6f", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ color: "var(--text)", fontSize: 14, fontWeight: 600 }}>
                  ¡Felicitaciones! Completaste el programa.
                </p>
                <p style={{ color: "var(--text-muted)", fontSize: 12.5 }}>
                  Certificado {certBanner} emitido —{" "}
                  <a href="/aula/certificaciones" style={{ color: "#4a9d6f", fontWeight: 600 }}>
                    ver mi certificado →
                  </a>
                </p>
              </div>
            </motion.div>
          )}

          <div style={{ marginBottom: 22, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
            <div style={{ minWidth: 0 }}>
              <span style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: 8 }}>
                {curriculum.course?.title ? `${curriculum.course.title} · ` : ""}{moduleLabel(currentModuleNumber, namedModule)}
                {currentItem?.estimatedMinutes != null && (
                  <span style={{ marginLeft: 10, color: "var(--text-faint)", textTransform: "none", letterSpacing: "normal" }}>
                    <Clock size={11} style={{ display: "inline", verticalAlign: -1, marginRight: 4 }} />
                    ~{currentItem.estimatedMinutes} min
                  </span>
                )}
              </span>
              <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 30, color: "var(--text)" }}>
                {currentItem?.title}
              </h1>
            </div>
            {onEditMaterial && (
              <button
                onClick={() => onEditMaterial(materialId)}
                style={{
                  display: "flex", alignItems: "center", gap: 7, flexShrink: 0, padding: "9px 16px", borderRadius: 30,
                  border: "1px solid rgba(165,141,102,.35)", background: "var(--surface)",
                  color: "var(--gold)", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                }}
              >
                <Pencil size={13} /> Editar este material
              </button>
            )}
          </div>

          <div style={{
            background: "var(--surface)", border: "1px solid rgba(165,141,102,.14)", borderRadius: 16,
            padding: "32px 34px", marginBottom: 24,
          }}>
            {isFileKind ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 22 }}>
                  {currentItem?.type === "link"
                    ? "Este contenido es un enlace a otra sección del aula."
                    : "Este contenido es un archivo descargable."}
                </p>
                <a
                  href={currentItem?.fileUrl || currentItem?.linkUrl || currentItem?.videoUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...ctaStyle, marginBottom: 18 }}
                >
                  {currentItem?.type === "link" ? <ExternalLink size={15} /> : <Download size={15} />}
                  {currentItem?.type === "link" ? "Abrir" : "Descargar archivo"}
                </a>
                {!readOnly && (
                  <div>
                    {isFileCompleted ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#4a9d6f", fontSize: 13.5, fontWeight: 600 }}>
                        <CheckCircle2 size={16} /> Completado
                      </span>
                    ) : (
                      <button
                        onClick={markFileComplete}
                        disabled={fileSaving}
                        style={{
                          padding: "9px 20px", borderRadius: 30,
                          border: "1px solid rgba(165,141,102,.25)", background: "transparent",
                          color: "var(--gold)", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                          opacity: fileSaving ? 0.7 : 1,
                        }}
                      >
                        Marcar como completado
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <LessonBody
                material={detail}
                progress={progress}
                onProgressChange={readOnly ? () => {} : handleProgressChange}
                onCertificateIssued={readOnly ? () => {} : setCertBanner}
                readOnly={readOnly}
              />
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {prevItem ? (
              <button
                onClick={() => router.push(`${basePath}/${prevItem.id}`)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 10,
                  border: "1px solid rgba(165,141,102,.25)", background: "transparent",
                  color: "var(--text-muted)", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                <ChevronLeft size={15} /> Anterior
              </button>
            ) : <div />}

            {nextItem ? (
              <button
                onClick={() => router.push(`${basePath}/${nextItem.id}`)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 10,
                  border: "none", background: "linear-gradient(135deg,#A76D61 0%,#C49F72 100%)",
                  color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                Siguiente: {nextItem.title} <ChevronRight size={15} />
              </button>
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#4a9d6f", fontSize: 13.5, fontWeight: 600 }}>
                <PartyPopper size={16} /> ¡Completaste el programa!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function MaterialRow({ m, active, onClick, readOnly }: { m: CurriculumMaterial; active: boolean; onClick: () => void; readOnly?: boolean }) {
  const completed = !!m.progress?.completedAt
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left",
        padding: "8px 10px", borderRadius: 8, marginBottom: 2, border: "none", cursor: "pointer",
        background: active ? "rgba(165,141,102,.14)" : "transparent",
        borderLeft: active ? "2px solid var(--gold)" : "2px solid transparent",
      }}
    >
      {!readOnly && (completed ? (
        <CheckCircle2 size={13} style={{ color: "#4a9d6f", flexShrink: 0 }} />
      ) : (
        <div style={{ width: 13, height: 13, borderRadius: "50%", border: "1px solid rgba(165,141,102,.3)", flexShrink: 0 }} />
      ))}
      <span style={{
        fontSize: 12.5, color: active ? "var(--gold)" : "var(--text-muted)",
        fontWeight: active ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
      }}>
        {m.title}
      </span>
      {m.estimatedMinutes != null && (
        <span style={{ fontSize: 10.5, color: "var(--text-faint)", flexShrink: 0, whiteSpace: "nowrap" }}>
          ~{m.estimatedMinutes} min
        </span>
      )}
    </button>
  )
}
