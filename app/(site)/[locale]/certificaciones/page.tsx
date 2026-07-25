"use client"

import { useState, useEffect } from "react"
import { Link } from "@/i18n/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import RevealInit from "@/components/RevealInit"
import { TiltCard } from "@/components/motion/TiltCard"
import { motion } from "framer-motion"
import { useLocale, useTranslations } from "next-intl"
import { DEFAULT_SITE_CONTENT, type SiteContent } from "@/lib/site-content"

// Datos visuales fijos de cada certificación; los textos se traducen vía
// next-intl con las claves c1..c5.
const CERT_META = [
  { key: "c1", slug: "life-coaching-integrativo", accent: "#A58D66", grad: "linear-gradient(135deg,#3A2410,#5C3A1E)", icon: "⟡" },
  { key: "c2", slug: "joogal-adultos",            accent: "#C49F72", grad: "linear-gradient(135deg,#3A2818,#5C4026)", icon: "✦" },
  { key: "c3", slug: "joogalkids",                accent: "#A76D61", grad: "linear-gradient(135deg,#4A2418,#6B3826)", icon: "★" },
  { key: "c4", slug: "metodo-sholem",             accent: "#A76D61", grad: "linear-gradient(135deg,#42200F,#653322)", icon: "◈" },
  { key: "c5", slug: "cabala-coach",              accent: "#CBB78B", grad: "linear-gradient(135deg,#332508,#4F3A12)", icon: "❂" },
]

