"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import RevealInit from "@/components/RevealInit"
import { accentForCategory, estimateReadTime } from "@/lib/blog"
import { Loader2 } from "lucide-react"

type Post = {
  id: string; slug: string; category: string; title: string
  excerpt: string; content: string; publishedAt: string | null; createdAt: string
}

const CATEGORIES = ["Todo", "Coaching", "Cabalá", "Jewgal", "Liderazgo", "Educación"]

const spring = { type: "spring" as const, stiffness: 280, damping: 26 }

export default function BlogPage() {
  const [posts, setPosts]           = useState<Post[]>([])
  const [loading, setLoading]       = useState(true)
  const [openPost, setOpenPost]     = useState<Post | null>(null)
  const [activeCategory, setActiveCategory] = useState("Todo")

  useEffect(() => {
    fetch("/api/blog")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts ?? []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = activeCategory === "Todo" ? posts : posts.filter((p) => p.category === activeCategory)

  const dateOf = (p: Post) => new Date(p.publishedAt ?? p.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })

  return (
    <>
      <RevealInit />
      <Navbar />

      {/* ── HERO ── */}
      <section className="blog-hero" style={{
        background: "linear-gradient(120deg,var(--navy-2) 0%,var(--navy) 55%,#2A1D12 100%)",
        position: "relative", overflow: "hidden",
        borderBottom: "1px solid var(--line-d)",
      }}>
        <div style={{ position: "absolute", top: "-30%", right: 0, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(165,141,102,.07),transparent 70%)", pointerEvents: "none" }} />
        <div className="wrap">
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ display: "block", marginBottom: 20 }}
          >
            Jewgal Academy
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ...spring }}
            style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(44px,6vw,78px)", color: "var(--text)", lineHeight: 1.02, letterSpacing: "-.01em", marginBottom: 22 }}
          >
            Blog &amp;<br /><em style={{ fontStyle: "normal", color: "var(--gold-light)" }}>Recursos</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32, ...spring }}
            style={{ color: "var(--on-dark)", fontSize: 17, maxWidth: 500, lineHeight: 1.7 }}
          >
            Artículos, reflexiones y herramientas sobre coaching, Cabalá, bienestar y liderazgo consciente.
          </motion.p>
        </div>
      </section>

      {/* ── FILTROS ── */}
      <section style={{ background: "var(--navy-2)", borderBottom: "1px solid var(--line-d)" }}>
        <div className="wrap blog-filters">
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: activeCategory === cat ? "var(--gold)" : "transparent",
                color: activeCategory === cat ? "var(--navy)" : "var(--on-dark)",
                border: "1px solid",
                borderColor: activeCategory === cat ? "var(--gold)" : "var(--line-d)",
                borderRadius: 20, padding: "8px 20px",
                fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase",
                cursor: "pointer", fontFamily: "var(--sans)",
                transition: "background .25s, color .25s, border-color .25s",
              }}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </section>

      {/* ── POSTS ── */}
      <section style={{ background: "var(--navy)" }}>
        <div className="wrap blog-section">

          {loading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--on-dark-faint)", padding: "60px 0" }}>
              <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Cargando artículos…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "60px 0", textAlign: "center" }}>
              <p style={{ color: "var(--on-dark-faint)", fontSize: 15 }}>
                {posts.length === 0 ? "Todavía no hay artículos publicados." : "No hay artículos en esta categoría."}
              </p>
            </div>
          ) : (
            <>
              {/* Post destacado */}
              <AnimatePresence mode="wait">
                {filtered[0] && (
                  <motion.div
                    key={filtered[0].slug + "-featured"}
                    className="blog-featured"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={spring}
                    onClick={() => setOpenPost(filtered[0])}
                    whileHover={{ y: -4, boxShadow: "0 24px 64px rgba(0,0,0,.32)" }}
                  >
                    <div className="blog-featured-l">
                      <div>
                        <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center" }}>
                          <span style={{ fontSize: 11, border: `1px solid ${accentForCategory(filtered[0].category)}40`, borderRadius: 16, padding: "4px 14px", color: accentForCategory(filtered[0].category), letterSpacing: ".12em", textTransform: "uppercase", background: `${accentForCategory(filtered[0].category)}10` }}>
                            {filtered[0].category}
                          </span>
                          <span style={{ fontSize: 11, color: "var(--on-dark-faint)", letterSpacing: ".08em" }}>⏱ {estimateReadTime(filtered[0].content)}</span>
                          <span style={{ fontSize: 11, color: "var(--on-dark-faint)" }}>·</span>
                          <span style={{ fontSize: 11, color: "var(--on-dark-faint)" }}>{dateOf(filtered[0])}</span>
                        </div>
                        <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(22px,2.8vw,34px)", color: "var(--text)", lineHeight: 1.2, marginBottom: 18 }}>
                          {filtered[0].title}
                        </h2>
                        <p style={{ color: "var(--on-dark)", fontSize: 15.5, lineHeight: 1.7 }}>{filtered[0].excerpt}</p>
                      </div>
                      <motion.span
                        whileHover={{ x: 5 }}
                        style={{ fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: accentForCategory(filtered[0].category), marginTop: 28, display: "inline-flex", alignItems: "center", gap: 6 }}
                      >
                        Leer artículo →
                      </motion.span>
                    </div>

                    <div className="blog-featured-r">
                      <blockquote style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: "clamp(16px,1.8vw,24px)", color: "var(--text)", lineHeight: 1.55, borderLeft: `3px solid ${accentForCategory(filtered[0].category)}`, paddingLeft: 24 }}>
                        "El coaching integrativo no es solo una metodología. Es una manera de habitar el cambio desde adentro."
                        <cite style={{ display: "block", fontStyle: "normal", fontFamily: "var(--sans)", fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold)", marginTop: 18 }}>
                          — Devora Benchimol
                        </cite>
                      </blockquote>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Grid de posts */}
              <div className="blog-grid">
                <AnimatePresence>
                  {filtered.slice(1).map((post, i) => (
                    <motion.div
                      key={post.slug}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ ...spring, delay: i * 0.06 }}
                      onClick={() => setOpenPost(post)}
                      whileHover={{ y: -6, boxShadow: "0 16px 48px rgba(0,0,0,.28)" }}
                      style={{
                        border: "1px solid var(--line-d)", borderRadius: 10,
                        background: "var(--surface)",
                        display: "flex", flexDirection: "column", justifyContent: "space-between",
                        cursor: "pointer", overflow: "hidden",
                        borderTop: `3px solid ${accentForCategory(post.category)}`,
                      }}
                    >
                      <div style={{ padding: "28px 28px 0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                          <span style={{ fontSize: 11, background: `${accentForCategory(post.category)}15`, border: `1px solid ${accentForCategory(post.category)}35`, borderRadius: 16, padding: "4px 12px", color: accentForCategory(post.category), letterSpacing: ".12em", textTransform: "uppercase" }}>
                            {post.category}
                          </span>
                          <span style={{ fontSize: 11, color: "var(--on-dark-faint)" }}>⏱ {estimateReadTime(post.content)}</span>
                        </div>
                        <h3 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 19, color: "var(--text)", lineHeight: 1.25, marginBottom: 10 }}>{post.title}</h3>
                        <p style={{ color: "var(--on-dark)", fontSize: 14, lineHeight: 1.65 }}>{post.excerpt}</p>
                      </div>
                      <div style={{ padding: "18px 28px 24px", marginTop: 8, borderTop: "1px solid var(--line-d)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "var(--on-dark-faint)" }}>{dateOf(post)}</span>
                        <motion.span whileHover={{ x: 4 }} style={{ fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: accentForCategory(post.category), display: "inline-block" }}>
                          Leer →
                        </motion.span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="join pad">
        <div className="glow" />
        <div className="wrap join-inner reveal">
          <span className="eyebrow" style={{ display: "inline-block" }}>Contenido exclusivo</span>
          <h2>Ideas que transforman,<br/>cada semana en tu correo.</h2>
          <p>Artículos nuevos cada semana sobre coaching, bienestar, Cabalá y liderazgo consciente.</p>
          <div className="join-actions">
            <Link href="/contacto" className="btn solid">Suscribirme gratis →</Link>
            <Link href="/academia" className="btn">Ver programas</Link>
          </div>
        </div>
      </section>

      <Footer />

      {/* ── MODAL ARTÍCULO ── */}
      <AnimatePresence>
        {openPost && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setOpenPost(null)}
              style={{ position: "fixed", inset: 0, zIndex: 80, background: "var(--scrim)", backdropFilter: "blur(8px)", cursor: "pointer" }}
            />

            <motion.div
              key="modal"
              className="blog-modal-wrap"
              initial={{ opacity: 0, y: 72 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={spring}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="blog-modal-pane"
              >
                {/* Header */}
                <div className="blog-modal-head">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, background: `${accentForCategory(openPost.category)}15`, border: `1px solid ${accentForCategory(openPost.category)}35`, borderRadius: 16, padding: "4px 14px", color: accentForCategory(openPost.category), letterSpacing: ".12em", textTransform: "uppercase" }}>
                          {openPost.category}
                        </span>
                        <span style={{ fontSize: 12, color: "var(--on-dark-faint)" }}>{dateOf(openPost)} · ⏱ {estimateReadTime(openPost.content)}</span>
                      </div>
                      <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(18px,2.4vw,28px)", color: "var(--text)", lineHeight: 1.2 }}>
                        {openPost.title}
                      </h2>
                    </div>
                    <motion.button
                      onClick={() => setOpenPost(null)}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      style={{ background: "var(--navy-2)", border: "1px solid var(--line-d)", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--on-dark)", fontSize: 20, flexShrink: 0 }}
                    >
                      ×
                    </motion.button>
                  </div>
                </div>

                {/* Contenido */}
                <div className="blog-modal-body">
                  <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: "clamp(15px,1.6vw,18px)", color: "var(--on-dark)", lineHeight: 1.75, marginBottom: 32, borderLeft: `3px solid ${accentForCategory(openPost.category)}`, paddingLeft: 20 }}>
                    {openPost.excerpt}
                  </p>

                  {openPost.content.split("\n\n").map((paragraph, i) => (
                    <p key={i} style={{ color: "var(--on-dark)", fontSize: "clamp(14px,1.4vw,16px)", lineHeight: 1.85, marginBottom: 22 }}>
                      {paragraph}
                    </p>
                  ))}

                  <div style={{ marginTop: 44, paddingTop: 28, borderTop: "1px solid var(--line-d)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                    <p style={{ fontSize: 13, color: "var(--on-dark-faint)" }}>
                      Por <span style={{ color: "var(--gold)" }}>Devora Benchimol</span> · Jewgal Academy
                    </p>
                    <Link href="/academia" className="btn solid" style={{ fontSize: 12, padding: "10px 22px" }} onClick={() => setOpenPost(null)}>
                      Ver programas →
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
