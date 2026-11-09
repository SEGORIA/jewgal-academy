// Genera el favicon y los iconos de la app a partir del monograma oficial (public/brand/logo-icono.png):
// la "J" de Jewgal con su estrella, en crema sobre un icono sólido terracota de marca.
// A tamaños chicos (pestaña del navegador) se engrosa el trazo para que se lea nítido.
//
// Uso (desde la carpeta jewgal-academy):   node scripts/generate-favicon.mjs
// Escribe: app/favicon.ico  y  public/icons/{icon-32,icon-192,icon-512,icon-maskable-192,icon-maskable-512,apple-touch-icon}.png
import sharp from "sharp"
import { writeFileSync, mkdirSync } from "node:fs"
import { join } from "node:path"

const ROOT = process.cwd()
const SRC = join(ROOT, "public", "brand", "logo-icono.png")
const OUT_ICONS = join(ROOT, "public", "icons")
const W = 1024 // lienzo de trabajo (se reduce con lanczos al tamaño final)

const BG_A = "#B47A6C", BG_B = "#8C5347" // degradé terracota (marca: Rosa Terracota #A76D61)
const CREAM = [251, 245, 234]
const STAR = [243, 222, 170]

// 1) Máscara del monograma: trazo oscuro sobre blanco → alfa
const { data: src, info } = await sharp(SRC).flatten({ background: "#ffffff" }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const sw = info.width, sh = info.height
const body = new Float32Array(sw * sh), star = new Float32Array(sw * sh)
for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
  const i = (y * sw + x) * 4
  const d = Math.max(255 - src[i], 255 - src[i + 1], 255 - src[i + 2])
  const a = d < 10 ? 0 : Math.min(1, d / 140)
  if (a === 0) continue
  // la estrella dorada: en la parte superior derecha del monograma
  const isStar = x > sw * 0.55 && x < sw * 0.66 && y > sh * 0.27 && y < sh * 0.40
  ;(isStar ? star : body)[y * sw + x] = a
}
// Componentes conexos del trazo: la "J" es el más alto; lo demás (la "g" del monograma) se descarta en la variante simple
const label = new Int32Array(sw * sh)
const comps = [] // { minY, maxY }
for (let s = 0; s < sw * sh; s++) {
  if (body[s] <= 0.25 || label[s]) continue
  const id = comps.length + 1, stack = [s]; label[s] = id
  let minY = sh, maxY = 0
  while (stack.length) {
    const p = stack.pop(), px = p % sw, py = (p - px) / sw
    minY = Math.min(minY, py); maxY = Math.max(maxY, py)
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = px + dx, ny = py + dy
      if (nx < 0 || ny < 0 || nx >= sw || ny >= sh) continue
      const q = ny * sw + nx
      if (body[q] > 0.25 && !label[q]) { label[q] = id; stack.push(q) }
    }
  }
  comps.push({ minY, maxY })
}
const jId = comps.reduce((best, c, i) => (c.maxY - c.minY > comps[best].maxY - comps[best].minY ? i : best), 0) + 1
const bodyJ = new Float32Array(sw * sh)
for (let i = 0; i < sw * sh; i++) if (label[i] === jId || (body[i] > 0 && !label[i] && nearJ(i))) bodyJ[i] = body[i]
// los bordes suaves (alfa bajo) no entran en el etiquetado: se heredan si lindan con la "J"
function nearJ(i) {
  const px = i % sw, py = (i - px) / sw
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
    const nx = px + dx, ny = py + dy
    if (nx >= 0 && ny >= 0 && nx < sw && ny < sh && label[ny * sw + nx] === jId) return true
  }
  return false
}
console.log(`componentes de trazo: ${comps.length}; "J" = #${jId}`)

// caja del dibujo (cuerpo + estrella) para cada variante
const boxOf = (b) => {
  let x0 = sw, y0 = sh, x1 = 0, y1 = 0
  for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
    if (b[y * sw + x] > 0.3 || star[y * sw + x] > 0.3) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y) }
  }
  return { x0, y0, gw: x1 - x0 + 1, gh: y1 - y0 + 1 }
}
const VARIANTS = { full: { body, ...boxOf(body) }, j: { body: bodyJ, ...boxOf(bodyJ) } }

// 2) Dilatación (engrosar el trazo) con ventana máxima separable
function dilate(a, w, h, r) {
  if (r <= 0) return a
  const tmp = new Float32Array(w * h), out = new Float32Array(w * h)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let m = 0; for (let k = Math.max(0, x - r); k <= Math.min(w - 1, x + r); k++) m = Math.max(m, a[y * w + k]); tmp[y * w + x] = m
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let m = 0; for (let k = Math.max(0, y - r); k <= Math.min(h - 1, y + r); k++) m = Math.max(m, tmp[k * w + x]); out[y * w + x] = m
  }
  return out
}

