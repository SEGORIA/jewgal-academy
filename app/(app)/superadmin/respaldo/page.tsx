"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Database, Download, FileSpreadsheet, ShieldAlert } from "lucide-react"
import { PageHeader, ToastProvider, api, card, useToast } from "@/components/admin/ui"

const CSVS: { table: string; label: string; desc: string }[] = [
  { table: "students", label: "Alumnos", desc: "Datos de contacto, estado y programas de cada alumno." },
  { table: "enrollments", label: "Inscripciones", desc: "Quién está en qué programa, con su avance y certificado." },
  { table: "payments", label: "Pagos", desc: "Todos los cobros, reembolsos y pagos manuales." },
  { table: "contacts", label: "Mensajes de contacto", desc: "Lo que escribieron desde el formulario del sitio." },
  { table: "subscribers", label: "Suscriptores del newsletter", desc: "Correos suscriptos y su fecha." },
]

const MODEL_LABELS: Record<string, string> = {
  User: "Usuarios", Course: "Programas", CourseModule: "Módulos", Material: "Materiales", Enrollment: "Inscripciones", Payment: "Pagos", MaterialProgress: "Avance por material",
  LiveSession: "Clases en vivo", Attendance: "Asistencias", Post: "Artículos", Testimonial: "Testimonios", ContactMessage: "Mensajes de contacto", Announcement: "Anuncios",
  SiteSetting: "Ajustes del sitio", Notification: "Notificaciones", AuditLog: "Historial", ForumTopic: "Temas del foro", ForumPost: "Respuestas del foro", ExclusiveResource: "Recursos exclusivos",
}

const dl = (href: string) => { const a = document.createElement("a"); a.href = href; a.rel = "noopener"; document.body.appendChild(a); a.click(); a.remove() }

function Inner() {
  const toast = useToast()
  const [counts, setCounts] = useState<Record<string, number> | null>(null)
  const [withAudit, setWithAudit] = useState(false)

  useEffect(() => { api<{ counts: Record<string, number> }>("/api/admin/backup?kind=summary").then((d) => setCounts(d.counts)).catch((e) => toast("error", (e as Error).message)) }, [toast])

  const shown = counts ? Object.entries(counts).filter(([m, n]) => n > 0 && MODEL_LABELS[m]).sort((a, b) => b[1] - a[1]) : []

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <PageHeader eyebrow="Sistema" title="Respaldo y exportación"
        subtitle="Llevate una copia de los datos de la plataforma cuando quieras: todo junto en un archivo, o por partes en planillas para Excel." />

      <div role="note" style={{ ...card, padding: "14px 18px", marginBottom: 22, display: "flex", gap: 12, alignItems: "flex-start", borderColor: "rgba(251,191,36,.35)", background: "var(--warning-soft)" }}>
        <ShieldAlert size={20} style={{ color: "var(--warning)", flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 14, color: "var(--text-strong)", lineHeight: 1.65 }}>
          Estos archivos contienen <strong>datos personales</strong> de alumnos (nombres, correos, pagos). Guardalos en un lugar seguro y no los compartas. Las contraseñas nunca se incluyen. Cada descarga queda anotada en el Historial.
        </p>
      </div>

      <div style={{ ...card, padding: 24, marginBottom: 22 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
          <Database size={26} style={{ color: "var(--gold-ink)", flexShrink: 0 }} />
          <div style={{ flex: "1 1 320px" }}>
            <p style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--text)", marginBottom: 6 }}>Respaldo completo</p>
            <p style={{ fontSize: 14.5, color: "var(--text-muted)", lineHeight: 1.65, marginBottom: 14 }}>
              Un único archivo (.json) con programas, materiales, alumnos, inscripciones, pagos, mensajes, ajustes del sitio y más. Sirve para conservar una copia propia o para migrar los datos a otro sistema.
            </p>
            <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14, color: "var(--text-strong)", cursor: "pointer", marginBottom: 16 }}>
              <input type="checkbox" checked={withAudit} onChange={(e) => setWithAudit(e.target.checked)} style={{ width: 17, height: 17, accentColor: "var(--terra)" }} /> Incluir también el historial de cambios (el archivo pesa más)
            </label>
            <button onClick={() => dl(`/api/admin/backup?kind=full${withAudit ? "&audit=1" : ""}`)} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: 10, background: "var(--grad-cta)", border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              <Download size={16} /> Descargar respaldo completo
            </button>
          </div>
        </div>
        {shown.length > 0 && (
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {shown.slice(0, 12).map(([m, n]) => <span key={m} style={{ fontSize: 12.5, padding: "4px 11px", borderRadius: 999, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-strong)" }}>{MODEL_LABELS[m]} <strong>{n}</strong></span>)}
          </div>
        )}
      </div>

      <p style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--text)", marginBottom: 12 }}>Planillas para Excel</p>
      <div style={{ display: "grid", gap: 10 }}>
        {CSVS.map((c) => (
          <div key={c.table} style={{ ...card, padding: "14px 18px", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <FileSpreadsheet size={20} style={{ color: "var(--gold-ink)", flexShrink: 0 }} />
            <div style={{ flex: "1 1 240px" }}>
              <p style={{ color: "var(--text)", fontSize: 15.5, fontWeight: 600 }}>{c.label}</p>
              <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>{c.desc}</p>
            </div>
            <button onClick={() => dl(`/api/admin/backup?kind=csv&table=${c.table}`)} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 10, background: "transparent", border: "1px solid var(--border)", color: "var(--text-strong)", fontSize: 13.5, cursor: "pointer" }}>
              <Download size={14} /> Descargar CSV
            </button>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 13.5, color: "var(--text-faint)", lineHeight: 1.7, marginTop: 22 }}>
        Además de estas copias, la base de datos mantiene sus propios respaldos automáticos según el plan que tenga contratado con su proveedor. Para recuperar algo que se borró o se cambió por error desde el panel, usá primero el <Link href="/superadmin/historial" style={{ color: "var(--gold-ink)" }}>Historial de cambios</Link>.
      </p>
    </div>
  )
}

export default function RespaldoPage() { return <ToastProvider><Inner /></ToastProvider> }
