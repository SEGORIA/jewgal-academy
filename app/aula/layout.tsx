"use client"

import { useState } from "react"
import Link from "next/link"
import BrandLogo from "@/components/BrandLogo"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Video, BookOpen, PlayCircle, Menu, X, LogOut, UserCircle, Award, CreditCard, Sparkles, ExternalLink } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"

const navItems = [
  { href: "/aula",                  icon: LayoutDashboard, label: "Mi panel",        group: "aprende" },
  { href: "/aula/clases",           icon: Video,           label: "Clases en vivo",  group: "aprende" },
  { href: "/aula/materiales",       icon: BookOpen,        label: "Materiales",      group: "aprende" },
  { href: "/aula/grabaciones",      icon: PlayCircle,      label: "Grabaciones",     group: "aprende" },
  { href: "/aula/certificaciones",  icon: Award,           label: "Certificaciones", group: "cuenta"  },
  { href: "/aula/pagos",            icon: CreditCard,      label: "Mis pagos",       group: "cuenta"  },
  { href: "/aula/perfil",           icon: UserCircle,      label: "Mi perfil",       group: "cuenta"  },
]

export default function AulaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [open, setOpen]         = useState(false)
  const profilePhoto = session?.user?.image ?? null
  const profileName  = session?.user?.name ?? ""

  const currentLabel = navItems.find((n) => n.href === pathname)?.label ?? "Aula"

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg)", overflow: "hidden" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        position: "fixed", insetBlock: 0, left: 0, zIndex: 40,
        width: 230, background: "linear-gradient(180deg,var(--bg) 0%,var(--bg-3) 100%)",
        borderRight: "1px solid rgba(165,141,102,.12)",
        display: "flex", flexDirection: "column",
        transform: open ? "translateX(0)" : undefined,
        transition: "transform .3s",
      }}
        className="sidebar-desk"
      >
        {/* Barra dorada decorativa */}
        <div style={{ height: 2, background: "linear-gradient(90deg,transparent,var(--gold),transparent)", opacity: 0.5 }} />

        {/* Logo */}
        <div style={{ padding: "24px 24px 18px", borderBottom: "1px solid rgba(165,141,102,.1)", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 80, background: "radial-gradient(ellipse at 50% 0%,rgba(196,159,114,.08) 0%,transparent 70%)", pointerEvents: "none" }} />
          <Link href="/" aria-label="Inicio">
            <BrandLogo height={58} variant="square" priority />
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, padding: "5px 10px", borderRadius: 20, background: "rgba(165,141,102,.1)", border: "1px solid rgba(165,141,102,.18)", width: "fit-content" }}>
            <Sparkles size={10} style={{ color: "var(--gold)" }} />
            <span style={{ fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 700 }}>
              Aula Virtual
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "18px 12px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 3 }}>
          {navItems.map(({ href, icon: Icon, label, group }, i) => {
            const active = pathname === href
            const prevGroup = i > 0 ? navItems[i - 1].group : group
            const showDivider = group !== prevGroup && i > 0
            return (
              <div key={href}>
                {showDivider && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 10px 8px" }}>
                    <div style={{ flex: 1, height: 1, background: "var(--surface-2)" }} />
                    <span style={{ fontSize: 9, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--text-faint)" }}>cuenta</span>
                    <div style={{ flex: 1, height: 1, background: "var(--surface-2)" }} />
                  </div>
                )}
                <motion.div whileHover={{ x: active ? 0 : 3 }} transition={{ type: "spring", stiffness: 400, damping: 28 }}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 14px", borderRadius: 10,
                      fontSize: 13, fontWeight: active ? 600 : 400,
                      textDecoration: "none",
                      background: active
                        ? "linear-gradient(90deg,rgba(165,141,102,.18) 0%,rgba(165,141,102,.06) 100%)"
                        : "transparent",
                      color: active ? "var(--gold)" : "var(--text-muted)",
                      borderLeft: active ? "2px solid var(--gold)" : "2px solid transparent",
                      boxShadow: active ? "inset 0 0 0 1px rgba(165,141,102,.1)" : "none",
                      transition: "all .2s",
                    }}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                </motion.div>
              </div>
            )
          })}
        </nav>

        {/* Decorativo */}
        <div style={{ padding: "0 24px 18px", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, height: 1, background: "var(--surface-2)" }} />
          <span style={{ color: "rgba(165,141,102,.35)", fontSize: 10 }}>✦</span>
          <div style={{ flex: 1, height: 1, background: "var(--surface-2)" }} />
        </div>

        {/* Cerrar sesión */}
        <div style={{ padding: "0 12px 22px" }}>
          <Link href="/" target="_blank" style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10,
            fontSize: 13, color: "var(--text-muted)", textDecoration: "none", marginBottom: 2, transition: "all .2s",
          }}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.color = "var(--text-strong)"; el.style.background = "rgba(165,141,102,.07)" }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.color = "var(--text-muted)"; el.style.background = "transparent" }}
          >
            <ExternalLink size={15} /> Ver sitio público
          </Link>
          <motion.button
            whileHover={{ x: 2 }}
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 14px", borderRadius: 10, width: "100%",
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, color: "var(--text-muted)",
              transition: "color .2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.background = "rgba(239,68,68,.06)" }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent" }}
          >
            <LogOut size={16} />
            Cerrar sesión
          </motion.button>
        </div>
      </aside>

      {/* Overlay mobile */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 30, background: "var(--scrim)", backdropFilter: "blur(4px)" }}
          />
        )}
      </AnimatePresence>

      {/* ── MAIN ── */}
      <div className="aula-main" style={{ flex: 1, marginLeft: 230, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Topbar */}
        <header style={{
          height: 60, flexShrink: 0,
          padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "var(--bar)", backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(165,141,102,.1)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setOpen(!open)}
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={open}
              style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "none" }}
              className="mob-menu-btn"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
              <span style={{ color: "var(--text-dim)", letterSpacing: ".06em" }}>Jewgal Aula</span>
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

          {/* Avatar → link a perfil */}
          <Link href="/aula/perfil" style={{ textDecoration: "none" }}>
            <motion.div
              whileHover={{ scale: 1.08 }}
              title="Mi perfil"
              style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "linear-gradient(135deg,#A76D61 0%,#C49F72 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, color: "white", cursor: "pointer",
                boxShadow: "0 0 0 2px rgba(196,159,114,.3), 0 4px 12px rgba(167,109,97,.3)",
                overflow: "hidden", flexShrink: 0,
              }}
            >
              {profilePhoto
                ? <img src={profilePhoto} alt="Perfil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : (profileName || "E").charAt(0).toUpperCase()
              }
            </motion.div>
          </Link>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: "auto", padding: "36px 32px" }}>
          {children}
        </main>
      </div>
    </div>
  )
}
