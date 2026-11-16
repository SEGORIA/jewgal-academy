// Contenido editable de la página de cada programa (course.content, JSON en DB).
// Lo puramente visual (icono, gradiente, color de acento, logos de certificación)
// sigue en app/programas/[slug]/page.tsx — no se expone en el admin.

export type ProgramModule = { title: string; items: string[] }

/** Los textos de la ficha del programa: existen en español y, opcionalmente, en inglés. */
export type ProgramText = {
  eyebrow: string
  duration: string
  modality: string
  level: string
  includes: string[]
  modules: ProgramModule[]
  forWhom: string[]
  outcome: string
  /** Título y descripción para Google y redes (vacío = se arman con el nombre y la descripción corta del programa). */
  seoTitle?: string
  seoDescription?: string
  /** Requisitos para obtener la certificación (se muestran en la página Certificaciones). */
  certRequirements?: string[]
}

export type ProgramContent = ProgramText & {
  /** Marca del programa: color de acento (#RRGGBB) e ícono corto. Vacío = los de su slug o los de la marca. */
  accent?: string
  icon?: string
  /** Versión en inglés: lo que falte se muestra en español. */
  en?: Partial<ProgramText>
}

export const EMPTY_PROGRAM_CONTENT: ProgramContent = {
  eyebrow: "",
  duration: "",
  modality: "",
  level: "",
  includes: [],
  modules: [],
  forWhom: [],
  outcome: "",
}

/* ── Identidad visual por programa ── */
export type ProgramBrand = { grad: string; accent: string; icon: string }

const BRAND_BY_SLUG: Record<string, ProgramBrand> = {
  "life-coaching-integrativo": { grad: "linear-gradient(135deg,#3A2410 0%,#5C3A1E 100%)", accent: "#A58D66", icon: "⟡" },
  "joogal-adultos":            { grad: "linear-gradient(135deg,#3A2818 0%,#5C4026 100%)", accent: "#C49F72", icon: "✦" },
  "joogalkids":                { grad: "linear-gradient(135deg,#4A2418 0%,#6B3826 100%)", accent: "#A76D61", icon: "★" },
  "metodo-sholem":             { grad: "linear-gradient(135deg,#42200F 0%,#653322 100%)", accent: "#A76D61", icon: "◈" },
  "cabala-coach":              { grad: "linear-gradient(135deg,#332508 0%,#4F3A12 100%)", accent: "#CBB78B", icon: "❂" },
}
export const DEFAULT_BRAND: ProgramBrand = BRAND_BY_SLUG["life-coaching-integrativo"]
export const BRAND_ICONS = ["⟡", "✦", "★", "◈", "❂", "❖", "✧", "✺", "☼", "❀"]

const HEX = /^#[0-9a-fA-F]{6}$/

/** Mezcla un color con el marrón de la marca para armar el fondo oscuro del programa. */
function gradFromAccent(accent: string): string {
  const n = parseInt(accent.slice(1), 16)
  const mix = (c: number, base: number) => Math.round(base + (c - base) * 0.18).toString(16).padStart(2, "0")
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  const dark1 = `#${mix(r, 0x2e)}${mix(g, 0x1c)}${mix(b, 0x0e)}`
  const dark2 = `#${mix(r, 0x4a)}${mix(g, 0x30)}${mix(b, 0x1a)}`
  return `linear-gradient(135deg,${dark1} 0%,${dark2} 100%)`
}

/** Color, fondo e ícono de un programa: lo definido en el panel manda; si no, los del slug; si no, los de la marca. */
export function getProgramBrand(slug: string, content?: Pick<ProgramContent, "accent" | "icon"> | null): ProgramBrand {
  const base = BRAND_BY_SLUG[slug] ?? DEFAULT_BRAND
  const accent = content?.accent && HEX.test(content.accent) ? content.accent : base.accent
  const icon = content?.icon?.trim() ? content.icon.trim().slice(0, 4) : base.icon
  const grad = content?.accent && HEX.test(content.accent) ? gradFromAccent(content.accent) : base.grad
  return { grad, accent, icon }
}

