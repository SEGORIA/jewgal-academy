// Eventos administrables desde el superadmin (SiteSetting key "eventos"),
// mismo patrón que hero_photos / site_content.

export type EventoItem = {
  /** Identificador estable (lo usan las reservas). Los eventos viejos lo reciben al leerse. */
  id: string
  datetime: string // "YYYY-MM-DDTHH:mm" (hora local del evento)
  title: string
  type: string
  location: string
  desc: string
  spots: string
  price: string
  active: boolean
  /** Foto del evento (opcional). */
  imageUrl?: string
  /** Versión en inglés: lo que falte se muestra en español. */
  titleEn?: string
  typeEn?: string
  locationEn?: string
  descEn?: string
  priceEn?: string
  /** Reservas en el sitio: formulario de inscripción con cupo y lista de espera. */
  registration?: boolean
  /** Cupo máximo para las reservas del sitio (vacío = sin tope). */
  capacity?: number | null
}

export type EventoPasado = {
  title: string
  date: string // texto libre, ej. "Marzo 2026"
  location: string
  titleEn?: string
  dateEn?: string
  locationEn?: string
  imageUrl?: string
}

export type EventosData = {
  upcoming: EventoItem[]
  past: EventoPasado[]
}

/** Id estable para un evento que todavía no tiene (se deriva de la fecha y el título, así no cambia entre lecturas). */
export function deriveEventoId(datetime: string, title: string): string {
  let h = 5381
  for (const ch of `${datetime}|${title}`) h = ((h << 5) + h + ch.charCodeAt(0)) | 0
  return `ev-${(h >>> 0).toString(36)}`
}

const str = (v: unknown) => (typeof v === "string" ? v : "")
const opt = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined)

/** Lo guardado (o los valores por defecto) con todos los campos presentes y un id por evento. */
export function normalizeEventos(raw: unknown): EventosData {
  const r = (raw && typeof raw === "object" ? raw : {}) as { upcoming?: unknown; past?: unknown }
  const upcoming: EventoItem[] = (Array.isArray(r.upcoming) ? r.upcoming : []).map((x) => {
    const e = (x ?? {}) as Partial<EventoItem>
    const datetime = str(e.datetime)
    const title = str(e.title)
    const cap = typeof e.capacity === "number" && Number.isFinite(e.capacity) && e.capacity > 0 ? Math.floor(e.capacity) : null
    return {
      id: opt(e.id) ?? deriveEventoId(datetime, title),
      datetime, title, type: str(e.type), location: str(e.location), desc: str(e.desc), spots: str(e.spots), price: str(e.price),
      active: e.active !== false,
      imageUrl: opt(e.imageUrl), titleEn: opt(e.titleEn), typeEn: opt(e.typeEn), locationEn: opt(e.locationEn), descEn: opt(e.descEn), priceEn: opt(e.priceEn),
      registration: e.registration === true, capacity: cap,
    }
  })
  const past: EventoPasado[] = (Array.isArray(r.past) ? r.past : []).map((x) => {
    const e = (x ?? {}) as Partial<EventoPasado>
    return { title: str(e.title), date: str(e.date), location: str(e.location), titleEn: opt(e.titleEn), dateEn: opt(e.dateEn), locationEn: opt(e.locationEn), imageUrl: opt(e.imageUrl) }
  })
  return { upcoming, past }
}

/** El evento en el idioma pedido (en inglés cae al español campo por campo). */
export function localizeEvento(ev: EventoItem, locale: string): EventoItem {
  if (locale !== "en") return ev
  return { ...ev, title: ev.titleEn || ev.title, type: ev.typeEn || ev.type, location: ev.locationEn || ev.location, desc: ev.descEn || ev.desc, price: ev.priceEn || ev.price }
}
export function localizePasado(p: EventoPasado, locale: string): EventoPasado {
  if (locale !== "en") return p
  return { ...p, title: p.titleEn || p.title, date: p.dateEn || p.date, location: p.locationEn || p.location }
}

export const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

// Deriva día/mes/año del string ISO sin usar Date (evita desfases de zona horaria en SSR)
export function fechaDisplay(datetime: string) {
  const year = datetime.slice(0, 4)
  const monthIdx = parseInt(datetime.slice(5, 7), 10) - 1
  const day = datetime.slice(8, 10)
  return { day, month: MESES_CORTOS[monthIdx] ?? "", year }
}

const RAW_DEFAULT_EVENTOS: { upcoming: Omit<EventoItem, "id">[]; past: EventoPasado[] } = {
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

export const DEFAULT_EVENTOS: EventosData = normalizeEventos(RAW_DEFAULT_EVENTOS)
