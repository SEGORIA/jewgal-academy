"use client"

import { motion, useScroll, useSpring } from "framer-motion"

/** Barra de progreso de lectura — toque premium sutil en el borde superior. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        transformOrigin: "0%",
        scaleX,
        background: "linear-gradient(90deg, var(--gold-deep), var(--gold-light), var(--gold))",
        zIndex: 1000,
      }}
    />
  )
}
