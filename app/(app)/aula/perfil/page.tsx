"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, Save, KeyRound, Eye, EyeOff, Check, User, Phone, MapPin, Briefcase, Sparkles, Loader2 } from "lucide-react"

const INTERESTS = ["Life Coaching", "Cabalá", "Jewgal · Adultos", "Joogalkids", "Método Sholem", "Mindfulness", "Liderazgo", "Bienestar"]
const COUNTRIES  = ["Argentina", "Colombia", "México", "España", "Estados Unidos", "Israel", "Venezuela", "Chile", "Uruguay", "Otro"]

const MAX_AVATAR_DIM = 400
const AVATAR_QUALITY = 0.82

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error("Archivo de imagen inválido"))
      img.onload = () => {
        const scale = Math.min(1, MAX_AVATAR_DIM / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement("canvas")
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext("2d")
        if (!ctx) { reject(new Error("Canvas no soportado")); return }
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL("image/jpeg", AVATAR_QUALITY))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid rgba(165,141,102,.13)",
  borderRadius: 16, padding: "28px 26px",
}
const inputStyle: React.CSSProperties = {
  background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.2)",
  borderRadius: 10, padding: "11px 14px", fontSize: 13, color: "var(--text)",
  outline: "none", fontFamily: "inherit", width: "100%",
  transition: "border-color .2s, box-shadow .2s",
}
const label: React.CSSProperties = {
  fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase",
  color: "var(--text-faint)", display: "block", marginBottom: 7,
}

