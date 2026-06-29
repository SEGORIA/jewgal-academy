"use client"

import Link from "next/link"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import RevealInit from "@/components/RevealInit"
import { TiltCard } from "@/components/motion/TiltCard"
import { motion } from "framer-motion"

const CERTS = [
  {
    n: "01",
    title: "Coach Integrativo Certificado",
    program: "Life Coaching Integrativo",
    slug: "life-coaching-integrativo",
    entity: "Jewgal Academy · Internacional",
    accent: "#A58D66",
    grad: "linear-gradient(135deg,var(--bg),#3A2817)",
    icon: "⟡",
    duration: "6 meses",
    type: "Formación completa",
    desc: "Acredita tu dominio de las herramientas del coaching integrativo, logoterapia y bienestar emocional para acompañar procesos de transformación personal y profesional.",
    req: ["Asistencia del 80% a clases en vivo", "Entrega de casos prácticos supervisados", "Evaluación teórica final", "Presentación de proyecto de práctica"],
  },
  {
    n: "02",
    title: "Instructor Jewgal Adultos",
    program: "Instructor Jewgal · Adultos",
    slug: "joogal-adultos",
    entity: "Método Jewgal · Certificación Oficial",
    accent: "#C49F72",
    grad: "linear-gradient(135deg,#1a0f08,#2c1f14)",
    icon: "✦",
    duration: "3 meses",
    type: "Certificación Oficial",
    desc: "Habilitación oficial para dictar clases, talleres y retiros del Método Jewgal para adultos. Reconocida dentro de la comunidad internacional de instructores Jewgal.",
    req: ["Asistencia completa al programa", "Práctica docente evaluada", "Examen teórico y práctico", "Presentación de clase final"],
  },
  {
    n: "03",
    title: "Instructor Joogalkids",
    program: "Instructor Joogalkids",
    slug: "joogalkids",
    entity: "Método Jewgal · Certificación Infantil",
    accent: "#A76D61",
    grad: "linear-gradient(135deg,#241A10,#3A2817)",
    icon: "★",
    duration: "3 meses",
    type: "Certificación Oficial",
    desc: "Habilitación para guiar sesiones de movimiento consciente y desarrollo integral en niños de 3 a 12 años, con pedagogía lúdica certificada.",
    req: ["Asistencia completa al programa", "Módulo de pedagogía infantil aprobado", "Clase práctica evaluada", "Portfolio pedagógico entregado"],
  },
  {
    n: "04",
    title: "Instructor Método Sholem",
    program: "Método Sholem",
    slug: "metodo-sholem",
    entity: "Fundación Sholem · Certificación",
    accent: "#B07FD8",
    grad: "linear-gradient(135deg,#1a0d20,#31184a)",
    icon: "◈",
    duration: "3 meses",
    type: "Certificación de Instructorado",
    desc: "Habilitación para facilitar el Método Sholem en comunidades juveniles, organizaciones y colegios. Formación en liderazgo con valores y cohesión grupal.",
    req: ["Asistencia mínima del 85%", "Taller de facilitación grupal aprobado", "Proyecto comunitario presentado", "Evaluación de competencias"],
  },
  {
    n: "05",
    title: "Cábala Coach",
    program: "Micro Curso · Cábala Coach",
    slug: "cabala-coach",
    entity: "Jewgal Academy · Micro Certificación",
    accent: "#CBB78B",
    grad: "linear-gradient(135deg,#130e03,#2e1f00)",
    icon: "❂",
    duration: "4 semanas",
    type: "Micro Certificación",
    desc: "Acredita el manejo de herramientas cabalísticas aplicadas al coaching y el autoconocimiento. Ideal como complemento a otras formaciones de bienestar.",
    req: ["Completar todos los módulos", "Ejercicios prácticos entregados", "Cuestionario final aprobado"],
  },
]

const STEPS = [
  { n: "01", title: "Elige tu programa", desc: "Explora los programas y elige el que mejor se adapta a tus metas profesionales." },
  { n: "02", title: "Cursa y practica", desc: "Asiste a las clases, realiza las prácticas supervisadas y entrega tus proyectos." },
  { n: "03", title: "Evaluación final", desc: "Aprueba la evaluación teórica y la presentación práctica con el equipo académico." },
  { n: "04", title: "Recibe tu certificado", desc: "Obtén tu certificado digital y únete a la red de profesionales certificados." },
]

