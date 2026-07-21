"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"
import { CreditCard, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react"
import { formatPrice } from "@/lib/utils"

type Course = { id: string; title: string; slug: string; price: number; currency: string; isFree: boolean }
type Config = { stripe: boolean; paypal: boolean; paypalClientId: string | null; demo: boolean }

const spring = { type: "spring" as const, stiffness: 300, damping: 24 }

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1.5px solid rgba(165,141,102,.25)",
  borderRadius: 12,
  padding: "13px 16px",
  fontSize: 15,
  color: "var(--text)",
  outline: "none",
  background: "var(--surface-2)",
  transition: "border-color .25s, box-shadow .25s",
  fontFamily: "inherit",
}

function GoldButton({ onClick, disabled, children, variant = "primary" }: {
  onClick?: () => void
  disabled?: boolean
  children: React.ReactNode
  variant?: "primary" | "outline"
}) {
  return (
    <motion.button
      type={onClick ? "button" : "submit"}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.025, boxShadow: "0 10px 36px rgba(212,147,65,.32)" }}
      whileTap={disabled ? {} : { scale: 0.975 }}
      style={{
        width: "100%", borderRadius: 12, padding: "14px 0",
        fontSize: 14, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase",
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.7 : 1,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        position: "relative", overflow: "hidden", fontFamily: "inherit",
        background: variant === "primary" ? "#d49341" : "transparent",
        color: variant === "primary" ? "white" : "#d49341",
        border: variant === "outline" ? "1.5px solid #d49341" : "none",
      }}
    >
      <motion.div
        initial={{ x: "-120%", opacity: 0 }}
        whileHover={{ x: "120%", opacity: 0.5 }}
        transition={{ duration: 0.55 }}
        style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent)", pointerEvents: "none" }}
      />
      {children}
    </motion.button>
  )
}

