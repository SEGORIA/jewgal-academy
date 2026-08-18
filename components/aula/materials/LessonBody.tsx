"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Sparkles, CheckCircle2, BookOpen } from "lucide-react"
import type { ContentBlock } from "@/lib/materials-content"
import ContentBlockView from "./ContentBlockView"
import QuizView, { type QuizQuestionView, type QuizResult } from "./QuizView"

const BreathingPacer = dynamic(() => import("@/components/aula/jewgalkids/BreathingPacer"))
const PostureGallery = dynamic(() => import("@/components/aula/jewgalkids/PostureGallery"))
const ValueCards = dynamic(() => import("@/components/aula/jewgalkids/ValueCards"))

// Hoy no hay ninguna UI de superadmin para setear toolHref — los 3 valores
// posibles (respiración/posturas/valores de Joogalkids) son los únicos que
// existen en la base. Por eso un mapeo fijo alcanza; un mecanismo genérico
// resolvería un problema que todavía no existe.
function resolveInlineTool(toolHref: string | null): React.ComponentType | null {
  if (!toolHref) return null
  try {
    const url = new URL(toolHref, "https://placeholder.invalid")
    if (url.pathname !== "/aula/jewgalkids") return null
    const map: Record<string, React.ComponentType> = {
      respiracion: BreathingPacer,
      posturas: PostureGallery,
      valores: ValueCards,
    }
    return map[url.searchParams.get("tab") ?? ""] ?? null
  } catch {
    return null
  }
}

export type LessonMaterial = {
  id: string
  title: string
  description: string | null
  interactionKind: string | null
  toolHref: string | null
  fileUrl: string | null
  coverImageUrl: string | null
  content: ContentBlock[]
  quiz: QuizQuestionView[] | null
}

export type LessonProgress = {
  completedAt: string | null
  response: string | null
  quizScore: number | null
  quizTotal: number | null
}