export default function CertificacionesPage() {
  return (
    <>
      <RevealInit />
      <Navbar />

      {/* ── HERO ── */}
      <section style={{
        background: "linear-gradient(120deg,var(--navy-2) 0%,var(--navy) 55%,#2A1D12 100%)",
        paddingTop: 150, paddingBottom: 90,
        position: "relative", overflow: "hidden",
        borderBottom: "1px solid var(--line-d)",
      }}>
        <div style={{ position: "absolute", top: "-30%", right: "0%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(165,141,102,.07),transparent 70%)", pointerEvents: "none" }} />
        <div className="wrap">
          <span className="eyebrow" style={{ display: "block", marginBottom: 20 }}>Jewgal Academy</span>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(44px,6vw,78px)", color: "var(--text)", lineHeight: 1.02, letterSpacing: "-.01em", marginBottom: 22 }}>
            Certificaciones
          </h1>
          <p style={{ color: "var(--on-dark)", fontSize: 17, maxWidth: 500, lineHeight: 1.7 }}>
            Cada programa culmina con una certificación reconocida. Conviértete en un profesional acreditado del coaching, el bienestar y el liderazgo consciente.
          </p>
        </div>
      </section>

      {/* ── PROCESO ── */}
      <section style={{ background: "var(--navy-2)", borderBottom: "1px solid var(--line-d)" }}>
        <div className="wrap" style={{ padding: "80px 36px", textAlign: "center" }}>
          <span className="eyebrow sec-eyebrow reveal">Cómo obtener tu certificación</span>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}
            variants={{ visible: { transition: { staggerChildren: 0.14 } } }}
            style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0, marginTop: 48 }}
          >
            {STEPS.map((s, i) => (
              <motion.div key={s.n}
                variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16,1,0.3,1] } } }}
                style={{
                  padding: "0 32px",
                  borderRight: i < 3 ? "1px solid var(--line-d)" : "none",
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
        <div className="wrap" style={{ padding: "100px 36px" }}>
          <span className="eyebrow sec-eyebrow reveal">Certificaciones disponibles</span>
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
                gridTemplateColumns: "280px 1fr",
                borderRadius: 10, overflow: "hidden",
                border: "1px solid var(--line-d)",
              }}>
                {/* Panel izquierdo con gradiente */}
                <div className="tone-dark" style={{ background: c.grad, padding: "36px 32px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 36, color: c.accent, marginBottom: 10, lineHeight: 1 }}>{c.icon}</div>
                    <span style={{ fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: c.accent, display: "block", marginBottom: 10 }}>{c.type}</span>
                    <h3 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 22, color: "var(--text)", lineHeight: 1.15 }}>{c.title}</h3>
                  </div>
                  <div style={{ marginTop: 24 }}>
                    <div style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--on-dark-faint)", marginBottom: 4 }}>Entidad</div>
                    <div style={{ fontSize: 13, color: c.accent }}>{c.entity}</div>
                    <div style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--on-dark-faint)", marginTop: 12, marginBottom: 4 }}>Duración</div>
                    <div style={{ fontSize: 13, color: "var(--on-dark)" }}>{c.duration}</div>
                  </div>
                </div>

                {/* Panel derecho */}
                <div style={{ background: "var(--navy-2)", padding: "36px 40px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>Descripción</div>
                    <p style={{ color: "var(--on-dark)", fontSize: 14.5, lineHeight: 1.7, marginBottom: 24 }}>{c.desc}</p>

                    <div style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 12 }}>Requisitos</div>
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
                      Ver programa completo →
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
          <span className="eyebrow" style={{ display: "inline-block" }}>Empieza hoy</span>
          <h2>Elige tu certificación y<br/><em>transforma tu carrera.</em></h2>
          <p>Cada programa te entrega las herramientas, el respaldo académico y la comunidad para ejercer con confianza.</p>
          <div className="join-actions">
            <Link href="/academia" className="btn solid">Explorar programas →</Link>
            <Link href="/contacto" className="btn">Hablar con Devora</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