// Valores originales (uno por programa existente) — sirven de fallback mientras
// no haya contenido guardado en la DB para ese curso.
export const DEFAULT_PROGRAM_CONTENT: Record<string, ProgramContent> = {
  "life-coaching-integrativo": {
    eyebrow: "Formación Profesional",
    duration: "6 meses",
    modality: "Online · Clases en vivo",
    level: "Principiante a avanzado",
    includes: [
      "Acceso al aula virtual 24/7",
      "Clases en vivo por Zoom",
      "Materiales de estudio descargables",
      "Grabaciones de cada clase",
      "Certificado al completar",
      "Comunidad de alumnos",
      "Supervisión individual",
      "Herramientas prácticas aplicables",
    ],
    modules: [
      { title: "Fundamentos del Coaching", items: ["¿Qué es el coaching?", "Bases de la escucha activa", "El modelo GROW"] },
      { title: "Enfoque Integrativo", items: ["Logoterapia y sentido de vida", "Regulación emocional", "Creencias limitantes"] },
      { title: "Herramientas Prácticas", items: ["Rueda de la vida", "Plan de acción", "Feedback transformador"] },
      { title: "Práctica Profesional", items: ["Ética del coach", "Construcción de tu práctica", "Primeras sesiones reales"] },
    ],
    forWhom: [
      "Personas que desean acompañar a otros en su transformación",
      "Psicólogos, terapeutas y educadores que quieren ampliar sus herramientas",
      "Líderes y managers que buscan desarrollar equipos más conscientes",
      "Emprendedores que quieren integrar el coaching en su propuesta",
    ],
    outcome: "Al completar la formación serás un coach certificado capaz de acompañar procesos de transformación personal y profesional desde una perspectiva integrativa.",
  },
  "joogal-adultos": {
    eyebrow: "Certificación Oficial",
    duration: "3 meses",
    modality: "Online · Híbrido",
    level: "Sin requisitos previos",
    includes: [
      "Acceso al aula virtual 24/7",
      "Clases en vivo por Zoom",
      "Manual oficial Jewgal Adultos",
      "Grabaciones de cada clase",
      "Certificado oficial de instructor",
      "Comunidad de instructores",
      "Mentoring grupal mensual",
      "Kit de materiales descargables",
    ],
    modules: [
      { title: "Bases del Método Jewgal", items: ["Historia y filosofía", "Principios del movimiento consciente", "El cuerpo como herramienta"] },
      { title: "Anatomía y Movimiento", items: ["Anatomía funcional", "Biomecánica segura", "Adaptaciones para adultos"] },
      { title: "Didáctica de Clases", items: ["Estructura de una sesión", "Lenguaje del instructor", "Gestión del grupo"] },
      { title: "Práctica y Certificación", items: ["Clases prácticas supervisadas", "Evaluación teórica", "Presentación final"] },
    ],
    forWhom: [
      "Amantes del movimiento y el bienestar",
      "Profesores de yoga, pilates o danza que quieren ampliar su oferta",
      "Personas que buscan una segunda vocación o fuente de ingresos",
      "Líderes comunitarios que desean implementar bienestar en sus grupos",
    ],
    outcome: "Serás instructor certificado del Método Jewgal Adultos, con las herramientas para dictar tus propias clases, talleres y retiros.",
  },
  "joogalkids": {
    eyebrow: "Certificación Infantil",
    duration: "3 meses",
    modality: "Online · Clases en vivo",
    level: "Sin requisitos previos",
    includes: [
      "Acceso al aula virtual 24/7",
      "Clases en vivo por Zoom",
      "Manual Joogalkids oficial",
      "Grabaciones de cada clase",
      "Certificado oficial de instructor",
      "Comunidad de instructores",
      "Mentoring grupal mensual",
      "Recursos lúdicos descargables",
    ],
    modules: [
      { title: "Sensopercepción y Movimiento", items: ["Sensopercepción", "Mindfulness en movimiento", "Expresión corporal"] },
      { title: "Movimiento y Creatividad", items: ["El cuerpo en la infancia", "Juegos de movimiento", "Expresión libre"] },
      { title: "Pedagogía Lúdica", items: ["Diseño de actividades", "Manejo de grupos infantiles", "Recursos creativos"] },
      { title: "Práctica y Certificación", items: ["Clases prácticas", "Evaluación pedagógica", "Presentación final"] },
    ],
    forWhom: [
      "Maestras y docentes de educación inicial",
      "Guías y educadores conscientes del desarrollo infantil",
      "Instructores que quieren trabajar con niños",
      "Madres y padres interesados en el desarrollo consciente",
    ],
    outcome: "Serás instructor certificado del Método Joogalkids, capaz de crear experiencias de movimiento significativas para niños de 3 a 12 años.",
  },
  "metodo-sholem": {
    eyebrow: "Liderazgo Adolescente",
    duration: "3 meses",
    modality: "Online · Intensivo",
    level: "Experiencia con adolescentes",
    includes: [
      "Acceso al aula virtual 24/7",
      "Clases en vivo por Zoom",
      "Manual Método Sholem",
      "Grabaciones de cada clase",
      "Certificado de instructor",
      "Comunidad de educadores",
      "Supervisión grupal",
      "Recursos para talleres",
    ],
    modules: [
      { title: "El Adolescente de Hoy", items: ["Desarrollo emocional", "Identidad y pertenencia", "Desafíos actuales"] },
      { title: "Liderazgo con Valores", items: ["Bases del Método Sholem", "Valores judíos aplicados", "Liderazgo positivo"] },
      { title: "Facilitación de Grupos", items: ["Dinámica de grupos", "Resolución de conflictos", "Creación de comunidad"] },
      { title: "Programa y Práctica", items: ["Diseño de programas", "Práctica facilitada", "Evaluación final"] },
    ],
    forWhom: [
      "Educadores y docentes de nivel secundario",
      "Líderes de juventud en organizaciones comunitarias",
      "Profesionales que trabajan con adolescentes",
      "Rabinos, cantores y educadores judíos",
    ],
    outcome: "Serás instructor certificado del Método Sholem, preparado para acompañar el desarrollo consciente de jóvenes con valores, identidad y propósito.",
  },
  "cabala-coach": {
    eyebrow: "Micro Curso · Sabiduría Ancestral",
    duration: "4 semanas",
    modality: "Online · A tu ritmo",
    level: "Todos los niveles",
    includes: [
      "Acceso al aula virtual 24/7",
      "Videos grabados HD",
      "Guía de estudio PDF",
      "Ejercicios prácticos",
      "Certificado al completar",
      "Acceso de por vida",
      "Material de meditación",
      "Comunidad privada",
    ],
    modules: [
      { title: "Introducción a la Cabalá", items: ["¿Qué es la Cabalá?", "El Árbol de la Vida", "Las sefirot"] },
      { title: "Cabalá y Coaching", items: ["Aplicaciones prácticas", "Arquetipos cabalísticos", "Lenguaje del alma"] },
      { title: "Herramientas de Transformación", items: ["Meditaciones guiadas", "Diálogos del yo", "Integración personal"] },
      { title: "Vivir con Propósito", items: ["Tu tikún personal", "El mapa de tu vida", "Acción con conciencia"] },
    ],
    forWhom: [
      "Personas curiosas por la espiritualidad judía",
      "Coaches que quieren enriquecer su práctica",
      "Buscadores espirituales de cualquier tradición",
      "Estudiantes de desarrollo personal",
    ],
    outcome: "Integrarás la sabiduría de la Cabalá como herramienta práctica de autoconocimiento y transformación personal, aplicable en tu vida cotidiana y tu práctica profesional.",
  },
}

