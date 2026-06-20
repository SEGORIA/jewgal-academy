import { notFound } from "next/navigation"
import Link from "next/link"
import { db } from "@/lib/db"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Checkout from "@/components/Checkout"
import RevealInit from "@/components/RevealInit"
import { formatPrice } from "@/lib/utils"

/* ── Metadata estática por slug ── */
const META: Record<string, {
  eyebrow: string
  grad: string
  accent: string
  icon: string
  duration: string
  modality: string
  level: string
  includes: string[]
  modules: { title: string; items: string[] }[]
  forWhom: string[]
  outcome: string
}> = {
  "life-coaching-integrativo": {
    eyebrow: "Formación Profesional",
    grad: "linear-gradient(135deg,var(--bg) 0%,var(--bg-2) 55%,#0a3d4f 100%)",
    accent: "#A58D66",
    icon: "⟡",
    duration: "6 meses",
    modality: "Online · Clases en vivo",
    level: "Principiante a avanzado",
    includes: [
      "Acceso al aula virtual 24/7",
      "Clases en vivo por Zoom",
      "Materiales de estudio descargables",
      "Grabaciones de cada clase",
      "Certificado al completar",
      "Comunidad de alumnos",
      "Supervisión individual",
      "Herramientas prácticas aplicables",
    ],
    modules: [
      { title: "Fundamentos del Coaching", items: ["¿Qué es el coaching?", "Bases de la escucha activa", "El modelo GROW"] },
      { title: "Psicología Integrativa", items: ["Logoterapia y sentido de vida", "Regulación emocional", "Creencias limitantes"] },
      { title: "Herramientas Prácticas", items: ["Rueda de la vida", "Plan de acción", "Feedback transformador"] },
      { title: "Práctica Profesional", items: ["Ética del coach", "Construcción de tu práctica", "Primeras sesiones reales"] },
    ],
    forWhom: [
      "Personas que desean acompañar a otros en su transformación",
      "Psicólogos, terapeutas y educadores que quieren ampliar sus herramientas",
      "Líderes y managers que buscan desarrollar equipos más conscientes",
      "Emprendedores que quieren integrar el coaching en su propuesta",
    ],
    outcome: "Al completar la formación serás un coach certificado capaz de acompañar procesos de transformación personal y profesional desde una perspectiva integrativa.",
  },
  "joogal-adultos": {
    eyebrow: "Certificación Oficial",
    grad: "linear-gradient(135deg,#0a1e15 0%,#0d2b1e 55%,#0e3824 100%)",
    accent: "#6BBF8E",
    icon: "✦",
    duration: "3 meses",
    modality: "Online · Híbrido",
    level: "Sin requisitos previos",
    includes: [
      "Acceso al aula virtual 24/7",
      "Clases en vivo por Zoom",
      "Manual oficial Joogal Adultos",
      "Grabaciones de cada clase",
      "Certificado oficial de instructor",
      "Comunidad de instructores",
      "Mentoring grupal mensual",
      "Kit de materiales descargables",
    ],
    modules: [
      { title: "Bases del Método Joogal", items: ["Historia y filosofía", "Principios del movimiento consciente", "El cuerpo como herramienta"] },
      { title: "Anatomía y Movimiento", items: ["Anatomía funcional", "Biomecánica segura", "Adaptaciones para adultos"] },
      { title: "Didáctica de Clases", items: ["Estructura de una sesión", "Lenguaje del instructor", "Gestión del grupo"] },
      { title: "Práctica y Certificación", items: ["Clases prácticas supervisadas", "Evaluación teórica", "Presentación final"] },
    ],
    forWhom: [
      "Amantes del movimiento y el bienestar",
      "Profesores de yoga, pilates o danza que quieren ampliar su oferta",
      "Personas que buscan una segunda vocación o fuente de ingresos",
      "Líderes comunitarios que desean implementar bienestar en sus grupos",
    ],
    outcome: "Serás instructor certificado del Método Joogal Adultos, con las herramientas para dictar tus propias clases, talleres y retiros.",
  },
  "joogalkids": {
    eyebrow: "Certificación Infantil",
    grad: "linear-gradient(135deg,#101828 0%,#1a2540 55%,#1e2d52 100%)",
    accent: "#7B9FD8",
    icon: "★",
    duration: "3 meses",
    modality: "Online · Clases en vivo",
    level: "Sin requisitos previos",
    includes: [
      "Acceso al aula virtual 24/7",
      "Clases en vivo por Zoom",
      "Manual Joogalkids oficial",
      "Grabaciones de cada clase",
      "Certificado oficial de instructor",
      "Comunidad de instructores",
      "Mentoring grupal mensual",
      "Recursos lúdicos descargables",
    ],
    modules: [
      { title: "Desarrollo Infantil", items: ["Etapas del desarrollo", "Psicología del juego", "Necesidades del niño"] },
      { title: "Movimiento y Creatividad", items: ["El cuerpo en la infancia", "Juegos de movimiento", "Expresión libre"] },
      { title: "Pedagogía Lúdica", items: ["Diseño de actividades", "Manejo de grupos infantiles", "Recursos creativos"] },
      { title: "Práctica y Certificación", items: ["Clases prácticas", "Evaluación pedagógica", "Presentación final"] },
    ],
    forWhom: [
      "Maestras y docentes de educación inicial",
      "Psicopedagogos y psicólogos infantiles",
      "Instructores que quieren trabajar con niños",
      "Madres y padres interesados en el desarrollo consciente",
    ],
    outcome: "Serás instructor certificado del Método Joogalkids, capaz de crear experiencias de movimiento significativas para niños de 3 a 12 años.",
  },
  "metodo-sholem": {
    eyebrow: "Liderazgo Adolescente",
    grad: "linear-gradient(135deg,#1a0d20 0%,#2a1535 55%,#31184a 100%)",
    accent: "#B07FD8",
    icon: "◈",
    duration: "3 meses",
    modality: "Online · Intensivo",
    level: "Experiencia con adolescentes",
    includes: [
      "Acceso al aula virtual 24/7",
      "Clases en vivo por Zoom",
      "Manual Método Sholem",
      "Grabaciones de cada clase",
      "Certificado de instructor",
      "Comunidad de educadores",
      "Supervisión grupal",
      "Recursos para talleres",
    ],
    modules: [
      { title: "El Adolescente de Hoy", items: ["Psicología adolescente", "Identidad y pertenencia", "Desafíos actuales"] },
      { title: "Liderazgo con Valores", items: ["Bases del Método Sholem", "Valores judíos aplicados", "Liderazgo positivo"] },
      { title: "Facilitación de Grupos", items: ["Dinámica de grupos", "Resolución de conflictos", "Creación de comunidad"] },
      { title: "Programa y Práctica", items: ["Diseño de programas", "Práctica facilitada", "Evaluación final"] },
    ],
    forWhom: [
      "Educadores y docentes de nivel secundario",
      "Líderes de juventud en organizaciones comunitarias",
      "Profesionales que trabajan con adolescentes",
      "Rabinos, cantores y educators judíos",
    ],
    outcome: "Serás instructor certificado del Método Sholem, preparado para formar líderes adolescentes con valores, identidad y propósito.",
  },
  "cabala-coach": {
    eyebrow: "Micro Curso · Sabiduría Ancestral",
    grad: "linear-gradient(135deg,#130e03 0%,#231700 55%,#2e1f00 100%)",
    accent: "#CBB78B",
    icon: "✡",
    duration: "4 semanas",
    modality: "Online · A tu ritmo",
    level: "Todos los niveles",
    includes: [
      "Acceso al aula virtual 24/7",
      "Videos grabados HD",
      "Guía de estudio PDF",
      "Ejercicios prácticos",
      "Certificado al completar",
      "Acceso de por vida",
      "Material de meditación",
      "Comunidad privada",
    ],
    modules: [
      { title: "Introducción a la Cabalá", items: ["¿Qué es la Cabalá?", "El Árbol de la Vida", "Las sefirot"] },
      { title: "Cabalá y Coaching", items: ["Aplicaciones prácticas", "Arquetipos cabalísticos", "Lenguaje del alma"] },
      { title: "Herramientas de Transformación", items: ["Meditaciones guiadas", "Diálogos del yo", "Integración personal"] },
      { title: "Vivir con Propósito", items: ["Tu tikún personal", "El mapa de tu vida", "Acción con conciencia"] },
    ],
    forWhom: [
      "Personas curiosas por la espiritualidad judía",
      "Coaches que quieren enriquecer su práctica",
      "Buscadores espirituales de cualquier tradición",
      "Estudiantes de desarrollo personal",
    ],
    outcome: "Integrarás la sabiduría de la Cabalá como herramienta práctica de autoconocimiento y transformación personal, aplicable en tu vida cotidiana y tu práctica profesional.",
  },
}

