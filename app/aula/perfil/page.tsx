"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, Save, KeyRound, Eye, EyeOff, Check, User, Phone, MapPin, Briefcase, Sparkles } from "lucide-react"

const INTERESTS = ["Life Coaching", "Cabalá", "Jewgal · Adultos", "Joogalkids", "Método Sholem", "Mindfulness", "Liderazgo", "Bienestar"]
const COUNTRIES  = ["Argentina", "Colombia", "México", "España", "Estados Unidos", "Israel", "Venezuela", "Chile", "Uruguay", "Otro"]

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
  const { data: session } = useSession()

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

  const [saved,    setSaved]    = useState(false)
  const [pwSaved,  setPwSaved]  = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Cargar desde localStorage al montar
  useEffect(() => {
    const p = localStorage.getItem("ja_profile")
    if (p) {
      const d = JSON.parse(p)
      if (d.photo)     setPhoto(d.photo)
      if (d.name)      setName(d.name)
      if (d.phone)     setPhone(d.phone)
      if (d.country)   setCountry(d.country)
      if (d.city)      setCity(d.city)
      if (d.job)       setJob(d.job)
      if (d.bio)       setBio(d.bio)
      if (d.interests) setInterests(d.interests)
    } else if (session?.user?.name) {
      setName(session.user.name)
    }
  }, [session])

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPhoto(result)
      // Guardar foto inmediatamente al storage
      const current = JSON.parse(localStorage.getItem("ja_profile") || "{}")
      localStorage.setItem("ja_profile", JSON.stringify({ ...current, photo: result }))
      window.dispatchEvent(new Event("ja_profile_update"))
    }
    reader.readAsDataURL(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleSave() {
    const data = { photo, name, phone, country, city, job, bio, interests }
    localStorage.setItem("ja_profile", JSON.stringify(data))
    window.dispatchEvent(new Event("ja_profile_update"))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function handlePwSave() {
    if (!pwNew || pwNew !== pwConfirm) return
    setPwSaved(true)
    setPwCurrent(""); setPwNew(""); setPwConfirm("")
    setTimeout(() => setPwSaved(false), 2500)
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
                  position: "absolute", inset: 0, background: "rgba(8,30,41,.7)",
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
              JPG, PNG · Máx 5MB
            </p>
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
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <motion.button
          onClick={handleSave}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: saved ? "var(--success)" : "var(--gold)",
            color: "#2C1F14", border: "none", borderRadius: 11,
            padding: "13px 28px", fontSize: 13, fontWeight: 700,
            cursor: "pointer", transition: "background .3s",
          }}
        >
          <AnimatePresence mode="wait">
            {saved
              ? <motion.span key="ok"  initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ display: "flex", gap: 8, alignItems: "center" }}><Check size={15} /> ¡Perfil guardado!</motion.span>
              : <motion.span key="sv" initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ display: "flex", gap: 8, alignItems: "center" }}><Save size={15} /> Guardar cambios</motion.span>
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
                onChange={(e) => setPwNew(e.target.value)} placeholder="Mínimo 8 caracteres"
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
        <motion.button
          onClick={handlePwSave}
          disabled={!pwCurrent || !pwNew || pwNew !== pwConfirm}
          whileHover={pwNew === pwConfirm && pwCurrent ? { scale: 1.02 } : {}}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: pwSaved ? "var(--success)" : "var(--surface-2)",
            border: "1px solid rgba(165,141,102,.25)", color: pwSaved ? "var(--bg)" : "var(--text-muted)",
            borderRadius: 10, padding: "11px 22px", fontSize: 13, fontWeight: 600,
            cursor: !pwCurrent || !pwNew || pwNew !== pwConfirm ? "not-allowed" : "pointer",
            opacity: !pwCurrent || !pwNew || pwNew !== pwConfirm ? 0.45 : 1,
            transition: "all .25s",
          }}
        >
          {pwSaved ? <><Check size={14} /> Contraseña actualizada</> : <><KeyRound size={14} /> Actualizar contraseña</>}
        </motion.button>
      </div>
    </div>
  )
}
