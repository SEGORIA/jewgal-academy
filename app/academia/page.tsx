"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import RevealInit from "@/components/RevealInit"
import { TiltCard } from "@/components/motion/TiltCard"
import { motion, useScroll, useTransform } from "framer-motion"

const PROGRAMS = [
  {
    slug: "life-coaching-integrativo",
    title: "Life Coaching Integrativo",
    tag: "Formación profesional",
    desc: "Formación integral que une logoterapia, mindfulness y herramientas de coaching para acompañar procesos de transformación profunda.",
    price: "$1.500", free: false,
    duration: "6 meses", level: "Todos los niveles",
    grad: "linear-gradient(135deg,var(--bg) 0%,#3A2817 100%)",
    accent: "#A58D66", icon: "⟡",
    bullets: ["Certificado internacional", "Clases en vivo + grabaciones", "Supervisión individual"],
  },
  {
    slug: "joogal-adultos",
    title: "Instructor Jewgal · Adultos",
    tag: "Certificación oficial",
    desc: "Certifícate como instructor del Método Jewgal y desarrolla tu práctica como guía de bienestar y movimiento consciente.",
    price: "Gratis", free: true,
    duration: "3 meses", level: "Sin requisitos",
    grad: "linear-gradient(135deg,#1a0f08 0%,#2c1f14 100%)",
    accent: "#C49F72", icon: "✦",
    bullets: ["Certificado oficial Jewgal", "Manual completo incluido", "Mentoring grupal mensual"],
  },
  {
    slug: "joogalkids",
    title: "Instructor Joogalkids",
    tag: "Certificación infantil",
    desc: "Formación especializada para guiar el desarrollo integral de niños a través del movimiento, la creatividad y el juego consciente.",
    price: "$360", free: false,
    duration: "3 meses", level: "Sin requisitos",
    grad: "linear-gradient(135deg,#241A10 0%,#3A2817 100%)",
    accent: "#A76D61", icon: "★",
    bullets: ["Certificado oficial Joogalkids", "Recursos lúdicos descargables", "Mentoring mensual"],
  },
  {
    slug: "metodo-sholem",
    title: "Método Sholem",
    tag: "Liderazgo adolescente",
    desc: "Formación de instructores para acompañar a adolescentes en el desarrollo de su identidad, liderazgo y valores con propósito.",
    price: "$360", free: false,
    duration: "3 meses", level: "Exp. con adolescentes",
    grad: "linear-gradient(135deg,#21160d 0%,#3a2418 100%)",
    accent: "#A76D61", icon: "◈",
    bullets: ["Certificado de instructor", "Manual Método Sholem", "Supervisión grupal"],
  },
  {
    slug: "cabala-coach",
    title: "Micro Curso · Cábala Coach",
    tag: "Sabiduría ancestral",
    desc: "Integra la sabiduría milenaria de la Cabalá como herramienta práctica de autoconocimiento, coaching y transformación personal.",
    price: "$360", free: false,
    duration: "4 semanas", level: "Todos los niveles",
    grad: "linear-gradient(135deg,#130e03 0%,#2e1f00 100%)",
    accent: "#CBB78B", icon: "❂",
    bullets: ["Acceso de por vida", "Videos HD + guías PDF", "Comunidad privada"],
  },
]

const PILLARS = [
  { n: "01", title: "Coaching Integrativo", desc: "Unimos las mejores herramientas del coaching moderno con enfoques psicológicos y espirituales." },
  { n: "02", title: "Sabiduría de la Cabalá", desc: "Incorporamos principios ancestrales que aportan profundidad y sentido a cada proceso de transformación." },
  { n: "03", title: "Movimiento Consciente", desc: "El cuerpo como herramienta de cambio. El método Jewgal integra movimiento, respiración y presencia." },
  { n: "04", title: "Comunidad Global", desc: "Aprendizaje entre pares, mentoring en vivo y acceso a una red de coaches e instructores activos." },
]

