// Eventos administrables desde el superadmin (SiteSetting key "eventos"),
// mismo patrón que hero_photos / site_content.

export type EventoItem = {
  datetime: string // "YYYY-MM-DDTHH:mm" (hora local del evento)
  title: string
  type: string
  location: string
  desc: string
  spots: string
  price: string
  active: boolean
}

export type EventoPasado = {
  title: string
  date: string // texto libre, ej. "Marzo 2026"
  location: string
}

export type EventosData = {
  upcoming: EventoItem[]
  past: EventoPasado[]
}

export const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

// Deriva día/mes/año del string ISO sin usar Date (evita desfases de zona horaria en SSR)
export function fechaDisplay(datetime: string) {
  const year = datetime.slice(0, 4)
  const monthIdx = parseInt(datetime.slice(5, 7), 10) - 1
  const day = datetime.slice(8, 10)
  return { day, month: MESES_CORTOS[monthIdx] ?? "", year }
}

export const DEFAULT_EVENTOS: EventosData = {
  upcoming: [
    {
      datetime: "2026-07-14T10:00",
      title: "Retiro de Bienestar · Jewgal Experience",
      type: "Retiro presencial",
      location: "Miami, Florida",
      desc: "Un fin de semana de reconexión profunda: movimiento Jewgal, meditación, círculos de coaching y sabiduría de la Cábala. Plazas muy limitadas.",
      spots: "20",
      price: "$450",
      active: true,
    },
    {
      datetime: "2026-07-22T19:00",
      title: "Masterclass Gratuita · Cabalá y Propósito",
      type: "Evento online",
      location: "Zoom · En vivo",
      desc: "Una sesión introductoria con Devora Benchimol sobre cómo la Cabalá puede transformar tu forma de entender el propósito y el liderazgo personal.",
      spots: "200",
      price: "Gratis",
      active: true,
    },
    {
      datetime: "2026-08-05T09:00",
      title: "Formación Intensiva · Life Coaching Weekend",
      type: "Intensivo presencial",
      location: "Miami, Florida",
      desc: "Dos días de inmersión en herramientas prácticas de Life Coaching Integrativo. Válido como módulo optativo para alumnos de la Academia.",
      spots: "30",
      price: "$280",
      active: true,
    },
    {
      datetime: "2026-09-12T10:00",
      title: "Encuentro Jewgal · Medellín",
      type: "Evento presencial",
      location: "Medellín, Colombia",
      desc: "Un encuentro de transformación y movimiento consciente con Devora Benchimol en Colombia: talleres de Jewgal, círculos de coaching y sabiduría de la Cábala. Plazas limitadas.",
      spots: "40",
      price: "Por confirmar",
      active: true,
    },
  ],
  past: [
    { title: "Retiro Sholem · Buenos Aires", date: "Marzo 2026", location: "Argentina" },
    { title: "Masterclass Jewgal · Bogotá", date: "Enero 2026", location: "Colombia" },
    { title: "Taller Cábala y Crianza", date: "Noviembre 2025", location: "Miami, FL" },
  ],
}
