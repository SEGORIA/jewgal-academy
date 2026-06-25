"use client"

import Link from "next/link"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import RevealInit from "@/components/RevealInit"
import { TiltCard } from "@/components/motion/TiltCard"
import { motion } from "framer-motion"

const PROGRAMS = [
  {
    slug: "life-coaching-integrativo",
    title: "Life Coaching Integrativo",
    tag: "Formación profesional",
    desc: "Formación integral que une logoterapia, mindfulness y herramientas de coaching para acompañar procesos de transformación profunda.",
    price: "$1.500", free: false,
    duration: "6 meses", level: "Todos los niveles",
    grad: "linear-gradient(135deg,var(--bg) 0%,#0a3d4f 100%)",
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
    grad: "linear-gradient(135deg,#0a1e15 0%,#0e3824 100%)",
    accent: "#6BBF8E", icon: "✦",
    bullets: ["Certificado oficial Jewgal", "Manual completo incluido", "Mentoring grupal mensual"],
  },
  {
    slug: "joogalkids",
    title: "Instructor Joogalkids",
    tag: "Certificación infantil",
    desc: "Formación especializada para guiar el desarrollo integral de niños a través del movimiento, la creatividad y el juego consciente.",
    price: "$360", free: false,
    duration: "3 meses", level: "Sin requisitos",
    grad: "linear-gradient(135deg,#101828 0%,#1e2d52 100%)",
    accent: "#7B9FD8", icon: "★",
    bullets: ["Certificado oficial Joogalkids", "Recursos lúdicos descargables", "Mentoring mensual"],
  },
  {
    slug: "metodo-sholem",
    title: "Método Sholem",
    tag: "Liderazgo adolescente",
    desc: "Formación de instructores para acompañar a adolescentes en el desarrollo de su identidad, liderazgo y valores con propósito.",
    price: "$360", free: false,
    duration: "3 meses", level: "Exp. con adolescentes",
    grad: "linear-gradient(135deg,#1a0d20 0%,#31184a 100%)",
    accent: "#B07FD8", icon: "◈",
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
    accent: "#CBB78B", icon: "✡",
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
  return (
    <>
      <RevealInit />
      <Navbar />

      {/* ── HERO ── */}
      <section style={{
        background: "var(--bg-2)",
        paddingTop: 150, paddingBottom: 90,
        position: "relative", overflow: "hidden",
        borderBottom: "1px solid var(--line-d)",
      }}>
        {/* Foto de la comunidad, fundida con el fondo del hero */}
        <div className="academia-hero-photo" style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "52%", zIndex: 0 }}>
          <img src="/brand/devora-grupo.webp" alt="Devora con su comunidad de alumnos" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 28%" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, var(--bg-2) 2%, rgba(0,0,0,0) 58%)" }} />
        </div>
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
        <div className="wrap" style={{ padding: "80px 36px" }}>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
            variants={{ visible: { transition: { staggerChildren: 0.13 } } }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 0 }}
          >
            {PILLARS.map((p, i) => (
              <motion.div key={p.n}
                variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16,1,0.3,1] } } }}
                style={{
                  padding: "32px 28px",
                  borderRight: i < PILLARS.length - 1 ? "1px solid var(--line-d)" : "none",
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
        <div className="wrap" style={{ padding: "100px 36px" }}>
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

          {/* Cards en grid 2+3 o 1 por fila en el primero */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Primera card — ancha */}
            <TiltCard radius={10} intensity={4}>
            <div className="reveal" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderRadius: 10, overflow: "hidden", border: "1px solid var(--line-d)" }}>
              <div className="tone-dark" style={{ background: PROGRAMS[0].grad, padding: "52px 44px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 320 }}>
                <div>
                  <div style={{ fontSize: 44, color: PROGRAMS[0].accent, fontFamily: "var(--serif)", marginBottom: 8, lineHeight: 1 }}>{PROGRAMS[0].icon}</div>
                  <span style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: PROGRAMS[0].accent, display: "block", marginBottom: 12 }}>{PROGRAMS[0].tag}</span>
                  <h3 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 32, color: "var(--text)", lineHeight: 1.1, marginBottom: 16 }}>{PROGRAMS[0].title}</h3>
                  <p style={{ color: "var(--on-dark)", fontSize: 15, lineHeight: 1.65, maxWidth: 360 }}>{PROGRAMS[0].desc}</p>
                </div>
                <Link href={`/programas/${PROGRAMS[0].slug}`} className="btn" style={{ alignSelf: "flex-start", marginTop: 24, borderColor: PROGRAMS[0].accent, color: PROGRAMS[0].accent }}>
                  Ver programa →
                </Link>
              </div>
              <div style={{ background: "var(--navy-2)", padding: "52px 44px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {PROGRAMS[0].bullets.map((b) => (
                    <div key={b} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: "var(--on-dark)" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={PROGRAMS[0].accent} strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                      {b}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 32 }}>
                  <div style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>Inversión</div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 34, color: "var(--text)" }}>{PROGRAMS[0].price}</div>
                  <div style={{ display: "flex", gap: 14, marginTop: 14, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, border: "1px solid var(--line-d)", borderRadius: 16, padding: "5px 13px", color: "var(--on-dark)" }}>⏱ {PROGRAMS[0].duration}</span>
                    <span style={{ fontSize: 11, border: "1px solid var(--line-d)", borderRadius: 16, padding: "5px 13px", color: "var(--on-dark)" }}>◈ {PROGRAMS[0].level}</span>
                  </div>
                </div>
              </div>
            </div>
            </TiltCard>

            {/* Resto de cards con TiltCard + stagger */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 20 }}
            >
              {PROGRAMS.slice(1).map((p) => (
                <motion.div key={p.slug}
                  variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16,1,0.3,1] } } }}
                >
                  <TiltCard radius={8}>
                    <Link href={`/programas/${p.slug}`} style={{ textDecoration: "none" }}>
                      <div className="tone-dark" style={{
                        background: p.grad, borderRadius: 8, padding: "34px 28px",
                        border: "1px solid var(--surface-2)",
                        display: "flex", flexDirection: "column", justifyContent: "space-between",
                        minHeight: 340, cursor: "pointer",
                      }}>
                        <div>
                          <div style={{ fontSize: 30, color: p.accent, marginBottom: 12, lineHeight: 1 }}>{p.icon}</div>
                          <span style={{ fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: p.accent, display: "block", marginBottom: 10 }}>{p.tag}</span>
                          <h3 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 20, color: "var(--text)", lineHeight: 1.15, marginBottom: 10 }}>{p.title}</h3>
                          <p style={{ color: "var(--on-dark)", fontSize: 13, lineHeight: 1.6 }}>{p.desc}</p>
                        </div>
                        <div style={{ marginTop: 20 }}>
                          <div style={{ fontFamily: "var(--serif)", fontSize: p.free ? 14 : 22, color: p.free ? "#6BBF8E" : p.accent, marginBottom: 10 }}>
                            {p.price}
                          </div>
                          <span style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: p.accent }}>Ver programa →</span>
                        </div>
                      </div>
                    </Link>
                  </TiltCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
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
        </div>
      </section>

      <Footer />
    </>
  )
}
