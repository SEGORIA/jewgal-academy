"use client"

import { useState } from "react"
import Link from "next/link"
import BrandLogo from "@/components/BrandLogo"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Users, BookOpen, FileText,
  CreditCard, Settings, Globe, Menu, X, LogOut,
  ChevronRight, Newspaper, Shield, ClipboardCheck, ExternalLink, ImageIcon, Headphones, CalendarDays,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"

const NAV = [
  {
    group: "General",
    items: [
      { href: "/superadmin",              icon: LayoutDashboard, label: "Dashboard" },
      { href: "/superadmin/alumnos",      icon: Users,           label: "Alumnos" },
      { href: "/superadmin/asistencia",   icon: ClipboardCheck,  label: "Asistencia" },
      { href: "/superadmin/pagos",        icon: CreditCard,      label: "Ingresos" },
    ],
  },
  {
    group: "Contenido",
    items: [
      { href: "/superadmin/cursos",       icon: BookOpen,        label: "Programas" },
      { href: "/superadmin/recursos",     icon: Headphones,      label: "Recursos" },
      { href: "/superadmin/blog",         icon: Newspaper,       label: "Blog" },
      { href: "/superadmin/eventos",      icon: CalendarDays,    label: "Eventos" },
      { href: "/superadmin/hero",          icon: ImageIcon,       label: "Fotos hero" },
      { href: "/superadmin/web",          icon: Globe,           label: "Sitio web" },
    ],
  },
  {
    group: "Sistema",
    items: [
      { href: "/superadmin/configuracion", icon: Settings,       label: "Configuración" },
    ],
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) =>
    href === "/superadmin" ? pathname === href : pathname.startsWith(href)

  const currentLabel = NAV.flatMap((g) => g.items).find((n) => isActive(n.href))?.label ?? "Panel"

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg-3)", overflow: "hidden" }}>

      {/* ── SIDEBAR ── */}
      <aside className="sidebar-desk" style={{
        position: "fixed", insetBlock: 0, left: 0, zIndex: 40,
        width: 240,
        background: "linear-gradient(180deg, var(--bg) 0%, var(--bg-3) 100%)",
        borderRight: "1px solid rgba(165,141,102,.14)",
        display: "flex", flexDirection: "column",
        transition: "transform .3s",
      }}>

        {/* Gold accent bar top */}
        <div style={{ height: 2, background: "linear-gradient(90deg,transparent,var(--gold),transparent)", opacity: 0.5 }} />

        {/* Logo + badge */}
        <div style={{ padding: "22px 22px 18px", borderBottom: "1px solid rgba(165,141,102,.1)", position: "relative" }}>
          {/* Glow decoration */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 80, background: "radial-gradient(ellipse at 50% 0%,rgba(196,159,114,.08) 0%,transparent 70%)", pointerEvents: "none" }} />
          <Link href="/" target="_blank" aria-label="Ver sitio">
            <BrandLogo height={58} variant="square" priority />
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, padding: "5px 10px", borderRadius: 20, background: "rgba(165,141,102,.1)", border: "1px solid rgba(165,141,102,.18)", width: "fit-content" }}>
            <Shield size={10} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 9, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 700 }}>
              Super Admin
            </span>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--success)", marginLeft: 2, boxShadow: "0 0 6px var(--success)" }} />
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "14px 10px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV.map(({ group, items }) => (
            <div key={group} style={{ marginBottom: 6 }}>
              <p style={{ fontSize: 9, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--text-faint)", padding: "6px 12px", marginBottom: 2 }}>
                {group}
              </p>
              {items.map(({ href, icon: Icon, label }) => {
                const active = isActive(href)
                return (
                  <motion.div key={href} whileHover={{ x: active ? 0 : 3 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "9px 12px", borderRadius: 10,
                        fontSize: 13, fontWeight: active ? 600 : 400,
                        textDecoration: "none", marginBottom: 1,
                        background: active
                          ? "linear-gradient(90deg,rgba(165,141,102,.18) 0%,rgba(165,141,102,.06) 100%)"
                          : "transparent",
                        color: active ? "var(--gold)" : "var(--text-muted)",
                        borderLeft: active ? "2px solid var(--gold)" : "2px solid transparent",
                        boxShadow: active ? "inset 0 0 0 1px rgba(165,141,102,.1)" : "none",
                        transition: "all .18s",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Icon size={15} />
                        {label}
                      </span>
                      {active && <ChevronRight size={12} style={{ opacity: 0.6 }} />}
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: "10px 10px 18px", borderTop: "1px solid rgba(165,141,102,.08)" }}>
          <Link href="/" target="_blank" style={{
            display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10,
            fontSize: 12, color: "var(--text-muted)", textDecoration: "none", marginBottom: 2, transition: "all .2s",
          }}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.color = "var(--text-strong)"; el.style.background = "rgba(165,141,102,.07)" }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.color = "var(--text-muted)"; el.style.background = "transparent" }}
          >
            <ExternalLink size={13} /> Ver sitio público
          </Link>
          <motion.button
            whileHover={{ x: 2 }}
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, width: "100%", background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--text-muted)", transition: "color .2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.background = "rgba(239,68,68,.06)" }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent" }}
          >
            <LogOut size={13} /> Salir
          </motion.button>
        </div>
      </aside>

      {/* Overlay mobile */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 30, background: "var(--scrim)" }}
          />
        )}
      </AnimatePresence>

      {/* ── MAIN ── */}
      <div className="aula-main" style={{ flex: 1, marginLeft: 240, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Topbar */}
        <header style={{
          height: 58, flexShrink: 0,
          padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(20,14,8,.82)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(165,141,102,.1)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setOpen(!open)}
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={open}
              className="mob-menu-btn"
              style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "none", padding: 4 }}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
              <span style={{ color: "var(--text-dim)", letterSpacing: ".06em" }}>Jewgal Admin</span>
              <span style={{ color: "rgba(165,141,102,.3)", fontSize: 10 }}>›</span>
              <span style={{
                color: "var(--gold)", fontWeight: 600, letterSpacing: ".04em",
                padding: "3px 10px", borderRadius: 6,
                background: "rgba(165,141,102,.1)",
                border: "1px solid rgba(165,141,102,.15)",
              }}>
                {currentLabel}
              </span>
            </div>
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 12, color: "var(--text-dim)", letterSpacing: ".02em" }}>admin@jewgalacademy.com</span>
            {/* Avatar */}
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "linear-gradient(135deg,#A76D61 0%,#C49F72 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, color: "white",
              boxShadow: "0 0 0 2px rgba(196,159,114,.3), 0 4px 12px rgba(167,109,97,.35)",
            }}>
              D
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: "auto", padding: "36px 36px 60px", background: "var(--bg)" }}>
          {children}
        </main>
      </div>
    </div>
  )
}
