"use client"

import { useState, useEffect } from "react"
import { GripVertical, Eye, EyeOff, ChevronUp, ChevronDown, Save, Info } from "lucide-react"

type Photo = { src: string; alt: string; active: boolean; order: number }

const DEFAULT: Photo[] = [
  { src: "/brand/hero/devora-coaching.webp",  alt: "Devora con su grupo de coaching",      active: true, order: 0 },
  { src: "/brand/hero/devora-tv.webp",         alt: "Devora en televisión",                active: true, order: 1 },
  { src: "/brand/hero/devora-ninos.webp",      alt: "Devora con niños",                    active: true, order: 2 },
  { src: "/brand/hero/devora-miami.webp",      alt: "Devora en Miami con familia",          active: true, order: 3 },
  { src: "/brand/hero/devora-joven.webp",      alt: "Joven saludando en experiencia Jewgal", active: true, order: 4 },
]

export default function HeroAdminPage() {
  const [photos, setPhotos] = useState<Photo[]>(DEFAULT)
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

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

  async function save() {
    setSaving(true)
    try {
      await fetch("/api/admin/hero-photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(photos),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
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
            </div>
          </div>
        ))}
      </div>

      {/* Nota: cómo agregar fotos nuevas */}
      <div style={{
        marginTop: 32, padding: "18px 20px", borderRadius: 12,
        background: "rgba(165,141,102,.06)", border: "1px solid rgba(165,141,102,.14)",
        display: "flex", gap: 14, alignItems: "flex-start",
      }}>
        <Info size={18} style={{ color: accent, flexShrink: 0, marginTop: 2 }} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
            ¿Querés agregar fotos nuevas?
          </p>
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
            Guardá la foto en la carpeta <code style={{ background: "var(--surface-2)", padding: "1px 6px", borderRadius: 4, fontSize: 12 }}>public/brand/hero/</code> del proyecto
            y hacé un push a main. Después, agregá la ruta aquí y guardá.
            Las fotos deben ser JPG o WebP, mínimo 1400&nbsp;px de ancho y relación 16:9 aproximada.
          </p>
        </div>
      </div>
    </div>
  )
}
