"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Play, Pause, RotateCcw } from "lucide-react"
import { BREATHING_PATTERNS, type BreathingPattern } from "@/lib/jewgalkids-content"

type Phase = "inhale" | "hold" | "exhale"

const PHASE_LABEL: Record<Phase, string> = { inhale: "Inhalá", hold: "Sostené", exhale: "Exhalá" }

function nextPhase(p: Phase, pattern: BreathingPattern): Phase {
  if (p === "inhale") return pattern.hold > 0 ? "hold" : "exhale"
  if (p === "hold") return "exhale"
  return "inhale"
}

export default function BreathingPacer() {
  const [pattern, setPattern] = useState<BreathingPattern>(BREATHING_PATTERNS[0])
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState<Phase>("inhale")
  const [elapsed, setElapsed] = useState(0) // ms transcurridos en la fase actual
  const [cycles, setCycles] = useState(0)
  const rafRef = useRef<number | undefined>(undefined)
  const lastTsRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!running) { lastTsRef.current = undefined; return }

    const tick = (ts: number) => {
      if (lastTsRef.current === undefined) lastTsRef.current = ts
      const delta = ts - lastTsRef.current
      lastTsRef.current = ts
      setElapsed((prev) => {
        const durationMs = pattern[phase] * 1000
        const next = prev + delta
        if (next >= durationMs) {
          const np = nextPhase(phase, pattern)
          setPhase(np)
          if (np === "inhale") setCycles((c) => c + 1)
          return 0
        }
        return next
      })
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [running, phase, pattern])

  function selectPattern(p: BreathingPattern) {
    setPattern(p)
    setRunning(false)
    setPhase("inhale")
    setElapsed(0)
    setCycles(0)
  }

  function reset() {
    setRunning(false)
    setPhase("inhale")
    setElapsed(0)
    setCycles(0)
  }

  const durationMs = Math.max(pattern[phase] * 1000, 1)
  const progress = Math.min(elapsed / durationMs, 1)
  const secondsLeft = Math.max(1, Math.ceil((durationMs - elapsed) / 1000))
  const scale = phase === "inhale" ? 0.55 + 0.45 * progress
    : phase === "hold" ? 1
    : 1 - 0.45 * progress

  return (
    <div>
      <p style={{ color: "var(--text-muted)", fontSize: 14.5, lineHeight: 1.65, marginBottom: 28, maxWidth: 560 }}>
        Elegí un patrón de respiración y seguí el círculo: crece cuando inhalás, se mantiene si hay que sostener, y se achica al exhalar. Pensado para practicar solo/a o guiar a un niño o niña.
      </p>

      {/* Selector de patrones */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
        {BREATHING_PATTERNS.map((p) => {
          const active = p.id === pattern.id
          return (
            <button
              key={p.id}
              onClick={() => selectPattern(p)}
              style={{
                padding: "9px 16px", borderRadius: 20,
                fontSize: 12.5, fontWeight: active ? 600 : 400,
                border: `1px solid ${active ? "var(--gold)" : "rgba(165,141,102,.25)"}`,
                background: active ? "rgba(165,141,102,.15)" : "transparent",
                color: active ? "var(--gold)" : "var(--text-muted)",
                cursor: "pointer", transition: "all .2s",
              }}
            >
              {p.name}
            </button>
          )
        })}
      </div>

      <p style={{ color: "var(--text-dim)", fontSize: 13, marginBottom: 32, maxWidth: 480 }}>{pattern.description}</p>

      {/* Visualización */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, padding: "20px 0 8px" }}>
        <div style={{ position: "relative", width: 220, height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Anillo guía */}
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px dashed rgba(165,141,102,.25)" }} />

          {pattern.visual === "balloon" ? (
            <motion.div
              animate={{ scale }}
              transition={{ duration: 0.1, ease: "linear" }}
              style={{
                width: 150, height: 170, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                background: "linear-gradient(135deg, var(--gold-light) 0%, var(--gold) 60%, #A76D61 100%)",
                boxShadow: "0 10px 40px -10px rgba(167,109,97,.55)",
                position: "relative",
              }}
            >
              <div style={{
                position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)",
                width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent",
                borderTop: "10px solid var(--gold)",
              }} />
            </motion.div>
          ) : (
            <motion.div
              animate={{ scale }}
              transition={{ duration: 0.1, ease: "linear" }}
              style={{
                width: 170, height: 170, borderRadius: "50%",
                background: "radial-gradient(circle at 35% 30%, var(--gold-light), var(--gold) 55%, #A76D61 100%)",
                boxShadow: "0 10px 40px -10px rgba(167,109,97,.5)",
              }}
            />
          )}

          {/* Texto central */}
          <div style={{ position: "absolute", textAlign: "center", color: "#fff", pointerEvents: "none" }}>
            <div style={{ fontSize: 13, letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 700, textShadow: "0 2px 8px rgba(0,0,0,.25)" }}>
              {running ? PHASE_LABEL[phase] : "Lista"}
            </div>
            {running && (
              <div style={{ fontFamily: "var(--serif)", fontSize: 34, fontWeight: 500, textShadow: "0 2px 8px rgba(0,0,0,.25)" }}>
                {secondsLeft}
              </div>
            )}
          </div>
        </div>

        {/* Controles */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={() => setRunning((r) => !r)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "11px 26px", borderRadius: 30,
              background: "linear-gradient(135deg,#A76D61 0%,#C49F72 100%)",
              border: "none", color: "#fff", fontSize: 13.5, fontWeight: 600,
              cursor: "pointer", boxShadow: "0 8px 24px -8px rgba(167,109,97,.5)",
            }}
          >
            {running ? <Pause size={15} /> : <Play size={15} />}
            {running ? "Pausar" : "Empezar"}
          </button>
          <button
            onClick={reset}
            aria-label="Reiniciar"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 40, height: 40, borderRadius: "50%",
              border: "1px solid rgba(165,141,102,.25)", background: "transparent",
              color: "var(--text-muted)", cursor: "pointer",
            }}
          >
            <RotateCcw size={15} />
          </button>
        </div>

        <p style={{ color: "var(--text-dim)", fontSize: 12.5 }}>
          Respiraciones completas: <strong style={{ color: "var(--gold)" }}>{cycles}</strong>
        </p>
      </div>
    </div>
  )
}
