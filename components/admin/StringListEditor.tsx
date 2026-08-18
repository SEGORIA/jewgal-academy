"use client"

import { useState } from "react"
import { GripVertical, ChevronUp, ChevronDown, Trash2, Plus } from "lucide-react"

const inputStyle: React.CSSProperties = { background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.2)", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: "var(--text)", outline: "none", fontFamily: "inherit", width: "100%" }

export default function StringListEditor({ items, onChange, placeholder }: { items: string[]; onChange: (items: string[]) => void; placeholder?: string }) {
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
