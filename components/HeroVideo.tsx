"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Video de fondo del hero con carga inteligente:
 * - Muestra un fondo gradiente premium al instante (0 bytes de red).
 * - Difiere la descarga del video pesado hasta después del primer render.
 * - NO descarga el video (~15MB) en pantallas pequeñas ni con ahorro de datos
 *   ni en conexiones lentas → móvil rapidísimo y sin gastar datos.
 * - Hace un fade-in elegante cuando el video está listo para reproducir.
 */
export default function HeroVideo() {
  const [load, setLoad] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const conn = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection
    // Respetar ahorro de datos y conexiones lentas
    if (conn?.saveData) return
    if (conn?.effectiveType && /(slow-)?2g/.test(conn.effectiveType)) return
    // No descargar el video pesado en pantallas pequeñas (ahorra ~15MB)
    if (window.matchMedia("(max-width: 768px)").matches) return
    // Respetar reduced-motion: no autoplay de video
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    // Cargar tras el primer render para no bloquear el contenido
    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
      cancelIdleCallback?: (id: number) => void
    }
    const start = () => setLoad(true)
    const id = w.requestIdleCallback
      ? w.requestIdleCallback(start, { timeout: 1500 })
      : window.setTimeout(start, 400)

    return () => {
      if (w.cancelIdleCallback) w.cancelIdleCallback(id as number)
      else clearTimeout(id as number)
    }
  }, [])

  return (
    <>
      {/* Fondo premium instantáneo (visible siempre, también si el video no carga) */}
      <div className="hero-fallback" aria-hidden="true" />
      {load && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          className={`hero-video${loaded ? " loaded" : ""}`}
          onCanPlay={() => setLoaded(true)}
        >
          <source src="/brand/hero-video.mp4" type="video/mp4" />
        </video>
      )}
    </>
  )
}