export default function LessonBody({
  material,
  progress,
  onProgressChange,
  onCertificateIssued,
  readOnly,
}: {
  material: LessonMaterial
  progress: LessonProgress | null
  onProgressChange?: (progress: LessonProgress) => void
  onCertificateIssued?: (certificateNumber: string) => void
  /** Vista previa de superadmin: sin envío de quiz/reflexión/completado (no hay progreso real que guardar) */
  readOnly?: boolean
}) {
  const [response, setResponse] = useState(progress?.response ?? "")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setResponse(progress?.response ?? "")
  }, [material.id, progress?.response])

  async function markComplete(body?: { response?: string }) {
    setSaving(true)
    try {
      const res = await fetch(`/api/me/materials/${material.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      })
      if (!res.ok) return
      const data = await res.json()
      onProgressChange?.({
        completedAt: data.progress.completedAt,
        response: data.progress.response ?? null,
        quizScore: progress?.quizScore ?? null,
        quizTotal: progress?.quizTotal ?? null,
      })
      if (data.certificateIssued && data.certificateNumber) {
        onCertificateIssued?.(data.certificateNumber)
      }
    } finally {
      setSaving(false)
    }
  }

  function handleQuizGraded(result: QuizResult) {
    onProgressChange?.({
      completedAt: new Date().toISOString(),
      response: progress?.response ?? null,
      quizScore: result.score,
      quizTotal: result.total,
    })
    if (result.certificateIssued && result.certificateNumber) {
      onCertificateIssued?.(result.certificateNumber)
    }
  }

  const InlineTool = resolveInlineTool(material.toolHref)

  return (
    <div>
      {material.toolHref && InlineTool && (
        <div style={{
          border: "1px solid rgba(165,141,102,.2)", borderRadius: 14,
          padding: "20px 22px", marginBottom: 26, background: "var(--surface)",
        }}>
          <p style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 16 }}>
            <Sparkles size={13} /> Practicá esto interactivamente
          </p>
          <InlineTool />
        </div>
      )}

      {material.toolHref && !InlineTool && (
        <a
          href={material.toolHref}
          style={{
            display: "flex", alignItems: "center", gap: 10, textDecoration: "none",
            background: "linear-gradient(135deg,rgba(167,109,97,.12),rgba(196,159,114,.12))",
            border: "1px solid rgba(165,141,102,.25)", borderRadius: 10,
            padding: "12px 16px", marginBottom: 22, color: "var(--gold)", fontSize: 13, fontWeight: 600,
          }}
        >
          <Sparkles size={15} /> Practicá esto interactivamente en el aula →
        </a>
      )}

      {material.interactionKind !== "quiz" && material.coverImageUrl && (
        <div style={{
          display: "flex", gap: 20, marginBottom: 26, padding: "20px 22px",
          borderRadius: 14, border: "1px solid rgba(165,141,102,.2)", background: "var(--surface)",
        }}>
          <img
            src={material.coverImageUrl}
            alt=""
            style={{ width: 110, height: 142, objectFit: "cover", borderRadius: 8, flexShrink: 0, border: "1px solid rgba(165,141,102,.18)" }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 10 }}>
              <BookOpen size={13} /> Workbook de la unidad
            </p>
            {material.description && (
              <p style={{ color: "var(--text-muted)", fontSize: 13.5, lineHeight: 1.6, marginBottom: 14 }}>{material.description}</p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {material.content.map((block, i) => <ContentBlockView key={i} block={block} />)}
            </div>
            {material.fileUrl && (
              <a
                href={material.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none",
                  background: "linear-gradient(135deg,#A76D61 0%,#C49F72 100%)",
                  borderRadius: 30, padding: "10px 22px", color: "#fff", fontSize: 13, fontWeight: 600,
                }}
              >
                Ir al workbook →
              </a>
            )}
          </div>
        </div>
      )}

      {material.interactionKind !== "quiz" && !material.coverImageUrl && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 26 }}>
          {material.content.map((block, i) => <ContentBlockView key={i} block={block} />)}
        </div>
      )}

      {material.interactionKind === "quiz" && material.quiz && readOnly && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <p style={{ fontSize: 12, color: "var(--text-faint)" }}>Vista previa — el alumno responde y corrige acá.</p>
          {material.quiz.map((q, qi) => (
            <div key={qi} style={{ background: "var(--surface)", border: "1px solid rgba(165,141,102,.14)", borderRadius: 12, padding: "18px 20px" }}>
              <p style={{ fontSize: 14.5, color: "var(--text)", fontWeight: 500, marginBottom: 14 }}>{qi + 1}. {q.question}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {q.options.map((opt, oi) => (
                  <label key={oi} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(165,141,102,.18)", fontSize: 13.5, color: "var(--text-muted)" }}>
                    <input type={q.multiple ? "checkbox" : "radio"} disabled style={{ accentColor: "var(--gold)" }} /> {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {material.interactionKind === "quiz" && material.quiz && !readOnly && (
        <QuizView
          materialId={material.id}
          questions={material.quiz}
          previousScore={progress?.quizScore != null && progress.quizTotal != null ? { quizScore: progress.quizScore, quizTotal: progress.quizTotal } : null}
          onGraded={handleQuizGraded}
        />
      )}

      {material.interactionKind === "reflection" && readOnly && (
        <div>
          <p style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 10 }}>
            Tu reflexión
          </p>
          <textarea
            disabled
            placeholder="Acá el alumno escribe su respuesta…"
            rows={6}
            style={{
              width: "100%", borderRadius: 10, border: "1px solid rgba(165,141,102,.25)",
              background: "var(--surface)", color: "var(--text-faint)", fontSize: 14, padding: "12px 14px",
              resize: "vertical", fontFamily: "inherit",
            }}
          />
        </div>
      )}

      {material.interactionKind === "reflection" && !readOnly && (
        <div>
          <p style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 10 }}>
            Tu reflexión
          </p>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Escribí tu respuesta acá…"
            rows={6}
            style={{
              width: "100%", borderRadius: 10, border: "1px solid rgba(165,141,102,.25)",
              background: "var(--surface)", color: "var(--text)", fontSize: 14, padding: "12px 14px",
              resize: "vertical", fontFamily: "inherit",
            }}
          />
          <button
            onClick={() => markComplete({ response })}
            disabled={saving}
            style={{
              marginTop: 14, padding: "11px 24px", borderRadius: 30,
              background: "linear-gradient(135deg,#A76D61 0%,#C49F72 100%)",
              border: "none", color: "#fff", fontSize: 13.5, fontWeight: 600,
              cursor: "pointer", opacity: saving ? 0.7 : 1,
            }}
          >
            {progress?.completedAt ? "Actualizar mi reflexión" : "Guardar mi reflexión"}
          </button>
          {progress?.completedAt && (
            <span style={{ marginLeft: 12, fontSize: 12.5, color: "#4a9d6f", display: "inline-flex", alignItems: "center", gap: 5 }}>
              <CheckCircle2 size={13} /> Guardada
            </span>
          )}
        </div>
      )}

      {!material.interactionKind && readOnly && (
        <div>
          <p style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 10 }}>
            Notas personales (opcional)
          </p>
          <textarea
            disabled
            placeholder="Acá el alumno puede anotar algo mientras lee…"
            rows={4}
            style={{
              width: "100%", borderRadius: 10, border: "1px solid rgba(165,141,102,.25)",
              background: "var(--surface)", color: "var(--text-faint)", fontSize: 14, padding: "12px 14px",
              resize: "vertical", fontFamily: "inherit",
            }}
          />
        </div>
      )}

      {!material.interactionKind && !readOnly && (
        <div>
          <p style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 10 }}>
            Notas personales (opcional)
          </p>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Anotá algo mientras leés…"
            rows={4}
            style={{
              width: "100%", borderRadius: 10, border: "1px solid rgba(165,141,102,.25)",
              background: "var(--surface)", color: "var(--text)", fontSize: 14, padding: "12px 14px",
              resize: "vertical", fontFamily: "inherit", marginBottom: 14,
            }}
          />
          <button
            onClick={() => markComplete({ response })}
            disabled={saving}
            style={{
              padding: "11px 24px", borderRadius: 30,
              background: "linear-gradient(135deg,#A76D61 0%,#C49F72 100%)",
              border: "none", color: "#fff", fontSize: 13.5, fontWeight: 600,
              cursor: "pointer", opacity: saving ? 0.7 : 1,
            }}
          >
            {progress?.completedAt ? "Actualizar" : "Marcar como completada"}
          </button>
          {progress?.completedAt && (
            <span style={{ marginLeft: 12, fontSize: 12.5, color: "#4a9d6f", display: "inline-flex", alignItems: "center", gap: 5 }}>
              <CheckCircle2 size={13} /> Completado
            </span>
          )}
        </div>
      )}
    </div>
  )
}
