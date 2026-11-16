import { DEFAULT_HOME_SECTIONS, DEFAULT_MENU, mergeHomeSections, mergeMenu, type HomeSection, type SiteMenu } from "./site-menu"

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
  /** Imágenes grandes de las páginas públicas (se cambian desde el panel; si se borra una vuelve la de siempre). */
  images: SiteImages
  /** Menú de arriba y enlaces del pie de página (se arma en Portada y contacto → Menú y pie de página). */
  menu: SiteMenu
  /** Orden y visibilidad de las secciones del inicio. */
  homeSections: HomeSection[]
}

export type SiteImages = {
  academiaGroup: string   // foto de la comunidad en el encabezado de Academia
  academiaBanner: string  // fondo de la franja final de Academia
  homeKids: string        // imagen de la banda destacada «Método Sholem» en Inicio
  devoraHero: string      // retrato en «Conoce a Devora»
  blogHero: string        // fondo del encabezado del Blog
  eventosHero: string     // fondo del encabezado de Eventos
  contactoHero: string    // fondo del encabezado de Contacto
}

export const IMAGE_FIELDS: { key: keyof SiteImages; label: string; hint: string; aspect: string }[] = [
  { key: "academiaGroup", label: "Academia · foto del encabezado", hint: "Se ve a la derecha del título (solo en pantallas grandes). Mejor horizontal, mínimo 1200 px.", aspect: "4/3" },
  { key: "academiaBanner", label: "Academia · fondo de la franja final", hint: "Imagen de fondo detrás del llamado a la acción.", aspect: "16/9" },
  { key: "homeKids", label: "Inicio · banda «Método Sholem»", hint: "La foto de la banda destacada de Método Sholem.", aspect: "3/2" },
  { key: "devoraHero", label: "Conoce a Devora · retrato principal", hint: "Foto cuadrada o vertical con el rostro en el tercio superior.", aspect: "1/1" },
  { key: "blogHero", label: "Blog · fondo del encabezado", hint: "Se ve a la derecha, con degradado. Horizontal, mínimo 1400 px.", aspect: "16/9" },
  { key: "eventosHero", label: "Eventos · fondo del encabezado", hint: "Se ve a la derecha, con degradado. Horizontal, mínimo 1400 px.", aspect: "16/9" },
  { key: "contactoHero", label: "Contacto · fondo del encabezado", hint: "Se ve a la derecha, con degradado. Horizontal, mínimo 1400 px.", aspect: "16/9" },
]

export const DEFAULT_SITE_IMAGES: SiteImages = {
  academiaGroup: "/brand/devora-grupo.webp",
  academiaBanner: "/brand/hero/devora-ninos.webp",
  homeKids: "/brand/hero/devora-ninos.webp",
  devoraHero: "/brand/devora-hero.webp",
  blogHero: "/brand/pages/hero-blog.webp",
  eventosHero: "/brand/pages/hero-eventos.webp",
  contactoHero: "/brand/pages/hero-contacto.webp",
}

/** Una imagen vacía o inválida no pisa la de siempre. */
export function mergeImages(base: SiteImages, partial: Partial<SiteImages> | null | undefined): SiteImages {
  const out = { ...base }
  for (const k of Object.keys(base) as (keyof SiteImages)[]) {
    const v = partial?.[k]
    if (typeof v === "string" && v.trim() && (v.startsWith("/") || /^https:\/\//.test(v))) out[k] = v.trim()
  }
  return out
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
      "Hola {nombre},\n\n¡Bienvenido/a a Jewgal Academy! Tu inscripción en {curso} está confirmada.\n\nEstos son tus datos de acceso al aula virtual:\n\nUsuario: {email}\nContraseña temporal: {password}\n\nEntra en https://jewgalacademy.com/login y cambia tu contraseña desde \"Mi perfil\" cuando quieras.\n\nNos vemos dentro,\nDevora Benchimol · Jewgal Academy",
  },
  images: DEFAULT_SITE_IMAGES,
  menu: DEFAULT_MENU,
  homeSections: DEFAULT_HOME_SECTIONS,
}

// `base` permite encadenar el fallback: el override en inglés (parcial, campo
// por campo) se completa con el contenido real vigente en español —no con
// los defaults hardcodeados— para que un texto todavía no traducido nunca
// se vea vacío ni desactualizado.
export function mergeSiteContent(
  partial: Partial<SiteContent> | null | undefined,
  base: SiteContent = DEFAULT_SITE_CONTENT,
  /** `overlay`: se está sobreponiendo la versión en inglés a la de español; el menú y el orden del inicio son compartidos y salen siempre de la base. */
  opts: { overlay?: boolean } = {}
): SiteContent {
  if (!partial) return base
  return {
    hero: { ...base.hero, ...partial.hero },
    stats: partial.stats?.length === base.stats.length ? partial.stats : base.stats,
    fundacionStat: { ...base.fundacionStat, ...partial.fundacionStat },
    fundadora: { ...base.fundadora, ...partial.fundadora },
    contacto: { ...base.contacto, ...partial.contacto },
    footer: { ...base.footer, ...partial.footer },
    pages: {
      academia: { ...base.pages.academia, ...partial.pages?.academia },
      certificaciones: { ...base.pages.certificaciones, ...partial.pages?.certificaciones },
      eventos: { ...base.pages.eventos, ...partial.pages?.eventos },
      blog: { ...base.pages.blog, ...partial.pages?.blog },
      contacto: { ...base.pages.contacto, ...partial.pages?.contacto },
    },
    emails: { ...base.emails, ...partial.emails },
    images: mergeImages(base.images, partial.images),
    menu: opts.overlay ? base.menu : mergeMenu(base.menu, partial.menu),
    homeSections: opts.overlay ? base.homeSections : mergeHomeSections(base.homeSections, partial.homeSections),
  }
}
