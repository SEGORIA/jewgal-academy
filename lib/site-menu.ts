/**
 * Menú de arriba, columnas del pie de página y orden de las secciones del inicio.
 * Todo es configurable desde el panel; sin configuración, el sitio queda exactamente como siempre.
 * Este archivo no importa nada del servidor: lo usan las rutas de API, las páginas públicas y el panel.
 */

export type MenuLink = {
  /** Identificador estable: los de fábrica ("inicio", "academia"…) no se pueden borrar, solo ocultar; los propios empiezan con "c-". */
  id: string
  /** Destino: una ruta del sitio ("/p/faq") o un enlace https / mailto / tel. Los de fábrica tienen el suyo fijo. */
  href: string
  /** Texto en español. Vacío = el texto de siempre (traducido). */
  label: string
  /** Texto en inglés. Vacío = el texto de siempre en inglés o, si es un enlace propio, el de español. */
  labelEn: string
  visible: boolean
  /** Clave del texto de siempre (Navbar / Footer). Solo en los enlaces de fábrica. */
  key?: string
}

export type SiteMenu = {
  header: MenuLink[]
  footerAcademia: MenuLink[]
  footerRecursos: MenuLink[]
}

const f = (id: string, href: string, key: string): MenuLink => ({ id, href, label: "", labelEn: "", visible: true, key })

export const DEFAULT_MENU: SiteMenu = {
  header: [
    f("inicio", "/", "inicio"), f("academia", "/academia", "academia"), f("coaching", "/coaching-1-1", "coaching"),
    f("eventos", "/eventos", "eventos"), f("blog", "/blog", "blog"), f("contacto", "/contacto", "contacto"),
  ],
  footerAcademia: [
    f("todosProgramas", "/academia", "todosProgramas"), f("certificaciones", "/certificaciones", "certificaciones"),
    f("sobreDevora", "/conoce-a-devora", "sobreDevora"), f("eventosRetiros", "/eventos", "eventosRetiros"),
  ],
  footerRecursos: [
    f("blog", "/blog", "blog"), f("biblioteca", "/aula", "bibliotecaVirtual"),
    f("testimonios", "/#testimonios", "testimonios"), f("contacto", "/contacto", "contacto"),
  ],
}

/** Un destino seguro: ruta del propio sitio, https, mailto o tel. Cualquier otra cosa (javascript:, data:…) se descarta. */
export function isSafeHref(raw: unknown): raw is string {
  if (typeof raw !== "string") return false
  const v = raw.trim()
  if (!v || v.length > 500) return false
  if (v.startsWith("/")) return !v.startsWith("//")
  return /^https:\/\/[^\s]+$/i.test(v) || /^mailto:[^\s]+$/i.test(v) || /^tel:[+\d\s()-]+$/i.test(v)
}

/** Enlace que sale del sitio (se abre en otra pestaña y no lleva el prefijo de idioma). */
export const isExternalHref = (href: string) => /^(https?:|mailto:|tel:)/i.test(href)

const text = (v: unknown, max = 60) => (typeof v === "string" ? v.trim().slice(0, max) : "")

/**
 * Mezcla lo guardado con lo de fábrica: se respeta el orden y las ediciones guardadas; los enlaces de fábrica que falten
 * (por ejemplo, uno agregado en una versión nueva) se suman al final; los enlaces propios con un destino inválido se descartan.
 */
export function mergeLinks(base: MenuLink[], stored: unknown): MenuLink[] {
  if (!Array.isArray(stored)) return base
  const byId = new Map(base.map((b) => [b.id, b]))
  const out: MenuLink[] = []
  const seen = new Set<string>()
  for (const raw of stored) {
    if (!raw || typeof raw !== "object") continue
    const r = raw as Partial<MenuLink>
    const id = text(r.id, 40)
    if (!id || seen.has(id)) continue
    const factory = byId.get(id)
    if (factory) {
      seen.add(id)
      out.push({ ...factory, label: text(r.label), labelEn: text(r.labelEn), visible: r.visible !== false })
    } else if (id.startsWith("c-") && isSafeHref(r.href) && text(r.label)) {
      seen.add(id)
      out.push({ id, href: r.href.trim(), label: text(r.label), labelEn: text(r.labelEn), visible: r.visible !== false })
    }
  }
  for (const b of base) if (!seen.has(b.id)) out.push(b)
  return out
}

export function mergeMenu(base: SiteMenu, stored: unknown): SiteMenu {
  const s = (stored && typeof stored === "object" ? stored : {}) as Partial<Record<keyof SiteMenu, unknown>>
  return {
    header: mergeLinks(base.header, s.header),
    footerAcademia: mergeLinks(base.footerAcademia, s.footerAcademia),
    footerRecursos: mergeLinks(base.footerRecursos, s.footerRecursos),
  }
}

/** Texto de un enlace en el idioma pedido. `fallback(key)` entrega el texto de siempre de los enlaces de fábrica. */
export function linkLabel(l: MenuLink, locale: string, fallback: (key: string) => string): string {
  const own = locale === "en" ? l.labelEn || l.label : l.label
  if (own) return own
  return l.key ? fallback(l.key) : l.label
}

/* ── Secciones del inicio ── */

export type HomeSectionId = "hero" | "stats" | "programas" | "diferenciador" | "fundadora" | "avales" | "ruta" | "testimonios" | "comunidad" | "features" | "join"
export type HomeSection = { id: HomeSectionId; visible: boolean }

export const HOME_SECTION_LABELS: Record<HomeSectionId, { label: string; hint: string }> = {
  hero: { label: "Portada", hint: "Titular, fotos y botones principales. Siempre visible." },
  stats: { label: "Cifras", hint: "Años de trayectoria, países y programas." },
  programas: { label: "Programas", hint: "Las tarjetas de los programas con sus precios." },
  diferenciador: { label: "Tres dimensiones", hint: "Lo que distingue el método." },
  fundadora: { label: "Fundadora", hint: "Presentación de Devora Benchimol." },
  avales: { label: "Avales y certificaciones", hint: "Logos de las instituciones que respaldan." },
  ruta: { label: "Ruta de aprendizaje", hint: "Los pasos del camino formativo." },
  testimonios: { label: "Testimonios", hint: "Lo que cuentan los alumnos." },
  comunidad: { label: "Comunidad (mapa)", hint: "Mapa interactivo de la comunidad." },
  features: { label: "Aula virtual", hint: "Las herramientas del campus." },
  join: { label: "Llamado final", hint: "Botón de inscripción al final de la página." },
}

export const DEFAULT_HOME_SECTIONS: HomeSection[] = (Object.keys(HOME_SECTION_LABELS) as HomeSectionId[]).map((id) => ({ id, visible: true }))

export function mergeHomeSections(base: HomeSection[], stored: unknown): HomeSection[] {
  if (!Array.isArray(stored)) return base
  const known = new Set(base.map((b) => b.id))
  const out: HomeSection[] = []
  const seen = new Set<string>()
  for (const raw of stored) {
    const r = raw as Partial<HomeSection> | null
    if (!r || typeof r.id !== "string" || !known.has(r.id as HomeSectionId) || seen.has(r.id)) continue
    seen.add(r.id)
    out.push({ id: r.id as HomeSectionId, visible: r.id === "hero" ? true : r.visible !== false })
  }
  for (const b of base) if (!seen.has(b.id)) out.push(b)
  // La portada siempre va primera: es lo que ve quien llega al sitio.
  return [...out.filter((s) => s.id === "hero"), ...out.filter((s) => s.id !== "hero")]
}