export default function AcademiaPage() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const { scrollY } = useScroll()
  const photoY = useTransform(scrollY, [0, 800], [0, -100])

  return (
    <>
      <RevealInit />
      <Navbar />

      {/* ── HERO ── */}
      <section style={{
        background: "var(--bg-2)",
        paddingTop: isMobile ? 100 : 150, paddingBottom: isMobile ? 60 : 90,
        position: "relative", overflow: "hidden",
        borderBottom: "1px solid var(--line-d)",
      }}>
        {/* Foto de la comunidad, fundida con el fondo del hero */}
        <motion.div className="academia-hero-photo" style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "52%", zIndex: 0, display: isMobile ? "none" : undefined, y: photoY }}>
          <img src="/brand/devora-grupo.webp" alt="Devora con su comunidad de alumnos" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 28%" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, var(--bg-2) 2%, rgba(0,0,0,0) 58%)" }} />
        </motion.div>
        <div className="wrap" style={{ position: "relative", zIndex: 2 }}>
          <span className="eyebrow" style={{ display: "block", marginBottom: 20 }}>Jewgal Academy</span>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(46px,6.5vw,82px)", color: "var(--text)", lineHeight: 1.02, letterSpacing: "-.01em", marginBottom: 22 }}>
            La Academia
          </h1>
          <p style={{ color: "var(--on-dark)", fontSize: 17, maxWidth: 520, lineHeight: 1.7, marginBottom: 36 }}>
            Programas, certificaciones y formaciones que integran coaching, logoterapia y sabiduría ancestral. Más de 40 años de experiencia al servicio de tu transformación.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link href="#programas" className="btn solid">Ver programas →</Link>
            <Link href="/conoce-a-devora" className="btn">Conocer a Devora</Link>
          </div>
        </div>
      </section>

      {/* ── PILARES ── */}
      <section style={{ background: "var(--navy-2)", borderBottom: "1px solid var(--line-d)" }}>
        <div className="wrap" style={{ padding: isMobile ? "44px 20px" : "80px 36px" }}>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
            variants={{ visible: { transition: { staggerChildren: 0.13 } } }}
            style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fit,minmax(220px,1fr))", gap: isMobile ? "24px 12px" : 0 }}
          >
            {PILLARS.map((p, i) => (
              <motion.div key={p.n}
                variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16,1,0.3,1] } } }}
                style={{
                  padding: isMobile ? "20px 16px" : "32px 28px",
                  borderRight: (!isMobile && i < PILLARS.length - 1) ? "1px solid var(--line-d)" : "none",
                  cursor: "default",
                  transition: "background .3s",
                }}
                whileHover={{ background: "rgba(165,141,102,.04)" }}
              >
                <span style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 13, color: "var(--gold)", display: "block", marginBottom: 16 }}>{p.n}</span>
                <h3 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 22, color: "var(--text)", marginBottom: 10 }}>{p.title}</h3>
                <p style={{ color: "var(--on-dark)", fontSize: 14, lineHeight: 1.65 }}>{p.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── PROGRAMAS ── */}
      <section style={{ background: "var(--navy)" }} id="programas">
        <div className="wrap" style={{ padding: isMobile ? "52px 20px" : "100px 36px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 60, flexWrap: "wrap", gap: 16 }}>
            <div className="reveal">
              <span className="eyebrow" style={{ display: "block", marginBottom: 12 }}>Nuestros programas</span>
              <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(28px,3.6vw,46px)", color: "var(--text)", lineHeight: 1.1 }}>
                Formaciones y certificaciones
              </h2>
            </div>
            <Link href="/certificaciones" className="reveal" style={{ color: "var(--gold)", fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", textDecoration: "none" }}>
              Ver certificaciones →
            </Link>
          </div>

          {/* Grid unificado: todas las cards al mismo nivel de lujo */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}
            variants={{ visible: { transition: { staggerChildren: 0.09 } } }}
            style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill,minmax(280px,1fr))", gap: 22 }}
          >
            {PROGRAMS.map((p, i) => (
              <motion.div key={p.slug}
                variants={{ hidden: { opacity: 0, y: 36 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16,1,0.3,1] } } }}
                style={{ gridColumn: i === 0 && !isMobile ? "1 / -1" : undefined }}
              >
                <TiltCard radius={10} intensity={i === 0 ? 3 : 5} style={{ height: "100%" }}>
                  <Link href={`/programas/${p.slug}`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                    <motion.div
                      whileHover={{ borderColor: p.accent, boxShadow: `0 28px 64px -22px ${p.accent}45` }}
                      transition={{ duration: 0.32 }}
                      className="tone-dark"
                      style={{
                        background: p.grad,
                        borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.06)",
                        overflow: "hidden",
                        position: "relative",
                        display: "grid",
                        gridTemplateColumns: i === 0 && !isMobile ? "1fr 1fr" : "1fr",
                        minHeight: i === 0 ? (isMobile ? "auto" : 320) : 340,
                        height: "100%",
                      }}
                    >
                      {/* Watermark número de fondo */}
                      <div aria-hidden style={{
                        position: "absolute",
                        bottom: i === 0 ? undefined : -16, top: i === 0 ? -20 : undefined,
                        right: 18,
                        fontFamily: "var(--serif)", fontSize: i === 0 ? 160 : 110, fontWeight: 700,
                        color: p.accent, opacity: 0.055, lineHeight: 1,
                        userSelect: "none", pointerEvents: "none", zIndex: 0,
                      }}>
                        {String(i + 1).padStart(2, "0")}
                      </div>

                      {/* Panel principal */}
                      <div style={{
                        padding: i === 0 ? (isMobile ? "36px 28px" : "52px 48px") : "36px 32px",
                        display: "flex", flexDirection: "column", justifyContent: "space-between",
                        position: "relative", zIndex: 1,
                      }}>
                        {/* Header */}
                        <div>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                            <div style={{ fontSize: i === 0 ? 48 : 38, color: p.accent, lineHeight: 1, fontFamily: "var(--serif)" }}>{p.icon}</div>
                            {p.free && (
                              <span style={{
                                fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase",
                                background: `${p.accent}18`, color: p.accent,
                                padding: "5px 12px", borderRadius: 14, border: `1px solid ${p.accent}35`,
                                whiteSpace: "nowrap",
                              }}>Gratuito</span>
                            )}
                          </div>
                          <span style={{ fontSize: 9, letterSpacing: ".22em", textTransform: "uppercase", color: p.accent, display: "block", marginBottom: 12 }}>{p.tag}</span>
                          <h3 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: i === 0 ? 32 : 22, color: "var(--text)", lineHeight: 1.1, marginBottom: 14 }}>{p.title}</h3>
                          <p style={{ color: "var(--on-dark)", fontSize: i === 0 ? 15 : 13.5, lineHeight: 1.68, maxWidth: i === 0 ? 380 : undefined }}>{p.desc}</p>
                        </div>

                        {/* Footer */}
                        <div style={{ marginTop: 28 }}>
                          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 10, border: "1px solid rgba(165,141,102,.2)", borderRadius: 16, padding: "4px 12px", color: "var(--on-dark)" }}>⏱ {p.duration}</span>
                            <span style={{ fontSize: 10, border: "1px solid rgba(165,141,102,.2)", borderRadius: 16, padding: "4px 12px", color: "var(--on-dark)" }}>◈ {p.level}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                            <div style={{
                              fontFamily: p.free ? "var(--sans)" : "var(--serif)",
                              fontSize: p.free ? 12 : (i === 0 ? 36 : 26),
                              color: "var(--text)",
                              letterSpacing: p.free ? ".08em" : undefined,
                              textTransform: p.free ? "uppercase" : undefined,
                            }}>
                              {p.price}
                            </div>
                            <span style={{
                              fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase",
                              color: p.accent, border: `1px solid ${p.accent}50`,
                              borderRadius: 3, padding: "8px 16px", flexShrink: 0,
                            }}>
                              Ver programa →
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Panel derecho — solo en la card destacada en desktop */}
                      {i === 0 && !isMobile && (
                        <div style={{ background: "rgba(0,0,0,.18)", backdropFilter: "blur(2px)", padding: "52px 44px", display: "flex", flexDirection: "column", justifyContent: "space-between", borderLeft: "1px solid rgba(255,255,255,.06)", position: "relative", zIndex: 1 }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {p.bullets.map((b) => (
                              <div key={b} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: "var(--on-dark)" }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={p.accent} strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                                {b}
                              </div>
                            ))}
                          </div>
                          <div>
                            <div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>Programa certificado por</div>
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                              {["IDC", "CEL", "FGU"].map((cert) => (
                                <span key={cert} style={{ fontSize: 10, letterSpacing: ".12em", border: `1px solid ${p.accent}40`, borderRadius: 3, padding: "4px 10px", color: p.accent }}>{cert}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </Link>
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
          <span className="eyebrow" style={{ display: "inline-block" }}>¿Por dónde empezar?</span>
          <h2>Habla con nosotros y encontremos<br/><em>el camino ideal para ti.</em></h2>
          <p>Una sesión exploratoria gratuita para orientarte entre todos los programas disponibles.</p>
          <div className="join-actions">
            <Link href="/contacto" className="btn solid">Agendar sesión gratuita →</Link>
            <Link href="/certificaciones" className="btn">Ver certificaciones</Link>
          </div>
          <p style={{ marginTop: 20, fontSize: 13.5 }}>
            ¿Buscas coaching personal, no un programa? <Link href="/conoce-a-devora#coaching-1-1" style={{ color: "var(--gold-light)", textDecoration: "underline" }}>Conoce las sesiones 1:1 con Devora →</Link>
          </p>
        </div>
      </section>

      <Footer />
    </>
  )
}
