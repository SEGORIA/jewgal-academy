/**
 * Dominio público canónico del sitio — ÚNICA fuente de verdad.
 *
 * Lo usan el canonical, Open Graph, sitemap, robots, JSON-LD y los enlaces
 * de los correos. Antes cada archivo tenía su propia copia hardcodeada y al
 * migrar a jewgalacademy.com quedaron todas apuntando al dominio viejo de
 * Vercel (Google indexaba el dominio equivocado y Stripe devolvía al cliente
 * fuera del sitio). Para cambiar de dominio, tocar sólo NEXT_PUBLIC_APP_URL.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || "https://jewgalacademy.com"
).replace(/\/+$/, "")
