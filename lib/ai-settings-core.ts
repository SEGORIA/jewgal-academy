// Ajustes del asistente de IA (sin dependencias del servidor: los usan el panel y la API).

/**
 * Control del asistente de IA desde el panel (SiteSetting "ai_settings").
 * Sin configuración, el asistente se comporta exactamente como siempre: activo, sin límite diario y sin instrucciones extra.
 */
export type AiSettings = {
  /** Apagarlo muestra a los alumnos que está en pausa (no gasta cuota de la IA). */
  enabled: boolean
  /** Instrucciones propias de la academia (tono, temas a priorizar). No pueden contradecir las reglas de seguridad del asistente. */
  extraInstructions: string
  /** Mensajes por alumno en 24 horas (0 = sin límite). */
  dailyLimit: number
  /** Largo máximo de cada respuesta (en tokens). */
  maxTokens: number
}

export const AI_SETTINGS_KEY = "ai_settings"
export const DEFAULT_AI_SETTINGS: AiSettings = { enabled: true, extraInstructions: "", dailyLimit: 0, maxTokens: 2048 }

const num = (v: unknown, def: number, min: number, max: number) => (typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : def)

export function normalizeAiSettings(raw: unknown): AiSettings {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<AiSettings>
  return {
    enabled: r.enabled !== false,
    extraInstructions: typeof r.extraInstructions === "string" ? r.extraInstructions.trim().slice(0, 3000) : "",
    dailyLimit: num(r.dailyLimit, 0, 0, 1000),
    maxTokens: num(r.maxTokens, 2048, 256, 4096),
  }
}

/** Las instrucciones de la academia se agregan al final y no pueden anular las reglas de tono y seguridad. */
export function withExtraInstructions(systemPrompt: string, extra: string): string {
  if (!extra.trim()) return systemPrompt
  return `${systemPrompt}\n\nINSTRUCCIONES ADICIONALES DE LA ACADEMIA (aplican siempre que no contradigan las reglas de tono y contenido de arriba, que tienen prioridad):\n${extra.trim()}`
}
