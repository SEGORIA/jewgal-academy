"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const COUNTRIES = [
  {
    id: "argentina",
    label: "Argentina",
    flag: "🇦🇷",
    top: "67%", left: "28%",
    years: "1984 – 2005",
    tagline: "Los orígenes del método",
    desc: "En Buenos Aires nació el método Jewgal y comenzaron los primeros procesos de Life Coaching. Formó las primeras comunidades de bienestar y sentó las bases de su filosofía integrativa que hoy llega a todo el mundo.",
    accent: "#A58D66",
    stat: "20+",
    statLabel: "años de práctica",
  },
  {
    id: "israel",
    label: "Israel",
    flag: "🇮🇱",
    top: "34%", left: "57%",
    years: "Formación continua",
    tagline: "La sabiduría de la Cábala",
    desc: "En Jerusalén y Tel Aviv profundizó sus estudios de Cábala aplicada y pensamiento judío, integrando esta sabiduría milenaria como herramienta de coaching y transformación personal consciente.",
    accent: "#A76D61",
    stat: "∞",
    statLabel: "sabiduría ancestral",
  },
  {
    id: "colombia",
    label: "Colombia",
    flag: "🇨🇴",
    top: "53%", left: "25%",
    years: "2005 – 2015",
    tagline: "Expansión latinoamericana",
    desc: "Desde Bogotá y Medellín formó a cientos de instructores Jewgal y Life Coaches certificados. Colombia se convirtió en el corazón de su red latinoamericana de bienestar y transformación.",
    accent: "#6BBF8E",
    stat: "200+",
    statLabel: "instructores formados",
  },
  {
    id: "eeuu",
    label: "EE.UU.",
    flag: "🇺🇸",
    top: "32%", left: "19%",
    years: "2015 – presente",
    tagline: "Miami · Sede internacional",
    desc: "Desde Miami lidera programas en línea con alcance global, fundó la organización 501c3 Sholem Corazón Valiente y creó Jewgal Academy para acompañar la transformación de estudiantes en todo el mundo.",
    accent: "#C49F72",
    stat: "4",
    statLabel: "continentes alcanzados",
  },
]

