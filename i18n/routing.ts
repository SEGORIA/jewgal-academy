import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  // Español sin prefijo (las URLs actuales no cambian), inglés bajo /en/*
  localePrefix: "as-needed",
})
