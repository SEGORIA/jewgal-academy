"use client"

import { ChevronUp, ChevronDown, Trash2, Plus } from "lucide-react"
import type { QuizQuestion } from "@/lib/materials-content"

const inputStyle: React.CSSProperties = { background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.2)", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: "var(--text)", outline: "none", fontFamily: "inherit", width: "100%" }

function smallBtn(disabled: boolean): React.CSSProperties {
  return { width: 26, height: 26, borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface-2)", cursor: disabled ? "default" : "pointer", color: "var(--text-muted)", opacity: disabled ? 0.3 : 1, display: "flex", alignItems: "center", justifyContent: "center" }
}

function emptyQuestion(): QuizQuestion {
  return { question: "", options: ["", ""], correctIndexes: [] }
}

export default function QuizEditor({ questions, onChange }: { questions: QuizQuestion[]; onChange: (questions: QuizQuestion[]) => void }) {
  function update(i: number, q: QuizQuestion) {
    onChange(questions.map((existing, idx) => (idx === i ? q : existing)))
  }
  function remove(i: number) {
    onChange(questions.filter((_, idx) => idx !== i))
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= questions.length) return
    const next = [...questions]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  function addQuestion() {
    onChange([...questions, emptyQuestion()])
  }

  function updateOption(qi: number, oi: number, value: string) {
    const q = questions[qi]
    update(qi, { ...q, options: q.options.map((o, idx) => (idx === oi ? value : o)) })
  }
  function removeOption(qi: number, oi: number) {
    const q = questions[qi]
    update(qi, {
      ...q,
      options: q.options.filter((_, idx) => idx !== oi),
      correctIndexes: q.correctIndexes.filter((ci) => ci !== oi).map((ci) => (ci > oi ? ci - 1 : ci)),
    })
  }
  function addOption(qi: number) {
    const q = questions[qi]
    update(qi, { ...q, options: [...q.options, ""] })
  }
  function toggleCorrect(qi: number, oi: number) {
    const q = questions[qi]
    const has = q.correctIndexes.includes(oi)
    update(qi, { ...q, correctIndexes: has ? q.correctIndexes.filter((ci) => ci !== oi) : [...q.correctIndexes, oi] })
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {questions.map((q, qi) => (
        <div key={qi} style={{ border: "1px solid rgba(165,141,102,.16)", borderRadius: 10, padding: "14px 16px", background: "var(--surface)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 600 }}>
              Pregunta {qi + 1}
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => move(qi, -1)} disabled={qi === 0} title="Subir" style={smallBtn(qi === 0)}><ChevronUp size={13} /></button>
              <button onClick={() => move(qi, 1)} disabled={qi === questions.length - 1} title="Bajar" style={smallBtn(qi === questions.length - 1)}><ChevronDown size={13} /></button>
              <button onClick={() => remove(qi)} title="Eliminar" style={{ ...smallBtn(false), border: "1px solid rgba(239,68,68,.25)", background: "rgba(239,68,68,.06)", color: "var(--danger)" }}><Trash2 size={12} /></button>
            </div>
          </div>

          <input
            value={q.question}
            onChange={(e) => update(qi, { ...q, question: e.target.value })}
            placeholder="Texto de la pregunta"
            style={{ ...inputStyle, marginBottom: 10 }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {q.options.map((opt, oi) => (
              <div key={oi} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={q.correctIndexes.includes(oi)}
                  onChange={() => toggleCorrect(qi, oi)}
                  title="Marcar como correcta"
                />
                <input
                  value={opt}
                  onChange={(e) => updateOption(qi, oi, e.target.value)}
                  placeholder={`Opción ${oi + 1}`}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  onClick={() => removeOption(qi, oi)}
                  disabled={q.options.length <= 2}
                  title="Eliminar opción"
                  style={{ ...smallBtn(q.options.length <= 2), border: "1px solid rgba(239,68,68,.25)", background: "rgba(239,68,68,.06)", color: "var(--danger)" }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => addOption(qi)}
            style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, background: "var(--surface-2)", border: "1px dashed rgba(165,141,102,.4)", color: "var(--gold)", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
          >
            <Plus size={12} /> Agregar opción
          </button>
        </div>
      ))}

      <button
        onClick={addQuestion}
        style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface-2)", border: "1px dashed rgba(165,141,102,.4)", color: "var(--gold)", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
      >
        <Plus size={13} /> Agregar pregunta
      </button>
    </div>
  )
}
