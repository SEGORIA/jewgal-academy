"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown, Trash2, Plus, AlertCircle, Upload, Loader2, X } from "lucide-react"
import type { ContentBlock } from "@/lib/materials-content"
import { getYouTubeEmbedUrl, getVimeoEmbedUrl } from "@/lib/program-content"
import StringListEditor from "@/components/admin/StringListEditor"
import LinkListEditor from "@/components/admin/LinkListEditor"

const inputStyle: React.CSSProperties = { background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.2)", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: "var(--text)", outline: "none", fontFamily: "inherit", width: "100%" }

const BLOCK_LABELS: Record<ContentBlock["type"], string> = {
  heading: "Título",
  paragraph: "Párrafo",
  list: "Lista",
  divider: "Separador",
  "video-youtube": "Video de YouTube",
  "video-vimeo": "Video de Vimeo",
  slides: "Diapositivas",
  "video-cloudinary": "Video (archivo propio)",
  "video-grid": "Grilla de sub-clips",
  "unit-resources": "Recursos de la unidad",
}

function emptyBlock(type: ContentBlock["type"]): ContentBlock {
  switch (type) {
    case "heading": return { type: "heading", level: 2, text: "" }
    case "paragraph": return { type: "paragraph", text: "" }
    case "list": return { type: "list", ordered: false, items: [] }
    case "divider": return { type: "divider" }
    case "video-youtube": return { type: "video-youtube", url: "" }
    case "video-vimeo": return { type: "video-vimeo", url: "" }
    case "slides": return { type: "slides", images: [] }
    case "video-cloudinary": return { type: "video-cloudinary", url: "" }
    case "video-grid": return { type: "video-grid", items: [{ title: "", provider: "cloudinary", url: "" }] }
    case "unit-resources": return { type: "unit-resources", videos: [], readings: [], quotes: [], links: [] }
  }
}

function smallBtn(disabled: boolean): React.CSSProperties {
  return { width: 26, height: 26, borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface-2)", cursor: disabled ? "default" : "pointer", color: "var(--text-muted)", opacity: disabled ? 0.3 : 1, display: "flex", alignItems: "center", justifyContent: "center" }
}

