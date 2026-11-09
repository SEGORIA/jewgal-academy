"use client"

import { Download, ExternalLink } from "lucide-react"

export function isPdfUrl(url: string | null | undefined) {
  return !!url && url.toLowerCase().split("?")[0].split("#")[0].endsWith(".pdf")
}

// Cloudinary: "fl_attachment" fuerza la descarga en vez de abrirlo en el navegador.
function downloadUrl(url: string) {
  return url.includes("/upload/") && !url.includes("fl_attachment") ? url.replace("/upload/", "/upload/fl_attachment/") : url
}

// Vista previa de un PDF dentro de la lección (workbooks, guías): el alumno y el
// admin lo leen ahí mismo, sin bajarlo. Los botones cubren el celular, donde
// algunos navegadores solo muestran la primera página del visor embebido.
export default function PdfViewer({ url, title }: { url: string; title: string }) {
  const btn: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 7, textDecoration: "none", padding: "8px 16px",
    borderRadius: 30, border: "1px solid rgba(165,141,102,.3)", background: "var(--surface)",
    color: "var(--gold)", fontSize: 12.5, fontWeight: 600,
  }
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
        <a href={url} target="_blank" rel="noopener noreferrer" style={btn}><ExternalLink size={13} /> Abrir en pantalla completa</a>
        <a href={downloadUrl(url)} style={btn}><Download size={13} /> Descargar PDF</a>
      </div>
      <iframe
        src={`${url}#view=FitH`}
        title={title}
        loading="lazy"
        style={{ width: "100%", height: "78vh", minHeight: 520, border: "1px solid rgba(165,141,102,.2)", borderRadius: 10, background: "#fff" }}
      />
    </div>
  )
}
