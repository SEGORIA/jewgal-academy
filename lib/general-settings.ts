import { cache } from "react"
import { db } from "./db"

/**
 * Ajustes generales de la marca que el sitio público SÍ usa:
 *  · name             → nombre en el título de cada página (“Página · Nombre”)
 *  · whatsapp         → número del botón flotante de WhatsApp (solo dígitos, con código de país)
 *  · whatsappMessage  → mensaje inicial del chat (vacío = el texto por defecto de cada idioma)
 *
 * El correo, el teléfono y las redes se editan en “Portada y contacto”; las descripciones SEO, en “Textos y SEO”.
 */
export type GeneralSettings = { name: string; whatsapp: string; whatsappMessage: string }

export const DEFAULT_GENERAL: GeneralSettings = {
  name: "Jewgal Academy",
  whatsapp: "17864835893",
  whatsappMessage: "",
}

export function mergeGeneral(raw: unknown): GeneralSettings {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<GeneralSettings>
  return {
    name: typeof r.name === "string" && r.name.trim() ? r.name.trim() : DEFAULT_GENERAL.name,
    whatsapp: typeof r.whatsapp === "string" ? r.whatsapp.replace(/\D/g, "") : DEFAULT_GENERAL.whatsapp,
    whatsappMessage: typeof r.whatsappMessage === "string" ? r.whatsappMessage : "",
  }
}

export const getGeneralSettings = cache(async (): Promise<GeneralSettings> => {
  try {
    const s = await db.siteSetting.findUnique({ where: { key: "site_general" } })
    if (s?.value) return mergeGeneral(JSON.parse(s.value))
  } catch { /* sin base: valores por defecto */ }
  return DEFAULT_GENERAL
})
