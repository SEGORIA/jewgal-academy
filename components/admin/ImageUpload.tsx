"use client"

import { useRef, useState } from "react"
import { ImagePlus, Loader2, Trash2, Link2 } from "lucide-react"
import { uploadToCloudinary } from "@/lib/cloudinary-upload"
import { hintStyle, inputStyle, labelStyle } from "@/components/admin/ui"

/** Valida el archivo en el navegador antes de subirlo (tipo y tamaño). Devuelve el mensaje de error o null. */
export function checkImageFile(file: File, maxMB: number): string | null {
  if (!file.type.startsWith("image/")) return "El archivo tiene que ser una imagen (JPG, PNG, WebP o GIF)."
  if (file.size > maxMB * 1024 * 1024) return `La imagen pesa ${(file.size / 1024 / 1024).toFixed(1)} MB; el máximo es ${maxMB} MB.`
  return null
}

type Props = {
  value: string
  onChange: (url: string) => void
  /** Carpeta de Cloudinary (ej. "jewgal-blog"). */
  folder: string
  label?: string
  hint?: string
  /** Proporción de la vista previa (CSS aspect-ratio), ej. "16/9" o "1/1". */
  aspect?: string
  maxMB?: number
  /** Permite pegar un enlace a mano (por defecto sí). */
  allowUrl?: boolean
  /** Fondo de la vista previa para logos con transparencia. */
  contain?: boolean
  /** Muestra el botón para quitar la imagen (por defecto sí cuando hay una). */
  canRemove?: boolean
  removeLabel?: string
}

/**
 * Campo de imagen del panel: sube a Cloudinary con progreso, muestra la vista previa y permite quitarla o pegar un enlace.
 * La imagen viaja directo del navegador a Cloudinary (el servidor solo firma), así que no hay que tocar el código ni hacer push.
 */
export default function ImageUpload({ value, onChange, folder, label, hint, aspect = "16/9", maxMB = 8, allowUrl = true, contain, canRemove = true, removeLabel = "Quitar" }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [showUrl, setShowUrl] = useState(false)
  const uploading = progress !== null

  async function onFile(file: File | undefined) {
    if (!file) return
    const bad = checkImageFile(file, maxMB)
    if (bad) { setError(bad); return }
    setError("")
    setProgress(0)
    try {
      const url = await uploadToCloudinary(file, folder, setProgress)
      onChange(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir la imagen.")
    } finally {
      setProgress(null)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  return (
    <div>
      {label && <span style={labelStyle}>{label}</span>}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(120px, 200px) 1fr", gap: 14, alignItems: "start" }} className="admin-image-upload">
        <div style={{
          aspectRatio: aspect, borderRadius: 10, overflow: "hidden", background: "var(--surface-2)", border: "1px dashed var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
        }}>
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element -- vista previa de una URL externa cualquiera
            <img src={value} alt="Vista previa" style={{ width: "100%", height: "100%", objectFit: contain ? "contain" : "cover" }} />
          ) : (
            <ImagePlus size={26} style={{ color: "var(--text-faint)" }} aria-hidden />
          )}
          {uploading && (
            <div role="status" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.55)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13 }}>
              <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> {progress}%
            </div>
          )}
        </div>

        <div style={{ display: "grid", gap: 8, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input ref={fileRef} type="file" accept="image/*" hidden aria-label={label ? `Subir imagen: ${label}` : "Subir imagen"} onChange={(e) => onFile(e.target.files?.[0])} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={btn}>
              <ImagePlus size={14} /> {value ? "Cambiar imagen" : "Subir imagen"}
            </button>
            {value && canRemove && (
              <button type="button" onClick={() => onChange("")} disabled={uploading} style={{ ...btn, color: "var(--danger)" }}>
                <Trash2 size={14} /> {removeLabel}
              </button>
            )}
            {allowUrl && (
              <button type="button" onClick={() => setShowUrl((s) => !s)} style={btn} aria-expanded={showUrl}>
                <Link2 size={14} /> Pegar enlace
              </button>
            )}
          </div>
          {showUrl && (
            <input value={value} onChange={(e) => onChange(e.target.value.trim())} placeholder="https://…" aria-label="Enlace de la imagen" style={inputStyle} />
          )}
          {error && <p role="alert" style={{ fontSize: 12.5, color: "var(--danger)", lineHeight: 1.5 }}>{error}</p>}
          {hint && !error && <p style={hintStyle}>{hint}</p>}
        </div>
      </div>
    </div>
  )
}

const btn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 9, background: "transparent",
  border: "1px solid var(--border)", color: "var(--text-strong)", fontSize: 12.5, cursor: "pointer", fontFamily: "inherit",
}

/** Botón suelto para insertar una imagen dentro de un texto (por ejemplo, en el editor del blog). */
export function ImageInsertButton({ folder, onUploaded, onError, maxMB = 8, children }: {
  folder: string; onUploaded: (url: string) => void; onError?: (msg: string) => void; maxMB?: number; children?: React.ReactNode
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" hidden aria-label="Subir imagen para insertar" onChange={async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const bad = checkImageFile(file, maxMB)
        if (bad) { onError?.(bad); return }
        setBusy(true)
        try { onUploaded(await uploadToCloudinary(file, folder, () => {})) }
        catch (err) { onError?.(err instanceof Error ? err.message : "No se pudo subir la imagen.") }
        finally { setBusy(false); if (fileRef.current) fileRef.current.value = "" }
      }} />
      <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} style={btn} title="Subir e insertar imagen">
        {busy ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <ImagePlus size={14} />} {children ?? "Imagen"}
      </button>
    </>
  )
}
