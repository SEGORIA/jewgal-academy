/**
 * Gamificación del aula (Fase 1) — lógica pura derivada de datos que ya existen
 * en cada inscripción (avance, horas, asistencia, certificación). No requiere
 * cambios de base de datos. La UI mapea los `icon` (strings) a iconos lucide.
 */

export type GamiEnrollment = {
  progress: number
  hoursCompleted: number
  status: string
  certificateNumber: string | null
  attendance: { attended: number; held: number; rate: number | null }
  course: { totalHours: number | null }
}

import type { AchievementConfig, LevelConfig } from "./aula-config"

/** Nombres, umbrales y textos propios del aula (se editan en el panel). Sin esto valen los de fábrica. */
export type GamiConfig = { levels?: LevelConfig[]; achievements?: Record<string, AchievementConfig> }

export type LevelIcon = "sprout" | "compass" | "trending" | "star" | "crown"
export type Level = { index: number; total: number; name: string; icon: LevelIcon }

/** 5 niveles temáticos por avance del programa. */
const LEVELS: { min: number; name: string; icon: LevelIcon }[] = [
  { min: 0,   name: "Iniciada",    icon: "sprout" },
  { min: 20,  name: "Exploradora", icon: "compass" },
  { min: 45,  name: "En camino",   icon: "trending" },
  { min: 70,  name: "Avanzada",    icon: "star" },
  { min: 100, name: "Maestra",     icon: "crown" },
]

export function getLevel(progress: number, completed = false, cfg?: GamiConfig): Level {
  const p = completed ? 100 : Math.max(0, Math.min(100, progress))
  const levels = LEVELS.map((l, i) => ({ ...l, ...(cfg?.levels?.[i] ? { min: cfg.levels[i].min, name: cfg.levels[i].name } : {}) }))
  let idx = 0
  for (let i = 0; i < levels.length; i++) if (p >= levels[i].min) idx = i
  return { index: idx, total: levels.length, name: levels[idx].name, icon: levels[idx].icon }
}

export type AchievementIcon =
  | "footprints" | "milestone" | "target" | "calendar" | "clock" | "award"
export type Achievement = {
  id: string
  label: string
  desc: string
  icon: AchievementIcon
  unlocked: boolean
}

/** Logros desbloqueables a partir de los datos reales de la inscripción. */
export function getAchievements(en: GamiEnrollment, cfg?: GamiConfig): Achievement[] {
  const certified = en.status === "completed" && !!en.certificateNumber
  const rate = en.attendance.rate
  const list: Achievement[] = [
    { id: "primeros-pasos", label: "Primeros pasos", desc: "Te inscribiste en el programa",     icon: "footprints", unlocked: true },
    { id: "medio-camino",   label: "Medio camino",   desc: "Alcanzaste el 50% del programa",     icon: "milestone",  unlocked: en.progress >= 50 || certified },
    { id: "recta-final",    label: "Recta final",    desc: "Llegaste al 90% del programa",        icon: "target",     unlocked: en.progress >= 90 || certified },
    { id: "constante",      label: "Constante",      desc: "80% o más de asistencia",             icon: "calendar",   unlocked: rate !== null && rate >= 80 },
    { id: "dedicacion",     label: "Dedicación",     desc: "10 o más horas de formación",         icon: "clock",      unlocked: en.hoursCompleted >= 10 },
    { id: "certificada",    label: "Certificado",    desc: "Completaste y obtuviste tu certificado", icon: "award",   unlocked: certified },
  ]
  return list.map((a) => (cfg?.achievements?.[a.id] ? { ...a, label: cfg.achievements[a.id].label, desc: cfg.achievements[a.id].desc } : a))
}

/** Hitos marcados sobre la barra de avance. */
export const MILESTONES = [25, 50, 75, 100] as const

/** Resumen gamificado global (todos los programas del estudiante). */
export function getSummary(ens: GamiEnrollment[], cfg?: GamiConfig) {
  const totalHours = Math.round(ens.reduce((s, e) => s + e.hoursCompleted, 0))
  let unlocked = 0
  let totalAch = 0
  for (const e of ens) {
    const a = getAchievements(e, cfg)
    unlocked += a.filter((x) => x.unlocked).length
    totalAch += a.length
  }
  const avgProgress = ens.length
    ? Math.round(ens.reduce((s, e) => s + (e.status === "completed" ? 100 : e.progress), 0) / ens.length)
    : 0
  return { totalHours, unlocked, totalAch, avgProgress, level: getLevel(avgProgress, false, cfg) }
}
