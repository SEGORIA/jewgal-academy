"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import BrandLogo from "@/components/BrandLogo"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

const NAV_LINKS = [
  { href: "/",                label: "Inicio" },
  { href: "/academia",        label: "Academia" },
  { href: "/certificaciones", label: "Certificaciones" },
  { href: "/eventos",         label: "Eventos" },
  { href: "/blog",            label: "Blog" },
]

export default function Navbar() {
  const { data: session, status } = useSession()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen]         = useState(false)
  const [hovered, setHovered]   = useState<string | null>(null)
  const pathname                = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  const isLoggedIn = status === "authenticated" && !!session
  const isAdmin    = session?.user?.role === "admin"

  return (
    <>
      <nav className={`jnav${scrolled ? " scrolled" : ""}`} id="nav" aria-label="Navegación principal">
        <Link href="/" aria-label="Jewgal Academy — Inicio">
          <BrandLogo height={44} priority />
        </Link>

        <div className="nav-links">
          {NAV_LINKS.map((l) => {
            const isActive = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href))
            const showLine = hovered === l.href || (!hovered && isActive)
            return (
              <div key={l.label} style={{ position: "relative", display: "inline-flex" }}
                onMouseEnter={() => setHovered(l.href)}
                onMouseLeave={() => setHovered(null)}
              >
                <Link href={l.href} style={{ color: isActive ? "var(--gold)" : undefined }}>
                  {l.label}
                </Link>
                {showLine && (
                  <motion.div
                    layoutId="nav-underline"
                    style={{
                      position: "absolute", bottom: -4, left: 0, right: 0,
                      height: 1, background: "var(--gold)", borderRadius: 1,
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </div>
            )
          })}
        </div>

        <div className="nav-actions">
          {/* Buscar */}
          <button className="nav-search" aria-label="Buscar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="7"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
          </button>

          {status === "loading" ? (
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(165,141,102,.15)", animation: "pulse 1.5s ease-in-out infinite" }} />
          ) : isLoggedIn ? (
            <Link
              href={isAdmin ? "/superadmin" : "/aula"}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                color: "var(--gold)", fontSize: 11, letterSpacing: ".12em",
                textTransform: "uppercase", textDecoration: "none",
                border: "1px solid rgba(165,141,102,.4)", borderRadius: 3, padding: "9px 16px",
                transition: "all .3s", background: "rgba(165,141,102,.08)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(165,141,102,.18)"
                ;(e.currentTarget as HTMLElement).style.borderColor = "var(--gold)"
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(165,141,102,.08)"
                ;(e.currentTarget as HTMLElement).style.borderColor = "rgba(165,141,102,.4)"
              }}
            >
              {isAdmin ? "Panel Admin" : "Mi Aula"} →
            </Link>
          ) : (
            <>
              <Link href="/login" style={{
                color: "var(--on-dark)", fontSize: 11, letterSpacing: ".12em",
                textTransform: "uppercase", textDecoration: "none",
                border: "1px solid var(--line-d)", borderRadius: 3, padding: "9px 16px",
                transition: "border-color .3s, color .3s",
              }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--gold)"
                  ;(e.currentTarget as HTMLElement).style.color = "var(--gold)"
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--line-d)"
                  ;(e.currentTarget as HTMLElement).style.color = "var(--on-dark)"
                }}
              >
                Iniciar Sesión
              </Link>
              <Link href="/#programas" className="btn solid" style={{ padding: "9px 18px", fontSize: 11 }}>
                Únete Ahora
              </Link>
            </>
          )}
        </div>

        {/* Hamburger mobile */}
        <button onClick={() => setOpen(!open)} aria-label="Abrir menú" className="nav-toggle">
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ display: "block", width: 24, height: 1.5, background: "var(--aqua)", transition: ".3s",
              transform: open && i === 0 ? "rotate(45deg) translate(4.5px, 4.5px)" : open && i === 1 ? "scaleX(0)" : open && i === 2 ? "rotate(-45deg) translate(4.5px,-4.5px)" : "none",
            }} />
          ))}
        </button>
      </nav>

      {/* Mobile overlay con AnimatePresence */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed", inset: 0, zIndex: 55,
              background: "rgba(8,24,33,.97)",
              backdropFilter: "blur(20px)",
              display: "flex", flexDirection: "column",
              justifyContent: "center", padding: "0 32px",
            }}
          >
            <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {NAV_LINKS.map((l, i) => (
                <motion.div
                  key={l.label}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 + i * 0.06 }}
                >
                  <Link href={l.href} onClick={() => setOpen(false)} style={{
                    fontFamily: "var(--serif)", fontSize: 32, color: "var(--text)",
                    textDecoration: "none", padding: "10px 0", display: "block",
                    borderBottom: "1px solid rgba(165,141,102,.1)",
                    transition: "color .2s",
                  }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--gold)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text)")}
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36 }}
              style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 12 }}
            >
              {isLoggedIn ? (
                <Link href={isAdmin ? "/superadmin" : "/aula"} onClick={() => setOpen(false)}
                  className="btn solid" style={{ textAlign: "center" }}>
                  {isAdmin ? "Panel Admin" : "Mi Aula"} →
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} style={{
                    color: "var(--on-dark)", fontSize: 12, letterSpacing: ".2em",
                    textTransform: "uppercase", textDecoration: "none",
                  }}>
                    Iniciar Sesión
                  </Link>
                  <Link href="/#programas" onClick={() => setOpen(false)} className="btn solid" style={{ textAlign: "center" }}>
                    Únete Ahora
                  </Link>
                </>
              )}
            </motion.div>

            <button onClick={() => setOpen(false)} aria-label="Cerrar menú" style={{
              position: "absolute", top: 24, right: 24,
              background: "none", border: "none", color: "var(--aqua)", fontSize: 28, cursor: "pointer",
            }}>
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
