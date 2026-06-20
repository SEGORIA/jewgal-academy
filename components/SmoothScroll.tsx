"use client"

import { useEffect } from "react"
import Lenis from "lenis"

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    })

    let raf = 0
    function loop(time: number) {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    // Anchor links → smooth scroll
    function onClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest('a[href^="#"], a[href*="/#"]')
      if (!target) return
      const href = target.getAttribute("href") || ""
      const hash = href.includes("#") ? "#" + href.split("#")[1] : ""
      if (hash && hash.length > 1 && document.querySelector(hash)) {
        e.preventDefault()
        lenis.scrollTo(hash, { offset: -80, duration: 1.4 })
      }
    }
    document.addEventListener("click", onClick)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener("click", onClick)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
