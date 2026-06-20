import { unstable_cache } from "next/cache"
import { db } from "./db"

export type Theme = "dark" | "light"
export const THEME_TAG = "site-theme"

/**
 * Tema global de la plataforma (lo controla el admin desde el superadmin).
 * Cacheado con tag para no consultar la DB en cada request; se revalida
 * cuando el admin cambia el tema.
 */
export const getTheme = unstable_cache(
  async (): Promise<Theme> => {
    try {
      const s = await db.siteSetting.findUnique({ where: { key: "theme" } })
      return s?.value === "light" ? "light" : "dark"
    } catch {
      return "dark"
    }
  },
  ["site-theme"],
  { tags: [THEME_TAG], revalidate: 3600 }
)
