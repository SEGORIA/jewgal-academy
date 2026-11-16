"use client"

import { useState } from "react"
import { Check, Link2 } from "lucide-react"

type Props = { url: string; title: string; labels: { share: string; whatsapp: string; copy: string; copied: string } }

const pill: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 20,
  border: "1px solid var(--line-d)", background: "transparent", color: "var(--on-dark)",
  fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer", textDecoration: "none", fontFamily: "var(--sans)",
}

/** Botones para compartir un artículo: WhatsApp, Facebook, X y copiar el enlace. */
export default function ShareButtons({ url, title, labels }: Props) {
  const [copied, setCopied] = useState(false)
  const u = encodeURIComponent(url)
  const t = encodeURIComponent(title)

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Navegadores sin acceso al portapapeles: selección manual como último recurso.
      const el = document.createElement("textarea")
      el.value = url
      el.style.position = "fixed"; el.style.opacity = "0"
      document.body.appendChild(el); el.select()
      try { document.execCommand("copy") } catch { /* sin permiso: no se puede copiar */ }
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <span style={{ fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--on-dark-faint)", marginRight: 4 }}>{labels.share}</span>
      <a href={`https://wa.me/?text=${t}%20${u}`} target="_blank" rel="noopener noreferrer" style={pill}>{labels.whatsapp}</a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noopener noreferrer" style={pill}>Facebook</a>
      <a href={`https://twitter.com/intent/tweet?text=${t}&url=${u}`} target="_blank" rel="noopener noreferrer" style={pill}>X</a>
      <button type="button" onClick={copy} style={pill} aria-live="polite">
        {copied ? <Check size={13} /> : <Link2 size={13} />} {copied ? labels.copied : labels.copy}
      </button>
    </div>
  )
}
