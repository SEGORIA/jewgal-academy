"use client"

import { useEffect } from "react"

/** Activa .reveal → .show via IntersectionObserver. Sin renders propios. */
export default function RevealInit() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add("show")
          io.unobserve(entry.target)
        })
      },
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
    )

    const els = document.querySelectorAll<HTMLElement>(".reveal")
    els.forEach((el, i) => {
      el.style.transitionDelay = ((i % 5) * 0.07) + "s"
      io.observe(el)
    })

    return () => io.disconnect()
  }, [])

  return null
}