export default function ComunidadMap() {
  const [active, setActive] = useState(COUNTRIES[3]) // EE.UU. default

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 32,
      alignItems: "stretch",
    }}>

      {/* ── MAPA IZQUIERDA ── */}
      <div style={{
        position: "relative",
        borderRadius: 18,
        border: "1px solid rgba(165,141,102,.18)",
        background: "rgba(255,255,255,.025)",
        backdropFilter: "blur(4px)",
        overflow: "hidden",
        minHeight: 340,
      }}>
        {/* Grid de puntos decorativo */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: .18 }} aria-hidden>
          <defs>
            <pattern id="dots" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#A58D66" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        {/* Siluetas de continentes simplificadas */}
        <svg viewBox="0 0 500 320" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: .12 }} aria-hidden>
          {/* América del Norte */}
          <path d="M60 30 C70 20 130 25 150 55 C165 80 155 110 140 130 C125 150 110 155 100 170 C90 185 85 195 75 190 C55 180 40 155 35 130 C28 100 35 55 60 30Z" fill="#A76D61" />
          {/* América del Sur */}
          <path d="M95 200 C105 195 135 200 145 220 C158 245 155 280 140 300 C125 318 105 318 90 300 C75 280 72 245 85 220 C90 210 90 205 95 200Z" fill="#A76D61" />
          {/* Europa */}
          <path d="M230 30 C245 22 275 25 285 45 C295 65 285 85 270 95 C255 105 240 100 232 88 C220 72 218 48 230 30Z" fill="#A76D61" />
          {/* Oriente Medio (Israel) */}
          <path d="M275 90 C285 85 300 88 308 100 C316 114 312 130 300 136 C288 142 276 135 270 122 C264 108 265 96 275 90Z" fill="#A76D61" />
          {/* África */}
          <path d="M230 110 C248 103 280 108 292 128 C310 155 308 200 295 228 C280 256 255 265 235 255 C215 245 200 220 196 195 C190 165 195 135 210 118 C218 111 224 113 230 110Z" fill="#A76D61" />
          {/* Asia */}
          <path d="M305 30 C340 20 420 30 450 60 C475 88 470 140 445 165 C415 192 370 195 340 178 C310 162 295 135 296 105 C297 75 300 38 305 30Z" fill="#A76D61" />
        </svg>

        {/* Líneas conectoras entre países activos */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} aria-hidden>
          {COUNTRIES.map((c) => {
            if (c.id === active.id) return null
            const x1 = parseFloat(active.left)
            const y1 = parseFloat(active.top)
            const x2 = parseFloat(c.left)
            const y2 = parseFloat(c.top)
            return (
              <motion.line
                key={c.id}
                x1={`${x1}%`} y1={`${y1}%`}
                x2={`${x2}%`} y2={`${y2}%`}
                stroke={active.accent}
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity={0.3}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.3 }}
                transition={{ duration: 0.6 }}
              />
            )
          })}
        </svg>

        {/* Puntos de países */}
        {COUNTRIES.map((c) => {
          const isActive = c.id === active.id
          return (
            <button
              key={c.id}
              onClick={() => setActive(c)}
              title={c.label}
              style={{
                position: "absolute",
                top: c.top, left: c.left,
                transform: "translate(-50%,-50%)",
                background: "none", border: "none",
                cursor: "pointer", padding: 0,
                zIndex: 10,
              }}
            >
              {/* Anillo pulsante cuando está activo */}
              {isActive && (
                <motion.span
                  style={{
                    position: "absolute", inset: -12, borderRadius: "50%",
                    border: `1.5px solid ${c.accent}`,
                  }}
                  animate={{ scale: [1, 1.5, 1], opacity: [.6, 0, .6] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
              )}
              {/* Dot principal */}
              <motion.span
                animate={{
                  width:  isActive ? 16 : 10,
                  height: isActive ? 16 : 10,
                  background: isActive ? c.accent : "rgba(165,141,102,.45)",
                  boxShadow: isActive ? `0 0 16px ${c.accent}88` : "none",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                style={{ display: "block", borderRadius: "50%" }}
              />
              {/* Label flotante */}
              <motion.span
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: isActive ? 1 : 0, y: isActive ? -22 : -14 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: "absolute", bottom: "100%", left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: 10, fontWeight: 700, letterSpacing: ".1em",
                  textTransform: "uppercase", whiteSpace: "nowrap",
                  color: c.accent, pointerEvents: "none",
                  textShadow: "0 1px 6px rgba(0,0,0,.8)",
                  marginBottom: 6,
                }}
              >
                {c.flag} {c.label}
              </motion.span>
            </button>
          )
        })}

        {/* Hint inicial */}
        <p style={{
          position: "absolute", bottom: 14, left: 0, right: 0,
          textAlign: "center", fontSize: 10, letterSpacing: ".14em",
          textTransform: "uppercase", color: "rgba(165,141,102,.35)",
          pointerEvents: "none",
        }}>
          Seleccioná un país
        </p>
      </div>

      {/* ── PANEL DERECHA ── */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 0 }}>
        {/* Stat grande */}
        <div style={{ marginBottom: 8 }}>
          <span style={{
            fontSize: 64, fontWeight: 700, lineHeight: 1,
            fontFamily: "var(--serif,Georgia,serif)",
            color: active.accent,
            display: "block",
          }}>
            40+
          </span>
          <span style={{
            fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase",
            color: "var(--text-faint)",
          }}>
            Años transformando vidas en 4 países
          </span>
        </div>

        <h3 style={{
          fontFamily: "var(--serif,Georgia,serif)", fontWeight: 500,
          fontSize: 30, color: "var(--text)", lineHeight: 1.25,
          marginBottom: 16,
        }}>
          Una trayectoria que trasciende fronteras
        </h3>

        {/* Contenido por país con animación */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{
              borderLeft: `3px solid ${active.accent}`,
              paddingLeft: 16,
              marginBottom: 20,
            }}>
              <span style={{
                fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase",
                color: active.accent, display: "block", marginBottom: 4,
              }}>
                {active.flag} {active.label} · {active.years}
              </span>
              <p style={{
                fontSize: 15, fontWeight: 600, color: "var(--text)",
                marginBottom: 8,
              }}>
                {active.tagline}
              </p>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.75 }}>
                {active.desc}
              </p>
            </div>

            {/* Stat del país */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: `${active.accent}14`,
              border: `1px solid ${active.accent}30`,
              borderRadius: 10, padding: "8px 16px",
            }}>
              <span style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--serif)", color: active.accent }}>
                {active.stat}
              </span>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {active.statLabel}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Tabs de países */}
        <div style={{ display: "flex", gap: 8, marginTop: 28, flexWrap: "wrap" }}>
          {COUNTRIES.map((c) => {
            const isActive = c.id === active.id
            return (
              <motion.button
                key={c.id}
                onClick={() => setActive(c)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", borderRadius: 24,
                  border: `1.5px solid ${isActive ? c.accent : "rgba(165,141,102,.18)"}`,
                  background: isActive ? `${c.accent}18` : "transparent",
                  color: isActive ? c.accent : "var(--text-faint)",
                  fontSize: 12, fontWeight: isActive ? 700 : 400,
                  cursor: "pointer", transition: "all .2s",
                  letterSpacing: ".06em",
                }}
              >
                <span>{c.flag}</span> {c.label}
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
