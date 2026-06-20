"use client"

import { useEffect, useState } from "react"
import { Download, AlertCircle, CreditCard, TrendingUp, DollarSign, Users, Loader2 } from "lucide-react"

type Payment = {
  id: string; amount: number; currency: string; status: string
  paidAt: string | null; createdAt: string
  user: { name: string; email: string }
  course: { title: string; slug: string }
}

const PROGRAMS_META: Record<string, { name: string; accent: string; price: number }> = {
  "life-coaching-integrativo": { name: "Life Coaching Integrativo", accent: "#A58D66", price: 1500 },
  "joogal-adultos":            { name: "Instructor Joogal Adultos", accent: "#6BBF8E", price: 0 },
  "joogalkids":                { name: "Instructor Joogalkids",     accent: "#7B9FD8", price: 360 },
  "metodo-sholem":             { name: "Método Sholem",             accent: "#B07FD8", price: 360 },
  "cabala-coach":              { name: "Cábala Coach",              accent: "#CBB78B", price: 360 },
}

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string; border: string }> = {
  completed: { label: "Completado", color: "#6BBF8E", bg: "rgba(107,191,142,.1)",  border: "rgba(107,191,142,.25)" },
  demo:      { label: "Demo",       color: "#A58D66", bg: "rgba(165,141,102,.1)",  border: "rgba(165,141,102,.25)" },
  pending:   { label: "Pendiente",  color: "#fbbf24", bg: "rgba(251,191,36,.1)",   border: "rgba(251,191,36,.25)" },
}

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid rgba(165,141,102,.13)",
  borderRadius: 14,
}

