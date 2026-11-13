"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations } from "next-intl"

export type CarouselItem = { text: string; who: string; role: string }

const variants = {
  enter: (d: number) => ({ x: d > 0 ? 72 : -72, opacity: 0, filter: "blur(4px)" }),
  center: { x: 0, opacity: 1, filter: "blur(0px)" },
  exit:  (d: number) => ({ x: d > 0 ? -72 : 72, opacity: 0, filter: "blur(4px)" }),
}

export default function TestimonialCarousel({ items }: { items: CarouselItem[] }) {
  const TESTIMONIALS = items
  const t = useTranslations("Testimonials")
  const [idx, setIdx]       = useState(0)
  const [dir, setDir]       = useState(1)
  const [paused, setPaused] = useState(false)

  const go = (next: number) => {
    const n = TESTIMONIALS.length ? (next + TESTIMONIALS.length) % TESTIMONIALS.length : 0
    setDir(n > idx ? 1 : -1)
    setIdx(n)
  }

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => { setDir(1); setIdx(c => (TESTIMONIALS.length ? (c + 1) % TESTIMONIALS.length : 0)) }, 5200)
    return () => clearInterval(t)
  }, [paused, idx])

  if (TESTIMONIALS.length === 0) return null

  return (
    <div
      style={{ position: "relative", maxWidth: 740, margin: "0 auto", padding: "0 56px" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Comilla decorativa */}
      <div aria-hidden style={{
        fontFamily: "var(--serif)", fontSize: 160, lineHeight: 0.55,
        color: "var(--gold-ink)", opacity: 0.1,
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
                color: "var(--gold-ink)", fontFamily: "var(--sans)", fontWeight: 600,
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
      <div style={{ display: "flex", gap: 0, justifyContent: "center", marginTop: 28 }}>
        {TESTIMONIALS.map((_, i) => (
          // Botón de 24px de alto (zona táctil); el punto visible mantiene 6px
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`${t("testimonial")} ${i + 1}`}
            aria-current={i === idx ? "true" : undefined}
            style={{ height: 24, minWidth: 24, padding: "0 4px", border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <motion.span
              aria-hidden="true"
              animate={{ width: i === idx ? 26 : 6, background: i === idx ? "#B58A55" : "rgba(132,97,69,.35)" }}
              transition={{ duration: 0.3 }}
              style={{ display: "block", height: 6, borderRadius: 3 }}
            />
          </button>
        ))}
      </div>

      {/* Botones prev / next */}
      {([
        { label: t("previous"), delta: -1, side: "left"  as const, char: "‹" },
        { label: t("next"), delta:  1, side: "right" as const, char: "›" },
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
            color: "var(--gold-ink)", fontSize: 22, cursor: "pointer",
          }}
        >
          {char}
        </motion.button>
      ))}
    </div>
  )
}
