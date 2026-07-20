"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { fechaDisplay, type EventoItem } from "@/lib/eventos"

function pad(n: number) { return String(n).padStart(2, "0") }

function Digit({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "clamp(52px,7vw,84px)" }}>
      <div style={{ position: "relative", height: "clamp(52px,7vw,80px)", width: "100%", overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          <motion.span
            key={value}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0,   opacity: 1 }}
            exit=  {{ y:  20, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(48px,7vw,80px)",
              color: "var(--gold-light)",
              lineHeight: 1,
              position: "absolute",
              inset: 0,
              textAlign: "center",
            }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      <span style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--on-dark)", marginTop: 6 }}>
        {label}
      </span>
    </div>
  )
}

function Colon() {
  return (
    <span style={{
      fontFamily: "var(--serif)",
      fontSize: "clamp(36px,5vw,64px)",
      color: "rgba(196,159,114,.28)",
      lineHeight: 1,
      alignSelf: "flex-start",
      paddingTop: 4,
      userSelect: "none",
    }}>:</span>
  )
}

export default function CountdownTimer({ eventos = [] }: { eventos?: EventoItem[] }) {
  const [t, setT]       = useState({ d: 0, h: 0, m: 0, s: 0 })
  const [ready, setReady] = useState(false)

  // Próximo evento visible con fecha futura (el más cercano)
  const next = eventos
    .filter((ev) => ev.active && new Date(ev.datetime).getTime() > Date.now())
    .sort((a, b) => a.datetime.localeCompare(b.datetime))[0]

  useEffect(() => {
    if (!next) return
    const target = new Date(next.datetime).getTime()
    const calc = () => {
      const diff = Math.max(0, target - Date.now())
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000)  / 60000),
        s: Math.floor((diff % 60000)    / 1000),
      })
      setReady(true)
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [next?.datetime])

  if (!next || !ready) return null

  const f = fechaDisplay(next.datetime)
  const NEXT_EVENT = {
    title: next.title,
    subtitle: `${f.day} ${f.month} ${f.year} — ${next.location}`,
    spots: next.spots ? `${next.spots} plazas disponibles` : "Plazas limitadas",
  }

  return (
    <section style={{
      background: "var(--navy-2)",
      borderTop: "1px solid var(--line-d)",
      borderBottom: "1px solid var(--line-d)",
    }}>
      <div className="wrap" style={{ padding: "clamp(44px,6vw,72px) 36px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>

        {/* Etiqueta */}
        <motion.span
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ fontSize: 10, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 12 }}
        >
          ◎ Próximo evento
        </motion.span>

        {/* Título */}
        <motion.h2
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(18px,2.4vw,28px)", color: "var(--text)", marginBottom: 6, lineHeight: 1.2 }}
        >
          {NEXT_EVENT.title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.26 }}
          style={{ fontSize: 13, letterSpacing: ".06em", color: "var(--on-dark)", marginBottom: 36 }}
        >
          {NEXT_EVENT.subtitle}
        </motion.p>

        {/* Dígitos */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.32 }}
          style={{ display: "flex", alignItems: "flex-start", gap: "clamp(6px,1.5vw,20px)", marginBottom: 36 }}
        >
          <Digit value={String(t.d)} label="días" />
          <Colon />
          <Digit value={pad(t.h)} label="horas" />
          <Colon />
          <Digit value={pad(t.m)} label="min" />
          <Colon />
          <Digit value={pad(t.s)} label="seg" />
        </motion.div>

        {/* Disponibilidad + CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}
        >
          <span style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "#A76D61" }}>
            ⚡ {NEXT_EVENT.spots}
          </span>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/contacto" className="btn solid">Reservar lugar →</Link>
            <Link href="/eventos" className="btn">Ver todos los eventos</Link>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
