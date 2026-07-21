// Contenido editable de la página de cada programa (course.content, JSON en DB).
// Lo puramente visual (icono, gradiente, color de acento, logos de certificación)
// sigue en app/programas/[slug]/page.tsx — no se expone en el admin.

export type ProgramModule = { title: string; items: string[] }

export type ProgramContent = {
  eyebrow: string
  duration: string
  modality: string
  level: string
  includes: string[]
  modules: ProgramModule[]
  forWhom: string[]
  outcome: string
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
      "Manual Jewgalkids oficial",
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
    outcome: "Serás instructor certificado del Método Jewgalkids, capaz de crear experiencias de movimiento significativas para niños de 3 a 12 años.",
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
    return {
      eyebrow: typeof parsed.eyebrow === "string" ? parsed.eyebrow : base.eyebrow,
      duration: typeof parsed.duration === "string" ? parsed.duration : base.duration,
      modality: typeof parsed.modality === "string" ? parsed.modality : base.modality,
      level: typeof parsed.level === "string" ? parsed.level : base.level,
      includes: Array.isArray(parsed.includes) ? parsed.includes : base.includes,
      modules: Array.isArray(parsed.modules) ? parsed.modules : base.modules,
      forWhom: Array.isArray(parsed.forWhom) ? parsed.forWhom : base.forWhom,
      outcome: typeof parsed.outcome === "string" ? parsed.outcome : base.outcome,
    }
  } catch {
    return base
  }
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
