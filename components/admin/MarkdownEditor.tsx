"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { Bold, Eye, Heading2, Heading3, Italic, Link2, List, ListOrdered, Minus, Pencil, Quote } from "lucide-react"
import { ImageInsertButton } from "@/components/admin/ImageUpload"
import { hintStyle, inputStyle, labelStyle, useToast } from "@/components/admin/ui"
import { MarkdownLite } from "@/lib/markdown-lite"
import { markdownToPlainText, readMinutes } from "@/lib/markdown-text"

type Props = {
  value: string
  onChange: (v: string) => void
  label: string
  ariaLabel?: string
  placeholder?: string
  rows?: number
  /** Carpeta de Cloudinary para las imágenes que se insertan en el texto. */
  imageFolder?: string
  /** Muestra palabras y minutos de lectura (por defecto sí). */
  showStats?: boolean
}

/**
 * Editor de texto con formato (Markdown ligero) para artículos y páginas: barra de herramientas, vista previa y subida de
 * imágenes dentro del texto. Es el mismo formato que dibuja el sitio (`lib/markdown-lite.tsx`).
 */
export default function MarkdownEditor({ value, onChange, label, ariaLabel, placeholder, rows = 18, imageFolder = "jewgal-blog", showStats = true }: Props) {
  const toast = useToast()
  const taRef = useRef<HTMLTextAreaElement>(null)
  const pendingSel = useRef<{ start: number; end: number } | null>(null)
  const [preview, setPreview] = useState(false)

  // Después de que React escribe el texto nuevo, se restaura la selección (así funciona aunque la pestaña esté en segundo plano).
  useLayoutEffect(() => {
    const sel = pendingSel.current
    const ta = taRef.current
    if (sel && ta) { pendingSel.current = null; ta.focus(); ta.setSelectionRange(sel.start, sel.end) }
  })

  function edit(fn: (v: string, s: number, e: number) => { value: string; start: number; end: number }) {
    const ta = taRef.current
    if (!ta || preview) return
    const r = fn(ta.value, ta.selectionStart, ta.selectionEnd)
    pendingSel.current = { start: r.start, end: r.end }
    onChange(r.value)
  }
  const wrap = (before: string, after: string, placeholderText: string) => edit((v, s, e) => {
    const sel = v.slice(s, e) || placeholderText
    return { value: v.slice(0, s) + before + sel + after + v.slice(e), start: s + before.length, end: s + before.length + sel.length }
  })
  // Aplica (o quita, si ya estaba) un prefijo de línea: título, lista, cita. Reemplaza otro prefijo que ya tuviera la línea.
  const linePrefix = (prefix: (i: number) => string) => edit((v, s, e) => {
    const lineStart = s === 0 ? 0 : v.lastIndexOf("\n", s - 1) + 1
    const nl = v.indexOf("\n", e)
    const lineEnd = nl === -1 ? v.length : nl
    const lines = v.slice(lineStart, lineEnd).split("\n")
    const filled = lines.map((l) => l.trim() !== "")
    let n = -1
    const prefixes = lines.map((_, i) => (filled[i] ? prefix(++n) : ""))
    const allHave = lines.every((l, i) => !filled[i] || l.startsWith(prefixes[i]))
    const out = lines.map((l, i) => (!filled[i] ? l : allHave ? l.slice(prefixes[i].length) : prefixes[i] + l.replace(/^(?:#{1,4}[ ]+|[-*+][ ]+|\d+[.)][ ]+|>[ ]?)/, ""))).join("\n")
    return { value: v.slice(0, lineStart) + out + v.slice(lineEnd), start: lineStart, end: lineStart + out.length }
  })
  const insertBlock = (text: string) => edit((v, s, e) => {
    const before = v.slice(0, s)
    const after = v.slice(e)
    const lead = !before ? "" : before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n"
    const trail = !after ? "\n" : after.startsWith("\n\n") ? "" : after.startsWith("\n") ? "\n" : "\n\n"
    const ins = lead + text + trail
    const pos = before.length + ins.length
    return { value: before + ins + after, start: pos, end: pos }
  })
  const insertLink = () => edit((v, s, e) => {
    const sel = v.slice(s, e) || "texto del enlace"
    const ins = `[${sel}](https://)`
    const urlStart = s + sel.length + 3
    return { value: v.slice(0, s) + ins + v.slice(e), start: urlStart, end: urlStart + "https://".length }
  })

  const words = markdownToPlainText(value).split(" ").filter(Boolean).length

  return (
    <div>
      <span style={labelStyle}>{label}</span>
      <div role="toolbar" aria-label="Formato" style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center", padding: 6, border: "1px solid var(--border)", borderBottom: "none", borderRadius: "9px 9px 0 0", background: "var(--surface-2)" }}>
        <ToolBtn label="Título grande" onClick={() => linePrefix(() => "## ")} disabled={preview}><Heading2 size={15} /></ToolBtn>
        <ToolBtn label="Subtítulo" onClick={() => linePrefix(() => "### ")} disabled={preview}><Heading3 size={15} /></ToolBtn>
        <ToolBtn label="Negrita" onClick={() => wrap("**", "**", "texto en negrita")} disabled={preview}><Bold size={15} /></ToolBtn>
        <ToolBtn label="Cursiva" onClick={() => wrap("*", "*", "texto en cursiva")} disabled={preview}><Italic size={15} /></ToolBtn>
        <ToolBtn label="Enlace" onClick={insertLink} disabled={preview}><Link2 size={15} /></ToolBtn>
        <ToolBtn label="Lista" onClick={() => linePrefix(() => "- ")} disabled={preview}><List size={15} /></ToolBtn>
        <ToolBtn label="Lista numerada" onClick={() => linePrefix((i) => `${i + 1}. `)} disabled={preview}><ListOrdered size={15} /></ToolBtn>
        <ToolBtn label="Cita" onClick={() => linePrefix(() => "> ")} disabled={preview}><Quote size={15} /></ToolBtn>
        <ToolBtn label="Separador" onClick={() => insertBlock("---")} disabled={preview}><Minus size={15} /></ToolBtn>
        <ImageInsertButton folder={imageFolder} onUploaded={(url) => insertBlock(`![descripción de la imagen](${url})`)} onError={(m) => toast("error", m)}>Imagen</ImageInsertButton>
        <span style={{ flex: 1 }} />
        <ToolBtn label={preview ? "Volver a editar" : "Vista previa"} onClick={() => setPreview((p) => !p)} active={preview}>
          {preview ? <Pencil size={15} /> : <Eye size={15} />}<span style={{ fontSize: 12.5 }}>{preview ? "Editar" : "Vista previa"}</span>
        </ToolBtn>
      </div>
      {preview ? (
        <div style={{ border: "1px solid var(--border)", borderRadius: "0 0 9px 9px", padding: "20px 22px", minHeight: 360, background: "var(--surface)" }}>
          {value.trim() ? <MarkdownLite source={value} className="prose-jg prose-admin" /> : <p style={{ color: "var(--text-faint)", fontSize: 14 }}>Todavía no hay texto para mostrar.</p>}
        </div>
      ) : (
        <textarea
          ref={taRef} value={value} onChange={(e) => onChange(e.target.value)} rows={rows}
          placeholder={placeholder ?? "Escribí acá. Separá los párrafos con una línea en blanco."}
          style={{ ...inputStyle, borderRadius: "0 0 9px 9px", resize: "vertical", lineHeight: 1.7, minHeight: 360, fontFamily: "inherit" }}
          aria-label={ariaLabel ?? label}
        />
      )}
      <p style={hintStyle}>
        {showStats && <>{words} palabras · ~{readMinutes(value)} min de lectura · </>}Formato: <code>**negrita**</code>, <code>*cursiva*</code>, <code>## título</code>, <code>- lista</code>, <code>&gt; cita</code>, <code>![pie de foto](imagen)</code>.
      </p>
    </div>
  )
}

function ToolBtn({ label, onClick, children, disabled, active }: { label: string; onClick: () => void; children: React.ReactNode; disabled?: boolean; active?: boolean }) {
  return (
    <button
      type="button" title={label} aria-label={label} onClick={onClick} disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, minWidth: 32, height: 32, padding: "0 8px", justifyContent: "center", borderRadius: 7, cursor: disabled ? "not-allowed" : "pointer",
        border: `1px solid ${active ? "var(--gold-ink)" : "transparent"}`, background: active ? "color-mix(in srgb, var(--gold-ink) 14%, transparent)" : "transparent",
        color: active ? "var(--gold-ink)" : "var(--text-strong)", opacity: disabled ? 0.4 : 1, fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  )
}
