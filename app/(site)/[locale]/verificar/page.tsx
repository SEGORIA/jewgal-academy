"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import RevealInit from "@/components/RevealInit"
import { ShieldCheck, Search } from "lucide-react"

export default function VerificarPage() {
  const router = useRouter()
  const [numero, setNumero] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!numero.trim()) return
    router.push(`/verificar/${encodeURIComponent(numero.trim())}`)
  }

  return (
    <>
      <RevealInit />
      <Navbar />
      <section style={{
        background: "linear-gradient(135deg,var(--bg) 0%,var(--surface-solid) 55%,#2A1D12 100%)",
        minHeight: "70vh", display: "flex", alignItems: "center",
        paddingTop: "clamp(120px,14vw,160px)", paddingBottom: 80,
      }}>
        <div className="wrap" style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", padding: "0 24px" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(165,141,102,.12)", border: "1px solid rgba(165,141,102,.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <ShieldCheck size={28} style={{ color: "var(--gold)" }} />
          </div>
          <span className="eyebrow" style={{ display: "block", marginBottom: 16 }}>Jewgal Academy</span>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(30px,4vw,44px)", color: "var(--text)", marginBottom: 16 }}>
            Verificar un certificado
          </h1>
          <p style={{ color: "var(--on-dark)", fontSize: 15.5, lineHeight: 1.7, marginBottom: 36 }}>
            Ingresá el número de certificado (por ejemplo <em style={{ fontStyle: "italic", color: "var(--gold-light)" }}>JA-2026-0001</em>) para confirmar su autenticidad.
          </p>
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, maxWidth: 420, margin: "0 auto" }}>
            <input
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="JA-2026-0001"
              style={{
                flex: 1, background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.25)",
                borderRadius: 10, padding: "13px 16px", fontSize: 14, color: "var(--text)", outline: "none",
                fontFamily: "inherit", textAlign: "center", letterSpacing: ".04em",
              }}
            />
            <button type="submit" className="btn solid" style={{ display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
              <Search size={15} /> Verificar
            </button>
          </form>
        </div>
      </section>
      <Footer />
    </>
  )
}
