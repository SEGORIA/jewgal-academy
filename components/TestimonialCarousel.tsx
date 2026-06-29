"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const TESTIMONIALS = [
  {
    text: "Qué bendición cruzarse con maestros tan empáticos que no solo educan, sino que muchas veces rescatan. Sus clases crean una profunda conexión entre quienes participamos.",
    who: "Constanza Wohlgemut",
    role: "Life Coaching Integrativo",
  },
  {
    text: "Tus clases de coaching y Cábala han sido un faro en mi camino, ayudándome a comprender no solo la materia, sino aspectos de mi propia vida. Estas enseñanzas me han transformado.",
    who: "Diana Atri",
    role: "Cábala Coach",
  },
  {
    text: "De todo corazón quiero agradecerte. Eres una guía invaluable; tu dedicación y sabiduría han marcado profundamente mi camino.",
    who: "Andrea Gálvez",
    role: "Instructor Jewgal Adultos",
  },
]

const variants = {
  enter: (d: number) => ({ x: d > 0 ? 72 : -72, opacity: 0, filter: "blur(4px)" }),
  center: { x: 0, opacity: 1, filter: "blur(0px)" },
  exit:  (d: number) => ({ x: d > 0 ? -72 : 72, opacity: 0, filter: "blur(4px)" }),
}

export default function TestimonialCarousel() {
  const [idx, setIdx]       = useState(0)
  const [dir, setDir]       = useState(1)
  const [paused, setPaused] = useState(false)

  const go = (next: number) => {
    const n = (next + TESTIMONIALS.length) % TESTIMONIALS.length
    setDir(n > idx ? 1 : -1)
    setIdx(n)
  }

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => { setDir(1); setIdx(c => (c + 1) % TESTIMONIALS.length) }, 5200)
    return () => clearInterval(t)
  }, [paused, idx])

  return (
    <div
      style={{ position: "relative", maxWidth: 740, margin: "0 auto", padding: "0 56px" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Comilla decorativa */}
      <div aria-hidden style={{
        fontFamily: "var(--serif)", fontSize: 160, lineHeight: 0.55,
        color: "var(--gold)", opacity: 0.1,
        position: "absolute", top: 8, left: 52,
        pointerEvents: "none", userSelect: "none",
      }}>
        &ldquo;
      </div>

      {/* Área de slide */}
      <div style={{ minHeight: 200, display: "flex", alignItems: "center" }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={idx}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={(_e, info) => {
              if (info.offset.x > 50)       go(idx - 1)
              else if (info.offset.x < -50) go(idx + 1)
            }}
            style={{ width: "100%", textAlign: "center", cursor: "grab" }}
          >
            <p style={{
              fontFamily: "var(--serif)", fontStyle: "italic",
              fontSize: "clamp(16px,1.9vw,21px)",
              color: "var(--text)", lineHeight: 1.8,
              marginBottom: 32,
            }}>
              {TESTIMONIALS[idx].text}
            </p>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              {/* Línea decorativa */}
              <motion.div
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                style={{ width: 28, height: 1, background: "var(--gold)", marginBottom: 10 }}
              />
              <span style={{
                fontSize: 12, letterSpacing: ".22em", textTransform: "uppercase",
                color: "var(--gold)", fontFamily: "var(--sans)", fontWeight: 600,
              }}>
                {TESTIMONIALS[idx].who}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-faint)", letterSpacing: ".1em" }}>
                {TESTIMONIALS[idx].role}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 36 }}>
        {TESTIMONIALS.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => go(i)}
            aria-label={`Testimonio ${i + 1}`}
            animate={{ width: i === idx ? 26 : 6, background: i === idx ? "#C49F72" : "rgba(165,141,102,.25)" }}
            transition={{ duration: 0.3 }}
            style={{ height: 6, borderRadius: 3, border: "none", cursor: "pointer", padding: 0 }}
          />
        ))}
      </div>

      {/* Botones prev / next */}
      {([
        { label: "Anterior", delta: -1, side: "left"  as const, char: "‹" },
        { label: "Siguiente", delta:  1, side: "right" as const, char: "›" },
      ] as const).map(({ label, delta, side, char }) => (
        <motion.button
          key={side}
          onClick={() => go(idx + delta)}
          aria-label={label}
          whileHover={{ scale: 1.08, borderColor: "var(--gold)", background: "rgba(196,159,114,.12)" }}
          whileTap={{ scale: 0.95 }}
          style={{
            position: "absolute", top: "38%", [side]: 0,
            transform: "translateY(-50%)",
            background: "none",
            border: "1px solid rgba(165,141,102,.22)",
            borderRadius: "50%", width: 40, height: 40,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--gold)", fontSize: 22, cursor: "pointer",
          }}
        >
          {char}
        </motion.button>
      ))}
    </div>
  )
}
