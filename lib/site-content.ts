export type SiteContent = {
  hero: { headline1: string; headline2: string; subtext: string; cta1: string; cta2: string }
  stats: { n: string; l: string }[]
  fundadora: { name: string; sig: string; p1: string; p2: string }
  contacto: { email: string; phone: string; city: string; ig: string; fb: string; yt: string }
  footer: { tagline: string; copyright: string }
}

// Refleja el copy real vigente en el sitio — sirve de fallback si no hay override guardado en la DB.
export const DEFAULT_SITE_CONTENT: SiteContent = {
  hero: {
    headline1: "Sabiduría para vivir.",
    headline2: "Liderazgo para transformar.",
    subtext: "Programas, certificaciones y experiencias diseñadas para desarrollar resiliencia, bienestar emocional y crecimiento espiritual. Únete a una comunidad global de aprendizaje con propósito.",
    cta1: "Explorar programas →",
    cta2: "Conocer a Devora",
  },
  stats: [
    { n: "40+", l: "Años de trayectoria" },
    { n: "5", l: "Países: Argentina, Israel, Guatemala, Colombia, EE.UU." },
    { n: "5", l: "Programas y certificaciones" },
  ],
  fundadora: {
    name: "Devora Benchimol",
    sig: "Master Coach Internacional · Educadora",
    p1: "Más de 40 años facilitando procesos de transformación que integran mente, cuerpo y alma, con trayectoria internacional en Argentina, Israel, Guatemala, Colombia y Estados Unidos.",
    p2: "Su método une Logoterapia y sentido de vida, Mindfulness y regulación del trauma, la sabiduría de la Cábala aplicada al coaching, y retiros de bienestar profundo.",
  },
  contacto: {
    email: "Hola@devorabenchimol.com",
    phone: "+1 (786) 483-5893",
    city: "Miami, Florida · EE.UU.",
    ig: "https://instagram.com/devora_benchimol_",
    fb: "",
    yt: "",
  },
  footer: {
    tagline: "Transformación consciente para una vida con propósito.",
    copyright: "Jewgal Academy · Fundación Sholem Corazón Valiente Non-Profit Organization. Todos los derechos reservados.",
  },
}

export function mergeSiteContent(partial: Partial<SiteContent> | null | undefined): SiteContent {
  if (!partial) return DEFAULT_SITE_CONTENT
  return {
    hero: { ...DEFAULT_SITE_CONTENT.hero, ...partial.hero },
    stats: partial.stats?.length === DEFAULT_SITE_CONTENT.stats.length ? partial.stats : DEFAULT_SITE_CONTENT.stats,
    fundadora: { ...DEFAULT_SITE_CONTENT.fundadora, ...partial.fundadora },
    contacto: { ...DEFAULT_SITE_CONTENT.contacto, ...partial.contacto },
    footer: { ...DEFAULT_SITE_CONTENT.footer, ...partial.footer },
  }
}
