"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Users, BookOpen, CreditCard, TrendingUp, ArrowUpRight, UserPlus, PlayCircle, FileText, Globe } from "lucide-react"
import { motion } from "framer-motion"

type Stats = {
  studentCount: number; enrollmentCount: number; totalRevenue: number; paymentCount: number
  enrollmentsByProgram: { slug: string | null; count: number }[]
  courses: { id: string; slug: string; title: string; isPublished: boolean }[]
  publishedCourseCount: number
  integrations: { stripe: boolean; paypal: boolean; email: boolean }
}

const ACCENTS = ["#A58D66", "#A76D61", "#C49F72", "#CBB78B", "#8FBF9F"]
const accentFor = (i: number) => ACCENTS[i % ACCENTS.length]

const quickActions = [
  { label: "Agregar alumno",     href: "/superadmin/alumnos",  icon: UserPlus,   color: "var(--gold)" },
  { label: "Agendar clase live", href: "/superadmin/cursos",   icon: PlayCircle, color: "var(--teal)" },
  { label: "Nueva entrada blog", href: "/superadmin/blog",     icon: FileText,   color: "var(--success)" },
  { label: "Editar sitio web",   href: "/superadmin/web",      icon: Globe,      color: "#A76D61" },
]

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid rgba(165,141,102,.13)",
  borderRadius: 14,
}

