import { baseDb } from "./db"
import { AULA_CONFIG_KEY, DEFAULT_AULA_CONFIG, normalizeAulaConfig, type AulaConfig } from "./aula-config"
import { DEFAULT_JEWGALKIDS, JEWGALKIDS_CONTENT_KEY, normalizeJewgalkids, type JewgalkidsContent } from "./jewgalkids-config"

/** Lectura (servidor) de la configuración del aula y del contenido de Joogalkids. */

export async function getAulaConfig(): Promise<AulaConfig> {
  try {
    const s = await baseDb.siteSetting.findUnique({ where: { key: AULA_CONFIG_KEY } })
    return normalizeAulaConfig(s?.value ? JSON.parse(s.value) : null)
  } catch {
    return DEFAULT_AULA_CONFIG
  }
}

export async function getJewgalkids(): Promise<{ content: JewgalkidsContent; customized: boolean }> {
  try {
    const s = await baseDb.siteSetting.findUnique({ where: { key: JEWGALKIDS_CONTENT_KEY } })
    if (s?.value) return { content: normalizeJewgalkids(JSON.parse(s.value)), customized: true }
  } catch { /* se usa el contenido original */ }
  return { content: DEFAULT_JEWGALKIDS, customized: false }
}
