/**
 * Reservas de Coaching 1:1: configuración de disponibilidad y cálculo de turnos.
 * Sin dependencias del servidor: lo usan las rutas de API, el panel y la página pública.
 */

export type TimeWindow = { start: string; end: string } // "HH:mm"

export type CoachingSettings = {
  /** Reservas en línea activadas (si no, la página muestra solo el formulario de contacto). */
  enabled: boolean
  /** Zona horaria en la que se definen los horarios (IANA, ej. "America/New_York"). */
  timezone: string
  /** Franjas de atención por día de la semana: 0 = domingo … 6 = sábado. */
  weekly: Record<string, TimeWindow[]>
  /** Cada cuántos minutos arranca un turno (15–120). */
  stepMinutes: number
  /** Descanso entre una sesión y la siguiente. */
  bufferMinutes: number
  /** Aviso mínimo para reservar (horas). */
  minNoticeHours: number
  /** Hasta cuántos días adelante se puede reservar. */
  maxDaysAhead: number
  /** true = la reserva queda confirmada al instante; false = queda pendiente hasta que se confirme desde el panel. */
  autoConfirm: boolean
  /** Fechas sin atención ("YYYY-MM-DD"): feriados, vacaciones. */
  blockedDates: string[]
  /** Enlace de videollamada por defecto (Zoom, Meet…) que se manda al confirmar. */
  meetingUrl: string
  /** Texto que ve quien reserva (cómo es la sesión, qué preparar, política de cancelación). */
  instructions: string
}

const dayWindows = (): TimeWindow[] => [{ start: "09:00", end: "13:00" }, { start: "15:00", end: "18:00" }]

export const DEFAULT_COACHING_SETTINGS: CoachingSettings = {
  enabled: false,
  timezone: "America/New_York",
  weekly: { "0": [], "1": dayWindows(), "2": dayWindows(), "3": dayWindows(), "4": dayWindows(), "5": [], "6": [] },
  stepMinutes: 30,
  bufferMinutes: 15,
  minNoticeHours: 24,
  maxDaysAhead: 60,
  autoConfirm: false,
  blockedDates: [],
  meetingUrl: "",
  instructions: "",
}

export const COACHING_SETTINGS_KEY = "coaching_settings"
export const WEEKDAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/
const num = (v: unknown, def: number, min: number, max: number) => (typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : def)
export const toMin = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5))

export function isValidTimezone(tz: unknown): tz is string {
  if (typeof tz !== "string" || !tz) return false
  try { new Intl.DateTimeFormat("en-US", { timeZone: tz }); return true } catch { return false }
}

/** Lo guardado con todos los campos presentes y valores razonables (nunca rompe si el JSON está incompleto). */
export function normalizeCoachingSettings(raw: unknown): CoachingSettings {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<CoachingSettings>
  const d = DEFAULT_COACHING_SETTINGS
  const weekly: Record<string, TimeWindow[]> = {}
  for (let i = 0; i < 7; i++) {
    const src = (r.weekly as Record<string, unknown> | undefined)?.[String(i)]
    const list = Array.isArray(src) ? src : d.weekly[String(i)]
    weekly[String(i)] = (list as Partial<TimeWindow>[])
      .filter((w) => typeof w?.start === "string" && typeof w?.end === "string" && HHMM.test(w.start) && HHMM.test(w.end) && toMin(w.end) > toMin(w.start))
      .map((w) => ({ start: w.start!, end: w.end! }))
      .sort((a, b) => toMin(a.start) - toMin(b.start))
  }
  return {
    enabled: r.enabled === true,
    timezone: isValidTimezone(r.timezone) ? r.timezone : d.timezone,
    weekly,
    stepMinutes: num(r.stepMinutes, d.stepMinutes, 15, 120),
    bufferMinutes: num(r.bufferMinutes, d.bufferMinutes, 0, 120),
    minNoticeHours: num(r.minNoticeHours, d.minNoticeHours, 0, 24 * 30),
    maxDaysAhead: num(r.maxDaysAhead, d.maxDaysAhead, 1, 365),
    autoConfirm: r.autoConfirm === true,
    blockedDates: Array.isArray(r.blockedDates) ? [...new Set(r.blockedDates.filter((x): x is string => typeof x === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x)))].sort() : [],
    meetingUrl: typeof r.meetingUrl === "string" && /^https:\/\/\S+$/i.test(r.meetingUrl.trim()) ? r.meetingUrl.trim() : "",
    instructions: typeof r.instructions === "string" ? r.instructions.slice(0, 2000) : "",
  }
}

/* ── Zonas horarias (sin librerías: solo Intl) ── */

function partsOf(ms: number, tz: string) {
  const f = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
  const o: Record<string, number> = {}
  for (const p of f.formatToParts(new Date(ms))) if (p.type !== "literal") o[p.type] = Number(p.value)
  return o
}

/** Diferencia (en minutos) entre la hora de `tz` y UTC en ese instante. */
function offsetMinutes(ms: number, tz: string): number {
  const p = partsOf(ms, tz)
  return Math.round((Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - ms) / 60000)
}

/** La hora de pared "YYYY-MM-DD" + "HH:mm" en `tz` como instante UTC (considera el horario de verano). */
export function zonedToUtc(date: string, time: string, tz: string): Date {
  const [y, m, d] = date.split("-").map(Number)
  const [hh, mm] = time.split(":").map(Number)
  const guess = Date.UTC(y, m - 1, d, hh, mm)
  let ms = guess - offsetMinutes(guess, tz) * 60000
  ms = guess - offsetMinutes(ms, tz) * 60000 // reajuste por si cruzó un cambio de horario
  return new Date(ms)
}

/** La fecha ("YYYY-MM-DD") de un instante en `tz`. */
export function dateInZone(d: Date, tz: string): string {
  const p = partsOf(d.getTime(), tz)
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`
}

export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10)
}

export const weekdayOf = (date: string) => new Date(`${date}T00:00:00Z`).getUTCDay()

export type Interval = { start: Date; end: Date }

/**
 * Turnos libres de un día para una sesión de `durationMin` minutos.
 * Un turno se ofrece si: el día tiene atención y no está bloqueado, entra completo en una franja, cumple el aviso mínimo y el
 * horizonte, y no se pisa (con el descanso) con otra reserva activa.
 */
export function slotsForDate(settings: CoachingSettings, durationMin: number, date: string, now: Date, busy: Interval[]): Date[] {
  if (settings.blockedDates.includes(date)) return []
  const today = dateInZone(now, settings.timezone)
  if (date < today || date > addDays(today, settings.maxDaysAhead)) return []
  const earliest = now.getTime() + settings.minNoticeHours * 3_600_000
  const gap = settings.bufferMinutes * 60_000
  const out: Date[] = []
  for (const w of settings.weekly[String(weekdayOf(date))] ?? []) {
    for (let t = toMin(w.start); t + durationMin <= toMin(w.end); t += settings.stepMinutes) {
      const hh = String(Math.floor(t / 60)).padStart(2, "0")
      const mm = String(t % 60).padStart(2, "0")
      const start = zonedToUtc(date, `${hh}:${mm}`, settings.timezone)
      const end = new Date(start.getTime() + durationMin * 60_000)
      if (start.getTime() < earliest) continue
      if (busy.some((b) => start.getTime() < b.end.getTime() + gap && end.getTime() + gap > b.start.getTime())) continue
      out.push(start)
    }
  }
  return out
}
