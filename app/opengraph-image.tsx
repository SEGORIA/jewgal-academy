import { ImageResponse } from "next/og"

export const alt = "Jewgal Academy – Devora Benchimol, Master Coach Internacional"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

/** Imagen Open Graph generada dinámicamente con la identidad de marca. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 90px",
          background:
            "radial-gradient(ellipse 70% 55% at 78% 30%, rgba(75,126,140,0.35), transparent 60%), linear-gradient(135deg, #06181f 0%, #0a2d3a 52%, #081e29 100%)",
          color: "#eef4f4",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            color: "#c9a86a",
            fontSize: 26,
            letterSpacing: 8,
            marginBottom: 28,
          }}
        >
          TRANSFORMACIÓN CONSCIENTE
        </div>
        <div style={{ display: "flex", fontSize: 98, fontWeight: 600, lineHeight: 1.02, marginBottom: 26 }}>
          Jewgal Academy
        </div>
        <div style={{ display: "flex", fontSize: 38, color: "#9fb8bd" }}>
          Devora Benchimol · Master Coach Internacional
        </div>
        <div style={{ display: "flex", width: 150, height: 4, background: "#c9a86a", marginTop: 46 }} />
      </div>
    ),
    { ...size }
  )
}
