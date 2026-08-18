"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText, Download, ExternalLink, BookOpen, Loader2, FolderOpen,
  ChevronDown, CheckCircle2, HelpCircle, PenLine, Sparkles, GraduationCap, ArrowRight,
} from "lucide-react"

type Material = {
  id: string; title: string; description: string | null
  type: "document" | "video" | "link" | "lesson"
  fileUrl: string | null; videoUrl: string | null; linkUrl: string | null
  moduleNumber: number; courseId: string; courseTitle: string; moduleTitle: string | null
  interactionKind: string | null; toolHref: string | null
  progress: { completedAt: string | null; quizScore: number | null; quizTotal: number | null } | null
}

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid rgba(165,141,102,.14)",
  borderRadius: 14,
}

function moduleLabel(mod: number, title: string | null) {
  if (title) return title
  return mod === 0 ? "Introducción" : `Módulo ${mod}`
}

function iconFor(m: Material) {
  if (m.type === "link") return <ExternalLink size={17} style={{ color: "var(--teal)" }} />
  if (m.interactionKind === "quiz") return <HelpCircle size={17} style={{ color: "var(--gold)" }} />
  if (m.interactionKind === "reflection") return <PenLine size={17} style={{ color: "var(--gold)" }} />
  if (m.toolHref) return <Sparkles size={17} style={{ color: "var(--gold)" }} />
  if (m.type === "lesson") return <BookOpen size={17} style={{ color: "var(--gold)" }} />
  return <FileText size={17} style={{ color: "var(--gold)" }} />
}

