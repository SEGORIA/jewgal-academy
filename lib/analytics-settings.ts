// Ajustes de analítica y verificación (sin dependencias del servidor: los usan el panel, el layout y la API).

/** Analítica y verificación de propiedad. Todo vacío = no se carga ningún script de terceros. */
export type AnalyticsSettings = {
  ga4: string // Google Analytics 4 (G-XXXXXXX)
  gtm: string // Google Tag Manager (GTM-XXXXXX); si está, GA4 se gestiona desde ahí
  metaPixel: string // Píxel de Meta (solo dígitos)
  googleVerification: string // contenido de la etiqueta google-site-verification
  bingVerification: string // contenido de la etiqueta msvalidate.01
  /** No cargar scripts de seguimiento a quien tiene activado «No rastrear» en su navegador. */
  respectDnt: boolean
}

/** Formatos válidos (los IDs se incrustan en scripts: se validan estrictamente). */
export const ANALYTICS_PATTERNS = {
  ga4: /^G-[A-Z0-9]{4,15}$/,
  gtm: /^GTM-[A-Z0-9]{4,10}$/,
  metaPixel: /^\d{8,20}$/,
  googleVerification: /^[A-Za-z0-9_-]{10,120}$/,
  bingVerification: /^[A-Fa-f0-9]{32}$/,
} as const

export const DEFAULT_ANALYTICS: AnalyticsSettings = { ga4: "", gtm: "", metaPixel: "", googleVerification: "", bingVerification: "", respectDnt: true }

export function mergeAnalytics(raw: unknown): AnalyticsSettings {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<Record<keyof AnalyticsSettings, unknown>>
  const pick = (k: keyof typeof ANALYTICS_PATTERNS) => (typeof r[k] === "string" && ANALYTICS_PATTERNS[k].test((r[k] as string).trim()) ? (r[k] as string).trim() : "")
  return {
    ga4: pick("ga4"), gtm: pick("gtm"), metaPixel: pick("metaPixel"), googleVerification: pick("googleVerification"), bingVerification: pick("bingVerification"),
    respectDnt: r.respectDnt !== false,
  }
}
