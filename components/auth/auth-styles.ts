import type { CSSProperties } from "react"

/** Estilos compartidos por las pantallas de acceso (recuperar y restablecer contraseña). */
export const authLabel: CSSProperties = { display: "block", fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 9 }
export const authInput: CSSProperties = {
  width: "100%", border: "1.5px solid var(--line-d)", borderRadius: 12, padding: "14px 16px", fontSize: 15, color: "var(--text)",
  outline: "none", background: "var(--surface-2)", fontFamily: "inherit",
}
export const authTitle: CSSProperties = { fontFamily: "var(--serif)", fontSize: 32, fontWeight: 500, color: "var(--text)", lineHeight: 1.1, marginBottom: 8 }
export const authText: CSSProperties = { color: "var(--text-muted)", fontSize: 15, lineHeight: 1.6, marginBottom: 26 }
export const authButton: CSSProperties = {
  width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, padding: "15px 0", borderRadius: 12, border: "none",
  background: "var(--gold)", color: "#2C1F14", fontSize: 13, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit",
}
export const authLink: CSSProperties = { color: "var(--gold-ink)", fontSize: 14, textDecoration: "none" }
export const authError: CSSProperties = { background: "rgba(220,38,38,.12)", border: "1px solid rgba(220,38,38,.35)", color: "var(--danger)", borderRadius: 10, padding: "12px 16px", fontSize: 14, marginBottom: 20 }
