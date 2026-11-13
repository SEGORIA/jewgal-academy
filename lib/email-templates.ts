/**
 * Plantillas de los correos automáticos y de los avisos / newsletter.
 *
 *  · welcome       → cuenta nueva (se guarda junto al contenido del sitio: site_content.emails). Siempre activa.
 *  · enrollment    → confirmación de inscripción a un alumno que ya tenía cuenta.
 *  · certificate   → aviso de que su certificado está listo.
 *  · announcement  → marco de los avisos que se envían por correo a los alumnos.
 *  · newsletter    → marco del boletín que se envía a las personas suscriptas.
 *
 * Los textos se editan en Comunicaciones → Plantillas de correo (SiteSetting "email_templates").
 * Este módulo no toca la base: sirve igual para el servidor y para el editor del panel.
 */

export type TemplateKey = "welcome" | "enrollment" | "certificate" | "announcement" | "newsletter"
export type EmailTemplate = { enabled: boolean; subject: string; body: string }
export type TemplateMeta = {
  key: TemplateKey
  label: string
  /** Cuándo se envía. */
  when: string
  /** Variables que se pueden usar escribiéndolas entre llaves. */
  placeholders: { name: string; desc: string }[]
  /** ¿Se puede apagar? (la de bienvenida y los marcos no). */
  toggleable: boolean
  defaults: EmailTemplate
}

export const EMAIL_TEMPLATES_KEY = "email_templates"

export const TEMPLATE_META: TemplateMeta[] = [
  {
    key: "welcome",
    label: "Bienvenida (cuenta nueva)",
    when: "Se envía solo cuando alguien compra o se inscribe y se le crea la cuenta, con su contraseña temporal.",
    placeholders: [
      { name: "nombre", desc: "Nombre del alumno" }, { name: "curso", desc: "Programa" },
      { name: "email", desc: "Su usuario de ingreso" }, { name: "password", desc: "Contraseña temporal" },
    ],
    toggleable: false,
    defaults: {
      enabled: true,
      subject: "¡Bienvenido/a a Jewgal Academy! Tu acceso al aula",
      body: "Hola {nombre},\n\n¡Bienvenido/a a Jewgal Academy! Tu inscripción en {curso} está confirmada.\n\nEstos son tus datos de acceso al aula virtual:\n\nUsuario: {email}\nContraseña temporal: {password}\n\nEntra en https://jewgalacademy.com/login y cambia tu contraseña desde \"Mi perfil\" cuando quieras.\n\nNos vemos dentro,\nDevora Benchimol · Jewgal Academy",
    },
  },
  {
    key: "enrollment",
    label: "Inscripción a un programa",
    when: "Se envía a un alumno que ya tiene cuenta cuando se lo inscribe en un programa (por una compra o desde el panel).",
    placeholders: [
      { name: "nombre", desc: "Nombre del alumno" }, { name: "curso", desc: "Programa" },
      { name: "email", desc: "Su usuario de ingreso" }, { name: "enlace", desc: "Enlace al aula" },
    ],
    toggleable: true,
    defaults: {
      enabled: false,
      subject: "Ya tenés acceso a {curso}",
      body: "Hola {nombre},\n\nTe confirmamos tu inscripción en {curso}. Ya podés ingresar al aula virtual con tu usuario ({email}).\n\nEntrá acá: {enlace}\n\nNos vemos dentro,\nDevora Benchimol · Jewgal Academy",
    },
  },
  {
    key: "certificate",
    label: "Certificado emitido",
    when: "Se envía cuando se emite el certificado de un alumno (al completar el programa o cuando se certifica desde el panel).",
    placeholders: [
      { name: "nombre", desc: "Nombre del alumno" }, { name: "curso", desc: "Programa" },
      { name: "certificado", desc: "Número del certificado" }, { name: "enlace", desc: "Enlace a sus certificaciones" },
    ],
    toggleable: true,
    defaults: {
      enabled: false,
      subject: "¡Felicitaciones! Tu certificado de {curso}",
      body: "Hola {nombre},\n\n¡Felicitaciones por completar {curso}! Tu certificado N° {certificado} ya está disponible.\n\nPodés verlo y descargarlo desde tu aula: {enlace}\n\nCon cariño,\nDevora Benchimol · Jewgal Academy",
    },
  },
  {
    key: "announcement",
    label: "Avisos a alumnos (marco del correo)",
    when: "Es el formato de los avisos que se mandan por correo desde Comunicaciones → Anuncios. {mensaje} se reemplaza por lo que escribas en cada aviso.",
    placeholders: [
      { name: "nombre", desc: "Nombre del alumno" }, { name: "titulo", desc: "Título del aviso" },
      { name: "mensaje", desc: "Texto del aviso (obligatorio)" },
    ],
    toggleable: false,
    defaults: {
      enabled: true,
      subject: "{titulo}",
      body: "Hola {nombre},\n\n{mensaje}\n\nUn abrazo,\nDevora Benchimol · Jewgal Academy",
    },
  },
  {
    key: "newsletter",
    label: "Newsletter (marco del correo)",
    when: "Es el formato del boletín para las personas suscriptas. {mensaje} se reemplaza por el contenido de cada envío; el enlace para darse de baja se agrega solo.",
    placeholders: [{ name: "titulo", desc: "Asunto del boletín" }, { name: "mensaje", desc: "Contenido del boletín (obligatorio)" }],
    toggleable: false,
    defaults: {
      enabled: true,
      subject: "{titulo}",
      body: "{mensaje}\n\nCon cariño,\nDevora Benchimol · Jewgal Academy",
    },
  },
]

