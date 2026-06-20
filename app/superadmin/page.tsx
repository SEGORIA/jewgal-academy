"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Users, BookOpen, CreditCard, TrendingUp, ArrowUpRight, UserPlus, PlayCircle, FileText, Globe } from "lucide-react"
import { motion } from "framer-motion"

type Stats = { studentCount: number; enrollmentCount: number; totalRevenue: number; paymentCount: number; enrollmentsByProgram: { courseId: string; _count: { courseId: number } }[] }

const PROGRAMS = [
  { name: "Life Coaching Integrativo", slug: "life-coaching-integrativo", accent: "#A58D66" },
  { name: "Instructor Joogal Adultos", slug: "joogal-adultos",            accent: "#6BBF8E" },
  { name: "Instructor Joogalkids",     slug: "joogalkids",                accent: "#7B9FD8" },
  { name: "Método Sholem",             slug: "metodo-sholem",             accent: "#B07FD8" },
  { name: "Cábala Coach",              slug: "cabala-coach",              accent: "#CBB78B" },
]

const quickActions = [
  { label: "Agregar alumna",     href: "/superadmin/alumnos",  icon: UserPlus,   color: "#A58D66" },
  { label: "Agendar clase live", href: "/superadmin/cursos",   icon: PlayCircle, color: "#4B7E8C" },
  { label: "Nueva entrada blog", href: "/superadmin/blog",     icon: FileText,   color: "#6BBF8E" },
  { label: "Editar sitio web",   href: "/superadmin/web",      icon: Globe,      color: "#B07FD8" },
]

const card: React.CSSProperties = {
  background: "rgba(255,255,255,.03)",
  border: "1px solid rgba(165,141,102,.13)",
  borderRadius: 14,
}

function StatCard({ label, value, delta, icon: Icon, href, accent, loading }: {
  label: string; value: string; delta: string; icon: typeof Users; href: string; accent: string; loading: boolean
}) {
  return (
    <Link href={href} style={{ ...card, padding: "22px 20px", textDecoration: "none", display: "block", transition: "border-color .2s, box-shadow .2s" }}
      onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = accent + "55"; el.style.boxShadow = `0 8px 32px ${accent}18` }}
      onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(165,141,102,.13)"; el.style.boxShadow = "none" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ width: 38, height: 38, borderRadius: 9, background: accent + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={18} style={{ color: accent }} />
        </div>
        <ArrowUpRight size={14} style={{ color: "rgba(224,233,234,.2)" }} />
      </div>
      {loading ? (
        <div style={{ height: 36, width: 80, background: "rgba(255,255,255,.06)", borderRadius: 6, marginBottom: 4 }} />
      ) : (
        <p style={{ fontSize: 30, fontWeight: 700, color: "#eef4f4", fontFamily: "var(--serif)", marginBottom: 4 }}>{value}</p>
      )}
      <p style={{ fontSize: 12, color: "rgba(224,233,234,.4)" }}>{label}</p>
      <p style={{ fontSize: 11, color: accent, marginTop: 4, opacity: .8 }}>{delta}</p>
    </Link>
  )
}

