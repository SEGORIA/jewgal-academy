import { ImageResponse } from "next/og"
import { readFileSync } from "fs"
import { join } from "path"

export const alt = "Jewgal Academy – Devora Benchimol, Master Coach Internacional"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const runtime = "nodejs"

const TITLE = "Jewgal Academy"

async function loadGoogleFont(text: string) {
  const url = `https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&text=${encodeURIComponent(text)}`
  const css = await (await fetch(url)).text()
  const match = css.match(/src: url\(([^)]+)\) format\('(?:opentype|truetype)'\)/)
  if (!match) throw new Error("No se pudo cargar la fuente Cormorant Garamond")
  const res = await fetch(match[1])
  return res.arrayBuffer()
}

/** Imagen Open Graph generada dinámicamente con la identidad de marca. */
export default async function OpengraphImage() {
  const photoData = readFileSync(join(process.cwd(), "public/brand/og-devora.jpg")).toString("base64")
  const logoData = readFileSync(join(process.cwd(), "public/brand/og-logo.png")).toString("base64")
  const serifFont = await loadGoogleFont(TITLE)

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#1a0f08",
          color: "#F6F1E7",
          fontFamily: "sans-serif",
        }}
      >
        {/* Foto de Devora, a sangre a la derecha */}
        <img
          src={`data:image/jpeg;base64,${photoData}`}
          width={560}
          height={630}
          style={{ position: "absolute", top: 0, right: 0, objectFit: "cover" }}
        />

        {/* Overlay: opaco bajo el texto, transparente sobre la foto — el corte queda antes del borde de la foto */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "linear-gradient(100deg, #1a0f08 0%, #1a0f08 54%, rgba(26,15,8,.75) 62%, rgba(26,15,8,0) 70%)",
          }}
        />

        {/* Halo de marca */}
        <div
          style={{
            position: "absolute",
            top: "-25%",
            left: "-10%",
            width: 560,
            height: 560,
            display: "flex",
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(167,109,97,.28), transparent 70%)",
          }}
        />

        {/* Contenido */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "70px 0 70px 80px",
            width: 540,
          }}
        >
          <img
            src={`data:image/png;base64,${logoData}`}
            width={50}
            height={50}
            style={{ display: "flex", marginBottom: 28, opacity: 0.92 }}
          />
          <div style={{ display: "flex", color: "#c9a86a", fontSize: 19, letterSpacing: 3, marginBottom: 22 }}>
            SABIDURÍA PARA VIVIR · LIDERAZGO PARA TRANSFORMAR
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Cormorant Garamond",
              fontWeight: 600,
              fontSize: 100,
              lineHeight: 1.02,
              marginBottom: 24,
            }}
          >
            {TITLE}
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#D8B98C", lineHeight: 1.3 }}>
            Devora Benchimol · Master Coach Internacional
          </div>
          <div style={{ display: "flex", width: 140, height: 4, background: "#c9a86a", marginTop: 40 }} />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Cormorant Garamond", data: serifFont, weight: 600, style: "normal" }],
    }
  )
}
