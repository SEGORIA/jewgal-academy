"use client"

import { useState } from "react"
import { GripVertical, ChevronUp, ChevronDown, Trash2, Plus } from "lucide-react"

const inputStyle: React.CSSProperties = { background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.2)", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: "var(--text)", outline: "none", fontFamily: "inherit", width: "100%" }

export type LinkItem = { label: string; url: string }

export default function LinkListEditor({ items, onChange, labelPlaceholder, urlPlaceholder }: {
  items: LinkItem[]
  onChange: (items: LinkItem[]) => void
  labelPlaceholder?: string
  urlPlaceholder?: string
}) {
  const [draftLabel, setDraftLabel] = useState("")
  const [draftUrl, setDraftUrl] = useState("")

  function update(i: number, item: LinkItem) {
    onChange(items.map((it, idx) => (idx === i ? item : it)))
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
    const label = draftLabel.trim()
    const url = draftUrl.trim()
    if (!label || !url) return
    onChange([...items, { label, url }])
    setDraftLabel("")
    setDraftUrl("")
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <GripVertical size={13} style={{ color: "var(--text-faint)", flexShrink: 0 }} />
          <input value={item.label} onChange={(e) => update(i, { ...item, label: e.target.value })} placeholder="Título" style={{ ...inputStyle, flex: 1 }} />
          <input value={item.url} onChange={(e) => update(i, { ...item, url: e.target.value })} placeholder="https://…" style={{ ...inputStyle, flex: 1 }} />
          <button onClick={() => move(i, -1)} disabled={i === 0} title="Subir" style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface-2)", cursor: i === 0 ? "default" : "pointer", color: "var(--text-muted)", opacity: i === 0 ? 0.3 : 1, flexShrink: 0 }}><ChevronUp size={13} /></button>
          <button onClick={() => move(i, 1)} disabled={i === items.length - 1} title="Bajar" style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface-2)", cursor: i === items.length - 1 ? "default" : "pointer", color: "var(--text-muted)", opacity: i === items.length - 1 ? 0.3 : 1, flexShrink: 0 }}><ChevronDown size={13} /></button>
          <button onClick={() => remove(i)} title="Eliminar" style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid rgba(239,68,68,.25)", background: "rgba(239,68,68,.06)", cursor: "pointer", color: "var(--danger)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={12} /></button>
        </div>
      ))}
      <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
        <input
          value={draftLabel}
          onChange={(e) => setDraftLabel(e.target.value)}
          placeholder={labelPlaceholder || "Título"}
          style={{ ...inputStyle, flex: 1 }}
        />
        <input
          value={draftUrl}
          onChange={(e) => setDraftUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add() } }}
          placeholder={urlPlaceholder || "https://…"}
          style={{ ...inputStyle, flex: 1 }}
        />
        <button onClick={add} style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface-2)", border: "1px dashed rgba(165,141,102,.4)", color: "var(--gold)", borderRadius: 8, padding: "0 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
          <Plus size={13} /> Agregar
        </button>
      </div>
    </div>
  )
}
