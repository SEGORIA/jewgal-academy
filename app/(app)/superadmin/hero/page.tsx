"use client"

import { useState, useEffect } from "react"
import { GripVertical, Eye, EyeOff, ChevronUp, ChevronDown, Save, Info, Trash2 } from "lucide-react"
import { ImageInsertButton } from "@/components/admin/ImageUpload"

type Photo = { src: string; alt: string; active: boolean; order: number }

const DEFAULT: Photo[] = [
  { src: "/brand/hero/devora-coaching.webp", alt: "Devora con su grupo de coaching",       active: true, order: 0 },
  { src: "/brand/hero/devora-tv.webp",        alt: "Devora en televisión",                 active: true, order: 1 },
  { src: "/brand/hero/devora-ninos.webp",     alt: "Devora con niños",                     active: true, order: 2 },
  { src: "/brand/hero/devora-miami.webp",     alt: "Devora en Miami con familia",           active: true, order: 3 },
]

export default function HeroAdminPage() {
  const [photos, setPhotos] = useState<Photo[]>(DEFAULT)
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)
  const [error,  setError]  = useState("")
  const [pendingRemove, setPendingRemove] = useState<number | null>(null)

  useEffect(() => {
    fetch("/api/admin/hero-photos")
      .then(r => r.json())
      .then((data: Photo[]) => {
        if (Array.isArray(data) && data.length) setPhotos(data)
      })
      .catch(() => {})
  }, [])

  function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= photos.length) return
    const next = [...photos]
    ;[next[i], next[j]] = [next[j], next[i]]
    setPhotos(next.map((p, idx) => ({ ...p, order: idx })))
  }

  function toggleActive(i: number) {
    setPhotos(prev => prev.map((p, idx) => idx === i ? { ...p, active: !p.active } : p))
  }

  function updateAlt(i: number, value: string) {
    setPhotos(prev => prev.map((p, idx) => idx === i ? { ...p, alt: value } : p))
  }

  function addPhoto(src: string) {
    setError("")
    setPhotos(prev => [...prev, { src, alt: "Foto del carrusel", active: true, order: prev.length }])
  }

  function removePhoto(i: number) {
    if (pendingRemove !== i) { setPendingRemove(i); setTimeout(() => setPendingRemove(null), 3500); return }
    setPendingRemove(null)
    setPhotos(prev => prev.filter((_, idx) => idx !== i).map((p, idx) => ({ ...p, order: idx })))
  }

  async function save() {
    if (!photos.some(p => p.active)) { setError("Dejá al menos una foto activa: el carrusel no puede quedar vacío."); return }
    setError("")
    setSaving(true)
    try {
      const res = await fetch("/api/admin/hero-photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(photos),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "No se pudo guardar. Probá de nuevo."); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setError("No se pudo guardar. Revisá tu conexión.")
    } finally {
      setSaving(false)
    }
  }

  const accent = "#A76D61"

  return (
    <div style={{ maxWidth: 820 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(22px,3vw,32px)", color: "var(--text)", marginBottom: 6 }}>
            Fotos del Hero
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Cambia el orden, activa o desactiva fotos del carrusel de inicio.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "11px 24px", borderRadius: 10, border: "none", cursor: saving ? "wait" : "pointer",
            background: saved
              ? "rgba(107,191,142,.18)"
              : `linear-gradient(135deg,${accent} 0%,#C49F72 100%)`,
            color: saved ? "var(--success)" : "white",
            fontWeight: 600, fontSize: 14,
            boxShadow: saved ? "none" : `0 6px 20px rgba(167,109,97,.35)`,
            transition: "all .25s",
          }}
        >
          <Save size={16} />
          {saving ? "Guardando…" : saved ? "¡Guardado!" : "Guardar cambios"}
        </button>
      </div>

      {/* Lista de fotos */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {photos.map((photo, i) => (
          <div
            key={photo.src}
            style={{
              display: "grid",
              gridTemplateColumns: "24px 96px 1fr auto",
              alignItems: "center",
              gap: 16,
              padding: "16px 20px",
              borderRadius: 12,
              background: "var(--surface)",
              border: `1px solid ${photo.active ? "rgba(165,141,102,.15)" : "rgba(255,255,255,.04)"}`,
              opacity: photo.active ? 1 : 0.45,
              transition: "all .2s",
            }}
          >
            {/* Drag handle (decorativo) */}
            <GripVertical size={16} style={{ color: "var(--text-faint)", cursor: "grab" }} />

            {/* Thumbnail */}
            <div style={{
              width: 96, height: 64, borderRadius: 8, overflow: "hidden",
              background: "var(--surface-2)",
              backgroundImage: `url(${photo.src})`,
              backgroundSize: "cover", backgroundPosition: "center",
              flexShrink: 0,
              border: "1px solid rgba(165,141,102,.1)",
            }} />

            {/* Info + editar alt */}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, color: "var(--text-faint)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 6 }}>
                {photo.src.split("/").pop()}
              </div>
              <input
                value={photo.alt}
                onChange={e => updateAlt(i, e.target.value)}
                placeholder="Descripción accesible de la foto"
                style={{
                  width: "100%", background: "var(--surface-2)",
                  border: "1px solid var(--border)", borderRadius: 8,
                  padding: "7px 12px", fontSize: 13, color: "var(--text)",
                  outline: "none",
                }}
              />
            </div>

            {/* Controles */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                title="Subir"
                style={{
                  width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border)",
                  background: "var(--surface-2)", cursor: i === 0 ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--text-muted)", opacity: i === 0 ? 0.3 : 1,
                }}
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === photos.length - 1}
                title="Bajar"
                style={{
                  width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border)",
                  background: "var(--surface-2)", cursor: i === photos.length - 1 ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--text-muted)", opacity: i === photos.length - 1 ? 0.3 : 1,
                }}
              >
                <ChevronDown size={14} />
              </button>
              <button
                onClick={() => toggleActive(i)}
                title={photo.active ? "Ocultar foto" : "Mostrar foto"}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border)",
                  background: photo.active ? "rgba(167,109,97,.12)" : "var(--surface-2)",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: photo.active ? accent : "var(--text-faint)",
                }}
              >
                {photo.active ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button
                onClick={() => removePhoto(i)}
                title={pendingRemove === i ? "Hacé clic de nuevo para quitarla" : "Quitar foto"}
                aria-label={pendingRemove === i ? "Confirmar: quitar foto" : "Quitar foto"}
                style={{
                  height: 32, minWidth: 32, padding: pendingRemove === i ? "0 10px" : 0, borderRadius: 8, border: "1px solid var(--border)",
                  background: pendingRemove === i ? "var(--danger)" : "var(--surface-2)", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12,
                  color: pendingRemove === i ? "#fff" : "var(--danger)",
                }}
              >
                <Trash2 size={14} />{pendingRemove === i ? "¿Quitar?" : null}
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && <p role="alert" style={{ marginTop: 16, color: "var(--danger)", fontSize: 13.5 }}>{error}</p>}

      {/* Agregar fotos nuevas: se suben directo desde acá */}
      <div style={{
        marginTop: 28, padding: "18px 20px", borderRadius: 12,
        background: "rgba(165,141,102,.06)", border: "1px solid rgba(165,141,102,.14)",
        display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap",
      }}>
        <Info size={18} style={{ color: accent, flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1, minWidth: 240 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
            ¿Querés agregar una foto nueva?
          </p>
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 12 }}>
            Subila desde tu computadora o celular: no hace falta tocar el código. Mejor en JPG o WebP, de al menos 1400&nbsp;px de ancho
            y con proporción 16:9 aproximada. Después de subirla, escribí su descripción y tocá <strong>Guardar cambios</strong>.
          </p>
          <ImageInsertButton folder="jewgal-hero" onUploaded={addPhoto} onError={setError} maxMB={10}>Subir foto nueva</ImageInsertButton>
        </div>
      </div>
    </div>
  )
}
