"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react"

export type QuizQuestionView = { question: string; options: string[]; multiple: boolean }
export type QuizResult = {
  score: number
  total: number
  perQuestion: { correct: boolean; correctIndexes: number[] }[]
  certificateIssued?: boolean
  certificateNumber?: string | null
}

export default function QuizView({
  materialId,
  questions,
  previousScore,
  onGraded,
}: {
  materialId: string
  questions: QuizQuestionView[]
  previousScore?: { quizScore: number; quizTotal: number } | null
  onGraded?: (result: QuizResult) => void
}) {
  const [selected, setSelected] = useState<number[][]>(() => questions.map(() => []))
  const [result, setResult] = useState<QuizResult | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function toggleOption(qIndex: number, optIndex: number, multiple: boolean) {
    setSelected((prev) => {
      const next = prev.map((arr) => [...arr])
      if (multiple) {
        const has = next[qIndex].includes(optIndex)
        next[qIndex] = has ? next[qIndex].filter((i) => i !== optIndex) : [...next[qIndex], optIndex]
      } else {
        next[qIndex] = [optIndex]
      }
      return next
    })
  }

  async function submit() {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/me/materials/${materialId}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: selected }),
      })
      if (!res.ok) return
      const data: QuizResult = await res.json()
      setResult(data)
      onGraded?.(data)
    } finally {
      setSubmitting(false)
    }
  }

  function retry() {
    setSelected(questions.map(() => []))
    setResult(null)
  }

  const allAnswered = selected.every((s) => s.length > 0)

  return (
    <div>
      {previousScore && !result && (
        <p style={{ fontSize: 12.5, color: "var(--text-dim)", marginBottom: 16 }}>
          Tu último puntaje: <strong style={{ color: "var(--gold)" }}>{previousScore.quizScore}/{previousScore.quizTotal}</strong>
        </p>
      )}

      {result && (
        <div style={{
          background: "rgba(165,141,102,.1)", border: "1px solid rgba(165,141,102,.25)",
          borderRadius: 12, padding: "16px 20px", marginBottom: 24,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
        }}>
          <span style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--text)" }}>
            Puntaje: <strong style={{ color: "var(--gold)" }}>{result.score}/{result.total}</strong>
          </span>
          <button
            onClick={retry}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8,
              border: "1px solid rgba(165,141,102,.25)", background: "transparent",
              color: "var(--gold)", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
            }}
          >
            <RotateCcw size={13} /> Reintentar
          </button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {questions.map((q, qi) => {
          const graded = result?.perQuestion[qi]
          return (
            <div key={qi} style={{
              background: "var(--surface)", border: "1px solid rgba(165,141,102,.14)",
              borderRadius: 12, padding: "18px 20px",
            }}>
              <p style={{ fontSize: 14.5, color: "var(--text)", fontWeight: 500, marginBottom: 14 }}>
                {qi + 1}. {q.question}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {q.options.map((opt, oi) => {
                  const isSelected = selected[qi]?.includes(oi)
                  const isCorrectAnswer = graded?.correctIndexes.includes(oi)
                  const showFeedback = !!graded
                  let borderColor = "rgba(165,141,102,.18)"
                  let bg = "transparent"
                  if (showFeedback) {
                    if (isCorrectAnswer) { borderColor = "#4a9d6f"; bg = "rgba(74,157,111,.1)" }
                    else if (isSelected && !isCorrectAnswer) { borderColor = "#c0564f"; bg = "rgba(192,86,79,.08)" }
                  } else if (isSelected) {
                    borderColor = "var(--gold)"
                    bg = "rgba(165,141,102,.1)"
                  }
                  return (
                    <label
                      key={oi}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                        borderRadius: 8, border: `1px solid ${borderColor}`, background: bg,
                        cursor: showFeedback ? "default" : "pointer", fontSize: 13.5, color: "var(--text-muted)",
                      }}
                    >
                      <input
                        type={q.multiple ? "checkbox" : "radio"}
                        name={`q${qi}`}
                        checked={!!isSelected}
                        disabled={showFeedback}
                        onChange={() => toggleOption(qi, oi, q.multiple)}
                        style={{ accentColor: "var(--gold)" }}
                      />
                      {opt}
                      {showFeedback && isCorrectAnswer && <CheckCircle2 size={14} color="#4a9d6f" style={{ marginLeft: "auto" }} />}
                      {showFeedback && isSelected && !isCorrectAnswer && <XCircle size={14} color="#c0564f" style={{ marginLeft: "auto" }} />}
                    </label>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {!result && (
        <motion.button
          onClick={submit}
          disabled={!allAnswered || submitting}
          whileHover={allAnswered ? { scale: 1.02 } : {}}
          style={{
            marginTop: 22, padding: "12px 28px", borderRadius: 30,
            background: allAnswered ? "linear-gradient(135deg,#A76D61 0%,#C49F72 100%)" : "rgba(165,141,102,.2)",
            border: "none", color: "#fff", fontSize: 13.5, fontWeight: 600,
            cursor: allAnswered ? "pointer" : "not-allowed",
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? "Corrigiendo…" : "Corregir"}
        </motion.button>
      )}
    </div>
  )
}
