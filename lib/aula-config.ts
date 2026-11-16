/**
 * Textos, niveles y logros del aula, editables desde el panel (SiteSetting "aula_config").
 * Sin configuración, el aula se ve exactamente como siempre. Sin dependencias del servidor: lo usan el panel, la API y el aula.
 */

export type AulaTexts = {
  /** Texto chico sobre el título. */
  eyebrow: string
  /** Saludo cuando se conoce el nombre ("Hola," + nombre). */
  greeting: string
  /** Título cuando no se conoce el nombre (primera parte y parte destacada). */
  welcome1: string
  welcome2: string
  /** Frase bajo el título. */
  subtitle: string
}

export type LevelConfig = { min: number; name: string }
export type AchievementConfig = { label: string; desc: string }

export type AulaConfig = {
  texts: AulaTexts
  /** 5 niveles por avance del programa: el primero arranca en 0 y el último en 100. */
  levels: LevelConfig[]
  /** Nombre y descripción de cada logro, por id. */
  achievements: Record<string, AchievementConfig>
}

export const AULA_CONFIG_KEY = "aula_config"

export const DEFAULT_AULA_TEXTS: AulaTexts = {
  eyebrow: "Jewgal Academy · Aula Virtual",
  greeting: "Hola,",
  welcome1: "Te damos la bienvenida a tu",
  welcome2: "espacio de aprendizaje",
  subtitle: "Aquí encontrás todo el contenido de tus programas activos.",
}

export const DEFAULT_LEVELS: LevelConfig[] = [
  { min: 0, name: "Iniciada" }, { min: 20, name: "Exploradora" }, { min: 45, name: "En camino" }, { min: 70, name: "Avanzada" }, { min: 100, name: "Maestra" },
]

export const DEFAULT_ACHIEVEMENTS: Record<string, AchievementConfig> = {
  "primeros-pasos": { label: "Primeros pasos", desc: "Te inscribiste en el programa" },
  "medio-camino": { label: "Medio camino", desc: "Alcanzaste el 50% del programa" },
  "recta-final": { label: "Recta final", desc: "Llegaste al 90% del programa" },
  constante: { label: "Constante", desc: "80% o más de asistencia" },
  dedicacion: { label: "Dedicación", desc: "10 o más horas de formación" },
  certificada: { label: "Certificado", desc: "Completaste y obtuviste tu certificado" },
}

export const DEFAULT_AULA_CONFIG: AulaConfig = { texts: DEFAULT_AULA_TEXTS, levels: DEFAULT_LEVELS, achievements: DEFAULT_ACHIEVEMENTS }

const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "")

export function normalizeAulaConfig(raw: unknown): AulaConfig {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<AulaConfig>
  const t = (r.texts ?? {}) as Partial<AulaTexts>
  const texts = { ...DEFAULT_AULA_TEXTS }
  for (const k of Object.keys(texts) as (keyof AulaTexts)[]) { const v = s(t[k], 200); if (v) texts[k] = v }

  // Los niveles: se respetan los nombres; los umbrales solo si siguen siendo crecientes (0 al inicio, 100 al final).
  let levels = DEFAULT_LEVELS.map((d, i) => ({ min: d.min, name: s((r.levels as Partial<LevelConfig>[] | undefined)?.[i]?.name, 40) || d.name }))
  const mins = (r.levels as Partial<LevelConfig>[] | undefined)?.map((l) => l?.min)
  if (Array.isArray(mins) && mins.length === 5 && mins.every((m) => typeof m === "number" && Number.isFinite(m)) && mins[0] === 0 && mins[4] === 100 && mins.every((m, i) => i === 0 || (m as number) > (mins[i - 1] as number))) {
    levels = levels.map((l, i) => ({ ...l, min: Math.round(mins[i] as number) }))
  }

  const achievements: Record<string, AchievementConfig> = {}
  for (const [id, d] of Object.entries(DEFAULT_ACHIEVEMENTS)) {
    const a = (r.achievements as Record<string, Partial<AchievementConfig>> | undefined)?.[id]
    achievements[id] = { label: s(a?.label, 40) || d.label, desc: s(a?.desc, 120) || d.desc }
  }
  return { texts, levels, achievements }
}
