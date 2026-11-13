import { getRequestConfig } from "next-intl/server"
import { routing } from "./routing"
import { loadMessages } from "@/lib/messages"

export default getRequestConfig(async ({ requestLocale }) => {
  // requestLocale es undefined para rutas fuera de app/(site)/[locale]
  // (ej. /aula, /superadmin) — en ese caso usamos el default.
  const requested = await requestLocale
  const locale = requested && routing.locales.includes(requested as "es" | "en")
    ? (requested as "es" | "en")
    : routing.defaultLocale

  return {
    locale,
    // messages/*.json + los textos que se cambiaron desde el panel (Textos y SEO)
    messages: await loadMessages(locale),
  }
})
