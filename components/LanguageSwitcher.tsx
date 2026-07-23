"use client"

import { useLocale, useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import { usePathname, useRouter } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"

/**
 * Selector ES/EN. Mantiene al usuario en la misma página al cambiar de
 * idioma (usePathname/useRouter de next-intl ya resuelven el prefijo).
 */
export default function LanguageSwitcher({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const locale = useLocale()
  const t = useTranslations("LanguageSwitcher")
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  function switchTo(next: string) {
    if (next === locale) return
    const query = searchParams.toString()
    router.replace({ pathname, query: query ? Object.fromEntries(searchParams.entries()) : undefined }, { locale: next })
  }

  const isLight = variant === "light"

  return (
    <div
      role="group"
      aria-label={t("label")}
      style={{
        display: "flex", alignItems: "center", gap: 2,
        border: `1px solid ${isLight ? "rgba(246,241,231,.28)" : "rgba(165,141,102,.3)"}`,
        borderRadius: 20, padding: 2,
      }}
    >
      {routing.locales.map((loc) => {
        const active = loc === locale
        return (
          <button
            key={loc}
            type="button"
            onClick={() => switchTo(loc)}
            aria-pressed={active}
            aria-label={loc === "es" ? "Español" : "English"}
            style={{
              appearance: "none", border: "none", cursor: active ? "default" : "pointer",
              padding: "5px 11px", borderRadius: 18,
              fontSize: 10.5, letterSpacing: ".1em", fontWeight: active ? 700 : 500,
              transition: "all .25s",
              background: active ? "var(--gold)" : "transparent",
              color: active ? "#241608" : isLight ? "rgba(246,241,231,.65)" : "var(--text-muted, rgba(246,241,231,.55))",
            }}
          >
            {t(loc as "es" | "en")}
          </button>
        )
      })}
    </div>
  )
}
