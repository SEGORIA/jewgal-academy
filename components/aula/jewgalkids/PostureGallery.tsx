"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Shuffle, X } from "lucide-react"
import { POSTURES, type Posture } from "@/lib/jewgalkids-content"

type Naming = "general" | "hebrew"

export default function PostureGallery() {
  const [naming, setNaming] = useState<Naming>("general")
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Posture | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return POSTURES
    return POSTURES.filter((p) =>
      p.nameGeneral.toLowerCase().includes(q) || p.nameHebrew.toLowerCase().includes(q)
    )
  }, [query])

  function randomPosture() {
    const pick = POSTURES[Math.floor(Math.random() * POSTURES.length)]
    setSelected(pick)
  }

  const nameOf = (p: Posture) => (naming === "general" ? p.nameGeneral : p.nameHebrew)
  const spiritualOf = (p: Posture) => (naming === "general" ? p.spiritualGeneral : p.spiritualHebrew)

  return (
    <div>
      <p style={{ color: "var(--text-muted)", fontSize: 14.5, lineHeight: 1.65, marginBottom: 24, maxWidth: 620 }}>
        Las 22 posturas del método, cada una con su mensaje espiritual. Elegí si querés verlas con nombres generales o con las letras del alefato hebreo.
      </p>

      {/* Controles */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface)", border: "1px solid rgba(165,141,102,.18)", borderRadius: 10, padding: "8px 14px", flex: "1 1 220px", maxWidth: 300 }}>
          <Search size={14} style={{ color: "var(--text-faint)", flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar postura…"
            style={{ border: "none", outline: "none", background: "transparent", fontSize: 13, color: "var(--text)", width: "100%" }}
          />
        </div>

        <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(165,141,102,.25)" }}>
          {(["general", "hebrew"] as const).map((n) => (
            <button
              key={n}
              onClick={() => setNaming(n)}
              style={{
                padding: "8px 16px", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
                background: naming === n ? "var(--gold)" : "transparent",
                color: naming === n ? "#fff" : "var(--text-muted)",
              }}
            >
              {n === "general" ? "General" : "Hebreo"}
            </button>
          ))}
        </div>

        <button
          onClick={randomPosture}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "9px 16px", borderRadius: 10,
            border: "1px solid rgba(165,141,102,.25)", background: "transparent",
            color: "var(--gold)", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
          }}
        >
          <Shuffle size={13} /> Postura al azar
        </button>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12 }}>
        {filtered.map((p) => (
          <motion.button
            key={p.id}
            onClick={() => setSelected(p)}
            whileHover={{ y: -3 }}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
              padding: "20px 14px", borderRadius: 12,
              background: "var(--surface)", border: "1px solid rgba(165,141,102,.14)",
              cursor: "pointer", textAlign: "center", transition: "border-color .2s, box-shadow .2s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(165,141,102,.35)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(165,141,102,.1)" }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(165,141,102,.14)"; (e.currentTarget as HTMLElement).style.boxShadow = "none" }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "linear-gradient(135deg,#A76D61 0%,#C49F72 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0,
            }}>
              {String(p.order).padStart(2, "0")}
            </div>
            <span style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 14.5, color: "var(--text)", lineHeight: 1.2 }}>
              {nameOf(p)}
            </span>
          </motion.button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ color: "var(--text-dim)", fontSize: 13.5, padding: "24px 0", textAlign: "center" }}>
          No se encontraron posturas con ese nombre.
        </p>
      )}

      {/* Modal de detalle */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            style={{
              position: "fixed", inset: 0, zIndex: 80, background: "var(--scrim)", backdropFilter: "blur(6px)",
              display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "relative",
                width: "min(560px, 92vw)", maxHeight: "84vh", overflowY: "auto",
                background: "var(--surface-solid)", border: "1px solid rgba(165,141,102,.2)",
                borderRadius: 16, boxShadow: "0 30px 80px rgba(0,0,0,.4)", padding: "32px 30px",
              }}
            >
              <button
                onClick={() => setSelected(null)}
                aria-label="Cerrar"
                style={{
                  position: "absolute", top: 18, right: 18,
                  width: 34, height: 34, borderRadius: "50%",
                  background: "var(--bg-3)", border: "1px solid rgba(165,141,102,.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--text-muted)", cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: "linear-gradient(135deg,#A76D61 0%,#C49F72 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 15, fontWeight: 700, flexShrink: 0,
                }}>
                  {String(selected.order).padStart(2, "0")}
                </div>
                <div>
                  <span style={{ fontSize: 10.5, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: 3 }}>
                    Postura {naming === "hebrew" ? "· alefato hebreo" : "· versión general"}
                  </span>
                  <h3 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 26, color: "var(--text)" }}>
                    {nameOf(selected)}
                  </h3>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>Instrucciones</p>
                <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.7 }}>{selected.instructions}</p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>Variaciones</p>
                <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.7 }}>{selected.variations}</p>
              </div>

              <div style={{
                background: "rgba(165,141,102,.08)", border: "1px solid rgba(165,141,102,.18)",
                borderRadius: 10, padding: "16px 18px",
              }}>
                <p style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>Mensaje espiritual</p>
                <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--text)", fontSize: 15.5, lineHeight: 1.6 }}>
                  {spiritualOf(selected)}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
