export type SiteContent = {
  hero: { headline1: string; headline2: string; subtext: string; cta1: string; cta2: string }
  stats: { n: string; l: string }[]
  fundacionStat: { bigText: string; label1: string; label2: string; buttonText: string; buttonUrl: string }
  fundadora: { name: string; sig: string; p1: string; p2: string }
  contacto: { email: string; phone: string; city: string; ig: string; fb: string; yt: string }
  footer: { tagline: string; copyright: string }
  pages: {
    academia: { eyebrow: string; title: string; subtext: string }
    certificaciones: { eyebrow: string; title: string; subtext: string }
    eventos: { eyebrow: string; title1: string; title2: string; subtext: string }
    blog: { eyebrow: string; title1: string; title2: string; subtext: string }
    contacto: { eyebrow: string; title1: string; title2: string; subtext: string }
  }
  emails: { welcomeSubject: string; welcomeBody: string }
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
  fundacionStat: {
    bigText: "Non-Profit Organization",
    label1: "Fundación Sholem",
    label2: "Corazón Valiente",
    buttonText: "Conocé la fundación →",
    buttonUrl: "https://sholemcorazonvaliente.org/",
  },
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
  pages: {
    academia: {
      eyebrow: "Jewgal Academy",
      title: "La Academia",
      subtext: "Programas, certificaciones y formaciones que integran coaching, logoterapia y sabiduría ancestral. Más de 40 años de experiencia al servicio de tu transformación.",
    },
    certificaciones: {
      eyebrow: "Jewgal Academy",
      title: "Certificaciones",
      subtext: "Cada programa culmina con una certificación reconocida. Conviértete en un profesional acreditado del coaching, el bienestar y el liderazgo consciente.",
    },
    eventos: {
      eyebrow: "Agenda",
      title1: "Próximos",
      title2: "Eventos",
      subtext: "Retiros, masterclasses y talleres intensivos diseñados para acelerar tu transformación. Presenciales y en línea.",
    },
    blog: {
      eyebrow: "Jewgal Academy",
      title1: "Blog &",
      title2: "Recursos",
      subtext: "Artículos, reflexiones y herramientas sobre coaching, Cabalá, bienestar y liderazgo consciente.",
    },
    contacto: {
      eyebrow: "Escríbeme",
      title1: "Estoy aquí",
      title2: "para ti.",
      subtext: "¿Tienes preguntas sobre los programas, quieres comenzar tu proceso de coaching o simplemente deseas conocer más? Escríbeme con confianza.",
    },
  },
  // Placeholders disponibles: {nombre}, {curso}, {email}, {password}
  emails: {
    welcomeSubject: "¡Bienvenido/a a Jewgal Academy! Tu acceso al aula",
    welcomeBody:
      "Hola {nombre},\n\n¡Bienvenido/a a Jewgal Academy! Tu inscripción en {curso} está confirmada.\n\nEstos son tus datos de acceso al aula virtual:\n\nUsuario: {email}\nContraseña temporal: {password}\n\nEntra en https://jewgal-academy.vercel.app/login y cambia tu contraseña desde \"Mi perfil\" cuando quieras.\n\nNos vemos dentro,\nDevora Benchimol · Jewgal Academy",
  },
}

export function mergeSiteContent(partial: Partial<SiteContent> | null | undefined): SiteContent {
  if (!partial) return DEFAULT_SITE_CONTENT
  return {
    hero: { ...DEFAULT_SITE_CONTENT.hero, ...partial.hero },
    stats: partial.stats?.length === DEFAULT_SITE_CONTENT.stats.length ? partial.stats : DEFAULT_SITE_CONTENT.stats,
    fundacionStat: { ...DEFAULT_SITE_CONTENT.fundacionStat, ...partial.fundacionStat },
    fundadora: { ...DEFAULT_SITE_CONTENT.fundadora, ...partial.fundadora },
    contacto: { ...DEFAULT_SITE_CONTENT.contacto, ...partial.contacto },
    footer: { ...DEFAULT_SITE_CONTENT.footer, ...partial.footer },
    pages: {
      academia: { ...DEFAULT_SITE_CONTENT.pages.academia, ...partial.pages?.academia },
      certificaciones: { ...DEFAULT_SITE_CONTENT.pages.certificaciones, ...partial.pages?.certificaciones },
      eventos: { ...DEFAULT_SITE_CONTENT.pages.eventos, ...partial.pages?.eventos },
      blog: { ...DEFAULT_SITE_CONTENT.pages.blog, ...partial.pages?.blog },
      contacto: { ...DEFAULT_SITE_CONTENT.pages.contacto, ...partial.pages?.contacto },
    },
    emails: { ...DEFAULT_SITE_CONTENT.emails, ...partial.emails },
  }
}
