import { cache } from "react"
import { baseDb } from "./db"
import { applyOverrides, parseOverrides, TEXT_OVERRIDES_KEY, type Locale, type OverridesByLocale } from "./text-overrides"

/** Textos modificados desde el panel (vacío si no hay ninguno o si la base no responde). */
export const getTextOverrides = cache(async (): Promise<OverridesByLocale> => {
  try {
    const s = await baseDb.siteSetting.findUnique({ where: { key: TEXT_OVERRIDES_KEY } })
    return parseOverrides(s?.value)
  } catch {
    return {}
  }
})

/** Mensajes de un idioma con los cambios del panel aplicados encima de los archivos messages/*.json. */
export async function loadMessages(locale: Locale) {
  const base = (await import(`../messages/${locale}.json`)).default as Record<string, unknown>
  const overrides = (await getTextOverrides())[locale]
  return applyOverrides(base, overrides)
}
