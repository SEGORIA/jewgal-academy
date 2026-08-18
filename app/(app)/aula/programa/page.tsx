"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Lock } from "lucide-react"

type Material = {
  id: string; moduleNumber: number; order: number
  progress: { completedAt: string | null } | null
}

export default function ProgramaIndexPage() {
  const router = useRouter()
  const [state, setState] = useState<"loading" | "empty" | "redirecting">("loading")

  useEffect(() => {
    fetch("/api/me/materials")
      .then((r) => r.json())
      .then((d: { materials?: Material[] }) => {
        const materials = d.materials ?? []
        if (materials.length === 0) {
          setState("empty")
          return
        }
        const sorted = [...materials].sort((a, b) => a.moduleNumber - b.moduleNumber || a.order - b.order)
        const firstIncomplete = sorted.find((m) => !m.progress?.completedAt)
        const target = firstIncomplete ?? sorted[sorted.length - 1]
        setState("redirecting")
        router.replace(`/aula/programa/${target.id}`)
      })
      .catch(() => setState("empty"))
  }, [router])

  if (state === "empty") {
    return (
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <div style={{
          background: "var(--surface)", border: "1px solid rgba(165,141,102,.14)", borderRadius: 14,
          padding: "56px 32px", textAlign: "center",
        }}>
          <Lock size={26} style={{ color: "rgba(165,141,102,.35)", margin: "0 auto 16px", display: "block" }} />
          <p style={{ color: "var(--text)", fontSize: 16, marginBottom: 8, fontFamily: "var(--serif)", fontWeight: 500 }}>
            Todavía no hay un programa disponible en tu cuenta
          </p>
          <p style={{ color: "var(--text-dim)", fontSize: 14, maxWidth: 380, margin: "0 auto" }}>
            Si creés que es un error, escribinos desde Contacto.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-dim)", padding: "40px 0" }}>
      <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Preparando tu programa…
    </div>
  )
}