// 3) Tile con el monograma centrado. `glyph` = alto del dibujo como fracción del tile; `bold` = engrosado;
//    `variant` = "full" (J + g + estrella) o "j" (solo J + estrella, para tamaños de pestaña)
async function tile(size, { rounded, glyph, bold, variant = "full" }) {
  const { body, x0, y0, gw, gh } = VARIANTS[variant]
  const scale = (glyph * W) / gh
  const dw = Math.round(gw * scale), dh = Math.round(gh * scale)
  const ox = Math.round((W - dw) / 2), oy = Math.round((W - dh) / 2)
  const place = (mask) => {
    const crop = Buffer.alloc(gw * gh * 4)
    for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) crop[(y * gw + x) * 4 + 3] = Math.round(mask[(y0 + y) * sw + (x0 + x)] * 255)
    return sharp(crop, { raw: { width: gw, height: gh, channels: 4 } }).resize(dw, dh, { kernel: "lanczos3" }).raw().toBuffer()
  }
  const [bodyBuf, starBuf] = await Promise.all([place(body), place(star)])
  const bm = new Float32Array(W * W), sm = new Float32Array(W * W)
  for (let y = 0; y < dh; y++) for (let x = 0; x < dw; x++) {
    const j = (y * dw + x) * 4 + 3, k = (y + oy) * W + (x + ox)
    bm[k] = bodyBuf[j] / 255; sm[k] = starBuf[j] / 255
  }
  const r = Math.round(bold * dh)
  const B = dilate(bm, W, W, r), S = dilate(sm, W, W, Math.round(r * 1.1))
  const layer = Buffer.alloc(W * W * 4)
  for (let i = 0; i < W * W; i++) {
    const a = Math.max(B[i], S[i]), c = S[i] > B[i] ? STAR : CREAM
    layer[i * 4] = c[0]; layer[i * 4 + 1] = c[1]; layer[i * 4 + 2] = c[2]; layer[i * 4 + 3] = Math.round(a * 255)
  }
  const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${W}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${BG_A}"/><stop offset="1" stop-color="${BG_B}"/></linearGradient></defs><rect width="${W}" height="${W}" ${rounded ? `rx="${Math.round(W * 0.225)}"` : ""} fill="url(#g)"/></svg>`)
  // sharp aplica resize ANTES de composite, así que se compone a tamaño completo y luego se reduce
  const full = await sharp(bg).composite([{ input: layer, raw: { width: W, height: W, channels: 4 }, left: 0, top: 0 }]).png().toBuffer()
  return sharp(full).resize(size, size, { kernel: "lanczos3" }).png({ compressionLevel: 9 }).toBuffer()
}

const BOLD_SMALL = 0.034, BOLD_MID = 0.02, BOLD_BIG = 0.012
const files = {
  "icon-32.png": await tile(32, { rounded: true, glyph: 0.72, bold: BOLD_SMALL, variant: "j" }),
  "icon-192.png": await tile(192, { rounded: true, glyph: 0.66, bold: BOLD_MID }),
  "icon-512.png": await tile(512, { rounded: true, glyph: 0.66, bold: BOLD_BIG }),
  "icon-maskable-192.png": await tile(192, { rounded: false, glyph: 0.52, bold: BOLD_MID }),
  "icon-maskable-512.png": await tile(512, { rounded: false, glyph: 0.52, bold: BOLD_BIG }),
  "apple-touch-icon.png": await tile(180, { rounded: false, glyph: 0.6, bold: BOLD_MID }),
}
mkdirSync(OUT_ICONS, { recursive: true })
for (const [name, buf] of Object.entries(files)) writeFileSync(join(OUT_ICONS, name), buf)

// 4) favicon.ico con 16, 32 y 48 px (PNG dentro del contenedor ICO)
const ico = [16, 32, 48]
const pngs = await Promise.all(ico.map((s) => tile(s, { rounded: true, glyph: 0.74, bold: s <= 16 ? 0.04 : BOLD_SMALL, variant: "j" })))
const head = Buffer.alloc(6); head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(ico.length, 4)
let offset = 6 + 16 * ico.length
const dir = Buffer.concat(ico.map((s, i) => {
  const e = Buffer.alloc(16)
  e.writeUInt8(s, 0); e.writeUInt8(s, 1); e.writeUInt8(0, 2); e.writeUInt8(0, 3)
  e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(pngs[i].length, 8); e.writeUInt32LE(offset, 12)
  offset += pngs[i].length
  return e
}))
writeFileSync(join(ROOT, "app", "favicon.ico"), Buffer.concat([head, dir, ...pngs]))

console.log(`OK — monograma ${VARIANTS.full.gw}x${VARIANTS.full.gh}px (J sola: ${VARIANTS.j.gw}x${VARIANTS.j.gh}); iconos escritos en public/icons y app/favicon.ico (${ico.join("/")} px)`)
