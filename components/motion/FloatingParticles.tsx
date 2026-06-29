"use client"

import { motion } from "framer-motion"

const PARTICLES = [
  { x:  8, size: 2.5, delay: 0,   dur:  9, col: "#A58D66", opa: 0.55 },
  { x: 18, size: 1.5, delay: 1.8, dur: 12, col: "#CBB78B", opa: 0.4  },
  { x: 31, size: 3.5, delay: 0.5, dur:  8, col: "#A58D66", opa: 0.5  },
  { x: 44, size: 2,   delay: 3.2, dur: 11, col: "#A76D61", opa: 0.38 },
  { x: 57, size: 1.5, delay: 2.1, dur:  9, col: "#C49F72", opa: 0.35 },
  { x: 67, size: 3,   delay: 1.0, dur: 10, col: "#CBB78B", opa: 0.48 },
  { x: 79, size: 2,   delay: 4.5, dur:  8, col: "#A58D66", opa: 0.42 },
  { x: 90, size: 1.5, delay: 0.7, dur: 13, col: "#A76D61", opa: 0.32 },
]

/**
 * Partículas doradas que ascienden suavemente en el fondo del hero.
 * Puramente decorativas y no interactúan con el mouse.
 */
export function FloatingParticles() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 1,
      }}
    >
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: "100%",
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.col,
            boxShadow: `0 0 ${p.size * 3.5}px ${p.col}`,
          }}
          animate={{
            y: [0, -1100],
            x: [0, Math.sin(i * 1.3) * 55],
            opacity: [0, p.opa, p.opa * 0.85, 0],
          }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  )
}
