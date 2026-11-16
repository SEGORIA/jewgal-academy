"use client"

import { useEffect, useState } from "react"
import { DEFAULT_MENU, mergeMenu, type SiteMenu } from "./site-menu"

/**
 * Menú del sitio para el navegador. Parte con el menú de siempre (sin saltos al cargar) y lo reemplaza por el guardado en el
 * panel. La respuesta se comparte entre componentes durante 30 segundos para no repetir el pedido.
 */
const cache = new Map<string, { at: number; promise: Promise<SiteMenu> }>()

function loadMenu(locale: string): Promise<SiteMenu> {
  const hit = cache.get(locale)
  if (hit && Date.now() - hit.at < 30_000) return hit.promise
  const promise = fetch(`/api/site-content?locale=${locale}`)
    .then((r) => r.json())
    .then((d: { menu?: unknown }) => mergeMenu(DEFAULT_MENU, d.menu))
    .catch(() => DEFAULT_MENU)
  cache.set(locale, { at: Date.now(), promise })
  return promise
}

export function useSiteMenu(locale: string): SiteMenu {
  const [menu, setMenu] = useState<SiteMenu>(DEFAULT_MENU)
  useEffect(() => {
    let alive = true
    loadMenu(locale).then((m) => { if (alive) setMenu(m) })
    return () => { alive = false }
  }, [locale])
  return menu
}
