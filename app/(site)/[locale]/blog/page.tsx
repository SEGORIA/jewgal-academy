"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "@/i18n/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import RevealInit from "@/components/RevealInit"
import { accentForCategory, estimateReadTime } from "@/lib/blog"
import { Loader2 } from "lucide-react"
import { useLocale } from "next-intl"
import { DEFAULT_SITE_CONTENT, type SiteContent } from "@/lib/site-content"

type Post = {
  id: string; slug: string; category: string; title: string
  excerpt: string; content: string; publishedAt: string | null; createdAt: string
}

const spring = { type: "spring" as const, stiffness: 280, damping: 26 }

export default function BlogPage() {
  const locale = useLocale()
  const [posts, setPosts]           = useState<Post[]>([])
  const [loading, setLoading]       = useState(true)
  const [openPost, setOpenPost]     = useState<Post | null>(null)
  const [activeCategory, setActiveCategory] = useState("Todo")
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    fetch("/api/blog", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setPosts(d.posts ?? []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
    fetch(`/api/site-content?locale=${locale}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setContent(d))
      .catch(() => {})
    fetch("/api/blog-categories", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d.categories)) setCategories(d.categories) })
      .catch(() => {})
  }, [locale])

  const CATEGORIES = ["Todo", ...categories]

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
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url(/brand/pages/hero-blog.webp)", backgroundSize: "cover", backgroundPosition: "right center", zIndex: 0 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(100deg,var(--navy-2) 0%,var(--navy) 42%,rgba(0,0,0,0) 82%)", zIndex: 1 }} />
        <div style={{ position: "absolute", top: "-30%", right: 0, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(165,141,102,.07),transparent 70%)", pointerEvents: "none", zIndex: 1 }} />
        <div className="wrap" style={{ position: "relative", zIndex: 2 }}>
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ display: "block", marginBottom: 20 }}
          >
            {content.pages.blog.eyebrow}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ...spring }}
            style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(44px,6vw,78px)", color: "var(--text)", lineHeight: 1.02, letterSpacing: "-.01em", marginBottom: 22 }}
          >
            {content.pages.blog.title1}<br /><em style={{ fontStyle: "normal", color: "var(--gold-light)" }}>{content.pages.blog.title2}</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32, ...spring }}
            style={{ color: "var(--on-dark)", fontSize: 17, maxWidth: 500, lineHeight: 1.7 }}
          >
            {content.pages.blog.subtext}
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
            /* Grid de posts — todas las cards con el mismo estilo */
            <div className="blog-grid">
              <AnimatePresence>
                {filtered.map((post, i) => (
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
