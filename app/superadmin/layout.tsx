"use client"

import { useState } from "react"
import Link from "next/link"
import BrandLogo from "@/components/BrandLogo"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Users, BookOpen, FileText,
  CreditCard, Settings, Globe, Menu, X, LogOut,
  ChevronRight, Newspaper, Shield, ClipboardCheck,
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
      { href: "/superadmin/blog",         icon: Newspaper,       label: "Blog" },
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

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg-3)", overflow: "hidden" }}>

      {/* ── SIDEBAR ── */}
      <aside className="sidebar-desk" style={{
        position: "fixed", insetBlock: 0, left: 0, zIndex: 40,
        width: 240,
        background: "linear-gradient(180deg,var(--bg) 0%,var(--bg-3) 100%)",
        borderRight: "1px solid rgba(165,141,102,.12)",
        display: "flex", flexDirection: "column",
        transition: "transform .3s",
      }}>
        {/* Logo + badge */}
        <div style={{ padding: "26px 22px 20px", borderBottom: "1px solid rgba(165,141,102,.1)" }}>
          <Link href="/" target="_blank" aria-label="Ver sitio">
            <BrandLogo height={36} priority />
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
            <Shield size={11} style={{ color: "#ef4444" }} />
            <span style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "#ef4444", fontWeight: 700 }}>
              Super Admin
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
          {NAV.map(({ group, items }) => (
            <div key={group} style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(165,141,102,.7)", padding: "6px 10px", marginBottom: 2 }}>
                {group}
              </p>
              {items.map(({ href, icon: Icon, label }) => {
                const active = isActive(href)
                return (
                  <motion.div key={href} whileHover={{ x: 2 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "10px 12px", borderRadius: 9,
                        fontSize: 13, fontWeight: active ? 600 : 400,
                        textDecoration: "none", marginBottom: 2,
                        background: active ? "rgba(165,141,102,.13)" : "transparent",
                        color: active ? "var(--gold,#A58D66)" : "var(--text-muted)",
                        borderLeft: active ? "2px solid var(--gold,#A58D66)" : "2px solid transparent",
                        transition: "all .18s",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Icon size={16} />
                        {label}
                      </span>
                      {active && <ChevronRight size={13} />}
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: "12px 12px 20px", borderTop: "1px solid rgba(165,141,102,.08)" }}>
          <Link href="/" target="_blank" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9, fontSize: 12, color: "var(--text-dim)", textDecoration: "none", marginBottom: 4, transition: "color .2s" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-strong)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-dim)")}
          >
            <Globe size={15} /> Ver sitio público
          </Link>
          <motion.button
            whileHover={{ x: 2 }}
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9, width: "100%", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--text-dim)", transition: "color .2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fca5a5")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-dim)")}
          >
            <LogOut size={15} /> Salir
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
          height: 58, borderBottom: "1px solid rgba(165,141,102,.1)",
          padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "var(--bar)", backdropFilter: "blur(10px)", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setOpen(!open)}
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              className="mob-menu-btn"
              style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "none", padding: 4 }}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-dim)" }}>
              <span>Super Admin</span>
              <ChevronRight size={13} />
              <span style={{ color: "var(--text-strong)" }}>
                {NAV.flatMap((g) => g.items).find((n) => isActive(n.href))?.label ?? "Panel"}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>admin@jewgalacademy.com</span>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "white" }}>
              D
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: "auto", padding: "32px 32px", background: "var(--bg)" }}>
          {children}
        </main>
      </div>
    </div>
  )
}
