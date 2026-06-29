"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CreditCard, CheckCircle2, Clock, AlertCircle, ArrowRight, Loader2 } from "lucide-react"

type Payment = {
  id: string; amount: number; currency: string; status: string
  paidAt: string | null; createdAt: string
  course: { title: string; slug: string }
}

const PROGRAM_META: Record<string, { icon: string; accent: string }> = {
  "life-coaching-integrativo": { icon: "⟡", accent: "#A58D66" },
  "joogal-adultos":            { icon: "✦", accent: "#C49F72" },
  "joogalkids":                { icon: "★", accent: "#A76D61" },
  "metodo-sholem":             { icon: "◈", accent: "#B07FD8" },
  "cabala-coach":              { icon: "❂", accent: "#CBB78B" },
}

const STATUS = {
  completed: { label: "Completado", color: "#C49F72", bg: "rgba(196,159,114,.1)",  border: "rgba(196,159,114,.25)", icon: CheckCircle2 },
  demo:      { label: "Demo",       color: "var(--gold)", bg: "rgba(165,141,102,.1)",  border: "rgba(165,141,102,.25)", icon: CheckCircle2 },
  pending:   { label: "Pendiente",  color: "var(--warning)", bg: "rgba(251,191,36,.08)",  border: "rgba(251,191,36,.25)",  icon: Clock },
}

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid rgba(165,141,102,.13)",
  borderRadius: 14,
}

export default function PagosPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    fetch("/api/me/payments")
      .then((r) => r.json())
      .then((d) => setPayments(d.payments ?? []))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false))
  }, [])

  const total = payments
    .filter((p) => p.status !== "pending")
    .reduce((s, p) => s + p.amount, 0)

  const pending = payments.filter((p) => p.status === "pending")

  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>
      <div style={{ marginBottom: 36 }}>
        <span style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: 10 }}>
          Aula Virtual
        </span>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 36, color: "var(--text)", marginBottom: 6 }}>
          Mis pagos
        </h1>
        <p style={{ color: "var(--text-faint)", fontSize: 14 }}>
          Historial de tus inscripciones y transacciones.
        </p>
      </div>

      {/* Resumen */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Programas pagados", value: String(payments.filter((p) => p.status !== "pending").length), accent: "#A58D66" },
          { label: "Total invertido",   value: loading ? "—" : `$${total.toLocaleString("es")}`,               accent: "#C49F72" },
          { label: "Pagos pendientes",  value: String(pending.length),                                          accent: pending.length > 0 ? "var(--warning)" : "var(--text-dim)" },
        ].map(({ label, value, accent }) => (
          <div key={label} style={{ ...card, padding: "20px 18px" }}>
            <p style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", fontFamily: "var(--serif)", marginBottom: 4 }}>{value}</p>
            <p style={{ fontSize: 12, color: accent }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Aviso pagos pendientes */}
      {pending.length > 0 && (
        <div style={{ ...card, padding: "18px 22px", marginBottom: 20, borderColor: "rgba(251,191,36,.25)", background: "rgba(251,191,36,.04)", display: "flex", gap: 14, alignItems: "flex-start" }}>
          <AlertCircle size={18} style={{ color: "var(--warning)", flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
              Tenés {pending.length} pago{pending.length > 1 ? "s" : ""} pendiente{pending.length > 1 ? "s" : ""}
            </p>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Completá el pago para acceder al contenido del programa.
            </p>
          </div>
          <Link href="/#programas" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--warning)", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
            Completar <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* Lista de pagos */}
      <div style={{ ...card, overflow: "hidden" }}>
        <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--surface-2)" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 18, color: "var(--text)" }}>
            Historial de transacciones
          </h2>
        </div>

        {loading ? (
          <div style={{ padding: "60px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "var(--text-dim)" }}>
            <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
            Cargando historial…
          </div>
        ) : payments.length === 0 ? (
          <div style={{ padding: "60px 0", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 14, color: "rgba(165,141,102,.2)" }}>✦</div>
            <p style={{ color: "var(--text-faint)", fontSize: 14, marginBottom: 8 }}>Aún no tenés transacciones registradas.</p>
            <Link href="/#programas" style={{ fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--gold)", textDecoration: "none" }}>
              Ver programas →
            </Link>
          </div>
        ) : (
          <div>
            {payments.map((p) => {
              const meta = PROGRAM_META[p.course.slug] ?? { icon: "✦", accent: "#A58D66" }
              const st   = STATUS[p.status as keyof typeof STATUS] ?? STATUS.pending
              const StIcon = st.icon
              return (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 22px", borderBottom: "1px solid var(--surface)", transition: "background .15s" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--surface)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                >
                  {/* Icono del programa */}
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: `${meta.accent}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                    {meta.icon}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, color: "var(--text)", fontSize: 14, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.course.title}
                    </p>
                    <p style={{ fontSize: 12, color: "var(--text-dim)" }}>
                      {p.paidAt
                        ? new Date(p.paidAt).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })
                        : new Date(p.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })
                      }
                    </p>
                  </div>

                  {/* Monto */}
                  <p style={{ fontSize: 16, fontFamily: "var(--serif)", color: p.amount > 0 ? "var(--text)" : "var(--text-dim)", fontWeight: 600, flexShrink: 0 }}>
                    {p.amount > 0 ? `$${p.amount.toLocaleString("es")}` : "Gratis"}
                  </p>

                  {/* Estado */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, padding: "5px 12px", borderRadius: 20, fontWeight: 600, background: st.bg, color: st.color, border: `1px solid ${st.border}`, flexShrink: 0 }}>
                    <StIcon size={12} />
                    {st.label}
                  </div>

                  {/* Completar pago si pendiente */}
                  {p.status === "pending" && (
                    <Link href={`/programas/${p.course.slug}`} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--warning)", textDecoration: "none", flexShrink: 0 }}>
                      Completar <ArrowRight size={12} />
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
