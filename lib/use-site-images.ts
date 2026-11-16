"use client"

import { useEffect, useState } from "react"
import { DEFAULT_SITE_IMAGES, mergeImages, type SiteImages } from "@/lib/site-content"

/**
 * Imágenes grandes de las páginas públicas que se cambian desde el panel.
 * Arranca con las de siempre y las reemplaza apenas llega el contenido (las imágenes no dependen del idioma).
 */
export function useSiteImages(): SiteImages {
  const [images, setImages] = useState<SiteImages>(DEFAULT_SITE_IMAGES)
  useEffect(() => {
    let alive = true
    fetch("/api/site-content?locale=es")
      .then((r) => r.json())
      .then((d: { images?: Partial<SiteImages> }) => { if (alive) setImages(mergeImages(DEFAULT_SITE_IMAGES, d.images)) })
      .catch(() => {})
    return () => { alive = false }
  }, [])
  return images
}

/** CSS `background-image` seguro para una URL cualquiera. */
export const bgUrl = (src: string) => `url("${src.replace(/"/g, "%22")}")`