// Sube un archivo al mismo endpoint firmado que ya usaban las diapositivas
// (auto/upload detecta el tipo solo — sirve igual para imagen o video).
// A diferencia del helper original, reporta progreso: para un video de
// varios MB no tener feedback deja al admin sin saber si sigue subiendo.
function uploadToCloudinary(file: File, folder: string, onProgress: (pct: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const sigRes = await fetch("/api/admin/cloudinary-signature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder }),
        })
        if (!sigRes.ok) {
          const d = await sigRes.json()
          reject(new Error(d.error ?? "Cloudinary no está configurado"))
          return
        }
        const { timestamp, signature, apiKey, cloudName, folder: signedFolder } = await sigRes.json()

        const formData = new FormData()
        formData.append("file", file)
        formData.append("timestamp", String(timestamp))
        formData.append("signature", signature)
        formData.append("api_key", apiKey)
        formData.append("folder", signedFolder)

        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
        }
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText).secure_url)
          else reject(new Error(`Error al subir: ${xhr.status}`))
        }
        xhr.onerror = () => reject(new Error("Error de red al subir"))
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`)
        xhr.send(formData)
      } catch (err) {
        reject(err instanceof Error ? err : new Error("Error al subir el archivo"))
      }
    })()
  })
}

// Botón chico de subida reutilizado por video/poster en varios bloques —
// mismo look que el de diapositivas, pero genérico (recibe accept + folder
// + qué hacer con la URL resultante). onProgress se reenvía al estado del
// padre para que el "Subiendo… N%" refleje el progreso real, no un valor
// fijo — importante para video, que puede tardar bastante más que una
// imagen de diapositiva.
function UploadSlot({ label, accept, folder, uploadKey, uploading, progress, onStart, onProgress, onDone, onError }: {
  label: string
  accept: string
  folder: string
  uploadKey: string
  uploading: string | null
  progress: number
  onStart: (key: string) => void
  onProgress: (pct: number) => void
  onDone: (url: string) => void
  onError: (msg: string) => void
}) {
  const isUploading = uploading === uploadKey
  return (
    <label style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      border: "1px dashed var(--border)", borderRadius: 8, padding: "9px",
      fontSize: 12, color: "var(--text-muted)", cursor: isUploading ? "wait" : "pointer",
    }}>
      {isUploading ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Upload size={13} />}
      {isUploading ? `Subiendo… ${progress}%` : label}
      <input
        type="file"
        accept={accept}
        disabled={uploading !== null}
        onChange={async (e) => {
          const f = e.target.files?.[0]
          e.target.value = ""
          if (!f) return
          onStart(uploadKey)
          try {
            const url = await uploadToCloudinary(f, folder, onProgress)
            onDone(url)
          } catch (err) {
            onError(err instanceof Error ? err.message : "Error al subir el archivo")
          }
        }}
        style={{ display: "none" }}
      />
    </label>
  )
}

export default function ContentBlockEditor({ blocks, onChange }: { blocks: ContentBlock[]; onChange: (blocks: ContentBlock[]) => void }) {
  const [uploading, setUploading] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState("")

  function update(i: number, block: ContentBlock) {
    onChange(blocks.map((b, idx) => (idx === i ? block : b)))
  }
  function remove(i: number) {
    onChange(blocks.filter((_, idx) => idx !== i))
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= blocks.length) return
    const next = [...blocks]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  function add(type: ContentBlock["type"]) {
    onChange([...blocks, emptyBlock(type)])
  }

  function startUpload(key: string) {
    setUploadError("")
    setUploadProgress(0)
    setUploading(key)
  }
  function finishUpload() {
    setUploading(null)
    setUploadProgress(0)
  }
  function failUpload(msg: string) {
    setUploadError(msg)
    finishUpload()
  }

  async function uploadSlideImage(blockIndex: number, file: File) {
    startUpload(`slide:${blockIndex}`)
    try {
      const url = await uploadToCloudinary(file, "jewgal-lecciones-slides", setUploadProgress)
      const block = blocks[blockIndex]
      if (block.type === "slides") {
        update(blockIndex, { ...block, images: [...block.images, url] })
      }
      finishUpload()
    } catch (err) {
      failUpload(err instanceof Error ? err.message : "Error al subir el archivo")
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {blocks.map((block, i) => (
        <div key={i} style={{ border: "1px solid rgba(165,141,102,.16)", borderRadius: 10, padding: "14px 16px", background: "var(--surface)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 600 }}>
              {BLOCK_LABELS[block.type]}
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => move(i, -1)} disabled={i === 0} title="Subir" style={smallBtn(i === 0)}><ChevronUp size={13} /></button>
              <button onClick={() => move(i, 1)} disabled={i === blocks.length - 1} title="Bajar" style={smallBtn(i === blocks.length - 1)}><ChevronDown size={13} /></button>
              <button onClick={() => remove(i)} title="Eliminar" style={{ ...smallBtn(false), border: "1px solid rgba(239,68,68,.25)", background: "rgba(239,68,68,.06)", color: "var(--danger)" }}><Trash2 size={12} /></button>
            </div>
          </div>

          {block.type === "heading" && (
            <div style={{ display: "flex", gap: 8 }}>
              <select value={block.level} onChange={(e) => update(i, { ...block, level: Number(e.target.value) as 1 | 2 | 3 })} style={{ ...inputStyle, width: 90 }}>
                <option value={1}>H1</option>
                <option value={2}>H2</option>
                <option value={3}>H3</option>
              </select>
              <input value={block.text} onChange={(e) => update(i, { ...block, text: e.target.value })} placeholder="Texto del título" style={{ ...inputStyle, flex: 1 }} />
            </div>
          )}

          {block.type === "paragraph" && (
            <textarea value={block.text} onChange={(e) => update(i, { ...block, text: e.target.value })} rows={3} placeholder="Texto del párrafo" style={{ ...inputStyle, resize: "vertical" }} />
          )}

          {block.type === "list" && (
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
                <input type="checkbox" checked={block.ordered} onChange={(e) => update(i, { ...block, ordered: e.target.checked })} />
                Lista numerada
              </label>
              <StringListEditor items={block.items} onChange={(items) => update(i, { ...block, items })} placeholder="Agregar ítem…" />
            </div>
          )}

          {block.type === "divider" && (
            <p style={{ fontSize: 12, color: "var(--text-faint)" }}>Línea separadora — sin contenido para editar.</p>
          )}

          {(block.type === "video-youtube" || block.type === "video-vimeo") && (
            <div>
              <input
                value={block.url}
                onChange={(e) => update(i, { ...block, url: e.target.value })}
                placeholder={block.type === "video-youtube" ? "https://www.youtube.com/watch?v=…" : "https://vimeo.com/…"}
                style={inputStyle}
              />
              {block.url.trim() && (
                (block.type === "video-youtube" ? getYouTubeEmbedUrl(block.url) : getVimeoEmbedUrl(block.url)) ? (
                  <div style={{ marginTop: 10, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(165,141,102,.18)", maxWidth: 360, aspectRatio: "16 / 9", position: "relative" }}>
                    <iframe
                      src={(block.type === "video-youtube" ? getYouTubeEmbedUrl(block.url) : getVimeoEmbedUrl(block.url))!}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--warning)", marginTop: 6 }}>
                    <AlertCircle size={13} /> No parece un link válido. Se guardará igual, pero no se va a mostrar.
                  </p>
                )
              )}
              <input
                value={block.caption ?? ""}
                onChange={(e) => update(i, { ...block, caption: e.target.value || undefined })}
                placeholder="Descripción opcional debajo del video"
                style={{ ...inputStyle, marginTop: 8 }}
              />
              <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
                {block.posterUrl && <img src={block.posterUrl} alt="" style={{ width: 56, height: 42, objectFit: "cover", borderRadius: 6, border: "1px solid var(--border)" }} />}
                <div style={{ flex: 1 }}>
                  <UploadSlot
                    label={block.posterUrl ? "Cambiar portada" : "Agregar portada (se ve antes de reproducir)"}
                    accept="image/*"
                    folder="jewgal-lecciones-posters"
                    uploadKey={`poster:${i}`}
                    uploading={uploading}
                    progress={uploadProgress}
                    onStart={startUpload}
                    onProgress={setUploadProgress}
                    onDone={(url) => { update(i, { ...block, posterUrl: url }); finishUpload() }}
                    onError={failUpload}
                  />
                </div>
              </div>
            </div>
          )}

          {block.type === "slides" && (
            <div>
              {block.images.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                  {block.images.map((img, imgIdx) => (
                    <div key={imgIdx} style={{ position: "relative" }}>
                      <img src={img} alt="" style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 6, border: "1px solid var(--border)" }} />
                      <button
                        onClick={() => update(i, { ...block, images: block.images.filter((_, idx) => idx !== imgIdx) })}
                        style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", border: "none", background: "var(--danger)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                border: "1px dashed var(--border)", borderRadius: 8, padding: "10px",
                fontSize: 12.5, color: "var(--text-muted)", cursor: uploading === `slide:${i}` ? "wait" : "pointer",
              }}>
                {uploading === `slide:${i}` ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Upload size={14} />}
                {uploading === `slide:${i}` ? `Subiendo… ${uploadProgress}%` : "Agregar imagen"}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading !== null}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadSlideImage(i, f); e.target.value = "" }}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          )}

          {block.type === "video-cloudinary" && (
            <div>
              {block.url ? (
                <video controls poster={block.posterUrl} src={block.url} style={{ width: "100%", maxWidth: 360, borderRadius: 8, border: "1px solid rgba(165,141,102,.18)", display: "block" }} />
              ) : (
                <p style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 8 }}>Todavía no se subió el video.</p>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                <UploadSlot
                  label={block.url ? "Reemplazar video" : "Subir video"}
                  accept="video/*"
                  folder="jewgal-lecciones-video"
                  uploadKey={`video:${i}`}
                  uploading={uploading}
                  progress={uploadProgress}
                  onStart={startUpload}
                  onProgress={setUploadProgress}
                  onDone={(url) => { update(i, { ...block, url }); finishUpload() }}
                  onError={failUpload}
                />
                <UploadSlot
                  label={block.posterUrl ? "Cambiar portada" : "Subir portada"}
                  accept="image/*"
                  folder="jewgal-lecciones-posters"
                  uploadKey={`poster:${i}`}
                  uploading={uploading}
                  progress={uploadProgress}
                  onStart={startUpload}
                  onProgress={setUploadProgress}
                  onDone={(url) => { update(i, { ...block, posterUrl: url }); finishUpload() }}
                  onError={failUpload}
                />
              </div>
              <input
                value={block.caption ?? ""}
                onChange={(e) => update(i, { ...block, caption: e.target.value || undefined })}
                placeholder="Descripción opcional debajo del video"
                style={{ ...inputStyle, marginTop: 8 }}
              />
            </div>
          )}

          {block.type === "video-grid" && (
            <div>
              <input
                value={block.title ?? ""}
                onChange={(e) => update(i, { ...block, title: e.target.value || undefined })}
                placeholder="Título de la grilla (opcional, ej. «Contenido de la unidad»)"
                style={{ ...inputStyle, marginBottom: 10 }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {block.items.map((item, gi) => (
                  <div key={gi} style={{ border: "1px solid rgba(165,141,102,.12)", borderRadius: 8, padding: 10, background: "var(--surface-2)" }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                      <input
                        value={item.title}
                        onChange={(e) => {
                          const items = [...block.items]; items[gi] = { ...item, title: e.target.value }
                          update(i, { ...block, items })
                        }}
                        placeholder="Título del clip"
                        style={{ ...inputStyle, flex: 1 }}
                      />
                      <input
                        value={item.durationLabel ?? ""}
                        onChange={(e) => {
                          const items = [...block.items]; items[gi] = { ...item, durationLabel: e.target.value || undefined }
                          update(i, { ...block, items })
                        }}
                        placeholder="08:45"
                        style={{ ...inputStyle, width: 80 }}
                      />
                      <button
                        onClick={() => {
                          if (gi === 0) return
                          const items = [...block.items]
                          ;[items[gi - 1], items[gi]] = [items[gi], items[gi - 1]]
                          update(i, { ...block, items })
                        }}
                        disabled={gi === 0} title="Subir" style={smallBtn(gi === 0)}
                      ><ChevronUp size={13} /></button>
                      <button
                        onClick={() => {
                          if (gi === block.items.length - 1) return
                          const items = [...block.items]
                          ;[items[gi], items[gi + 1]] = [items[gi + 1], items[gi]]
                          update(i, { ...block, items })
                        }}
                        disabled={gi === block.items.length - 1} title="Bajar" style={smallBtn(gi === block.items.length - 1)}
                      ><ChevronDown size={13} /></button>
                      <button
                        onClick={() => update(i, { ...block, items: block.items.filter((_, idx) => idx !== gi) })}
                        title="Eliminar" style={{ ...smallBtn(false), border: "1px solid rgba(239,68,68,.25)", background: "rgba(239,68,68,.06)", color: "var(--danger)" }}
                      ><Trash2 size={12} /></button>
                    </div>
                    <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                      <select
                        value={item.provider}
                        onChange={(e) => {
                          const items = [...block.items]; items[gi] = { ...item, provider: e.target.value as "cloudinary" | "youtube" | "vimeo" }
                          update(i, { ...block, items })
                        }}
                        style={{ ...inputStyle, width: 130 }}
                      >
                        <option value="cloudinary">Archivo propio</option>
                        <option value="youtube">YouTube</option>
                        <option value="vimeo">Vimeo</option>
                      </select>
                      {item.provider === "cloudinary" ? (
                        <div style={{ flex: 1 }}>
                          <UploadSlot
                            label={item.url ? "Reemplazar video" : "Subir video"}
                            accept="video/*"
                            folder="jewgal-lecciones-video"
                            uploadKey={`grid:${i}:${gi}`}
                            uploading={uploading}
                            progress={uploadProgress}
                            onStart={startUpload}
                            onProgress={setUploadProgress}
                            onDone={(url) => { const items = [...block.items]; items[gi] = { ...item, url }; update(i, { ...block, items }); finishUpload() }}
                            onError={failUpload}
                          />
                        </div>
                      ) : (
                        <input
                          value={item.url}
                          onChange={(e) => { const items = [...block.items]; items[gi] = { ...item, url: e.target.value }; update(i, { ...block, items }) }}
                          placeholder={item.provider === "youtube" ? "https://www.youtube.com/watch?v=…" : "https://vimeo.com/…"}
                          style={{ ...inputStyle, flex: 1 }}
                        />
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {item.posterUrl && <img src={item.posterUrl} alt="" style={{ width: 44, height: 33, objectFit: "cover", borderRadius: 5, border: "1px solid var(--border)" }} />}
                      <div style={{ flex: 1 }}>
                        <UploadSlot
                          label={item.posterUrl ? "Cambiar miniatura" : "Agregar miniatura"}
                          accept="image/*"
                          folder="jewgal-lecciones-posters"
                          uploadKey={`grid-poster:${i}:${gi}`}
                          uploading={uploading}
                          progress={uploadProgress}
                          onStart={startUpload}
                          onProgress={setUploadProgress}
                          onDone={(url) => { const items = [...block.items]; items[gi] = { ...item, posterUrl: url }; update(i, { ...block, items }); finishUpload() }}
                          onError={failUpload}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => update(i, { ...block, items: [...block.items, { title: "", provider: "cloudinary", url: "" }] })}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface-2)", border: "1px dashed rgba(165,141,102,.4)", color: "var(--gold)", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", marginTop: 8 }}
              >
                <Plus size={13} /> Agregar clip
              </button>
            </div>
          )}

          {block.type === "unit-resources" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <span style={{ fontSize: 11, color: "var(--text-faint)", display: "block", marginBottom: 4 }}>Videos recomendados</span>
                <LinkListEditor items={block.videos} onChange={(videos) => update(i, { ...block, videos })} labelPlaceholder="Título del video" />
              </div>
              <div>
                <span style={{ fontSize: 11, color: "var(--text-faint)", display: "block", marginBottom: 4 }}>Lecturas complementarias</span>
                <LinkListEditor items={block.readings} onChange={(readings) => update(i, { ...block, readings })} labelPlaceholder="Título de la lectura" />
              </div>
              <div>
                <span style={{ fontSize: 11, color: "var(--text-faint)", display: "block", marginBottom: 4 }}>Citas para reflexionar</span>
                <StringListEditor items={block.quotes} onChange={(quotes) => update(i, { ...block, quotes })} placeholder="Agregar cita…" />
              </div>
              <div>
                <span style={{ fontSize: 11, color: "var(--text-faint)", display: "block", marginBottom: 4 }}>Enlaces de interés</span>
                <LinkListEditor items={block.links} onChange={(links) => update(i, { ...block, links })} labelPlaceholder="Título del enlace" />
              </div>
            </div>
          )}
        </div>
      ))}

      {uploadError && <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--danger)" }}><AlertCircle size={13} /> {uploadError}</p>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {(Object.keys(BLOCK_LABELS) as ContentBlock["type"][]).map((type) => (
          <button
            key={type}
            onClick={() => add(type)}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface-2)", border: "1px dashed rgba(165,141,102,.4)", color: "var(--gold)", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
          >
            <Plus size={13} /> {BLOCK_LABELS[type]}
          </button>
        ))}
      </div>
    </div>
  )
}