export default function AdminDashboard() {
  const [stats, setStats]   = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const now = new Date().toLocaleDateString("es-AR", { month: "long", year: "numeric" })

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label: "Alumnos activos",   value: stats ? String(stats.studentCount)    : "—", delta: "Registradas", icon: Users,      href: "/superadmin/alumnos", accent: "#A58D66" },
    { label: "Programas activos", value: "5",                                          delta: "Todos publicados", icon: BookOpen, href: "/superadmin/cursos",  accent: "#4B7E8C" },
    { label: "Ingresos totales",  value: stats ? `$${stats.totalRevenue.toLocaleString("es")}` : "—", delta: stats?.paymentCount ? `${stats.paymentCount} transacciones` : "Stripe pendiente", icon: CreditCard, href: "/superadmin/pagos", accent: "#6BBF8E" },
    { label: "Inscripciones",     value: stats ? String(stats.enrollmentCount) : "—", delta: "Activas",     icon: TrendingUp, href: "/superadmin/alumnos", accent: "#B07FD8" },
  ]

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <span style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold,#A58D66)", display: "block", marginBottom: 10 }}>
          Jewgal Academy
        </span>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 38, color: "#eef4f4", marginBottom: 6 }}>
          Panel de control
        </h1>
        <p style={{ color: "rgba(224,233,234,.45)", fontSize: 15 }}>
          Gestión completa de la plataforma · {now}
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 16, marginBottom: 28 }}>
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: -14, rotateX: -12 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.55, delay: i * 0.08, ease: [0.23, 1, 0.32, 1] }}
            style={{ perspective: 600, transformStyle: "preserve-3d" }}
          >
            <StatCard {...s} loading={loading} />
          </motion.div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 20, marginBottom: 20 }}>
        {/* Acciones rápidas */}
        <div style={{ ...card, padding: "24px 22px" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 18, color: "#eef4f4", marginBottom: 18 }}>
            Acciones rápidas
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {quickActions.map(({ label, href, icon: Icon, color }) => (
              <Link key={label} href={href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, textDecoration: "none", transition: "background .18s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.04)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
              >
                <div style={{ width: 34, height: 34, borderRadius: 8, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <span style={{ fontSize: 13, color: "rgba(224,233,234,.75)", fontWeight: 500 }}>{label}</span>
                <ArrowUpRight size={13} style={{ color: "rgba(224,233,234,.2)", marginLeft: "auto" }} />
              </Link>
            ))}
          </div>
        </div>

        {/* Actividad / estado del sistema */}
        <div style={{ ...card, padding: "24px 22px" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 18, color: "#eef4f4", marginBottom: 18 }}>
            Estado del sistema
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { dot: "#6BBF8E", title: "Base de datos", sub: "SQLite · Operativa" },
              { dot: "#6BBF8E", title: "5 programas publicados", sub: "Accesibles desde el sitio" },
              { dot: "#fbbf24", title: "Stripe", sub: "Configurar STRIPE_SECRET_KEY para activar pagos reales" },
              { dot: "#fbbf24", title: "PayPal", sub: "Configurar PAYPAL_CLIENT_ID para activar PayPal" },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.dot, marginTop: 5, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, color: "rgba(224,233,234,.75)", fontWeight: 500 }}>{item.title}</p>
                  <p style={{ fontSize: 12, color: "rgba(224,233,234,.35)", marginTop: 2 }}>{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Programas overview */}
      <div style={{ ...card, padding: "24px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 18, color: "#eef4f4" }}>
            Programas · Vista general
          </h2>
          <Link href="/superadmin/cursos" style={{ fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--gold,#A58D66)", textDecoration: "none" }}>
            Gestionar →
          </Link>
        </div>
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px", gap: 12, padding: "0 14px 12px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
            {["Programa", "Estado", "Inscripciones"].map((h) => (
              <span key={h} style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(224,233,234,.3)" }}>{h}</span>
            ))}
          </div>
          {PROGRAMS.map((p, i) => {
            const enrolled = stats?.enrollmentsByProgram?.find((e: any) => e.courseId && true)?._count?.courseId ?? 0
            return (
              <motion.div key={p.slug} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px", gap: 12, padding: "14px", borderBottom: "1px solid rgba(255,255,255,.04)", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.accent, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "rgba(224,233,234,.75)" }}>{p.name}</span>
                </div>
                <span style={{ fontSize: 11, color: "#6BBF8E", background: "rgba(107,191,142,.1)", border: "1px solid rgba(107,191,142,.2)", borderRadius: 20, padding: "3px 10px", display: "inline-block" }}>
                  Activo
                </span>
                <span style={{ fontSize: 13, color: "rgba(224,233,234,.45)" }}>
                  {loading ? "—" : enrolled}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