export default function CertificacionesPage() {
  const locale = useLocale()
  const t = useTranslations("Certificaciones")
  const [isMobile, setIsMobile] = useState(false)

  const CERTS = CERT_META.map((m, i) => ({
    n: String(i + 1).padStart(2, "0"),
    slug: m.slug, accent: m.accent, grad: m.grad, icon: m.icon,
    title: t(`${m.key}Title`), entity: t(`${m.key}Entity`),
    type: t(`${m.key}Type`), duration: t(`${m.key}Dur`),
    desc: t(`${m.key}Desc`), req: t.raw(`${m.key}Req`) as string[],
  }))

  const STEPS = [
    { n: "01", title: t("step1Title"), desc: t("step1Desc") },
    { n: "02", title: t("step2Title"), desc: t("step2Desc") },
    { n: "03", title: t("step3Title"), desc: t("step3Desc") },
    { n: "04", title: t("step4Title"), desc: t("step4Desc") },
  ]
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    fetch(`/api/site-content?locale=${locale}`)
      .then((r) => r.json())
      .then((d) => setContent(d))
      .catch(() => {})
  }, [locale])

  return (
    <>
      <RevealInit />
      <Navbar />

      {/* ── HERO ── */}
      <section style={{
        background: "linear-gradient(120deg,var(--navy-2) 0%,var(--navy) 55%,#2A1D12 100%)",
        paddingTop: isMobile ? 100 : 150, paddingBottom: isMobile ? 60 : 90,
        position: "relative", overflow: "hidden",
        borderBottom: "1px solid var(--line-d)",
      }}>
        <div style={{ position: "absolute", top: "-30%", right: "0%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(165,141,102,.07),transparent 70%)", pointerEvents: "none" }} />
        <div className="wrap">
          <span className="eyebrow" style={{ display: "block", marginBottom: 20 }}>{content.pages.certificaciones.eyebrow}</span>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(44px,6vw,78px)", color: "var(--text)", lineHeight: 1.02, letterSpacing: "-.01em", marginBottom: 22 }}>
            {content.pages.certificaciones.title}
          </h1>
          <p style={{ color: "var(--on-dark)", fontSize: 17, maxWidth: 500, lineHeight: 1.7 }}>
            {content.pages.certificaciones.subtext}
          </p>
        </div>
      </section>

      {/* ── PROCESO ── */}
      <section style={{ background: "var(--navy-2)", borderBottom: "1px solid var(--line-d)" }}>
        <div className="wrap" style={{ padding: isMobile ? "48px 20px" : "80px 36px", textAlign: "center" }}>
          <span className="eyebrow sec-eyebrow reveal">{t("processEyebrow")}</span>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}
            variants={{ visible: { transition: { staggerChildren: 0.14 } } }}
            style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: isMobile ? "28px 16px" : 0, marginTop: 48 }}
          >
            {STEPS.map((s, i) => (
              <motion.div key={s.n}
                variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16,1,0.3,1] } } }}
                style={{
                  padding: isMobile ? "0 12px" : "0 32px",
                  borderRight: (!isMobile && i < 3) ? "1px solid var(--line-d)" : "none",
                }}
              >
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.14 + 0.2 }}
                  style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 13, color: "var(--gold)", display: "block", marginBottom: 14 }}
                >
                  {s.n}
                </motion.span>
                <h3 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 20, color: "var(--text)", marginBottom: 10 }}>{s.title}</h3>
                <p style={{ color: "var(--on-dark)", fontSize: 14, lineHeight: 1.6 }}>{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── GRID DE CERTIFICACIONES ── */}
      <section style={{ background: "var(--navy)" }}>
        <div className="wrap" style={{ padding: isMobile ? "52px 20px" : "100px 36px" }}>
          <span className="eyebrow sec-eyebrow reveal">{t("availableEyebrow")}</span>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 52 }}
          >
            {CERTS.map((c) => (
              <motion.div key={c.n}
                variants={{ hidden: { opacity: 0, x: -24 }, visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.16,1,0.3,1] } } }}
              >
              <TiltCard radius={10} intensity={3}>
              <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "280px 1fr",
                borderRadius: 10, overflow: "hidden",
                border: "1px solid var(--line-d)",
              }}>
                {/* Panel izquierdo con gradiente */}
                <div className="tone-dark" style={{ background: c.grad, padding: isMobile ? "28px 24px" : "36px 32px", display: "flex", flexDirection: isMobile ? "row" : "column", justifyContent: "space-between", alignItems: isMobile ? "center" : "flex-start", gap: isMobile ? 16 : 0 }}>
                  <div>
                    <div style={{ fontSize: 36, color: c.accent, marginBottom: 10, lineHeight: 1 }}>{c.icon}</div>
                    <span style={{ fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: c.accent, display: "block", marginBottom: 10 }}>{c.type}</span>
                    <h3 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 22, color: "var(--text)", lineHeight: 1.15 }}>{c.title}</h3>
                  </div>
                  <div style={{ marginTop: 24 }}>
                    <div style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--on-dark-faint)", marginBottom: 4 }}>{t("labelEntity")}</div>
                    <div style={{ fontSize: 13, color: c.accent }}>{c.entity}</div>
                    <div style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--on-dark-faint)", marginTop: 12, marginBottom: 4 }}>{t("labelDuration")}</div>
                    <div style={{ fontSize: 13, color: "var(--on-dark)" }}>{c.duration}</div>
                  </div>
                </div>

                {/* Panel derecho */}
                <div style={{ background: "var(--navy-2)", padding: isMobile ? "24px 24px" : "36px 40px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>{t("labelDescription")}</div>
                    <p style={{ color: "var(--on-dark)", fontSize: 14.5, lineHeight: 1.7, marginBottom: 24 }}>{c.desc}</p>

                    <div style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 12 }}>{t("labelRequirements")}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {c.req.map((r) => (
                        <div key={r} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: "var(--on-dark)" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.accent} strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                          {r}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginTop: 28 }}>
                    <Link href={`/programas/${c.slug}`} className="btn" style={{ borderColor: c.accent, color: c.accent, fontSize: 11 }}>
                      {t("viewFullProgram")}
                    </Link>
                  </div>
                </div>
              </div>
              </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="join pad">
        <div className="glow" />
        <div className="wrap join-inner reveal">
          <span className="eyebrow" style={{ display: "inline-block" }}>{t("ctaEyebrow")}</span>
          <h2>{t("ctaTitle1")}<br/><em>{t("ctaTitle2")}</em></h2>
          <p>{t("ctaSubtext")}</p>
          <div className="join-actions">
            <Link href="/academia" className="btn solid">{t("ctaExplore")}</Link>
            <Link href="/contacto" className="btn">{t("ctaTalk")}</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