export default function PerfilPage() {
  const { data: session, update } = useSession()

  const [loadingProfile, setLoadingProfile] = useState(true)
  const [photo, setPhoto]         = useState<string | null>(null)
  const [name,  setName]          = useState("")
  const [phone, setPhone]         = useState("")
  const [country, setCountry]     = useState("")
  const [city,  setCity]          = useState("")
  const [job,   setJob]           = useState("")
  const [bio,   setBio]           = useState("")
  const [interests, setInterests] = useState<string[]>([])

  const [showPw,    setShowPw]    = useState(false)
  const [showNew,   setShowNew]   = useState(false)
  const [pwCurrent, setPwCurrent] = useState("")
  const [pwNew,     setPwNew]     = useState("")
  const [pwConfirm, setPwConfirm] = useState("")

  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [saveError, setSaveError] = useState("")
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSaved,  setPwSaved]  = useState(false)
  const [pwError,  setPwError]  = useState("")
  const [dragging, setDragging] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/me/profile")
      .then((r) => r.json())
      .then((d) => {
        const u = d.user
        if (!u) return
        setPhoto(u.image ?? null)
        setName(u.name ?? "")
        setPhone(u.phone ?? "")
        setCountry(u.country ?? "")
        setCity(u.city ?? "")
        setJob(u.job ?? "")
        setBio(u.bio ?? "")
        setInterests(u.interests ?? [])
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false))
  }, [])

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return
    setUploadError("")
    try {
      const resized = await resizeImage(file)
      setPhoto(resized)
      await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: resized }),
      })
      await update({ image: resized })
    } catch {
      setUploadError("No se pudo procesar la imagen. Probá con otro archivo.")
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  async function handleSave() {
    setSaving(true); setSaveError("")
    try {
      const res = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, country, city, job, bio, interests }),
      })
      const data = await res.json()
      if (!res.ok) { setSaveError(data.error || "No se pudo guardar el perfil"); return }
      await update({ name })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  async function handlePwSave() {
    if (!pwNew || pwNew !== pwConfirm) return
    setPwSaving(true); setPwError("")
    try {
      const res = await fetch("/api/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwCurrent, newPassword: pwNew }),
      })
      const data = await res.json()
      if (!res.ok) { setPwError(data.error || "No se pudo actualizar la contraseña"); return }
      setPwSaved(true)
      setPwCurrent(""); setPwNew(""); setPwConfirm("")
      setTimeout(() => setPwSaved(false), 2500)
    } finally {
      setPwSaving(false)
    }
  }

  function toggleInterest(i: string) {
    setInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    )
  }

  const initials = (name || session?.user?.name || "?").charAt(0).toUpperCase()

  const focusIn  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = "rgba(165,141,102,.6)"
    e.target.style.boxShadow   = "0 0 0 3px rgba(165,141,102,.12)"
  }
  const focusOut = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = "rgba(165,141,102,.2)"
    e.target.style.boxShadow   = "none"
  }

  if (loadingProfile) {
    return (
      <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", alignItems: "center", gap: 10, color: "var(--text-dim)", padding: "60px 0" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Cargando tu perfil…
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <span style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: 8 }}>
          Aula Virtual
        </span>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 34, color: "var(--text)", marginBottom: 4 }}>
          Mi perfil
        </h1>
        <p style={{ fontSize: 14, color: "rgba(224,233,234,.38)" }}>
          Tu información personal dentro de la plataforma.
        </p>
      </div>

      {/* ── FOTO + INFO BÁSICA ── */}
      <div style={{ ...card, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>

          {/* Avatar upload */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <div
              onClick={() => fileRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              style={{
                width: 110, height: 110, borderRadius: "50%", cursor: "pointer",
                background: photo ? "transparent" : "rgba(165,141,102,.12)",
                border: `2px ${dragging ? "solid" : "dashed"} ${dragging ? "#A58D66" : "rgba(165,141,102,.35)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden", position: "relative",
                transition: "border-color .2s, box-shadow .2s",
                boxShadow: dragging ? "0 0 0 4px rgba(165,141,102,.2)" : "none",
              }}
            >
              {photo
                ? <img src={photo} alt="Foto de perfil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontFamily: "var(--serif)", fontSize: 38, color: "var(--gold)", fontWeight: 500 }}>{initials}</span>
              }
              {/* Overlay hover */}
              <motion.div
                whileHover={{ opacity: 1 }}
                initial={{ opacity: 0 }}
                style={{
                  position: "absolute", inset: 0, background: "rgba(44,31,20,.72)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
                }}
              >
                <Camera size={18} style={{ color: "var(--gold)" }} />
                <span style={{ fontSize: 10, color: "var(--gold)", letterSpacing: ".1em" }}>Cambiar</span>
              </motion.div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
            <p style={{ fontSize: 11, color: "rgba(224,233,234,.28)", textAlign: "center", maxWidth: 100 }}>
              JPG, PNG
            </p>
            {uploadError && <p style={{ fontSize: 11, color: "var(--danger)", textAlign: "center", maxWidth: 120 }}>{uploadError}</p>}
          </div>

          {/* Campos info básica */}
          <div style={{ flex: 1, minWidth: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 14 }}>
            <div style={{ gridColumn: "span 2" }}>
              <label style={label}><User size={10} style={{ display: "inline", marginRight: 5 }} />Nombre completo</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label style={label}>Email</label>
              <input value={session?.user?.email ?? ""} readOnly
                style={{ ...inputStyle, opacity: .45, cursor: "not-allowed" }} />
            </div>
            <div>
              <label style={label}><Phone size={10} style={{ display: "inline", marginRight: 5 }} />Teléfono / WhatsApp</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 000 000 0000" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
            </div>
            <div>
              <label style={label}><Briefcase size={10} style={{ display: "inline", marginRight: 5 }} />Ocupación</label>
              <input value={job} onChange={(e) => setJob(e.target.value)}
                placeholder="Coach, terapeuta, docente…" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
            </div>
            <div>
              <label style={label}><MapPin size={10} style={{ display: "inline", marginRight: 5 }} />País</label>
              <select value={country} onChange={(e) => setCountry(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }} onFocus={focusIn} onBlur={focusOut}>
                <option value="">Seleccioná tu país</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={label}>Ciudad</label>
              <input value={city} onChange={(e) => setCity(e.target.value)}
                placeholder="Tu ciudad" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
            </div>
          </div>
        </div>
      </div>

      {/* ── SOBRE MÍ ── */}
      <div style={{ ...card, marginBottom: 16 }}>
        <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 18, color: "var(--text)", marginBottom: 18 }}>
          Sobre mí
        </h2>
        <div style={{ marginBottom: 18 }}>
          <label style={label}>Bio breve</label>
          <textarea
            value={bio} onChange={(e) => setBio(e.target.value)}
            placeholder="Contanos un poco sobre vos, tu camino y lo que buscás en Jewgal Academy…"
            rows={4}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.75 }}
            onFocus={focusIn} onBlur={focusOut}
          />
        </div>
        <div>
          <label style={{ ...label, marginBottom: 12 }}>
            <Sparkles size={10} style={{ display: "inline", marginRight: 5 }} />
            Áreas de interés
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {INTERESTS.map((i) => {
              const active = interests.includes(i)
              return (
                <motion.button
                  key={i}
                  onClick={() => toggleInterest(i)}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: "7px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer",
                    border: `1.5px solid ${active ? "var(--gold)" : "rgba(165,141,102,.2)"}`,
                    background: active ? "rgba(165,141,102,.15)" : "transparent",
                    color: active ? "var(--gold)" : "var(--text-faint)",
                    fontWeight: active ? 600 : 400,
                    display: "flex", alignItems: "center", gap: 6,
                    transition: "all .18s",
                  }}
                >
                  {active && <Check size={11} />}
                  {i}
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Botón guardar perfil */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, marginBottom: 16 }}>
        {saveError && <p style={{ fontSize: 12, color: "var(--danger)" }}>{saveError}</p>}
        <motion.button
          onClick={handleSave}
          disabled={saving}
          whileHover={saving ? {} : { scale: 1.03 }}
          whileTap={saving ? {} : { scale: 0.97 }}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: saved ? "var(--success)" : "var(--gold)",
            color: "#2C1F14", border: "none", borderRadius: 11,
            padding: "13px 28px", fontSize: 13, fontWeight: 700,
            cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1,
            transition: "background .3s",
          }}
        >
          <AnimatePresence mode="wait">
            {saving
              ? <motion.span key="sv" initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ display: "flex", gap: 8, alignItems: "center" }}><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Guardando…</motion.span>
              : saved
              ? <motion.span key="ok"  initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ display: "flex", gap: 8, alignItems: "center" }}><Check size={15} /> ¡Perfil guardado!</motion.span>
              : <motion.span key="idle" initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ display: "flex", gap: 8, alignItems: "center" }}><Save size={15} /> Guardar cambios</motion.span>
            }
          </AnimatePresence>
        </motion.button>
      </div>

      {/* ── SEGURIDAD ── */}
      <div style={{ ...card }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <KeyRound size={17} style={{ color: "rgba(165,141,102,.7)" }} />
          <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 18, color: "var(--text)" }}>
            Cambiar contraseña
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14, marginBottom: 18 }}>
          {/* Contraseña actual */}
          <div>
            <label style={label}>Contraseña actual</label>
            <div style={{ position: "relative" }}>
              <input type={showPw ? "text" : "password"} value={pwCurrent}
                onChange={(e) => setPwCurrent(e.target.value)} placeholder="••••••••"
                style={{ ...inputStyle, paddingRight: 40 }} onFocus={focusIn} onBlur={focusOut} />
              <button type="button" onClick={() => setShowPw(!showPw)} aria-label={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)" }}>
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          {/* Nueva */}
          <div>
            <label style={label}>Nueva contraseña</label>
            <div style={{ position: "relative" }}>
              <input type={showNew ? "text" : "password"} value={pwNew}
                onChange={(e) => setPwNew(e.target.value)} placeholder="Mínimo 6 caracteres"
                style={{ ...inputStyle, paddingRight: 40 }} onFocus={focusIn} onBlur={focusOut} />
              <button type="button" onClick={() => setShowNew(!showNew)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)" }}>
                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          {/* Confirmar */}
          <div>
            <label style={label}>Confirmar nueva</label>
            <input type="password" value={pwConfirm}
              onChange={(e) => setPwConfirm(e.target.value)} placeholder="Repetir contraseña"
              style={{ ...inputStyle, borderColor: pwConfirm && pwNew !== pwConfirm ? "rgba(239,68,68,.5)" : "rgba(165,141,102,.2)" }}
              onFocus={focusIn} onBlur={focusOut} />
          </div>
        </div>
        {pwConfirm && pwNew !== pwConfirm && (
          <p style={{ fontSize: 12, color: "var(--danger)", marginBottom: 14 }}>Las contraseñas no coinciden.</p>
        )}
        {pwError && (
          <p style={{ fontSize: 12, color: "var(--danger)", marginBottom: 14 }}>{pwError}</p>
        )}
        <motion.button
          onClick={handlePwSave}
          disabled={!pwCurrent || !pwNew || pwNew !== pwConfirm || pwSaving}
          whileHover={pwNew === pwConfirm && pwCurrent && !pwSaving ? { scale: 1.02 } : {}}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: pwSaved ? "var(--success)" : "var(--surface-2)",
            border: "1px solid rgba(165,141,102,.25)", color: pwSaved ? "var(--bg)" : "var(--text-muted)",
            borderRadius: 10, padding: "11px 22px", fontSize: 13, fontWeight: 600,
            cursor: !pwCurrent || !pwNew || pwNew !== pwConfirm || pwSaving ? "not-allowed" : "pointer",
            opacity: !pwCurrent || !pwNew || pwNew !== pwConfirm ? 0.45 : 1,
            transition: "all .25s",
          }}
        >
          {pwSaving
            ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Actualizando…</>
            : pwSaved ? <><Check size={14} /> Contraseña actualizada</> : <><KeyRound size={14} /> Actualizar contraseña</>}
        </motion.button>
      </div>
    </div>
  )
}
