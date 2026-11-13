"use client"

import { useEffect, useState } from "react"
import { Eye } from "lucide-react"

/**
 * Aviso flotante cuando un administrador está viendo el aula como un alumno (solo lectura).
 * No aparece para nadie más: la API solo responde "activo" si la sesión real es del panel.
 */
export default function ViewAsBanner() {
  const [info, setInfo] = useState<{ student: string; by: string | null } | null>(null)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    fetch("/api/me/view-as", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (d?.active) setInfo({ student: d.student, by: d.by }) })
      .catch(() => {})
  }, [])

  if (!info) return null

  async function exit() {
    setLeaving(true)
    await fetch("/api/admin/view-as", { method: "DELETE" }).catch(() => {})
    window.location.href = "/superadmin/alumnos"
  }

  return (
    <div role="status" style={{
      position: "fixed", left: "50%", bottom: 18, transform: "translateX(-50%)", zIndex: 400, maxWidth: "calc(100vw - 24px)",
      display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", justifyContent: "center",
      padding: "11px 18px", borderRadius: 14, background: "#3A2410", color: "#F6EBDD", border: "1px solid #C49F72", boxShadow: "0 14px 44px rgba(0,0,0,.45)",
    }}>
      <Eye size={17} style={{ color: "#E4C896", flexShrink: 0 }} aria-hidden />
      <span style={{ fontSize: 14, lineHeight: 1.4 }}>
        Estás viendo el aula como <strong>{info.student}</strong> · solo lectura
      </span>
      <button onClick={exit} disabled={leaving} style={{ padding: "7px 16px", borderRadius: 9, border: "none", background: "#E4C896", color: "#2C1F14", fontSize: 13.5, fontWeight: 700, cursor: leaving ? "wait" : "pointer" }}>
        {leaving ? "Saliendo…" : "Volver al panel"}
      </button>
    </div>
  )
}
