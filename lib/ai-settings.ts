import { baseDb } from "./db"
import { AI_SETTINGS_KEY, DEFAULT_AI_SETTINGS, normalizeAiSettings, type AiSettings } from "./ai-settings-core"

export * from "./ai-settings-core"

export async function getAiSettings(): Promise<AiSettings> {
  try {
    const s = await baseDb.siteSetting.findUnique({ where: { key: AI_SETTINGS_KEY } })
    return normalizeAiSettings(s?.value ? JSON.parse(s.value) : null)
  } catch {
    return DEFAULT_AI_SETTINGS
  }
}