// Combina lo guardado en DB (course.content) con los defaults del slug (o vacío si es un programa nuevo)
export function getProgramContent(slug: string, stored: string | null | undefined): ProgramContent {
  const base = DEFAULT_PROGRAM_CONTENT[slug] ?? EMPTY_PROGRAM_CONTENT
  if (!stored) return base
  try {
    const parsed = JSON.parse(stored)
    const str = (v: unknown) => (typeof v === "string" ? v : undefined)
    const list = (v: unknown) => (Array.isArray(v) ? (v.filter((x) => typeof x === "string") as string[]) : undefined)
    const en = parsed.en && typeof parsed.en === "object" ? (parsed.en as Partial<ProgramText>) : undefined
    return {
      eyebrow: typeof parsed.eyebrow === "string" ? parsed.eyebrow : base.eyebrow,
      duration: typeof parsed.duration === "string" ? parsed.duration : base.duration,
      modality: typeof parsed.modality === "string" ? parsed.modality : base.modality,
      level: typeof parsed.level === "string" ? parsed.level : base.level,
      includes: Array.isArray(parsed.includes) ? parsed.includes : base.includes,
      modules: Array.isArray(parsed.modules) ? parsed.modules : base.modules,
      forWhom: Array.isArray(parsed.forWhom) ? parsed.forWhom : base.forWhom,
      outcome: typeof parsed.outcome === "string" ? parsed.outcome : base.outcome,
      seoTitle: str(parsed.seoTitle),
      seoDescription: str(parsed.seoDescription),
      certRequirements: list(parsed.certRequirements),
      accent: str(parsed.accent),
      icon: str(parsed.icon),
      ...(en ? { en } : {}),
    }
  } catch {
    return base
  }
}

