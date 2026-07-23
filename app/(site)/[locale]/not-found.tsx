import { getLocale } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

const COPY = {
  es: {
    eyebrow: "Página no encontrada",
    title: "Te perdiste",
    titleEm: "en el camino",
    body: "Eso también pasa, y es parte del proceso. La página que buscas no existe o fue movida.",
    home: "Volver al inicio →",
    programs: "Ver programas",
    links: [
      { href: "/blog" as const, label: "Blog" },
      { href: "/eventos" as const, label: "Eventos" },
      { href: "/contacto" as const, label: "Contacto" },
      { href: "/conoce-a-devora" as const, label: "Sobre Devora" },
    ],
  },
  en: {
    eyebrow: "Page not found",
    title: "You got lost",
    titleEm: "along the way",
    body: "That happens too, and it's part of the process. The page you're looking for doesn't exist or was moved.",
    home: "Back to home →",
    programs: "View programs",
    links: [
      { href: "/blog" as const, label: "Blog" },
      { href: "/eventos" as const, label: "Events" },
      { href: "/contacto" as const, label: "Contact" },
      { href: "/conoce-a-devora" as const, label: "About Devora" },
    ],
  },
} as const

export default async function NotFound() {
  const locale = await getLocale()
  const t = COPY[locale as keyof typeof COPY] ?? COPY.es

  return (
    <>
      <Navbar />

      <section style={{
        background: "linear-gradient(160deg,var(--navy-2) 0%,var(--navy) 50%,#2A1D12 100%)",
        minHeight: "100svh",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>
        {/* Fondo decorativo */}
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(165,141,102,.06),transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(167,109,97,.05),transparent 70%)", pointerEvents: "none" }} />

        <div style={{ textAlign: "center", padding: "120px 24px 80px", position: "relative", zIndex: 2 }}>
          {/* Número 404 como marca de fondo */}
          <div style={{
            fontFamily: "var(--serif)", fontWeight: 500,
            fontSize: "clamp(120px,20vw,240px)",
            color: "rgba(196,159,114,.06)",
            lineHeight: 1, userSelect: "none",
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%,-52%)",
            whiteSpace: "nowrap", pointerEvents: "none",
          }}>
            404
          </div>

          {/* Contenido principal */}
          <span style={{ fontSize: 10, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: 20 }}>
            {t.eyebrow}
          </span>
          <h1 style={{
            fontFamily: "var(--serif)", fontWeight: 500,
            fontSize: "clamp(36px,6vw,72px)",
            color: "var(--text)", lineHeight: 1.05,
            letterSpacing: "-.01em", marginBottom: 20,
          }}>
            {t.title}<br /><em style={{ fontStyle: "normal", color: "var(--gold-light)" }}>{t.titleEm}</em>
          </h1>
          <p style={{ color: "var(--on-dark)", fontSize: "clamp(14px,1.6vw,17px)", lineHeight: 1.7, maxWidth: 420, margin: "0 auto 40px" }}>
            {t.body}
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/" className="btn solid">{t.home}</Link>
            <Link href="/academia" className="btn">{t.programs}</Link>
          </div>

          {/* Links rápidos */}
          <div style={{ marginTop: 52, display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
            {t.links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="not-found-link"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
