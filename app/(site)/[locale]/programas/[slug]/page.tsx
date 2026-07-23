import { notFound } from "next/navigation"
import { Link } from "@/i18n/navigation"
import { db } from "@/lib/db"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Checkout from "@/components/Checkout"
import RevealInit from "@/components/RevealInit"
import { formatPrice } from "@/lib/utils"
import { getProgramContent, getYouTubeEmbedUrl } from "@/lib/program-content"

/* ── Identidad visual por slug (no editable desde el admin) ── */
const META: Record<string, { grad: string; accent: string; icon: string; certs: string[] }> = {
  "life-coaching-integrativo": { grad: "linear-gradient(135deg,#3A2410 0%,#5C3A1E 100%)", accent: "#A58D66", icon: "⟡", certs: ["idc", "cel", "fgu"] },
  "joogal-adultos":            { grad: "linear-gradient(135deg,#3A2818 0%,#5C4026 100%)", accent: "#C49F72", icon: "✦", certs: ["idc", "cel", "fgu"] },
  "joogalkids":                { grad: "linear-gradient(135deg,#4A2418 0%,#6B3826 100%)", accent: "#A76D61", icon: "★", certs: ["idc", "cel", "fgu"] },
  "metodo-sholem":              { grad: "linear-gradient(135deg,#42200F 0%,#653322 100%)", accent: "#A76D61", icon: "◈", certs: ["idc", "cel", "fgu"] },
  "cabala-coach":               { grad: "linear-gradient(135deg,#332508 0%,#4F3A12 100%)", accent: "#CBB78B", icon: "❂", certs: ["idc", "cel", "fgu"] },
}

const DEFAULT_META = META["life-coaching-integrativo"]

