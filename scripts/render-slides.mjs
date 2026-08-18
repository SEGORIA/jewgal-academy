// Genera diapositivas nuevas, con la identidad visual de Jewgal, a partir
// del texto REAL extraído de las 6 presentaciones PPTX que no se pudieron
// convertir a imagen por un límite de PowerPoint COM en este entorno (ver
// investigación en la conversación). No es una copia píxel a píxel del
// diseño original — es contenido real re-maquetado, aprobado por el
// usuario como alternativa.
import sharp from "sharp"
import { readFileSync, mkdirSync } from "fs"
import { join } from "path"

const CREAM = "#F6F1E7"
const CAFE = "#4A2E1F"
const CAFE_TEXT = "#5C4430"
const GOLD = "#C49F72"
const TERRACOTA = "#A76D61"

const W = 1600, H = 900

const MODULE_TITLES = {
  1: "Introducción al Coaching",
  3: "Logoterapia",
  4: "Coaching y Mindfulness",
  5: "El Arte de Preguntar",
  6: "Diseño de Programas TCC",
  7: "Método Sholem",
}

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

// Envuelve texto en líneas según un ancho de caracteres aproximado (fuente
// no-monoespaciada — 0.55 es un factor empírico razonable para Georgia/Arial).
function wrapText(text, maxCharsPerLine) {
  const words = text.split(" ")
  const lines = []
  let current = ""
  for (const w of words) {
    const candidate = current ? `${current} ${w}` : w
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current)
      current = w
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)
  return lines
}

function renderSlide({ kicker, title, items }, { moduleNumber, slideIndex, totalSlides, isTitleSlide }) {
  const parts = []
  parts.push(`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`)
  parts.push(`<rect width="${W}" height="${H}" fill="${CREAM}"/>`)
  // barra superior dorada
  parts.push(`<rect x="0" y="0" width="${W}" height="10" fill="${GOLD}"/>`)

  if (isTitleSlide) {
    // Portada del módulo: centrada, con eyebrow + título grande + subtítulo
    parts.push(`<text x="${W/2}" y="360" text-anchor="middle" font-family="Georgia, serif" font-size="22" letter-spacing="6" fill="${GOLD}">${esc(kicker || "PROGRAMA DE LIFE COACH INTEGRATIVO")}</text>`)
    const titleLines = wrapText(title || MODULE_TITLES[moduleNumber] || "", 26)
    let ty = 440
    for (const line of titleLines) {
      parts.push(`<text x="${W/2}" y="${ty}" text-anchor="middle" font-family="Georgia, serif" font-size="64" font-weight="bold" fill="${CAFE}">${esc(line)}</text>`)
      ty += 74
    }
    if (items?.length) {
      const subtitle = items.filter(i => i.length > 15).slice(0, 1)[0] || items[0]
      parts.push(`<text x="${W/2}" y="${ty + 30}" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="${TERRACOTA}">${esc(subtitle)}</text>`)
    }
    parts.push(`<line x1="${W/2-60}" y1="${ty+70}" x2="${W/2+60}" y2="${ty+70}" stroke="${GOLD}" stroke-width="3"/>`)
    parts.push(`<text x="${W/2}" y="${H-50}" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="${TERRACOTA}">Jewgal Academy · Módulo ${moduleNumber}</text>`)
  } else {
    // Diapositiva de contenido: eyebrow + título arriba, lista de items abajo
    if (kicker) {
      parts.push(`<text x="90" y="90" font-family="Arial, sans-serif" font-size="18" letter-spacing="4" fill="${GOLD}" font-weight="bold">${esc(kicker.toUpperCase())}</text>`)
    }
    const titleLines = wrapText(title || "", 44)
    let ty = 150
    for (const line of titleLines.slice(0, 2)) {
      parts.push(`<text x="90" y="${ty}" font-family="Georgia, serif" font-size="40" font-weight="bold" fill="${CAFE}">${esc(line)}</text>`)
      ty += 50
    }
    parts.push(`<line x1="90" y1="${ty+10}" x2="160" y2="${ty+10}" stroke="${GOLD}" stroke-width="4"/>`)

    const list = (items || []).filter(Boolean).slice(0, 11)
    // tamaño de fuente dinámico según cantidad de ítems
    const fontSize = list.length <= 4 ? 26 : list.length <= 6 ? 22 : list.length <= 8 ? 19 : list.length <= 10 ? 16 : 14
    const lineGap = fontSize + 14
    const maxChars = Math.floor(1350 / (fontSize * 0.58))
    let iy = ty + 70
    for (const item of list) {
      const lines = wrapText(item, maxChars)
      parts.push(`<circle cx="100" cy="${iy - fontSize * 0.35}" r="4" fill="${TERRACOTA}"/>`)
      for (const [idx, line] of lines.entries()) {
        parts.push(`<text x="122" y="${iy}" font-family="Arial, sans-serif" font-size="${fontSize}" fill="${CAFE_TEXT}">${esc(line)}</text>`)
        iy += lineGap
      }
      iy += 6
      if (iy > H - 70) break
    }
    parts.push(`<text x="${W-90}" y="${H-40}" text-anchor="end" font-family="Arial, sans-serif" font-size="14" fill="${TERRACOTA}">Módulo ${moduleNumber} · ${slideIndex}/${totalSlides}</text>`)
  }

  parts.push(`</svg>`)
  return parts.join("")
}

async function main() {
  const data = JSON.parse(readFileSync(process.argv[2], "utf-8"))
  const outRoot = process.argv[3]

  for (const [moduleNumber, slides] of Object.entries(data)) {
    const outDir = join(outRoot, `m${moduleNumber}`)
    mkdirSync(outDir, { recursive: true })
    for (let i = 0; i < slides.length; i++) {
      const svg = renderSlide(slides[i], {
        moduleNumber,
        slideIndex: i + 1,
        totalSlides: slides.length,
        isTitleSlide: i === 0,
      })
      const outPath = join(outDir, `slide-${String(i + 1).padStart(2, "0")}.png`)
      await sharp(Buffer.from(svg)).png().toFile(outPath)
    }
    console.log(`✓ Módulo ${moduleNumber}: ${slides.length} diapositivas renderizadas`)
  }
}

main()
