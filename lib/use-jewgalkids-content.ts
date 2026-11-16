"use client"

import { useEffect, useState } from "react"
import { DEFAULT_JEWGALKIDS, type JewgalkidsContent } from "./jewgalkids-config"

/**
 * Contenido de las herramientas de Joogalkids en el aula. Parte con el contenido original (sin esperas ni parpadeos) y lo
 * reemplaza por el editado en el panel (Contenido del aula → Joogalkids) cuando llega.
 */
export function useJewgalkidsContent(): JewgalkidsContent {
  const [content, setContent] = useState<JewgalkidsContent>(DEFAULT_JEWGALKIDS)
  useEffect(() => {
    let alive = true
    fetch("/api/me/jewgalkids-content", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: JewgalkidsContent | null) => { if (alive && d?.breathing && d?.postures && d?.values) setContent(d) })
      .catch(() => {})
    return () => { alive = false }
  }, [])
  return content
}
