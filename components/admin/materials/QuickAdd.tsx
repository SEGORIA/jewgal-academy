"use client"

import { useState } from "react"
import { Link2, FileText, Wand2, X, Eye, EyeOff } from "lucide-react"
import type { ContentBlock } from "@/lib/materials-content"
import { textToBlocks } from "@/lib/text-to-blocks"
import { videoBlockFromUrl } from "@/lib/video-links"
import ContentBlockView from "@/components/aula/materials/ContentBlockView"

const field: React.CSSProperties = { background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.2)", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: "var(--text)", outline: "none", fontFamily: "inherit", width: "100%" }
const tool: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 7, background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.3)", color: "var(--gold)", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }

// Atajos para armar una lección sin tocar bloques uno por uno:
//  · pegar un link de video → se agrega el bloque correcto solo
//  · pegar el texto de un documento → se convierte en títulos, párrafos y listas
export default function QuickAdd({ blocks, onChange }: { blocks: ContentBlock[]; onChange: (blocks: ContentBlock[]) => void }) {
  const [link, setLink] = useState("")
  const [linkMsg, setLinkMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [showText, setShowText] = useState(false)
  const [text, setText] = useState("")
  const [textMsg, setTextMsg] = useState("")

  function addLink(raw: string) {
    if (!raw.trim()) return
    const block = videoBlockFromUrl(raw)
    if (!block) { setLinkMsg({ ok: false, text: "No reconocí ese link como un video (YouTube, Vimeo o archivo .mp4). Probá con el link completo." }); return }
    onChange([...blocks, block])
    setLink("")
    setLinkMsg({ ok: true, text: block.type === "video-youtube" ? "Video de YouTube agregado ✓" : block.type === "video-vimeo" ? "Video de Vimeo agregado ✓" : "Video agregado ✓" })
    setTimeout(() => setLinkMsg(null), 2500)
  }

  function convertText() {
    const converted = textToBlocks(text)
    if (!converted.length) { setTextMsg("No encontré texto para convertir."); return }
    onChange([...blocks, ...converted])
    const h = converted.filter((b) => b.type === "heading").length
    const l = converted.filter((b) => b.type === "list").length
    setTextMsg(`Listo: ${converted.length} bloques (${h} título${h === 1 ? "" : "s"}, ${l} lista${l === 1 ? "" : "s"}, ${converted.length - h - l} párrafo${converted.length - h - l === 1 ? "" : "s"}). Revisalos abajo y ajustá lo que haga falta.`)
    setText("")
    setShowText(false)
  }

  return (
    <div style={{ border: "1px dashed rgba(165,141,102,.4)", borderRadius: 12, padding: "14px 16px", background: "rgba(165,141,102,.05)" }}>
      <p style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, color: "var(--gold)", marginBottom: 10 }}>
        <Wand2 size={14} /> Armado rápido
      </p>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Link2 size={14} style={{ position: "absolute", left: 12, top: 13, color: "var(--text-faint)" }} />
          <input
            value={link}
            onChange={(e) => { setLink(e.target.value); setLinkMsg(null) }}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData("text")
              if (videoBlockFromUrl(pasted)) { e.preventDefault(); addLink(pasted) }
            }}
            onKeyDown={(e) => { if (e.key === "Enter") addLink(link) }}
            placeholder="Pegá un link de YouTube, Vimeo o video y se agrega solo"
            style={{ ...field, paddingLeft: 34 }}
          />
        </div>
        <button onClick={() => addLink(link)} disabled={!link.trim()} style={{ ...tool, opacity: link.trim() ? 1 : 0.5 }}>Agregar video</button>
        <button onClick={() => { setShowText((v) => !v); setTextMsg("") }} style={tool}><FileText size={13} /> Pegar texto de un documento</button>
      </div>
      {linkMsg && <p style={{ fontSize: 12, marginTop: 8, color: linkMsg.ok ? "#4a9d6f" : "var(--danger)" }}>{linkMsg.text}</p>}

      {showText && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Copiá el texto de Word, Google Docs o un PDF y pegalo acá. Reconoce títulos (1.1, UNIDAD…), listas y tablas.</span>
            <button onClick={() => setShowText(false)} title="Cerrar" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)" }}><X size={15} /></button>
          </div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={9} placeholder={"UNIDAD 1 — Título\n\n1.1 Primer tema\nTexto del tema…\n\n• Punto uno\n• Punto dos"} style={{ ...field, resize: "vertical", lineHeight: 1.5 }} />
          <button onClick={convertText} disabled={!text.trim()} style={{ ...tool, marginTop: 10, background: "var(--gold)", color: "#2C1F14", border: "none", opacity: text.trim() ? 1 : 0.5 }}>
            <Wand2 size={13} /> Convertir en bloques
          </button>
        </div>
      )}
      {textMsg && <p style={{ fontSize: 12, marginTop: 8, color: textMsg.startsWith("Listo") ? "#4a9d6f" : "var(--danger)" }}>{textMsg}</p>}
    </div>
  )
}

// Vista previa en vivo: la lección tal como la verá el alumno, mientras se arma.
export function LivePreview({ blocks }: { blocks: ContentBlock[] }) {
  const [open, setOpen] = useState(false)
  if (blocks.length === 0) return null
  return (
    <div>
      <button onClick={() => setOpen((v) => !v)} style={tool}>
        {open ? <EyeOff size={13} /> : <Eye size={13} />} {open ? "Ocultar vista previa" : "Ver como lo verá el alumno"}
      </button>
      {open && (
        <div style={{ marginTop: 12, border: "1px solid rgba(165,141,102,.2)", borderRadius: 12, padding: "22px 24px", background: "var(--bg)", display: "flex", flexDirection: "column", gap: 12 }}>
          {blocks.map((b, i) => <ContentBlockView key={i} block={b} />)}
        </div>
      )}
    </div>
  )
}
