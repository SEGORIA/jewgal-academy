"use client"

import { motion } from "framer-motion"
import { Printer, Moon, Sun } from "lucide-react"
import { VALUE_CARDS } from "@/lib/jewgalkids-content"

export default function ValueCards() {
  return (
    <div>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #jk-print-cards, #jk-print-cards * { visibility: visible; }
          #jk-print-cards { position: absolute; top: 0; left: 0; width: 100%; }
        }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <p style={{ color: "var(--text-muted)", fontSize: 14.5, lineHeight: 1.65, maxWidth: 560 }}>
          Los 10 valores universales del método, más "Sombrita" — la sombra que le impide a cada valor brillar del todo. Imprimilas para recortar y usar con los niños y niñas.
        </p>
        <button
          onClick={() => window.print()}
          style={{
            display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
            padding: "10px 20px", borderRadius: 10,
            background: "linear-gradient(135deg,#A76D61 0%,#C49F72 100%)",
            border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
            boxShadow: "0 8px 24px -8px rgba(167,109,97,.5)",
          }}
        >
          <Printer size={14} /> Imprimir tarjetas
        </button>
      </div>

      <div id="jk-print-cards" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: 14 }}>
        {VALUE_CARDS.map((v, i) => (
          <motion.div
            key={v.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.4 }}
            style={{
              borderRadius: 14, padding: "22px 18px",
              background: v.bg,
              border: `1.5px solid ${v.color}35`,
              display: "flex", flexDirection: "column", gap: 10,
              breakInside: "avoid",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: v.color, display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 4px 12px ${v.color}55`,
              }}>
                {v.isShadow ? <Moon size={15} color="#fff" /> : <Sun size={15} color="#fff" />}
              </div>
            </div>
            <h3 style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: 18, color: v.color }}>
              {v.name}
            </h3>
            <p style={{ fontSize: 12.5, lineHeight: 1.55, color: "#2A241C" }}>
              {v.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