export default function MaterialesPage() {
  const router = useRouter()
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetch("/api/me/materials")
      .then((r) => r.json())
      .then((d) => {
        const list: Material[] = d.materials ?? []
        setMaterials(list)
        setExpanded(new Set(list.map((m) => m.moduleNumber)))
      })
      .catch(() => setMaterials([]))
      .finally(() => setLoading(false))
  }, [])

  function toggleModule(mod: number) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(mod)) next.delete(mod)
      else next.add(mod)
      return next
    })
  }

  const courseIds = useMemo(() => [...new Set(materials.map((m) => m.courseId))], [materials])
  const multiCourse = courseIds.length > 1

  const totalCompleted = materials.filter((m) => m.progress?.completedAt).length

  // Los materiales "lesson" (bloques de contenido) no tienen un único
  // archivo adjunto — antes esto abría "#" en una pestaña nueva sin hacer
  // nada. Para esos, navegar dentro del aula al reproductor secuencial en
  // vez de intentar abrir un link vacío.
  function openMaterial(m: Material) {
    const href = m.fileUrl || m.videoUrl || m.linkUrl
    if (!href) {
      router.push(`/aula/programa/${m.id}`)
      return
    }
    window.open(href, "_blank", "noopener,noreferrer")
  }

  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 30 }}>
        <span style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: 10 }}>
          Aula Virtual
        </span>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 38, color: "var(--text)", marginBottom: 8 }}>
          Materiales de estudio
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
          PDFs, guías y ejercicios para descargar — para seguir el contenido paso a paso, andá al Programa.
        </p>
        {!loading && materials.length > 0 && (
          <p style={{ color: "var(--text-dim)", fontSize: 13, marginTop: 10 }}>
            {totalCompleted} de {materials.length} completados
          </p>
        )}
        <a
          href="/aula/programa"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8, marginTop: 18,
            padding: "11px 22px", borderRadius: 30,
            background: "linear-gradient(135deg,#A76D61 0%,#C49F72 100%)",
            color: "#fff", fontSize: 13.5, fontWeight: 600, textDecoration: "none",
          }}
        >
          <GraduationCap size={16} /> Ir al programa →
        </a>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-dim)", padding: "40px 0" }}>
          <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Cargando materiales…
        </div>
      ) : materials.length === 0 ? (
        <div style={{ ...card, padding: "44px 32px", textAlign: "center" }}>
          <FolderOpen size={26} style={{ color: "rgba(165,141,102,.3)", margin: "0 auto 14px", display: "block" }} />
          <p style={{ color: "var(--text-muted)", fontSize: 15, marginBottom: 6 }}>Todavía no hay materiales disponibles</p>
          <p style={{ color: "var(--text-dim)", fontSize: 13 }}>Aparecerán aquí a medida que tu programa avance.</p>
        </div>
      ) : (
        courseIds.map((courseId) => {
          const courseMaterials = materials.filter((m) => m.courseId === courseId)
          const modules = [...new Set(courseMaterials.map((m) => m.moduleNumber))].sort((a, b) => a - b)
          return (
            <div key={courseId} style={{ marginBottom: 8 }}>
              {multiCourse && (
                <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 20, color: "var(--gold)", marginBottom: 20 }}>
                  {courseMaterials[0].courseTitle}
                </h2>
              )}
              {modules.map((mod) => {
                const items = courseMaterials.filter((m) => m.moduleNumber === mod)
                const doneCount = items.filter((m) => m.progress?.completedAt).length
                const isOpen = expanded.has(mod)
                return (
                  <section key={mod} style={{ marginBottom: 24 }}>
                    <button
                      onClick={() => toggleModule(mod)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12, marginBottom: isOpen ? 16 : 0,
                        width: "100%", background: "none", border: "none", cursor: "pointer", padding: 0,
                      }}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(165,141,102,.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <BookOpen size={15} style={{ color: "var(--gold)" }} />
                      </div>
                      <h3 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 18, color: "var(--text)" }}>
                        {moduleLabel(mod, items[0]?.moduleTitle ?? null)}
                      </h3>
                      <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{doneCount}/{items.length}</span>
                      <div style={{ flex: 1, height: 1, background: "var(--surface-2)" }} />
                      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown size={16} style={{ color: "var(--text-faint)" }} />
                      </motion.div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ overflow: "hidden" }}
                        >
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {items.map((material) => {
                              const completed = !!material.progress?.completedAt
                              return (
                                <button
                                  key={material.id}
                                  onClick={() => openMaterial(material)}
                                  style={{
                                    ...card, display: "flex", alignItems: "center", gap: 16, padding: "16px 20px",
                                    transition: "border-color .2s, box-shadow .2s", textAlign: "left", cursor: "pointer",
                                    width: "100%",
                                  }}
                                  onMouseEnter={(e) => {
                                    const el = e.currentTarget as HTMLElement
                                    el.style.borderColor = "rgba(165,141,102,.3)"
                                    el.style.boxShadow = "0 6px 24px rgba(165,141,102,.08)"
                                  }}
                                  onMouseLeave={(e) => {
                                    const el = e.currentTarget as HTMLElement
                                    el.style.borderColor = "rgba(165,141,102,.14)"
                                    el.style.boxShadow = "none"
                                  }}
                                >
                                  <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(165,141,102,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    {iconFor(material)}
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: 600, color: "var(--text)", fontSize: 14, marginBottom: 3 }}>{material.title}</p>
                                    {material.description && <p style={{ color: "var(--text-faint)", fontSize: 12 }}>{material.description}</p>}
                                    {material.progress?.quizScore != null && material.progress?.quizTotal != null && (
                                      <p style={{ color: "var(--gold)", fontSize: 11.5, marginTop: 2 }}>
                                        Puntaje: {material.progress.quizScore}/{material.progress.quizTotal}
                                      </p>
                                    )}
                                  </div>
                                  {completed ? (
                                    <CheckCircle2 size={18} style={{ color: "#4a9d6f", flexShrink: 0 }} />
                                  ) : (
                                    <span style={{ color: "var(--gold)", flexShrink: 0 }}>
                                      {material.type === "document" ? <Download size={18} /> : material.type === "lesson" ? <ArrowRight size={16} /> : <ExternalLink size={16} />}
                                    </span>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </section>
                )
              })}
            </div>
          )
        })
      )}
    </div>
  )
}