function StatCard({ label, value, delta, icon: Icon, href, accent, loading }: {
  label: string; value: string; delta: string; icon: typeof Users; href: string; accent: string; loading: boolean
}) {
  return (
    <Link href={href} style={{
      ...card, padding: "22px 20px", textDecoration: "none", display: "block",
      transition: "border-color .22s, box-shadow .22s, transform .18s",
      position: "relative", overflow: "hidden",
    }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = accent + "55"
        el.style.boxShadow = `0 12px 40px ${accent}20, 0 0 0 1px ${accent}22 inset`
        el.style.transform = "translateY(-2px)"
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = "rgba(165,141,102,.13)"
        el.style.boxShadow = "none"
        el.style.transform = "none"
      }}
    >
      {/* Subtle corner glow */}
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: accent + "10", pointerEvents: "none" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, position: "relative" }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: accent + "20", border: `1px solid ${accent}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={18} style={{ color: accent }} />
        </div>
        <ArrowUpRight size={14} style={{ color: "var(--text-dim)" }} />
      </div>
      {loading ? (
        <div style={{ height: 36, width: 80, background: "var(--surface-2)", borderRadius: 6, marginBottom: 4 }} />
      ) : (
        <p style={{ fontSize: 32, fontWeight: 600, color: "var(--text)", fontFamily: "var(--serif)", marginBottom: 4, letterSpacing: "-.02em" }}>{value}</p>
      )}
      <p style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 3 }}>{label}</p>
      <p style={{ fontSize: 11, color: accent, opacity: .85 }}>{delta}</p>
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

  const totalCourses = stats?.courses.length ?? 0
  const statCards = [
    { label: "Alumnos activos",   value: stats ? String(stats.studentCount)    : "—", delta: "Registradas", icon: Users,      href: "/superadmin/alumnos", accent: "#A58D66" },
    { label: "Programas activos", value: stats ? String(stats.publishedCourseCount) : "—", delta: stats ? `${stats.publishedCourseCount} de ${totalCourses} publicados` : "—", icon: BookOpen, href: "/superadmin/cursos",  accent: "#A76D61" },
    { label: "Ingresos totales",  value: stats ? `$${stats.totalRevenue.toLocaleString("es")}` : "—", delta: stats?.paymentCount ? `${stats.paymentCount} transacciones` : "Sin transacciones", icon: CreditCard, href: "/superadmin/pagos", accent: "var(--success)" },
    { label: "Inscripciones",     value: stats ? String(stats.enrollmentCount) : "—", delta: "Activas",     icon: TrendingUp, href: "/superadmin/alumnos", accent: "#A76D61" },
  ]

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 36, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <span style={{ fontSize: 10, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: 10 }}>
            Jewgal Academy
          </span>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 38, color: "var(--text)", marginBottom: 6, letterSpacing: "-.01em" }}>
            Panel de control
          </h1>
          <p style={{ color: "var(--text-faint)", fontSize: 14 }}>
            Gestión completa de la plataforma
          </p>
        </div>
        <div style={{
          padding: "10px 16px", borderRadius: 10,
          background: "rgba(165,141,102,.08)",
          border: "1px solid rgba(165,141,102,.15)",
          fontSize: 12, color: "var(--text-dim)", letterSpacing: ".04em",
        }}>
          {now}
        </div>
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
          <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 18, color: "var(--text)", marginBottom: 18 }}>
            Acciones rápidas
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {quickActions.map(({ label, href, icon: Icon, color }) => (
              <Link key={label} href={href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, textDecoration: "none", transition: "background .18s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--surface)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
              >
                <div style={{ width: 34, height: 34, borderRadius: 8, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <span style={{ fontSize: 13, color: "var(--text-strong)", fontWeight: 500 }}>{label}</span>
                <ArrowUpRight size={13} style={{ color: "var(--text-dim)", marginLeft: "auto" }} />
              </Link>
            ))}
          </div>
        </div>

        {/* Actividad / estado del sistema */}
        <div style={{ ...card, padding: "24px 22px" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 18, color: "var(--text)", marginBottom: 18 }}>
            Estado del sistema
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { dot: "var(--success)", title: "Base de datos", sub: "Neon PostgreSQL · Operativa" },
              {
                dot: stats && stats.publishedCourseCount > 0 ? "var(--success)" : "var(--warning)",
                title: stats ? `${stats.publishedCourseCount} programa${stats.publishedCourseCount === 1 ? "" : "s"} publicado${stats.publishedCourseCount === 1 ? "" : "s"}` : "Programas",
                sub: "Accesibles desde el sitio",
              },
              {
                dot: stats?.integrations.stripe ? "var(--success)" : "var(--warning)",
                title: "Stripe",
                sub: stats?.integrations.stripe ? "Configurado" : "Configurar STRIPE_SECRET_KEY para activar pagos reales",
              },
              {
                dot: stats?.integrations.paypal ? "var(--success)" : "var(--warning)",
                title: "PayPal",
                sub: stats?.integrations.paypal ? "Configurado" : "Configurar PAYPAL_CLIENT_ID para activar PayPal",
              },
              {
                dot: stats?.integrations.email ? "var(--success)" : "var(--warning)",
                title: "Email (Resend)",
                sub: stats?.integrations.email ? "Configurado" : "Configurar RESEND_API_KEY para enviar emails",
              },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.dot, marginTop: 5, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, color: "var(--text-strong)", fontWeight: 500 }}>{item.title}</p>
                  <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Programas overview */}
      <div style={{ ...card, padding: "24px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 18, color: "var(--text)" }}>
            Programas · Vista general
          </h2>
          <Link href="/superadmin/cursos" style={{ fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--gold)", textDecoration: "none" }}>
            Gestionar →
          </Link>
        </div>
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px", gap: 12, padding: "0 14px 12px", borderBottom: "1px solid var(--surface-2)" }}>
            {["Programa", "Estado", "Inscripciones"].map((h) => (
              <span key={h} style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-dim)" }}>{h}</span>
            ))}
          </div>
          {!loading && (stats?.courses.length ?? 0) === 0 && (
            <p style={{ padding: "20px 14px", color: "var(--text-dim)", fontSize: 13 }}>No hay programas creados todavía.</p>
          )}
          {stats?.courses.map((p, i) => {
            const enrolled = stats.enrollmentsByProgram?.find((e) => e.slug === p.slug)?.count ?? 0
            return (
              <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px", gap: 12, padding: "14px", borderBottom: "1px solid var(--surface)", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: accentFor(i), flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "var(--text-strong)" }}>{p.title}</span>
                </div>
                <span style={{
                  fontSize: 11, borderRadius: 20, padding: "3px 10px", display: "inline-block",
                  color: p.isPublished ? "var(--success)" : "var(--text-dim)",
                  background: p.isPublished ? "rgba(196,159,114,.1)" : "rgba(255,255,255,.04)",
                  border: p.isPublished ? "1px solid rgba(196,159,114,.2)" : "1px solid rgba(255,255,255,.08)",
                }}>
                  {p.isPublished ? "Activo" : "Oculto"}
                </span>
                <span style={{ fontSize: 13, color: "var(--text-faint)" }}>
                  {enrolled}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
