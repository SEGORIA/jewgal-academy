"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import BrandLogo from "@/components/BrandLogo"
import { Eye, EyeOff, Loader2 } from "lucide-react"

const spring = { type: "spring" as const, stiffness: 280, damping: 22 }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get("redirect") || "/aula"

  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")
  const [success, setSuccess]   = useState(false)
  const [dest, setDest]         = useState("/aula")
  const btnRef = useRef<HTMLButtonElement>(null)
  const canSubmit = EMAIL_RE.test(email) && password.length >= 1

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError("")
    const res = await signIn("credentials", { email, password, redirect: false })
    setLoading(false)
    if (res?.error) {
      setError("Email o contraseña incorrectos.")
    } else {
      const session = await getSession()
      const destination = session?.user?.role === "admin"
        ? "/superadmin"
        : (redirect.startsWith("/superadmin") ? "/aula" : redirect)
      setDest(destination)
      setSuccess(true)
      setTimeout(() => router.push(destination), 1400)
    }
  }

  const focusInput  = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "var(--gold)"
    e.target.style.boxShadow   = "0 0 0 3px rgba(165,141,102,.18)"
  }
  const blurInput = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "var(--line-d, rgba(255,255,255,.1))"
    e.target.style.boxShadow   = "none"
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1.5px solid rgba(255,255,255,.1)",
    borderRadius: 12,
    padding: "14px 16px",
    fontSize: 15,
    color: "var(--text)",
    outline: "none",
    background: "var(--surface-2)",
    transition: "border-color .25s, box-shadow .25s",
    fontFamily: "inherit",
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,var(--bg) 0%,var(--surface-solid) 55%,#0a3140 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px 20px", position: "relative", overflow: "hidden",
    }}>

      {/* Blobs de fondo animados */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], rotate: [0, 15, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "-20%", right: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(75,126,140,.09),transparent 70%)", pointerEvents: "none" }}
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, -12, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        style={{ position: "absolute", bottom: "-25%", left: "-8%", width: 580, height: 580, borderRadius: "50%", background: "radial-gradient(circle,rgba(165,141,102,.07),transparent 70%)", pointerEvents: "none" }}
      />

      {/* Partículas doradas */}
      {[
        { top: "20%", right: "12%", size: 5, delay: 0 },
        { top: "65%", left: "9%",   size: 3, delay: 2 },
        { top: "40%", left: "5%",   size: 4, delay: 1 },
        { top: "80%", right: "8%",  size: 3, delay: 3 },
      ].map((p, i) => (
        <motion.div key={i}
          animate={{ y: [0, -16, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 7 + i * 1.5, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
          style={{ position: "absolute", ...p, width: p.size, height: p.size, borderRadius: "50%", background: "var(--gold,#A58D66)", pointerEvents: "none" }}
        />
      ))}

      {/* Línea decorativa izquierda */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 120, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        style={{ position: "absolute", left: "calc(50% - 230px)", top: "50%", transform: "translateY(-50%)", width: 1, background: "linear-gradient(to bottom,transparent,var(--gold,#A58D66),transparent)", pointerEvents: "none" }}
      />

      {/* Contenedor principal */}
      <motion.div
        initial={{ opacity: 0, y: 44, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...spring, delay: 0.08 }}
        style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 2 }}
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, ...spring }}
          style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}
        >
          <Link href="/" aria-label="Jewgal Academy — Inicio">
            <BrandLogo height={52} priority />
          </Link>
        </motion.div>

        {/* Card */}
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={spring}
              style={{
                background: "var(--surface)",
                borderRadius: 20,
                padding: 52,
                textAlign: "center",
                border: "1px solid rgba(165,141,102,.3)",
                boxShadow: "0 32px 80px rgba(0,0,0,.4), inset 0 1px 0 var(--surface-2)",
                backdropFilter: "blur(12px)",
              }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 360, damping: 18, delay: 0.1 }}
                style={{ fontSize: 52, marginBottom: 18, color: "var(--gold,#A58D66)" }}
              >✦</motion.div>
              <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
                style={{ fontFamily: "var(--serif)", fontSize: 28, color: "var(--text)", marginBottom: 10, fontWeight: 500 }}>
                ¡Bienvenida!
              </motion.h2>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.38 }}
                style={{ color: "var(--text-muted)", fontSize: 15 }}>
                {dest.startsWith("/superadmin")
                  ? "Entrando al panel de administración…"
                  : "Entrando a tu aula virtual…"}
              </motion.p>
              <motion.div
                initial={{ width: 0 }} animate={{ width: "100%" }}
                transition={{ delay: 0.5, duration: 1.1, ease: "easeInOut" }}
                style={{ height: 2, background: "linear-gradient(90deg,var(--gold,#A58D66),#d4b06a)", borderRadius: 4, marginTop: 28 }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                background: "var(--surface)",
                borderRadius: 20,
                padding: "40px 36px",
                border: "1px solid rgba(165,141,102,.18)",
                boxShadow: "0 32px 80px rgba(0,0,0,.4), inset 0 1px 0 var(--surface-2)",
                backdropFilter: "blur(12px)",
              }}
            >
              {/* Eyebrow */}
              <motion.span
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
                className="eyebrow"
                style={{ display: "inline-block", marginBottom: 14 }}
              >
                Aula virtual
              </motion.span>

              {/* Título */}
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 }}
                style={{ fontFamily: "var(--serif)", fontSize: 36, fontWeight: 500, color: "var(--text)", lineHeight: 1.05, marginBottom: 6 }}
              >
                Iniciar sesión
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{ color: "var(--text-muted)", fontSize: 15, marginBottom: 32 }}
              >
                Accedé a tu espacio de aprendizaje
              </motion.p>

              {/* Error con shake */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 20, x: [0, -10, 10, -8, 8, -4, 4, 0] }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.45 }}
                    style={{ background: "rgba(220,38,38,.12)", border: "1px solid rgba(220,38,38,.35)", color: "#fca5a5", borderRadius: 10, padding: "12px 16px", fontSize: 14, overflow: "hidden" }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Email */}
                <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.36 }}>
                  <label style={{ display: "block", fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 9 }}>
                    Email
                  </label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    required placeholder="tu@email.com"
                    style={inputStyle} onFocus={focusInput} onBlur={blurInput}
                  />
                </motion.div>

                {/* Contraseña */}
                <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.44 }}>
                  <label style={{ display: "block", fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 9 }}>
                    Contraseña
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                      required placeholder="••••••••"
                      style={{ ...inputStyle, paddingRight: 46 }} onFocus={focusInput} onBlur={blurInput}
                    />
                    <motion.button
                      type="button" onClick={() => setShowPw(!showPw)}
                      aria-label={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}
                      whileTap={{ scale: 0.82 }}
                      style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", display: "flex", alignItems: "center", padding: 4 }}
                    >
                      {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                    </motion.button>
                  </div>
                </motion.div>

                {/* Botón */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52 }}>
                  <motion.button
                    ref={btnRef}
                    type="submit"
                    disabled={loading || !canSubmit}
                    whileHover={loading || !canSubmit ? {} : { scale: 1.025, boxShadow: "0 12px 40px rgba(165,141,102,.35)" }}
                    whileTap={loading || !canSubmit ? {} : { scale: 0.975 }}
                    style={{
                      width: "100%",
                      background: "var(--gold,#A58D66)",
                      color: "#081E29",
                      border: "none", borderRadius: 12,
                      padding: "15px 0", fontSize: 13,
                      fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase",
                      cursor: loading || !canSubmit ? "not-allowed" : "pointer",
                      opacity: loading || !canSubmit ? 0.6 : 1,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
                      position: "relative", overflow: "hidden",
                      fontFamily: "var(--sans)", marginTop: 4,
                    }}
                  >
                    {/* Shimmer */}
                    <motion.div
                      initial={{ x: "-120%", opacity: 0 }}
                      whileHover={{ x: "120%", opacity: 1 }}
                      transition={{ duration: 0.6 }}
                      style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent)", pointerEvents: "none" }}
                    />
                    {loading && (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}>
                        <Loader2 size={16} />
                      </motion.div>
                    )}
                    {loading ? "Entrando…" : "Entrar al aula →"}
                  </motion.button>
                </motion.div>
              </form>

              {/* Divider */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                style={{ display: "flex", alignItems: "center", gap: 14, margin: "24px 0 0" }}
              >
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.08)" }} />
                <span style={{ fontSize: 11, color: "var(--text-dim)", letterSpacing: ".1em" }}>·</span>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.08)" }} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Links pie */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.68 }}
          style={{ textAlign: "center", marginTop: 24 }}
        >
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 10 }}>
            ¿No tenés cuenta?{" "}
            <Link href="/#programas" style={{ color: "var(--gold,#A58D66)", fontWeight: 600, textDecoration: "none" }}>
              Inscribite en un programa
            </Link>
          </p>
          <Link href="/" style={{ fontSize: 12, color: "var(--text-dim)", textDecoration: "none", letterSpacing: ".08em" }}>
            ← Volver al sitio
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
