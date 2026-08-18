"use client"

import { useState, useEffect } from "react"
import { Save, Eye, EyeOff, RotateCcw, Upload, X, Loader2, Plus, Trash2 } from "lucide-react"
import {
  DEFAULT_CERTIFICATE_DESIGN,
  resolveProgramAccent,
  type CertificateDesign,
} from "@/lib/certificate-design"
import CertificatePreview from "@/components/certificates/CertificatePreview"

type CourseOption = { id: string; title: string; slug: string }
type Accreditation = { id: string; code: string; name: string; logoUrl: string | null; order: number; courses: { id: string; title: string }[] }

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid rgba(165,141,102,.15)",
  borderRadius: 12,
  padding: "22px 24px",
}

const sectionTitle: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontSize: 16,
  fontWeight: 500,
  color: "var(--text)",
  marginBottom: 16,
}

const label: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: ".08em",
  textTransform: "uppercase",
  color: "var(--text-faint)",
  display: "block",
  marginBottom: 6,
}

const textInput: React.CSSProperties = {
  width: "100%",
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: "9px 12px",
  fontSize: 13,
  color: "var(--text)",
  outline: "none",
  fontFamily: "inherit",
}

function ColorField({ label: fieldLabel, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [hexInput, setHexInput] = useState(value)
  useEffect(() => setHexInput(value), [value])

  function commitHex(v: string) {
    setHexInput(v)
    if (/^#[0-9A-Fa-f]{6}$/.test(v)) onChange(v)
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <span style={label}>{fieldLabel}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <input
          type="color"
          value={/^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#000000"}
          onChange={(e) => { setHexInput(e.target.value); onChange(e.target.value) }}
          style={{ width: 40, height: 36, padding: 0, border: "1px solid var(--border)", borderRadius: 8, background: "none", cursor: "pointer" }}
        />
        <input
          value={hexInput}
          onChange={(e) => commitHex(e.target.value)}
          placeholder="#RRGGBB"
          style={{ ...textInput, flex: 1, fontFamily: "monospace" }}
        />
      </div>
    </div>
  )
}

function TextField({
  fieldLabel, value, onChange, maxLength, multiline,
}: { fieldLabel: string; value: string; onChange: (v: string) => void; maxLength: number; multiline?: boolean }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <span style={label}>{fieldLabel} <span style={{ opacity: .6 }}>({value.length}/{maxLength})</span></span>
      {multiline ? (
        <textarea
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          style={{ ...textInput, resize: "vertical" }}
        />
      ) : (
        <input
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          style={textInput}
        />
      )}
    </div>
  )
}

function AvalesCard({
  accreditations, courses, onChange,
}: { accreditations: Accreditation[]; courses: CourseOption[]; onChange: () => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [rowError, setRowError] = useState<Record<string, string>>({})
  const [newCode, setNewCode] = useState("")
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")

  async function uploadLogo(id: string, file: File) {
    setUploadingId(id)
    setRowError((p) => ({ ...p, [id]: "" }))
    try {
      const sigRes = await fetch("/api/admin/cloudinary-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "jewgal-avales" }),
      })
      if (!sigRes.ok) {
        const d = await sigRes.json()
        setRowError((p) => ({ ...p, [id]: d.error ?? "Cloudinary no está configurado" }))
        return
      }
      const { timestamp, signature, apiKey, cloudName, folder } = await sigRes.json()
      const formData = new FormData()
      formData.append("file", file)
      formData.append("timestamp", String(timestamp))
      formData.append("signature", signature)
      formData.append("api_key", apiKey)
      formData.append("folder", folder)

      const xhr = new XMLHttpRequest()
      const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText))
          else reject(new Error(`Error al subir: ${xhr.status}`))
        }
        xhr.onerror = () => reject(new Error("Error de red al subir"))
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`)
        xhr.send(formData)
      })

      await fetch(`/api/admin/accreditations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl: result.secure_url }),
      })
      onChange()
    } catch (err) {
      setRowError((p) => ({ ...p, [id]: err instanceof Error ? err.message : "Error al subir el archivo" }))
    } finally {
      setUploadingId(null)
    }
  }

  async function toggleCourse(aval: Accreditation, courseId: string) {
    const has = aval.courses.some((c) => c.id === courseId)
    const courseIds = has ? aval.courses.filter((c) => c.id !== courseId).map((c) => c.id) : [...aval.courses.map((c) => c.id), courseId]
    await fetch(`/api/admin/accreditations/${aval.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseIds }),
    })
    onChange()
  }

  async function deleteAval(id: string) {
    if (!window.confirm("¿Eliminar este aval? Deja de mostrarse en certificados y páginas de programa.")) return
    await fetch(`/api/admin/accreditations/${id}`, { method: "DELETE" })
    onChange()
  }

  async function createAval() {
    if (!newCode.trim() || !newName.trim()) return
    setCreating(true)
    setCreateError("")
    try {
      const res = await fetch("/api/admin/accreditations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: newCode.trim().toUpperCase(), name: newName.trim(), order: accreditations.length }),
      })
      const data = await res.json()
      if (!res.ok) { setCreateError(data.error ?? "No se pudo crear el aval"); return }
      setNewCode("")
      setNewName("")
      onChange()
    } finally {
      setCreating(false)
    }
  }

  return (
    <div style={card}>
      <p style={sectionTitle}>Avales por programa</p>
      <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.6 }}>
        Logos de acreditaciones externas (FGU, CEL, IDC, etc.) — a diferencia de la co-marca, cada aval se asigna a los programas específicos que lo tienen, y se muestra en el certificado y en la página pública del programa.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {accreditations.map((a) => (
          <div key={a.id} style={{ background: "var(--surface-2)", borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {a.logoUrl ? (
                <img src={a.logoUrl} alt={a.code} style={{ height: 28, width: 60, objectFit: "contain", background: "#fff", borderRadius: 4, padding: 2 }} />
              ) : (
                <div style={{ height: 28, width: 60, display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed var(--border)", borderRadius: 4, fontSize: 9, color: "var(--text-faint)" }}>
                  sin logo
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{a.code}</p>
                <p style={{ fontSize: 11, color: "var(--text-faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</p>
              </div>
              <button
                onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                style={{ fontSize: 11.5, color: "var(--gold, #A76D61)", background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
              >
                {a.courses.length} programa{a.courses.length === 1 ? "" : "s"} {expandedId === a.id ? "▲" : "▼"}
              </button>
              <button onClick={() => deleteAval(a.id)} style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", display: "flex" }}>
                <Trash2 size={14} />
              </button>
            </div>

            {expandedId === a.id && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                <label style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  border: "1px dashed var(--border)", borderRadius: 7, padding: "8px 10px",
                  fontSize: 12, color: "var(--text-muted)", cursor: uploadingId === a.id ? "wait" : "pointer", marginBottom: 12,
                }}>
                  {uploadingId === a.id ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Upload size={13} />}
                  {uploadingId === a.id ? "Subiendo…" : a.logoUrl ? "Reemplazar logo" : "Subir logo"}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingId === a.id}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadLogo(a.id, f); e.target.value = "" }}
                    style={{ display: "none" }}
                  />
                </label>
                {rowError[a.id] && <p style={{ fontSize: 11.5, color: "var(--danger)", marginBottom: 10 }}>{rowError[a.id]}</p>}

                <p style={{ fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 8 }}>Programas</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {courses.map((c) => (
                    <label key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text)", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={a.courses.some((ac) => ac.id === c.id)}
                        onChange={() => toggleCourse(a, c.id)}
                      />
                      {c.title}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="Sigla (ej. APC)" style={{ ...textInput, width: 110 }} maxLength={20} />
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nombre completo" style={{ ...textInput, flex: 1 }} maxLength={200} />
        <button
          onClick={createAval}
          disabled={creating || !newCode.trim() || !newName.trim()}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "0 14px", borderRadius: 8, border: "none",
            background: "rgba(167,109,97,.12)", color: "#A76D61", fontSize: 12.5, fontWeight: 600,
            cursor: creating || !newCode.trim() || !newName.trim() ? "not-allowed" : "pointer", opacity: creating || !newCode.trim() || !newName.trim() ? 0.6 : 1,
          }}
        >
          <Plus size={14} /> Agregar
        </button>
      </div>
      {createError && <p style={{ fontSize: 11.5, color: "var(--danger)", marginTop: 8 }}>{createError}</p>}
    </div>
  )
}

export default function CertificadosAdminPage() {
  const [design, setDesign] = useState<CertificateDesign>(DEFAULT_CERTIFICATE_DESIGN)
  const [courses, setCourses] = useState<CourseOption[]>([])
  const [previewSlug, setPreviewSlug] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [accreditations, setAccreditations] = useState<Accreditation[]>([])

  useEffect(() => {
    fetch("/api/admin/certificate-design")
      .then((r) => r.json())
      .then((d) => { if (d && typeof d === "object" && "accentColor" in d) setDesign(d) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch("/api/admin/courses")
      .then((r) => r.json())
      .then((d) => {
        const list: CourseOption[] = (d.courses ?? []).map((c: CourseOption) => ({ id: c.id, title: c.title, slug: c.slug }))
        setCourses(list)
        if (list.length && !previewSlug) setPreviewSlug(list[0].slug)
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function loadAccreditations() {
    fetch("/api/admin/accreditations")
      .then((r) => r.json())
      .then((d) => setAccreditations(d.accreditations ?? []))
      .catch(() => {})
  }
  useEffect(loadAccreditations, [])

  function set<K extends keyof CertificateDesign>(key: K, value: CertificateDesign[K]) {
    setDesign((prev) => ({ ...prev, [key]: value }))
  }

  function setProgramAccent(slug: string, accent: string) {
    setDesign((prev) => {
      const exists = prev.programs.some((p) => p.slug === slug)
      const programs = exists
        ? prev.programs.map((p) => (p.slug === slug ? { ...p, accent } : p))
        : [...prev.programs, { slug, accent }]
      return { ...prev, programs }
    })
  }

  async function save() {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/certificate-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(design),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      }
    } finally {
      setSaving(false)
    }
  }

  // Subida firmada directa a Cloudinary — mismo patrón de superadmin/recursos.
  async function handleLogoUpload(file: File) {
    setUploadingLogo(true)
    setUploadError("")
    try {
      const sigRes = await fetch("/api/admin/cloudinary-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "jewgal-certificados-branding" }),
      })
      if (!sigRes.ok) {
        const d = await sigRes.json()
        setUploadError(d.error ?? "Cloudinary no está configurado")
        return
      }
      const { timestamp, signature, apiKey, cloudName, folder } = await sigRes.json()

      const formData = new FormData()
      formData.append("file", file)
      formData.append("timestamp", String(timestamp))
      formData.append("signature", signature)
      formData.append("api_key", apiKey)
      formData.append("folder", folder)

      const xhr = new XMLHttpRequest()
      const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText))
          else reject(new Error(`Error al subir: ${xhr.status}`))
        }
        xhr.onerror = () => reject(new Error("Error de red al subir"))
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`)
        xhr.send(formData)
      })

      set("coBrandingLogoUrl", uploadResult.secure_url)
      set("coBrandingEnabled", true)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Error al subir el archivo")
    } finally {
      setUploadingLogo(false)
    }
  }

  function restoreDefaults() {
    if (window.confirm("¿Restaurar los valores por defecto? Esto no se guarda hasta que apretes \"Guardar cambios\".")) {
      setDesign(DEFAULT_CERTIFICATE_DESIGN)
    }
  }

  const previewCourse = courses.find((c) => c.slug === previewSlug)
  const previewAccent = resolveProgramAccent(design, previewSlug)
  const previewAccreditations = previewCourse
    ? accreditations.filter((a) => a.courses.some((c) => c.id === previewCourse.id))
    : []

  return (
    <div style={{ maxWidth: 1400 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(22px,3vw,32px)", color: "var(--text)", marginBottom: 6 }}>
            Certificados
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Colores, textos y marca de agua del certificado — se refleja en la vista previa del alumno y en el PDF descargable.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={restoreDefaults}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "11px 18px", borderRadius: 10, border: "1px solid var(--border)",
              background: "var(--surface-2)", color: "var(--text-muted)", fontSize: 13, cursor: "pointer",
            }}
          >
            <RotateCcw size={14} /> Restaurar valores por defecto
          </button>
          <button
            onClick={save}
            disabled={saving}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "11px 24px", borderRadius: 10, border: "none", cursor: saving ? "wait" : "pointer",
              background: saved ? "rgba(107,191,142,.18)" : "linear-gradient(135deg,#A76D61 0%,#C49F72 100%)",
              color: saved ? "var(--success)" : "white",
              fontWeight: 600, fontSize: 14,
              boxShadow: saved ? "none" : "0 6px 20px rgba(167,109,97,.35)",
              transition: "all .25s",
            }}
          >
            <Save size={16} />
            {saving ? "Guardando…" : saved ? "¡Guardado!" : "Guardar cambios"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(340px, 480px) 1fr", gap: 24, alignItems: "start" }}>
        {/* Formulario */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={card}>
            <p style={sectionTitle}>Colores globales</p>
            <ColorField label="Color de acento (por defecto)" value={design.accentColor} onChange={(v) => set("accentColor", v)} />
            <ColorField label="Fondo" value={design.backgroundColor} onChange={(v) => set("backgroundColor", v)} />
            <ColorField label="Texto principal" value={design.textColor} onChange={(v) => set("textColor", v)} />
            <ColorField label="Texto secundario" value={design.mutedTextColor} onChange={(v) => set("mutedTextColor", v)} />
          </div>

          <div style={card}>
            <p style={sectionTitle}>Colores por programa</p>
            {courses.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-faint)" }}>Cargando programas…</p>
            ) : (
              courses.map((c) => (
                <div key={c.slug} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <span style={{ flex: 1, fontSize: 13, color: "var(--text)" }}>{c.title}</span>
                  <input
                    type="color"
                    value={resolveProgramAccent(design, c.slug)}
                    onChange={(e) => setProgramAccent(c.slug, e.target.value)}
                    style={{ width: 36, height: 32, padding: 0, border: "1px solid var(--border)", borderRadius: 7, background: "none", cursor: "pointer" }}
                  />
                </div>
              ))
            )}
          </div>

          <div style={card}>
            <p style={sectionTitle}>Textos</p>
            <TextField fieldLabel="Eyebrow" value={design.eyebrow} onChange={(v) => set("eyebrow", v)} maxLength={60} />
            <TextField fieldLabel="Título" value={design.title} onChange={(v) => set("title", v)} maxLength={80} />
            <TextField fieldLabel="Etiqueta 'Otorgado a'" value={design.awardedToLabel} onChange={(v) => set("awardedToLabel", v)} maxLength={60} />
            <TextField fieldLabel="Frase de finalización" value={design.completionText} onChange={(v) => set("completionText", v)} maxLength={200} multiline />
            <TextField fieldLabel="Línea de institución" value={design.institutionLine} onChange={(v) => set("institutionLine", v)} maxLength={200} multiline />
            <TextField fieldLabel="Nombre de firma" value={design.signatureName} onChange={(v) => set("signatureName", v)} maxLength={80} />
            <TextField fieldLabel="Cargo de firma" value={design.signatureRole} onChange={(v) => set("signatureRole", v)} maxLength={100} />
            <TextField fieldLabel="Frase de marca" value={design.tagline} onChange={(v) => set("tagline", v)} maxLength={140} multiline />
          </div>

          <div style={card}>
            <p style={sectionTitle}>Marca de agua</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: design.watermarkEnabled ? 16 : 0 }}>
              <button
                onClick={() => set("watermarkEnabled", !design.watermarkEnabled)}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border)",
                  background: design.watermarkEnabled ? "rgba(167,109,97,.12)" : "var(--surface-2)",
                  color: design.watermarkEnabled ? "#A76D61" : "var(--text-faint)",
                  fontSize: 13, cursor: "pointer",
                }}
              >
                {design.watermarkEnabled ? <Eye size={14} /> : <EyeOff size={14} />}
                {design.watermarkEnabled ? "Visible" : "Oculta"}
              </button>
              <span style={{ fontSize: 12, color: "var(--text-faint)" }}>Árbol de las Sefirot</span>
            </div>
            {design.watermarkEnabled && (
              <div>
                <span style={label}>Opacidad ({Math.round(design.watermarkOpacity * 100)}%)</span>
                <input
                  type="range"
                  min={0}
                  max={0.3}
                  step={0.01}
                  value={design.watermarkOpacity}
                  onChange={(e) => set("watermarkOpacity", Number(e.target.value))}
                  style={{ width: "100%" }}
                />
              </div>
            )}
            <p style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 12 }}>
              La imagen de la marca de agua no es editable desde acá.
            </p>
          </div>

          <div style={card}>
            <p style={sectionTitle}>Co-marca</p>
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.6 }}>
              Logo de una acreditación externa (ej. GCF), se muestra arriba a la derecha del certificado.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <button
                onClick={() => set("coBrandingEnabled", !design.coBrandingEnabled)}
                disabled={!design.coBrandingLogoUrl}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border)",
                  background: design.coBrandingEnabled ? "rgba(167,109,97,.12)" : "var(--surface-2)",
                  color: design.coBrandingEnabled ? "#A76D61" : "var(--text-faint)",
                  fontSize: 13, cursor: design.coBrandingLogoUrl ? "pointer" : "not-allowed",
                  opacity: design.coBrandingLogoUrl ? 1 : 0.5,
                }}
              >
                {design.coBrandingEnabled ? <Eye size={14} /> : <EyeOff size={14} />}
                {design.coBrandingEnabled ? "Visible" : "Oculto"}
              </button>
            </div>

            {design.coBrandingLogoUrl && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, padding: "10px 12px", background: "var(--surface-2)", borderRadius: 8 }}>
                <img src={design.coBrandingLogoUrl} alt="Logo de co-marca" style={{ height: 40, width: "auto", objectFit: "contain" }} />
                <button
                  onClick={() => { set("coBrandingLogoUrl", null); set("coBrandingEnabled", false) }}
                  style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", color: "var(--text-faint)", fontSize: 12, cursor: "pointer" }}
                >
                  <X size={13} /> Quitar logo
                </button>
              </div>
            )}

            <label style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              border: "1px dashed var(--border)", borderRadius: 8, padding: "14px 12px",
              fontSize: 13, color: "var(--text-muted)", cursor: uploadingLogo ? "wait" : "pointer",
            }}>
              {uploadingLogo ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Upload size={15} />}
              {uploadingLogo ? "Subiendo…" : design.coBrandingLogoUrl ? "Reemplazar logo" : "Subir logo"}
              <input
                type="file"
                accept="image/*"
                disabled={uploadingLogo}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); e.target.value = "" }}
                style={{ display: "none" }}
              />
            </label>
            {uploadError && (
              <p style={{ fontSize: 12, color: "var(--danger)", marginTop: 8 }}>{uploadError}</p>
            )}
          </div>

          <AvalesCard accreditations={accreditations} courses={courses} onChange={loadAccreditations} />
        </div>

        {/* Vista previa en vivo */}
        <div style={{ position: "sticky", top: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <p style={{ ...sectionTitle, marginBottom: 0 }}>Vista previa</p>
            {courses.length > 0 && (
              <select
                value={previewSlug}
                onChange={(e) => setPreviewSlug(e.target.value)}
                style={{ ...textInput, width: "auto" }}
              >
                {courses.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.title}</option>
                ))}
              </select>
            )}
          </div>
          <CertificatePreview
            studentName="Nombre del Alumno"
            courseTitle={previewCourse?.title ?? "Programa de ejemplo"}
            certificateNumber="JA-2026-0000"
            completedAt={new Date()}
            accent={previewAccent}
            design={design}
            accreditationLogos={previewAccreditations.map((a) => a.logoUrl).filter((u): u is string => !!u)}
          />
        </div>
      </div>
    </div>
  )
}