export const metaOf = (key: TemplateKey) => TEMPLATE_META.find((t) => t.key === key)!

/** Mezcla lo guardado con los valores por defecto (campo a campo, lo vacío vuelve al original). */
export function mergeTemplate(key: TemplateKey, raw: unknown): EmailTemplate {
  const d = metaOf(key).defaults
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<EmailTemplate>
  return {
    enabled: metaOf(key).toggleable ? (typeof r.enabled === "boolean" ? r.enabled : d.enabled) : true,
    subject: typeof r.subject === "string" && r.subject.trim() ? r.subject.trim() : d.subject,
    body: typeof r.body === "string" && r.body.trim() ? r.body : d.body,
  }
}

/** Reemplaza {variable} por su valor. Solo toca las variables conocidas de la plantilla. */
export function renderTemplate(text: string, vars: Record<string, string>): string {
  return text.replace(/\{([a-z]+)\}/g, (whole, k: string) => (k in vars ? vars[k] : whole))
}

/** Variables {x} que usa un texto y que la plantilla no reconoce (para avisar en el editor). */
export function unknownPlaceholders(key: TemplateKey, text: string): string[] {
  const known = new Set(metaOf(key).placeholders.map((p) => p.name))
  return [...new Set((text.match(/\{([a-z]+)\}/g) ?? []).map((m) => m.slice(1, -1)).filter((n) => !known.has(n)))]
}

/** Variables obligatorias que faltan (por ejemplo {mensaje} en los marcos). */
export function missingRequired(key: TemplateKey, body: string): string[] {
  if (key === "announcement" || key === "newsletter") return body.includes("{mensaje}") ? [] : ["mensaje"]
  if (key === "welcome") return body.includes("{password}") ? [] : ["password"]
  return []
}

/** Datos de ejemplo para la vista previa del editor. */
export const SAMPLE_VARS: Record<string, string> = {
  nombre: "María", curso: "Life Coaching Integrativo", email: "maria@ejemplo.com", password: "Ab3xK9pQ", enlace: "https://jewgalacademy.com/aula",
  certificado: "JA-2026-0001", titulo: "Nueva clase en vivo este jueves", mensaje: "Les recordamos que este jueves a las 19:00 (hora Miami) tenemos nuestra clase en vivo. ¡Los esperamos!",
}
