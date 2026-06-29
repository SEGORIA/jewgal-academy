"use client"

import { useRef, type MouseEvent, type ReactNode, type CSSProperties } from "react"

/**
 * Tarjeta con perspectiva 3D reactiva al mouse.
 * Añade inclinación + sombra dinámica dorada + destello de luz que sigue el cursor.
 */
export function TiltCard({
  children,
  style,
  className,
  intensity = 7,
  radius = 8,
}: {
  children: ReactNode
  style?: CSSProperties
  className?: string
  /** Grados máximos de inclinación (default 7) */
  intensity?: number
  /** Border-radius en px — debe coincidir con el del hijo para el glare */
  radius?: number
}) {
  const wrapRef  = useRef<HTMLDivElement>(null)
  const glareRef = useRef<HTMLDivElement>(null)

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const outer = e.currentTarget
    const wrap  = wrapRef.current
    const gl    = glareRef.current
    if (!wrap) return

    const rect = outer.getBoundingClientRect()
    const x    = (e.clientX - rect.left) / rect.width   // 0–1
    const y    = (e.clientY - rect.top)  / rect.height  // 0–1
    const rx   = (0.5 - y) * intensity * 2              // rotateX (tilt vertical)
    const ry   = (x - 0.5) * intensity * 2              // rotateY (tilt horizontal)

    wrap.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.018,1.018,1.018)`

    // Sombra gold que se desplaza en dirección contraria a la luz
    const sx = -(x - 0.5) * 24
    const sy = -(y - 0.5) * 16
    wrap.style.boxShadow = `${sx}px ${sy}px 48px rgba(165,141,102,0.14), 0 22px 60px rgba(0,0,0,0.28)`

    // Destello de luz (glare)
    if (gl) gl.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.09) 0%, transparent 52%)`
  }

  function handleLeave() {
    const wrap = wrapRef.current
    const gl   = glareRef.current
    if (!wrap) return
    wrap.style.transform  = "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)"
    wrap.style.boxShadow  = ""
    if (gl) gl.style.background = "none"
  }

  return (
    <div
      data-tilt
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ width: "100%", display: "flex", flexDirection: "column", ...style }}
      className={className}
    >
      <div
        ref={wrapRef}
        style={{
          transition: "transform 0.22s cubic-bezier(0.23,1,0.32,1), box-shadow 0.22s ease",
          willChange: "transform, box-shadow",
          borderRadius: radius,
          overflow: "hidden",
          flex: 1,
          position: "relative",
          display: "flex", flexDirection: "column",
        }}
      >
        {children}

        {/* Capa de destello — absolutamente posicionada, nunca interactúa con el mouse */}
        <div
          ref={glareRef}
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 10,
            transition: "background 0.1s ease",
          }}
        />
      </div>
    </div>
  )
}
