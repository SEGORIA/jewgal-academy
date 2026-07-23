import { getRequestConfig } from "next-intl/server"
import { routing } from "./routing"

export default getRequestConfig(async ({ requestLocale }) => {
  // requestLocale es undefined para rutas fuera de app/(site)/[locale]
  // (ej. /aula, /superadmin) — en ese caso usamos el default.
  const requested = await requestLocale
  const locale = requested && routing.locales.includes(requested as "es" | "en")
    ? requested
    : routing.defaultLocale

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
