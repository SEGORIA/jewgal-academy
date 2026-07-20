"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { motion } from "framer-motion"
import { CheckCircle2, Loader2, AlertTriangle } from "lucide-react"

type Estado = "verificando" | "ok" | "existente" | "error"

export default function CompraExitosaPage() {
  const router = useRouter()
  const [estado, setEstado] = useState<Estado>("verificando")
  const [curso, setCurso] = useState("")

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id")
    if (!sessionId) { setEstado("error"); return }

    fetch("/api/stripe/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then((r) => r.json())
      .then(async (d) => {
        if (!d.ok) { setEstado("error"); return }
        setCurso(d.courseTitle ?? "")
        if (d.tempPassword) {
          setEstado("ok")
          await signIn("credentials", { email: d.email, password: d.tempPassword, redirect: false })
          setTimeout(() => { router.push("/aula?enrolled=true"); router.refresh() }, 1500)
        } else {
          // Alumno con cuenta previa: entra con su contraseña de siempre
          setEstado("existente")
          setTimeout(() => router.push("/login?enrolled=true"), 2200)
        }
      })
      .catch(() => setEstado("error"))
  }, [router])

  return (
    <main style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(160deg,var(--navy-2) 0%,var(--navy) 60%,#2A1D12 100%)",
      padding: 24,
    }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          maxWidth: 460, width: "100%", textAlign: "center",
          background: "var(--surface)", borderRadius: 18,
          border: "1px solid rgba(165,141,102,.2)",
          padding: "48px 36px",
          boxShadow: "0 30px 80px rgba(0,0,0,.35)",
        }}
      >
        {estado === "verificando" && (
          <>
            <Loader2 size={44} style={{ color: "var(--gold)", margin: "0 auto 20px", animation: "spin 1s linear infinite" }} />
            <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 26, color: "var(--text)", marginBottom: 10 }}>
              Confirmando tu pago…
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6 }}>
              Un momento, estamos verificando la compra con Stripe.
            </p>
          </>
        )}

        {estado === "ok" && (
          <>
            <CheckCircle2 size={44} style={{ color: "var(--success)", margin: "0 auto 20px" }} />
            <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 26, color: "var(--text)", marginBottom: 10 }}>
              ¡Pago confirmado!
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6 }}>
              {curso ? <>Ya estás inscripto en <strong style={{ color: "var(--text)" }}>{curso}</strong>.</> : "Tu inscripción está lista."}
              <br />Entrando al aula…
            </p>
          </>
        )}

        {estado === "existente" && (
          <>
            <CheckCircle2 size={44} style={{ color: "var(--success)", margin: "0 auto 20px" }} />
            <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 26, color: "var(--text)", marginBottom: 10 }}>
              ¡Pago confirmado!
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6 }}>
              {curso ? <>Se agregó <strong style={{ color: "var(--text)" }}>{curso}</strong> a tu cuenta.</> : "Tu inscripción está lista."}
              <br />Inicia sesión con tu contraseña de siempre…
            </p>
          </>
        )}

        {estado === "error" && (
          <>
            <AlertTriangle size={44} style={{ color: "var(--warning)", margin: "0 auto 20px" }} />
            <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 26, color: "var(--text)", marginBottom: 10 }}>
              No pudimos confirmar el pago
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              Si el cobro se realizó, tu inscripción se procesará automáticamente en unos minutos.
              Si no puedes entrar al aula, escríbenos y lo resolvemos.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/login" className="btn solid">Ir al login</Link>
              <Link href="/contacto" className="btn">Contacto</Link>
            </div>
          </>
        )}
      </motion.div>
    </main>
  )
}
