import { Link } from "@/i18n/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { getLegal } from "@/lib/legal"
import type { LegalDoc } from "@/lib/legal-defaults"

/** Rótulos fijos de la página (los textos del documento, en cambio, se editan desde el panel). */
const LABELS = {
  es: { legal: "Legal", terminos: "Términos de uso →", privacidad: "Política de privacidad →", home: "Volver al inicio" },
  en: { legal: "Legal", terminos: "Terms of use →", privacidad: "Privacy policy →", home: "Back to home" },
} as const

const linkStyle: React.CSSProperties = { fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--on-dark)", textDecoration: "none" }

/** Página legal (Términos o Privacidad): el contenido sale de lo editado en “Páginas legales”, o del texto original. */
export default async function LegalPage({ doc, locale }: { doc: LegalDoc; locale: string }) {
  const c = await getLegal(doc, locale)
  const l = LABELS[locale === "en" ? "en" : "es"]
  const other: LegalDoc = doc === "terminos" ? "privacidad" : "terminos"

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section style={{
        background: "linear-gradient(120deg,var(--navy-2) 0%,var(--navy) 60%,#2A1D12 100%)",
        paddingTop: 140, paddingBottom: 72,
        borderBottom: "1px solid var(--line-d)",
      }}>
        <div className="wrap">
          <span style={{ fontSize: 10, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--gold-ink)", display: "block", marginBottom: 18 }}>
            {l.legal}
          </span>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(32px,5vw,60px)", color: "var(--text)", lineHeight: 1.05, letterSpacing: "-.01em", marginBottom: 16 }}>
            {c.title1}<br /><em style={{ fontStyle: "normal", color: "var(--gold-em)" }}>{c.title2}</em>
          </h1>
          <p style={{ color: "var(--on-dark)", fontSize: 14, lineHeight: 1.7 }}>{c.updated}</p>
        </div>
      </section>

      {/* Contenido */}
      <section style={{ background: "var(--navy)" }}>
        <div className="wrap" style={{ padding: "72px 36px", maxWidth: 760 }}>
          <p style={{ color: "var(--on-dark)", fontSize: 16, lineHeight: 1.8, marginBottom: 52 }}>{c.intro}</p>

          {c.sections.map((s, i) => (
            <div key={`${i}-${s.title}`} style={{ marginBottom: 44, paddingBottom: 44, borderBottom: "1px solid var(--line-d)" }}>
              <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(18px,2vw,24px)", color: "var(--text)", marginBottom: 16, lineHeight: 1.2 }}>
                {s.title}
              </h2>
              {s.content.split(/\n\s*\n/).map((p, j) => (
                <p key={j} style={{ color: "var(--on-dark)", fontSize: 15, lineHeight: 1.8, marginBottom: 12, whiteSpace: "pre-line" }}>
                  {p}
                </p>
              ))}
            </div>
          ))}

          {/* Contacto */}
          <div style={{ background: "var(--navy-2)", border: "1px solid var(--line-d)", borderRadius: 10, padding: "28px 32px", marginTop: 8 }}>
            <p style={{ color: "var(--on-dark)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>{c.questions}</p>
            <a href={`mailto:${c.email}`} style={{ color: "var(--gold-ink)", fontSize: 14, textDecoration: "none" }}>
              {c.email}
            </a>
          </div>

          <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid var(--line-d)", display: "flex", gap: 20, flexWrap: "wrap" }}>
            <Link href={other === "terminos" ? "/terminos" : "/politica-privacidad"} style={linkStyle}>{l[other]}</Link>
            <Link href="/" style={linkStyle}>{l.home}</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