const DEFAULT_META = META["life-coaching-integrativo"]

export default async function ProgramaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const course = await db.course.findUnique({ where: { slug } })
  if (!course) notFound()

  const meta = META[slug] ?? DEFAULT_META
  const priceLabel = course.isFree ? "Gratis" : formatPrice(course.price, course.currency)

  return (
    <>
      <RevealInit />
      <Navbar />

      {/* ── HERO ── */}
      <section className="tone-dark" style={{
        background: meta.grad,
        paddingTop: 140, paddingBottom: 80,
        position: "relative", overflow: "hidden",
        borderBottom: "1px solid rgba(165,141,102,.18)",
      }}>
        {/* Glow de fondo */}
        <div style={{
          position: "absolute", top: "-20%", right: "5%",
          width: 500, height: 500, borderRadius: "50%",
          background: `radial-gradient(circle,${meta.accent}12,transparent 68%)`,
          pointerEvents: "none",
        }} />

        <div className="wrap">
          {/* Breadcrumb */}
          <Link href="/#programas" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase",
            color: "var(--on-dark-faint)", textDecoration: "none", marginBottom: 40,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Todos los programas
          </Link>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 40, alignItems: "end" }}>
            <div>
              <span className="eyebrow" style={{ display: "block", marginBottom: 16, color: meta.accent }}>{meta.eyebrow}</span>
              <div style={{ fontSize: 52, color: meta.accent, lineHeight: 1, marginBottom: 12, fontFamily: "var(--serif)" }}>
                {meta.icon}
              </div>
              <h1 style={{
                fontFamily: "var(--serif)", fontWeight: 500,
                fontSize: "clamp(36px,5.5vw,68px)", color: "var(--text)",
                lineHeight: 1.02, letterSpacing: "-.01em",
              }}>
                {course.title}
              </h1>
              <p style={{ color: "var(--on-dark)", fontSize: 17, maxWidth: 580, marginTop: 18, lineHeight: 1.65 }}>
                {course.shortDesc}
              </p>
            </div>

            {/* Precio badge */}
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{
                fontFamily: "var(--serif)", fontWeight: 500,
                fontSize: "clamp(36px,4vw,56px)", color: course.isFree ? "#6BBF8E" : meta.accent,
                lineHeight: 1,
              }}>
                {priceLabel}
              </div>
              {!course.isFree && (
                <div style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--on-dark-faint)", marginTop: 6 }}>
                  Pago único · Acceso completo
                </div>
              )}
            </div>
          </div>

          {/* Chips de info rápida */}
          <div style={{ display: "flex", gap: 12, marginTop: 36, flexWrap: "wrap" }}>
            {[
              { label: meta.duration,   icon: "⏱" },
              { label: meta.modality,   icon: "🎓" },
              { label: meta.level,      icon: "◈" },
            ].map((c) => (
              <div key={c.label} style={{
                display: "flex", alignItems: "center", gap: 7,
                border: "1px solid rgba(165,141,102,.25)", borderRadius: 20,
                padding: "7px 16px",
                fontSize: 12, color: "var(--on-dark)",
                background: "var(--surface)",
              }}>
                <span>{c.icon}</span>
                <span>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTENIDO + CHECKOUT ── */}
      <section style={{ background: "var(--navy)" }}>
        <div className="wrap" style={{ padding: "80px 36px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 64, alignItems: "start" }}>

            {/* ── Columna izquierda ── */}
            <div>

              {/* Descripción */}
              <div className="reveal" style={{ marginBottom: 60 }}>
                <h2 style={{
                  fontFamily: "var(--serif)", fontWeight: 500,
                  fontSize: "clamp(22px,2.8vw,34px)", color: "var(--text)",
                  marginBottom: 20,
                }}>
                  Sobre el programa
                </h2>
                <p style={{ color: "var(--on-dark)", fontSize: 15.5, lineHeight: 1.8, whiteSpace: "pre-line" }}>
                  {course.description}
                </p>
              </div>

              {/* Módulos */}
              <div className="reveal" style={{ marginBottom: 60 }}>
                <h2 style={{
                  fontFamily: "var(--serif)", fontWeight: 500,
                  fontSize: "clamp(22px,2.8vw,34px)", color: "var(--text)",
                  marginBottom: 28,
                }}>
                  Contenido del programa
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {meta.modules.map((mod, i) => (
                    <details key={mod.title} style={{
                      borderTop: "1px solid var(--line-d)",
                      paddingTop: 16,
                    }}
                      open={i === 0}
                    >
                      <summary style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        cursor: "pointer", paddingBottom: 10, listStyle: "none",
                        color: "var(--text)",
                      }}>
                        <span style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <span style={{ fontFamily: "var(--serif)", fontSize: 13, color: "var(--gold)", fontStyle: "italic" }}>
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span style={{ fontSize: 15, fontWeight: 500 }}>{mod.title}</span>
                        </span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M6 9l6 6 6-6"/>
                        </svg>
                      </summary>
                      <ul style={{ paddingLeft: 38, paddingBottom: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                        {mod.items.map((it) => (
                          <li key={it} style={{ fontSize: 14, color: "var(--on-dark)", display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--gold)", flexShrink: 0 }} />
                            {it}
                          </li>
                        ))}
                      </ul>
                    </details>
                  ))}
                  <div style={{ borderTop: "1px solid var(--line-d)" }} />
                </div>
              </div>

              {/* Qué incluye */}
              <div className="reveal" style={{ marginBottom: 60 }}>
                <h2 style={{
                  fontFamily: "var(--serif)", fontWeight: 500,
                  fontSize: "clamp(22px,2.8vw,34px)", color: "var(--text)",
                  marginBottom: 24,
                }}>
                  Qué incluye
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
                  {meta.includes.map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--on-dark)" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={meta.accent} strokeWidth="2">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Para quién */}
              <div className="reveal" style={{ marginBottom: 60 }}>
                <h2 style={{
                  fontFamily: "var(--serif)", fontWeight: 500,
                  fontSize: "clamp(22px,2.8vw,34px)", color: "var(--text)",
                  marginBottom: 24,
                }}>
                  ¿Para quién es este programa?
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {meta.forWhom.map((fw) => (
                    <div key={fw} style={{
                      display: "flex", alignItems: "flex-start", gap: 14,
                      padding: "14px 18px",
                      border: "1px solid var(--line-d)",
                      borderRadius: 6,
                      fontSize: 14, color: "var(--on-dark)", lineHeight: 1.55,
                    }}>
                      <span style={{ color: meta.accent, fontSize: 18, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>◆</span>
                      {fw}
                    </div>
                  ))}
                </div>
              </div>

              {/* Lo que lograrás */}
              <div className="reveal" style={{
                background: `linear-gradient(135deg,${meta.accent}12,transparent)`,
                border: `1px solid ${meta.accent}30`,
                borderRadius: 8, padding: 28,
              }}>
                <div style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: meta.accent, marginBottom: 12 }}>
                  Al finalizar
                </div>
                <p style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--text)", lineHeight: 1.6 }}>
                  {meta.outcome}
                </p>
              </div>
            </div>

            {/* ── Columna derecha: Checkout sticky ── */}
            <div style={{ position: "sticky", top: 100 }}>
              <div style={{
                background: "var(--navy-2)",
                border: "1px solid var(--line-d)",
                borderRadius: 10,
                overflow: "hidden",
              }}>
                {/* Cabecera del card */}
                <div className="tone-dark" style={{
                  background: meta.grad,
                  padding: "24px 28px",
                  borderBottom: "1px solid rgba(165,141,102,.18)",
                }}>
                  <div style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: meta.accent, marginBottom: 8 }}>
                    Inscripción
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "var(--serif)", fontSize: 28, color: "var(--text)" }}>
                      {course.title}
                    </span>
                    <span style={{ fontFamily: "var(--serif)", fontSize: 28, color: course.isFree ? "#6BBF8E" : meta.accent }}>
                      {priceLabel}
                    </span>
                  </div>
                  {!course.isFree && (
                    <p style={{ fontSize: 12, color: "var(--on-dark-faint)", marginTop: 4 }}>
                      Pago único · Acceso completo al curso
                    </p>
                  )}
                </div>

                {/* Formulario de pago */}
                <div style={{ padding: 28 }}>
                  <Checkout
                    course={{
                      id: course.id,
                      title: course.title,
                      slug: course.slug,
                      price: course.price,
                      currency: course.currency,
                      isFree: course.isFree,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── OTROS PROGRAMAS ── */}
      <section className="join pad">
        <div className="glow" />
        <div className="wrap join-inner reveal">
          <span className="eyebrow" style={{ display: "inline-block" }}>Explora más</span>
          <h2>Descubre otros <em>programas</em> de Jewgal Academy</h2>
          <p>Cada formación está diseñada para acompañarte en un aspecto diferente de tu transformación.</p>
          <div className="join-actions">
            <Link href="/#programas" className="btn solid">Ver todos los programas →</Link>
            <Link href="/contacto" className="btn">Hablar con Devora</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