/** La ficha en un idioma: en inglés, cada campo que tenga versión en inglés reemplaza al español (lo que falta queda en español). */
export function localizeProgramContent(c: ProgramContent, locale: string): ProgramText {
  const { en, accent: _a, icon: _i, ...es } = c
  void _a; void _i
  if (locale !== "en" || !en) return es
  const out: ProgramText = { ...es }
  for (const k of ["eyebrow", "duration", "modality", "level", "outcome", "seoTitle", "seoDescription"] as const) {
    const v = en[k]
    if (typeof v === "string" && v.trim()) out[k] = v
  }
  for (const k of ["includes", "forWhom", "certRequirements"] as const) {
    const v = en[k]
    if (Array.isArray(v) && v.some((x) => x.trim())) out[k] = v
  }
  if (Array.isArray(en.modules) && en.modules.length) out.modules = en.modules
  return out
}

/**
 * Extrae el ID de video de cualquier formato común de URL de YouTube
 * (watch?v=, youtu.be/, /embed/, /shorts/). Devuelve null si no es válida.
 */
export function getYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    const u = new URL(url.trim())
    const host = u.hostname.replace(/^www\./, "")
    if (host === "youtu.be") {
      const id = u.pathname.slice(1)
      return /^[\w-]{11}$/.test(id) ? id : null
    }
    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      if (u.pathname === "/watch") {
        const id = u.searchParams.get("v")
        return id && /^[\w-]{11}$/.test(id) ? id : null
      }
      const match = u.pathname.match(/^\/(embed|shorts)\/([\w-]{11})/)
      if (match) return match[2]
    }
    return null
  } catch {
    return null
  }
}

export function getYouTubeEmbedUrl(url: string | null | undefined): string | null {
  const id = getYouTubeId(url)
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
}

/**
 * Extrae el ID (y el hash privado, si lo trae) de un link de Vimeo, tanto
 * de la página normal (vimeo.com/123/hash) como del embed directo
 * (player.vimeo.com/video/123?h=hash). Devuelve null si no es válido.
 */
export function getVimeoId(url: string | null | undefined): { id: string; hash: string | null } | null {
  if (!url) return null
  try {
    const u = new URL(url.trim())
    const host = u.hostname.replace(/^www\./, "")
    if (host === "vimeo.com") {
      const m = u.pathname.match(/^\/(\d+)(?:\/([a-zA-Z0-9]+))?\/?$/)
      return m ? { id: m[1], hash: m[2] ?? null } : null
    }
    if (host === "player.vimeo.com") {
      const m = u.pathname.match(/^\/video\/(\d+)\/?$/)
      return m ? { id: m[1], hash: u.searchParams.get("h") } : null
    }
    return null
  } catch {
    return null
  }
}

export function getVimeoEmbedUrl(url: string | null | undefined): string | null {
  const p = getVimeoId(url)
  if (!p) return null
  return p.hash ? `https://player.vimeo.com/video/${p.id}?h=${p.hash}` : `https://player.vimeo.com/video/${p.id}`
}