export default function PagosAdminPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState("Todos")

  useEffect(() => {
    fetch("/api/admin/payments")
      .then((r) => r.json())
      .then((d) => setPayments(d.payments ?? []))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false))
  }, [])

  const completedPayments = payments.filter((p) => p.status !== "pending")
  const totalRevenue      = completedPayments.reduce((s, p) => s + p.amount, 0)
  const uniqueStudents    = new Set(completedPayments.map((p) => p.user.email)).size
  const avgTicket         = completedPayments.length > 0 ? totalRevenue / completedPayments.length : 0

  const filtered = filter === "Todos" ? payments : payments.filter((p) => p.course.slug === filter)

  const selectStyle: React.CSSProperties = {
    background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.2)",
    borderRadius: 9, padding: "9px 13px", fontSize: 13, color: "var(--text)",
    outline: "none", fontFamily: "inherit", cursor: "pointer",
  }

  function downloadCSV() {
    const rows = [["Fecha","Alumna","Email","Programa","Monto","Estado"]]
    payments.forEach((p) => rows.push([
      p.paidAt ? new Date(p.paidAt).toLocaleDateString("es-AR") : "—",
      p.user.name, p.user.email, p.course.title,
      `$${p.amount}`, p.status,
    ]))
    const csv  = rows.map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a"); a.href = url; a.download = "pagos-jewgal.csv"; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <span style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold,#A58D66)", display: "block", marginBottom: 8 }}>Admin</span>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 36, color: "var(--text)", marginBottom: 6 }}>Ingresos y pagos</h1>
          <p style={{ color: "var(--text-faint)", fontSize: 14 }}>Historial financiero de la plataforma.</p>
        </div>
        <button onClick={downloadCSV} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.2)", borderRadius: 10, padding: "11px 18px", fontSize: 13, color: "var(--text-strong)", cursor: "pointer", transition: "all .2s" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(165,141,102,.5)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(165,141,102,.2)")}
        >
          <Download size={15} /> Exportar CSV
        </button>
      </div>

      {/* Aviso Stripe si no hay pagos reales */}
      {!payments.some((p) => p.status === "completed") && (
        <div style={{ ...card, padding: "18px 22px", marginBottom: 24, borderColor: "rgba(251,191,36,.2)", background: "rgba(251,191,36,.04)", display: "flex", gap: 14 }}>
          <AlertCircle size={18} style={{ color: "#fbbf24", flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>Stripe no está conectado</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
              Agregá <code style={{ color: "#fbbf24", background: "rgba(251,191,36,.1)", padding: "1px 6px", borderRadius: 4 }}>STRIPE_SECRET_KEY</code> en tu <code style={{ color: "#fbbf24", background: "rgba(251,191,36,.1)", padding: "1px 6px", borderRadius: 4 }}>.env.local</code> para activar pagos reales. Los pagos demo se muestran abajo.
            </p>
          </div>
        </div>
      )}

      {/* Métricas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Ingresos totales",  value: loading ? "—" : `$${totalRevenue.toLocaleString("es")}`,  sub: "Pagos completados + demo", icon: DollarSign, accent: "#A58D66" },
          { label: "Transacciones",     value: loading ? "—" : String(completedPayments.length),          sub: "Inscripciones activas",    icon: CreditCard, accent: "#4B7E8C" },
          { label: "Alumnas pagas",     value: loading ? "—" : String(uniqueStudents),                   sub: "Usuarios únicos",          icon: Users,      accent: "#6BBF8E" },
          { label: "Ticket promedio",   value: loading ? "—" : avgTicket > 0 ? `$${Math.round(avgTicket).toLocaleString("es")}` : "$—", sub: "Por transacción", icon: TrendingUp, accent: "#B07FD8" },
        ].map(({ label, value, sub, icon: Icon, accent }) => (
          <div key={label} style={{ ...card, padding: "20px 18px" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: accent + "22", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <Icon size={17} style={{ color: accent }} />
            </div>
            <p style={{ fontSize: 26, fontWeight: 700, color: "var(--text)", fontFamily: "var(--serif)" }}>{value}</p>
            <p style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 3 }}>{label}</p>
            <p style={{ fontSize: 11, color: accent, marginTop: 3, opacity: .7 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Tabla de transacciones */}
      <div style={{ ...card, overflow: "hidden" }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--surface-2)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 18, color: "var(--text)" }}>Transacciones</h2>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={selectStyle}>
            <option value="Todos">Todos los programas</option>
            {Object.entries(PROGRAMS_META).map(([slug, m]) => (
              <option key={slug} value={slug}>{m.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div style={{ padding: "60px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "var(--text-dim)" }}>
            <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> Cargando transacciones…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "60px 0", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(165,141,102,.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <CreditCard size={22} style={{ color: "rgba(165,141,102,.5)" }} />
            </div>
            <p style={{ color: "var(--text-muted)", fontWeight: 500, marginBottom: 6 }}>No hay transacciones</p>
            <p style={{ color: "var(--text-dim)", fontSize: 13 }}>Los pagos aparecerán aquí después de la primera inscripción.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--surface-2)" }}>
                  {["Alumna", "Programa", "Monto", "Estado", "Fecha"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "13px 18px", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const s = STATUS_LABEL[p.status] ?? STATUS_LABEL.pending
                  return (
                    <tr key={p.id} style={{ borderBottom: "1px solid var(--surface)", transition: "background .15s" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--surface)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                    >
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ fontWeight: 500, color: "var(--text)", marginBottom: 2 }}>{p.user.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{p.user.email}</div>
                      </td>
                      <td style={{ padding: "14px 18px", color: "var(--text-muted)", fontSize: 12 }}>{p.course.title}</td>
                      <td style={{ padding: "14px 18px", color: p.amount > 0 ? "var(--text)" : "var(--text-dim)", fontFamily: "var(--serif)", fontSize: 15 }}>
                        {p.amount > 0 ? `$${p.amount.toLocaleString("es")}` : "—"}
                      </td>
                      <td style={{ padding: "14px 18px" }}>
                        <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 20, fontWeight: 600, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                          {s.label}
                        </span>
                      </td>
                      <td style={{ padding: "14px 18px", color: "var(--text-faint)", fontSize: 12 }}>
                        {p.paidAt ? new Date(p.paidAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
