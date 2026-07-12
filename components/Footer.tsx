"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import BrandLogo from "@/components/BrandLogo"
import { DEFAULT_SITE_CONTENT, type SiteContent } from "@/lib/site-content"

export default function Footer() {
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT)

  useEffect(() => {
    fetch("/api/site-content")
      .then((r) => r.json())
      .then((d) => setContent(d))
      .catch(() => {})
  }, [])

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
            <h5>Academia</h5>
            <Link href="/academia">Todos los programas</Link>
            <Link href="/certificaciones">Certificaciones</Link>
            <Link href="/conoce-a-devora">Sobre Devora</Link>
            <Link href="/eventos">Eventos y Retiros</Link>
          </div>

          {/* Programas */}
          <div className="foot-col">
            <h5>Programas</h5>
            <Link href="/programas/life-coaching-integrativo">Life Coaching</Link>
            <Link href="/programas/joogal-adultos">Jewgal Adultos</Link>
            <Link href="/programas/cabala-coach">Cábala Coach</Link>
            <Link href="/programas/metodo-sholem">Método Sholem</Link>
          </div>

          {/* Recursos */}
          <div className="foot-col">
            <h5>Recursos</h5>
            <Link href="/blog">Blog</Link>
            <Link href="/aula">Biblioteca Virtual</Link>
            <Link href="/#testimonios">Testimonios</Link>
            <Link href="/contacto">Contacto</Link>
          </div>

          {/* Newsletter */}
          <div className="foot-col news">
            <h5>Únete a la comunidad</h5>
            <p>Contenido exclusivo y novedades de Jewgal Academy.</p>
            <div className="row">
              <input type="email" placeholder="Tu correo electrónico" aria-label="Correo electrónico" />
              <button type="button" aria-label="Suscribirse">→</button>
            </div>
          </div>
        </div>

        <div className="foot-bottom">
          <small>© {new Date().getFullYear()} {content.footer.copyright}</small>
          <div style={{ display: "flex", gap: 20 }}>
            <Link href="/politica-privacidad" style={{ color: "var(--on-dark-faint)", fontSize: 12, textDecoration: "none" }}>Privacidad</Link>
            <Link href="/terminos" style={{ color: "var(--on-dark-faint)", fontSize: 12, textDecoration: "none" }}>Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
