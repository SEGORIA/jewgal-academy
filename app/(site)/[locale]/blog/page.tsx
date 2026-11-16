"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "@/i18n/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import RevealInit from "@/components/RevealInit"
import { accentForCategory, type PublicPostCard } from "@/lib/blog"
import { Loader2 } from "lucide-react"
import { bgUrl } from "@/lib/use-site-images"
import { useLocale, useTranslations } from "next-intl"
import { DEFAULT_SITE_CONTENT, type SiteContent } from "@/lib/site-content"

const spring = { type: "spring" as const, stiffness: 280, damping: 26 }
const PAGE_SIZE = 9

/** Minúsculas y sin tildes, para que "cabala" encuentre "Cabalá". */
const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")

export default function BlogPage() {
  const locale = useLocale()
  const t = useTranslations("Blog")
  const [posts, setPosts]           = useState<PublicPostCard[]>([])
  const [loading, setLoading]       = useState(true)
  const [activeCategory, setActiveCategory] = useState("Todo")
  const [query, setQuery]           = useState("")
  const [visible, setVisible]       = useState(PAGE_SIZE)
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    fetch(`/api/blog?locale=${locale}`, { cache: "no-store" })
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

  const filtered = useMemo(() => {
    const q = fold(query.trim())
    return posts.filter((p) => {
      if (activeCategory !== "Todo" && p.category !== activeCategory) return false
      if (!q) return true
      return fold(`${p.title} ${p.excerpt} ${p.category} ${p.tags.join(" ")}`).includes(q)
    })
  }, [posts, activeCategory, query])

  const shown = filtered.slice(0, visible)

  const dateOf = (p: PublicPostCard) => new Date(p.publishedAt ?? p.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "es-ES", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })

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
        <div style={{ position: "absolute", inset: 0, backgroundImage: bgUrl(content.images.blogHero), backgroundSize: "cover", backgroundPosition: "right center", zIndex: 0 }} />
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
            {content.pages.blog.title1}<br /><em style={{ fontStyle: "normal", color: "var(--gold-em)" }}>{content.pages.blog.title2}</em>
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
        <div className="wrap blog-filters" style={{ alignItems: "center" }}>
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat}
              onClick={() => { setActiveCategory(cat); setVisible(PAGE_SIZE) }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-pressed={activeCategory === cat}
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
              {cat === "Todo" ? t("all") : cat}
            </motion.button>
          ))}
          <input
            type="search"
            className="blog-search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setVisible(PAGE_SIZE) }}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchLabel")}
          />
        </div>
      </section>

      {/* ── POSTS ── */}
      <section style={{ background: "var(--navy)" }}>
        <div className="wrap blog-section">

          {loading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--on-dark-faint)", padding: "60px 0" }}>
              <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> {t("loading")}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "60px 0", textAlign: "center" }}>
              <p style={{ color: "var(--on-dark-faint)", fontSize: 15 }}>
                {posts.length === 0 ? t("emptyNone") : query.trim() ? t("emptySearch") : t("emptyCategory")}
              </p>
            </div>
          ) : (
            <>
              <div className="blog-grid">
                <AnimatePresence>
                  {shown.map((post, i) => (
                    <motion.div
                      key={post.slug}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ ...spring, delay: Math.min(i, 8) * 0.05 }}
                      style={{ display: "flex" }}
                    >
                      <Link href={`/blog/${post.slug}`} className="blog-card" style={{ width: "100%", justifyContent: "space-between" }}>
                        <div>
                          {post.coverUrl && (
                            // eslint-disable-next-line @next/next/no-img-element -- portadas subidas desde el panel (Cloudinary u otro origen)
                            <img src={post.coverUrl} alt="" className="blog-card-cover" loading="lazy" />
                          )}
                          <div style={{ padding: `${post.coverUrl ? 22 : 28}px 28px 0` }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 10 }}>
                              <span style={{ fontSize: 11, background: `${accentForCategory(post.category)}15`, border: `1px solid ${accentForCategory(post.category)}35`, borderRadius: 16, padding: "4px 12px", color: accentForCategory(post.category), letterSpacing: ".12em", textTransform: "uppercase" }}>
                                {post.category}
                              </span>
                              <span style={{ fontSize: 11, color: "var(--on-dark-faint)", whiteSpace: "nowrap" }}>⏱ {post.readMinutes} min</span>
                            </div>
                            <h3 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 19, color: "var(--text)", lineHeight: 1.25, marginBottom: 10 }}>{post.title}</h3>
                            <p style={{ color: "var(--on-dark)", fontSize: 14, lineHeight: 1.65 }}>{post.excerpt}</p>
                          </div>
                        </div>
                        <div style={{ padding: "18px 28px 24px", marginTop: 8, borderTop: "1px solid var(--line-d)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 12, color: "var(--on-dark-faint)" }}>{dateOf(post)}</span>
                          <span style={{ fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: accentForCategory(post.category) }}>
                            {t("read")}
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              {filtered.length > shown.length && (
                <div style={{ textAlign: "center", marginTop: 40 }}>
                  <button type="button" className="btn" onClick={() => setVisible((v) => v + PAGE_SIZE)}>{t("loadMore")}</button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="join pad">
        <div className="glow" />
        <div className="wrap join-inner reveal">
          <span className="eyebrow" style={{ display: "inline-block" }}>{t("ctaEyebrow")}</span>
          <h2>{t("ctaTitle1")}<br/>{t("ctaTitle2")}</h2>
          <p>{t("ctaSubtext")}</p>
          <div className="join-actions">
            <Link href="/contacto" className="btn solid">{t("ctaSubscribe")}</Link>
            <Link href="/academia" className="btn">{t("ctaPrograms")}</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
