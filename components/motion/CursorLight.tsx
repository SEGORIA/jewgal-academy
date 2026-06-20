"use client"

import { useEffect, useRef } from "react"

/**
 * Luz de cursor — gradiente radial translúcido dorado que sigue el mouse.
 * Coloca este componente dentro del contenedor que quieras iluminar.
 */
export function CursorLight({
  color = "rgba(165,141,102,0.06)",
  size  = 520,
}: {
  color?: string
  size?:  number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const parent = ref.current?.parentElement
    if (!parent) return

    function onMove(e: MouseEvent) {
      const el   = ref.current
      if (!el) return
      const rect = parent!.getBoundingClientRect()
      const x    = e.clientX - rect.left
      const y    = e.clientY - rect.top
      el.style.background = `radial-gradient(${size}px circle at ${x}px ${y}px, ${color}, transparent 70%)`
    }

    function onLeave() {
      const el = ref.current
      if (el) el.style.background = "none"
    }

    parent.addEventListener("mousemove", onMove)
    parent.addEventListener("mouseleave", onLeave)
    return () => {
      parent.removeEventListener("mousemove", onMove)
      parent.removeEventListener("mouseleave", onLeave)
    }
  }, [color, size])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 2,
        transition: "background 0.08s ease",
      }}
    />
  )
}
