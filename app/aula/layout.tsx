"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import BrandLogo from "@/components/BrandLogo"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Video, BookOpen, PlayCircle, Menu, X, LogOut, UserCircle, Award, CreditCard } from "lucide-react"
import { signOut } from "next-auth/react"
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
  const [open, setOpen]         = useState(false)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [profileName,  setProfileName]  = useState("")

  function loadProfile() {
    const p = localStorage.getItem("ja_profile")
    if (p) {
      const d = JSON.parse(p)
      setProfilePhoto(d.photo ?? null)
      setProfileName(d.name  ?? "")
    }
  }

  useEffect(() => {
    loadProfile()
    window.addEventListener("ja_profile_update", loadProfile)
    return () => window.removeEventListener("ja_profile_update", loadProfile)
  }, [])

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
        {/* Logo */}
        <div style={{ padding: "28px 24px 22px", borderBottom: "1px solid rgba(165,141,102,.1)" }}>
          <Link href="/" aria-label="Inicio">
            <BrandLogo height={62} variant="square" priority />
          </Link>
          <p style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(165,141,102,.6)", marginTop: 8 }}>
            Aula Virtual
          </p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "20px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map(({ href, icon: Icon, label, group }, i) => {
            const active = pathname === href
            const prevGroup = i > 0 ? navItems[i - 1].group : group
            const showDivider = group !== prevGroup && i > 0
            return (
              <div key={href}>
                {showDivider && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 10px 8px" }}>
                    <div style={{ flex: 1, height: 1, background: "var(--surface-2)" }} />
                    <span style={{ fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(165,141,102,.7)" }}>cuenta</span>
                    <div style={{ flex: 1, height: 1, background: "var(--surface-2)" }} />
                  </div>
                )}
                <motion.div whileHover={{ x: 2 }} transition={{ type: "spring", stiffness: 400, damping: 28 }}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "11px 14px", borderRadius: 10,
                      fontSize: 13, fontWeight: active ? 600 : 400,
                      textDecoration: "none",
                      background: active ? "rgba(165,141,102,.15)" : "transparent",
                      color: active ? "var(--gold)" : "var(--text-muted)",
                      borderLeft: active ? "2px solid var(--gold)" : "2px solid transparent",
                      transition: "all .2s",
                    }}
                  >
                    <Icon size={17} />
                    {label}
                  </Link>
                </motion.div>
              </div>
            )
          })}
        </nav>

        {/* Decorativo */}
        <div style={{ padding: "0 24px 24px", display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ flex: 1, height: 1, background: "var(--surface-2)" }} />
          <span style={{ color: "rgba(165,141,102,.3)", fontSize: 10 }}>✦</span>
          <div style={{ flex: 1, height: 1, background: "var(--surface-2)" }} />
        </div>

        {/* Cerrar sesión */}
        <div style={{ padding: "0 14px 24px" }}>
          <motion.button
            whileHover={{ x: 2 }}
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "11px 14px", borderRadius: 10, width: "100%",
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, color: "var(--text-dim)",
              transition: "color .2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--danger)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-dim)")}
          >
            <LogOut size={17} />
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
          height: 60, borderBottom: "1px solid rgba(165,141,102,.1)",
          padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "var(--bar)", backdropFilter: "blur(8px)",
          flexShrink: 0,
        }}>
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
          <span style={{ fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-dim)" }}>
            {navItems.find((n) => n.href === pathname)?.label ?? "Aula"}
          </span>

          {/* Avatar → link a perfil */}
          <Link href="/aula/perfil" style={{ textDecoration: "none" }}>
            <motion.div
              whileHover={{ scale: 1.08 }}
              title="Mi perfil"
              style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "var(--gold)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, color: "#2C1F14", cursor: "pointer",
                border: "2px solid rgba(165,141,102,.35)",
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
