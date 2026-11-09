"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { Search, CornerDownLeft, FileText, GraduationCap } from "lucide-react"

type Item = { id: string; title: string; hint?: string; href: string; kind: "page" | "program" }
type ApiCourse = { slug: string; title: string; shortDesc?: string | null }

// Sin tildes y en minúsculas: "Cábala" coincide con "cabala"
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

/**
 * Buscador del sitio (paleta de comandos): páginas + programas reales de la base.
 * Teclado: ↑/↓ para moverse, Enter para ir, Esc para cerrar. Se abre con la lupa o con Ctrl/⌘+K.
 */
export default function SiteSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  return open ? <SearchDialog onClose={onClose} /> : null
}

// Programas ya pedidos, por idioma (evita repetir la consulta cada vez que se abre)
const coursesCache = new Map<string, ApiCourse[]>()

function SearchDialog({ onClose }: { onClose: () => void }) {
  const t = useTranslations("Navbar")
  const locale = useLocale()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)
  const [courses, setCourses] = useState<ApiCourse[] | null>(() => coursesCache.get(locale) ?? null)

  const pages: Item[] = useMemo(
    () => [
      { id: "p-home", title: t("inicio"), href: "/", kind: "page" },
      { id: "p-academia", title: t("academia"), href: "/academia", kind: "page" },
      { id: "p-coaching", title: t("coaching"), href: "/coaching-1-1", kind: "page" },
      { id: "p-devora", title: t("buscarDevora"), href: "/conoce-a-devora", kind: "page" },
      { id: "p-cert", title: t("buscarCertificaciones"), href: "/certificaciones", kind: "page" },
      { id: "p-verificar", title: t("buscarVerificar"), href: "/verificar", kind: "page" },
      { id: "p-eventos", title: t("eventos"), href: "/eventos", kind: "page" },
      { id: "p-blog", title: t("blog"), href: "/blog", kind: "page" },
      { id: "p-contacto", title: t("contacto"), href: "/contacto", kind: "page" },
    ],
    [t]
  )

  // Programas: una sola consulta por idioma
  useEffect(() => {
    if (coursesCache.has(locale)) return
    let cancelled = false
    fetch(`/api/courses?locale=${locale}`)
      .then((r) => r.json())
      .then((d: { courses?: ApiCourse[] }) => {
        const list = d.courses ?? []
        coursesCache.set(locale, list)
        if (!cancelled) setCourses(list)
      })
      .catch(() => { if (!cancelled) setCourses([]) })
    return () => { cancelled = true }
  }, [locale])

  const programs: Item[] = useMemo(
    () => (courses ?? []).map((c) => ({ id: `c-${c.slug}`, title: c.title, hint: c.shortDesc ?? undefined, href: `/programas/${c.slug}`, kind: "program" as const })),
    [courses]
  )

  const results = useMemo(() => {
    const q = norm(query.trim())
    const all = [...programs, ...pages]
    if (!q) return all
    return all.filter((i) => norm(i.title).includes(q) || (i.hint ? norm(i.hint).includes(q) : false))
  }, [query, programs, pages])

  // al montar: foco en el campo y recordar dónde estaba el foco para devolverlo al cerrar
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    const id = window.setTimeout(() => inputRef.current?.focus(), 30)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.clearTimeout(id)
      document.body.style.overflow = prevOverflow
      prev?.focus?.()
    }
  }, [])

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" })
  }, [active])

  const go = (item: Item | undefined) => {
    if (!item) return
    onClose()
    router.push(item.href)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { e.preventDefault(); onClose() }
    else if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, Math.max(results.length - 1, 0))) }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
    else if (e.key === "Enter") { e.preventDefault(); go(results[active]) }
    else if (e.key === "Tab") { e.preventDefault() } // el foco se queda en el diálogo
  }

  const rowStyle = (isActive: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
    padding: "11px 14px", borderRadius: 10, border: "none", cursor: "pointer",
    background: isActive ? "var(--surface-2)" : "transparent",
    color: "var(--text)", fontFamily: "inherit",
  })

  return (
    <div
      role="dialog" aria-modal="true" aria-label={t("buscar")}
      onKeyDown={onKeyDown}
      style={{ position: "fixed", inset: 0, zIndex: 120, display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "min(14vh,120px) 16px 16px" }}
    >
      <div onClick={onClose} aria-hidden style={{ position: "absolute", inset: 0, background: "var(--scrim)", backdropFilter: "blur(4px)" }} />
      <div style={{
        position: "relative", width: "100%", maxWidth: 580, maxHeight: "min(70vh,560px)", display: "flex", flexDirection: "column",
        background: "var(--surface-solid)", border: "1px solid var(--border)", borderRadius: 16,
        boxShadow: "0 30px 90px rgba(26,8,6,.35)", overflow: "hidden",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
          <Search size={18} aria-hidden style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-expanded="true"
            aria-controls="site-search-list"
            aria-activedescendant={results[active] ? `ss-${results[active].id}` : undefined}
            aria-label={t("buscar")}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0) }}
            placeholder={t("buscarPlaceholder")}
            autoComplete="off"
            style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 16, color: "var(--text)", fontFamily: "inherit", minWidth: 0 }}
          />
          <kbd style={{ fontSize: 11, color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: 6, padding: "2px 7px", fontFamily: "inherit" }}>Esc</kbd>
        </div>

        <div id="site-search-list" role="listbox" ref={listRef} style={{ overflowY: "auto", padding: 8 }}>
          {results.length === 0 ? (
            <p style={{ padding: "28px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>{t("buscarVacio")}</p>
          ) : (
            results.map((item, idx) => {
              const prev = results[idx - 1]
              return (
                <div key={item.id}>
                  {(!prev || prev.kind !== item.kind) && (
                    <p style={{ fontSize: 10.5, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--text-muted)", padding: "10px 14px 4px" }}>
                      {item.kind === "program" ? t("buscarProgramas") : t("buscarPaginas")}
                    </p>
                  )}
                  <button
                    id={`ss-${item.id}`} data-idx={idx} role="option" aria-selected={idx === active} tabIndex={-1}
                    onMouseMove={() => active !== idx && setActive(idx)}
                    onClick={() => go(item)}
                    style={rowStyle(idx === active)}
                  >
                    {item.kind === "program"
                      ? <GraduationCap size={17} aria-hidden style={{ color: "var(--gold-ink)", flexShrink: 0 }} />
                      : <FileText size={17} aria-hidden style={{ color: "var(--gold-ink)", flexShrink: 0 }} />}
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 14.5, fontWeight: 500 }}>{item.title}</span>
                      {item.hint && <span style={{ display: "block", fontSize: 12.5, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.hint}</span>}
                    </span>
                    {idx === active && <CornerDownLeft size={14} aria-hidden style={{ color: "var(--text-muted)", flexShrink: 0 }} />}
                  </button>
                </div>
              )
            })
          )}
        </div>

        <div style={{ display: "flex", gap: 16, padding: "9px 16px", borderTop: "1px solid var(--border)", fontSize: 11.5, color: "var(--text-muted)" }}>
          <span>↑↓ {t("buscarNavegar")}</span>
          <span>↵ {t("buscarAbrir")}</span>
        </div>
      </div>
    </div>
  )
}