export default function Checkout({ course }: { course: Course }) {
  const router = useRouter()
  const [config, setConfig] = useState<Config | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [demoStage, setDemoStage] = useState<"idle" | "processing" | "receipt">("idle")

  useEffect(() => {
    fetch("/api/payment-config").then((r) => r.json()).then(setConfig)
      .catch(() => setConfig({ stripe: false, paypal: false, paypalClientId: null, demo: true }))
  }, [])

  const valid = email.includes("@") && name.trim().length > 1

  function requireValid() {
    if (!valid) { setError("Completá tu nombre y un email válido."); return false }
    setError("")
    return true
  }

  async function autoLogin(em: string, pw: string) {
    await signIn("credentials", { email: em, password: pw, redirect: false })
    router.push("/aula?enrolled=true")
    router.refresh()
  }

  function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async function handleDemoOrFree() {
    if (!requireValid()) return
    // Simulación de pago: solo cuando es un curso pago y no hay pasarela real activa
    // (un curso gratis no "simula" ningún cobro, entra directo)
    const isPaidDemo = !course.isFree && !(config?.stripe || config?.paypal)
    setLoading(true)
    if (isPaidDemo) setDemoStage("processing")
    try {
      const [res] = await Promise.all([
        fetch("/api/demo-enroll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId: course.id, email, name }),
        }),
        isPaidDemo ? wait(1500) : Promise.resolve(), // deja ver el paso "procesando" aunque la API responda al instante
      ])
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al inscribir")

      if (isPaidDemo) {
        setDemoStage("receipt")
        await wait(1900)
      }

      setSuccess(true)
      if (data.tempPassword) {
        setTimeout(() => autoLogin(data.email, data.tempPassword), 1200)
      } else {
        // Usuario existente: inscripto, pero entra con su contraseña de siempre
        setTimeout(() => router.push("/login?enrolled=true"), 1200)
      }
    } catch (e: unknown) {
      setDemoStage("idle")
      setError(e instanceof Error ? e.message : "Error al inscribir")
      setLoading(false)
    }
  }

  async function handleStripe() {
    if (!requireValid()) return
    setLoading(true)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id, email }),
      })
      const data = await res.json()
      if (data.url) { window.location.href = data.url; return }
      throw new Error(data.error || "Error con Stripe")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error de pago")
      setLoading(false)
    }
  }

  const focus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "var(--gold)"
    e.target.style.boxShadow   = "0 0 0 3px rgba(165,141,102,.18)"
  }
  const blur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "rgba(165,141,102,.25)"
    e.target.style.boxShadow   = "none"
  }

  /* ── Estado de carga inicial ── */
  if (!config) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "36px 0" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
          style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid #d49341", borderTopColor: "transparent" }}
        />
      </div>
    )
  }

  /* ── Simulación de pago: procesando ── */
  if (demoStage === "processing") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={spring}
        style={{ textAlign: "center", padding: "32px 0" }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #d49341", borderTopColor: "transparent", margin: "0 auto 18px" }}
        />
        <p style={{ fontFamily: "var(--serif)", fontSize: 19, color: "var(--text)", marginBottom: 6 }}>Procesando pago simulado…</p>
        <p style={{ color: "var(--text-muted)", fontSize: 13.5 }}>Validando datos de {course.title}</p>
      </motion.div>
    )
  }

  /* ── Simulación de pago: recibo ── */
  if (demoStage === "receipt") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={spring}
        style={{ textAlign: "center", padding: "28px 0" }}
      >
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 18 }}
        >
          <CheckCircle2 size={44} style={{ color: "var(--success)", margin: "0 auto 14px" }} />
        </motion.div>
        <p style={{ fontFamily: "var(--serif)", fontSize: 20, color: "var(--text)", marginBottom: 16 }}>Pago simulado exitoso</p>
        <div style={{ background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.18)", borderRadius: 12, padding: "16px 18px", marginBottom: 14, textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, color: "var(--text-muted)", marginBottom: 6 }}>
            <span>{course.title}</span>
            <span style={{ fontWeight: 700, color: "var(--text)" }}>{formatPrice(course.price, course.currency)}</span>
          </div>
          <div style={{ borderTop: "1px dashed rgba(165,141,102,.25)", paddingTop: 8, fontSize: 11, color: "var(--text-dim)" }}>
            Comprobante de demostración · sin cargo real
          </div>
        </div>
        <p style={{ fontSize: 12, color: "var(--text-faint)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <ShieldCheck size={12} /> No se realizó ningún cobro — modo demostración
        </p>
      </motion.div>
    )
  }

  /* ── Estado éxito ── */
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={spring}
        style={{ textAlign: "center", padding: "32px 0" }}
      >
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 18, delay: 0.1 }}
          style={{ fontSize: 48, color: "#d49341", marginBottom: 14 }}
        >
          ✦
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
          <p style={{ fontFamily: "var(--serif)", fontSize: 20, color: "var(--text)", marginBottom: 6 }}>¡Inscripción exitosa!</p>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Entrando a tu aula virtual…</p>
          <motion.div
            initial={{ width: 0 }} animate={{ width: "100%" }}
            transition={{ delay: 0.5, duration: 1.1 }}
            style={{ height: 3, background: "linear-gradient(90deg,#d49341,#f0b84c)", borderRadius: 4, marginTop: 20 }}
          />
        </motion.div>
      </motion.div>
    )
  }

  const isPaid = !course.isFree
  const realPayments = isPaid && (config.stripe || config.paypal)

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
      {/* Campos de datos */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>
            Nombre completo
          </label>
          <input value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre" style={inputStyle} onFocus={focus} onBlur={blur} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>
            Email
          </label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com" style={inputStyle} onFocus={focus} onBlur={blur} />
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="err"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto", x: [0, -8, 8, -6, 6, 0] }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 14, overflow: "hidden" }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Curso gratuito */}
      {course.isFree && (
        <GoldButton onClick={handleDemoOrFree} disabled={loading}>
          {loading
            ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}><Sparkles size={16} /></motion.div>Inscribiendo…</>
            : <><Sparkles size={16} />Inscribirme gratis</>
          }
        </GoldButton>
      )}

      {/* Stripe */}
      {realPayments && config.stripe && (
        <GoldButton onClick={handleStripe} disabled={loading}>
          {loading
            ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}><CreditCard size={16} /></motion.div>Procesando…</>
            : <><CreditCard size={16} />Pagar con tarjeta</>
          }
        </GoldButton>
      )}

      {/* PayPal */}
      {realPayments && config.paypal && config.paypalClientId && (
        <div style={{ marginTop: 12, opacity: !valid ? 0.5 : 1, pointerEvents: !valid ? "none" : undefined }}>
          <PayPalScriptProvider options={{ clientId: config.paypalClientId, currency: course.currency }}>
            <PayPalButtons
              style={{ shape: "pill", color: "gold", layout: "horizontal", tagline: false }}
              createOrder={async () => {
                const res = await fetch("/api/paypal/create-order", {
                  method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ courseId: course.id }),
                })
                return (await res.json()).id
              }}
              onApprove={async (data) => {
                const res = await fetch("/api/paypal/capture-order", {
                  method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ orderId: data.orderID, courseId: course.id, email, name }),
                })
                const result = await res.json()
                if (result.ok && result.tempPassword) {
                  setSuccess(true)
                  setTimeout(() => autoLogin(email, result.tempPassword), 1200)
                } else {
                  router.push("/login?enrolled=true")
                }
              }}
            />
          </PayPalScriptProvider>
        </div>
      )}

      {/* Demo */}
      {isPaid && !realPayments && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <GoldButton onClick={handleDemoOrFree} disabled={loading}>
            {loading
              ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}><Sparkles size={16} /></motion.div>Simulando…</>
              : <><Sparkles size={16} />Simular pago — demo</>
            }
          </GoldButton>
          <p style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "flex-start", gap: 6, lineHeight: 1.55 }}>
            <ShieldCheck size={13} style={{ color: "#d49341", marginTop: 1, flexShrink: 0 }} />
            Modo demostración: no se cobra nada. Las pasarelas reales se activan al cargar las credenciales.
          </p>
        </div>
      )}

      <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-faint)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 16 }}>
        <ShieldCheck size={12} /> Pago seguro · Acceso inmediato al aula
      </p>
    </motion.div>
  )
}
