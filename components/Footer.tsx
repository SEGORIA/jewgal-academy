"use client"

import { useEffect, useState } from "react"
import { Link } from "@/i18n/navigation"
import NextLink from "next/link"
import BrandLogo from "@/components/BrandLogo"
import { useTranslations } from "next-intl"
import { DEFAULT_SITE_CONTENT, type SiteContent } from "@/lib/site-content"

export default function Footer() {
  const t = useTranslations("Footer")
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT)
  const [nlEmail, setNlEmail] = useState("")
  const [nlStatus, setNlStatus] = useState<"idle" | "sending" | "ok" | "error">("idle")

  useEffect(() => {
    fetch("/api/site-content")
      .then((r) => r.json())
      .then((d) => setContent(d))
      .catch(() => {})
  }, [])

  async function subscribe() {
    if (!nlEmail.includes("@") || nlStatus === "sending") {
      if (!nlEmail.includes("@")) setNlStatus("error")
      return
    }
    setNlStatus("sending")
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: nlEmail }),
      })
      if (!res.ok) throw new Error()
      setNlStatus("ok")
      setNlEmail("")
    } catch {
      setNlStatus("error")
    }
  }

  return (
    <footer className="jfoot">
      <div className="wrap">

        <div className="foot-grid">
          {/* Brand */}
          <div className="foot-brand">
            <BrandLogo height={84} variant="square" />
            <p>{content.footer.tagline}</p>
            <div className="foot-social">
              {content.contacto.ig && (
                <a href={content.contacto.ig} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
                  </svg>
                </a>
              )}
              {content.contacto.yt && (
                <a href={content.contacto.yt} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none"/>
                  </svg>
                </a>
              )}
              {content.contacto.fb && (
                <a href={content.contacto.fb} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <path d="M14 8h3V4h-3a4 4 0 00-4 4v2H7v4h3v6h4v-6h3l1-4h-4V8a1 1 0 011-1z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Academia */}
          <div className="foot-col">
            <h5>{t("academiaTitulo")}</h5>
            <Link href="/academia">{t("todosProgramas")}</Link>
            <Link href="/certificaciones">{t("certificaciones")}</Link>
            <Link href="/conoce-a-devora">{t("sobreDevora")}</Link>
            <Link href="/eventos">{t("eventosRetiros")}</Link>
          </div>

          {/* Programas */}
          <div className="foot-col">
            <h5>{t("programasTitulo")}</h5>
            <Link href="/programas/life-coaching-integrativo">{t("programLifeCoaching")}</Link>
            <Link href="/programas/joogal-adultos">{t("programJewgalAdultos")}</Link>
            <Link href="/programas/cabala-coach">{t("programCabalaCoach")}</Link>
            <Link href="/programas/metodo-sholem">{t("programMetodoSholem")}</Link>
          </div>

          {/* Recursos */}
          <div className="foot-col">
            <h5>{t("recursosTitulo")}</h5>
            <Link href="/blog">Blog</Link>
            <NextLink href="/aula">{t("bibliotecaVirtual")}</NextLink>
            <Link href="/#testimonios">{t("testimonios")}</Link>
            <Link href="/contacto">{t("contacto")}</Link>
          </div>

          {/* Newsletter */}
          <div className="foot-col news">
            <h5>{t("comunidadTitulo")}</h5>
            <p>{t("comunidadTexto")}</p>
            <div className="row">
              <input
                type="email"
                placeholder={t("emailPlaceholder")}
                aria-label={t("emailLabel")}
                value={nlEmail}
                onChange={(e) => { setNlEmail(e.target.value); if (nlStatus !== "idle") setNlStatus("idle") }}
                onKeyDown={(e) => { if (e.key === "Enter") subscribe() }}
                disabled={nlStatus === "sending"}
              />
              <button type="button" aria-label={t("suscribirse")} onClick={subscribe} disabled={nlStatus === "sending"}>
                {nlStatus === "sending" ? "…" : "→"}
              </button>
            </div>
            {nlStatus === "ok" && (
              <p role="status" style={{ color: "var(--gold-light)", fontSize: 12, marginTop: 8 }}>
                {t("suscritoOk")}
              </p>
            )}
            {nlStatus === "error" && (
              <p role="alert" style={{ color: "#E8A1A1", fontSize: 12, marginTop: 8 }}>
                {t("suscritoError")}
              </p>
            )}
          </div>
        </div>

        <div className="foot-bottom">
          <small>© {new Date().getFullYear()} {content.footer.copyright}</small>
          <div style={{ display: "flex", gap: 20 }}>
            <Link href="/politica-privacidad" style={{ color: "var(--on-dark-faint)", fontSize: 12, textDecoration: "none" }}>{t("privacidad")}</Link>
            <Link href="/terminos" style={{ color: "var(--on-dark-faint)", fontSize: 12, textDecoration: "none" }}>{t("terminos")}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
