"use client"

import { useState, useEffect, useCallback, useRef } from "react"

type Photo = { src: string; alt: string; active?: boolean; order?: number }

const DEFAULT_PHOTOS: Photo[] = [
  { src: "/brand/hero/mariposas.webp",       alt: "Ilustración de mariposas Jewgal Academy" },
  { src: "/brand/hero/devora-coaching.webp", alt: "Devora con su grupo de coaching" },
  { src: "/brand/hero/devora-tv.webp",        alt: "Devora en televisión" },
  { src: "/brand/hero/devora-ninos.webp",     alt: "Devora con niños" },
  { src: "/brand/hero/devora-miami.webp",     alt: "Devora en Miami con familia" },
  { src: "/brand/hero/devora-joven.webp",     alt: "Joven saludando en experiencia Jewgal" },
]

const INTERVAL   = 5000
const HERO_VIDEO = "/brand/hero-intro.mp4"

/* Recortes alternativos para mobile — "cover" en un viewport angosto
   sólo muestra la franja central de fotos panorámicas y corta al grupo */
const MOBILE_SRC: Record<string, string> = {
  "/brand/hero/devora-coaching.webp": "/brand/hero/devora-coaching-mobile.webp",
}

type Props = { onSlideChange?: (index: number) => void }

export default function HeroCarousel({ onSlideChange }: Props) {
  const [photos, setPhotos]     = useState<Photo[]>(DEFAULT_PHOTOS)
  const [current, setCurrent]   = useState(0)
  const [paused, setPaused]     = useState(false)
  const [showVideo, setShowVideo] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const reducedMotion = useRef(false)

  /* Notifica a la página qué foto está activa (la primera, sin overlay, se maneja distinto) */
  useEffect(() => {
    if (!showVideo) onSlideChange?.(current)
  }, [current, showVideo, onSlideChange])

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reducedMotion.current) setShowVideo(false)

    const mq = window.matchMedia("(max-width: 720px)")
    setIsMobile(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener("change", onChange)

    fetch("/api/hero-photos")
      .then(r => r.json())
      .then((data: Photo[]) => {
        const active = (data as Photo[]).filter(p => p.active !== false)
        if (active.length) setPhotos(active)
      })
      .catch(() => {})

    return () => mq.removeEventListener("change", onChange)
  }, [])

  const handleVideoEnd = useCallback(() => {
    setShowVideo(false)
    setCurrent(0)
  }, [])

  const next = useCallback(() => setCurrent(c => (c + 1) % photos.length), [photos.length])
  const prev = useCallback(() => setCurrent(c => (c - 1 + photos.length) % photos.length), [photos.length])

  /* Auto-avance del carrusel sólo cuando el video ya terminó */
  useEffect(() => {
    if (showVideo || paused || reducedMotion.current || photos.length <= 1) return
    const id = setInterval(next, INTERVAL)
    return () => clearInterval(id)
  }, [showVideo, paused, photos.length, next])

  return (
    <>
      {/* Fondo instantáneo siempre visible */}
      <div className="hero-fallback" aria-hidden="true" />

      {/* ── VIDEO INTRO ── */}
      <div
        aria-hidden={!showVideo}
        style={{
          position: "absolute", inset: 0, zIndex: 0,
          opacity: showVideo ? 1 : 0,
          transition: "opacity 1.4s ease",
          pointerEvents: showVideo ? "auto" : "none",
        }}
      >
        <video
          src={HERO_VIDEO}
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
          style={{
            width: "100%", height: "100%",
            objectFit: "cover",
            objectPosition: "center 20%",
          }}
        />
      </div>

      {/* ── SLIDES CARRUSEL — crossfade ── */}
      {photos.map((photo, i) => {
        const src = (isMobile && MOBILE_SRC[photo.src]) || photo.src
        return (
          <div
            key={photo.src}
            role="img"
            aria-label={photo.alt}
            aria-hidden={showVideo || i !== current}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            style={{
              position: "absolute", inset: 0, zIndex: 0,
              backgroundImage: `url(${src})`,
              backgroundSize: "cover",
              backgroundPosition: "center 22%",
              opacity: !showVideo && i === current ? 1 : 0,
              transition: "opacity 1.2s ease",
            }}
          />
        )
      })}

      {/* ── CONTROLES — sólo cuando el carrusel está activo ── */}
      {!showVideo && photos.length > 1 && (
        <>
          {/* Dots */}
          <div
            aria-label="Navegación de fotos"
            style={{
              position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
              zIndex: 10, display: "flex", gap: 8, alignItems: "center",
            }}
          >
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Ir a foto ${i + 1}${i === current ? " (actual)" : ""}`}
                aria-pressed={i === current}
                style={{
                  width: i === current ? 22 : 6, height: 6,
                  borderRadius: 4, border: "none", padding: 0, cursor: "pointer",
                  background: i === current ? "#A76D61" : "rgba(246,241,231,.35)",
                  transition: "all .35s ease",
                  boxShadow: i === current ? "0 0 8px rgba(167,109,97,.5)" : "none",
                }}
              />
            ))}
          </div>

          {/* Flecha anterior */}
          <button
            onClick={prev}
            aria-label="Foto anterior"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            style={{
              position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)",
              zIndex: 10, width: 40, height: 40, borderRadius: "50%",
              background: "rgba(44,31,20,.38)", border: "1px solid rgba(196,159,114,.2)",
              backdropFilter: "blur(6px)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "rgba(246,241,231,.75)", transition: "all .2s",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          {/* Flecha siguiente */}
          <button
            onClick={next}
            aria-label="Siguiente foto"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            style={{
              position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)",
              zIndex: 10, width: 40, height: 40, borderRadius: "50%",
              background: "rgba(44,31,20,.38)", border: "1px solid rgba(196,159,114,.2)",
              backdropFilter: "blur(6px)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "rgba(246,241,231,.75)", transition: "all .2s",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </>
      )}
    </>
  )
}