export default async function ProgramaPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const course = await db.course.findUnique({ where: { slug } })
  if (!course) notFound()

  const isEn = locale === "en"
  const title = (isEn && course.titleEn) || course.title
  const shortDesc = (isEn && course.shortDescEn) || course.shortDesc
  const description = (isEn && course.descriptionEn) || course.description

  const meta = META[slug] ?? DEFAULT_META
  const content = getProgramContent(slug, course.content)
  const embedUrl = getYouTubeEmbedUrl(course.videoUrl)
  const priceLabel = course.isFree ? (isEn ? "Free" : "Gratis") : formatPrice(course.price, course.currency)

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: title,
    description: shortDesc,
    provider: {
      "@type": "EducationalOrganization",
      name: "Jewgal Academy",
      sameAs: "https://jewgal-academy.vercel.app",
    },
    ...(course.isFree
      ? {}
      : {
          offers: {
            "@type": "Offer",
            price: course.price,
            priceCurrency: course.currency,
            availability: "https://schema.org/InStock",
          },
        }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
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

          <div className="prog-hero-grid">
            <div>
              <span className="eyebrow" style={{ display: "block", marginBottom: 16, color: meta.accent }}>{content.eyebrow}</span>
              <div style={{ fontSize: 52, color: meta.accent, lineHeight: 1, marginBottom: 12, fontFamily: "var(--serif)" }}>
                {meta.icon}
              </div>
              <h1 style={{
                fontFamily: "var(--serif)", fontWeight: 500,
                fontSize: "clamp(36px,5.5vw,68px)", color: "var(--text)",
                lineHeight: 1.02, letterSpacing: "-.01em",
              }}>
                {title}
              </h1>
              <p style={{ color: "var(--on-dark)", fontSize: 17, maxWidth: 580, marginTop: 18, lineHeight: 1.65 }}>
                {shortDesc}
              </p>
            </div>

            {/* Precio badge */}
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{
                fontFamily: "var(--serif)", fontWeight: 500,
                fontSize: "clamp(36px,4vw,56px)", color: course.isFree ? "#C49F72" : meta.accent,
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
              { label: content.duration, icon: "⏱" },
              { label: content.modality, icon: "🎓" },
              { label: content.level,    icon: "◈" },
            ].filter((c) => c.label).map((c) => (
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

          {/* Certificado por */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--on-dark-faint)" }}>Certificado por</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {meta.certs.map((certSlug) => (
                <span key={certSlug} style={{ background: "#f7f3ec", borderRadius: 5, padding: "5px 10px", display: "flex", alignItems: "center" }}>
                  <img src={`/brand/certs/${certSlug}.webp`} alt={certSlug.toUpperCase()} style={{ height: 16, width: "auto", objectFit: "contain", display: "block" }} loading="lazy" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTENIDO + CHECKOUT ── */}
      <section style={{ background: "var(--navy)" }}>
        <div className="wrap prog-main-wrap">
          <div className="prog-main-grid">

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
                  {description}
                </p>
              </div>

              {/* Video del programa */}
              {embedUrl && (
                <div className="reveal" style={{ marginBottom: 60 }}>
                  <div style={{
                    position: "relative", width: "100%", aspectRatio: "16 / 9",
                    borderRadius: 10, overflow: "hidden",
                    border: "1px solid var(--line-d)",
                    boxShadow: "0 20px 50px -20px rgba(0,0,0,.4)",
                  }}>
                    <iframe
                      src={embedUrl}
                      title={`Video — ${title}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                    />
                  </div>
                </div>
              )}

              {/* Módulos */}
              {content.modules.length > 0 && (
              <div className="reveal" style={{ marginBottom: 60 }}>
                <h2 style={{
                  fontFamily: "var(--serif)", fontWeight: 500,
                  fontSize: "clamp(22px,2.8vw,34px)", color: "var(--text)",
                  marginBottom: 28,
                }}>
                  Contenido del programa
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {content.modules.map((mod, i) => (
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
              )}

              {/* Qué incluye */}
              {content.includes.length > 0 && (
              <div className="reveal" style={{ marginBottom: 60 }}>
                <h2 style={{
                  fontFamily: "var(--serif)", fontWeight: 500,
                  fontSize: "clamp(22px,2.8vw,34px)", color: "var(--text)",
                  marginBottom: 24,
                }}>
                  Qué incluye
                </h2>
                <div className="prog-includes-grid">
                  {content.includes.map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--on-dark)" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={meta.accent} strokeWidth="2">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              )}

              {/* Para quién */}
              {content.forWhom.length > 0 && (
              <div className="reveal" style={{ marginBottom: 60 }}>
                <h2 style={{
                  fontFamily: "var(--serif)", fontWeight: 500,
                  fontSize: "clamp(22px,2.8vw,34px)", color: "var(--text)",
                  marginBottom: 24,
                }}>
                  ¿Para quién es este programa?
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {content.forWhom.map((fw) => (
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
              )}

              {/* Lo que lograrás */}
              {content.outcome && (
              <div className="reveal" style={{
                background: `linear-gradient(135deg,${meta.accent}12,transparent)`,
                border: `1px solid ${meta.accent}30`,
                borderRadius: 8, padding: 28,
              }}>
                <div style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: meta.accent, marginBottom: 12 }}>
                  Al finalizar
                </div>
                <p style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--text)", lineHeight: 1.6 }}>
                  {content.outcome}
                </p>
              </div>
              )}

              {/* Sitio hermano para adolescentes y familias */}
              {slug === "metodo-sholem" && (
                <div className="reveal" style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 8, padding: 24,
                  display: "flex", flexDirection: "column", gap: 8,
                }}>
                  <div style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: meta.accent }}>
                    ¿Eres adolescente o familia?
                  </div>
                  <p style={{ fontSize: 14.5, color: "var(--on-dark)", lineHeight: 1.65 }}>
                    Esta formación certifica instructores. Si buscas la experiencia del Método Sholem para adolescentes, visita el sitio dedicado.
                  </p>
                  <a href="https://www.sholemethod.com" target="_blank" rel="noopener noreferrer" style={{ color: meta.accent, fontSize: 14.5, fontWeight: 600 }}>
                    www.sholemethod.com →
                  </a>
                </div>
              )}
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
                      {title}
                    </span>
                    <span style={{ fontFamily: "var(--serif)", fontSize: 28, color: course.isFree ? "#C49F72" : meta.accent }}>
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
                      title,
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
