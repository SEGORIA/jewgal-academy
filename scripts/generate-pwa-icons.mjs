import sharp from "sharp"
import pngToIco from "png-to-ico"
import { mkdirSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")
// El ícono cuadrado (logo completo) es ilegible a tamaño de favicon/app icon —
// se usa la marca "J" sola, recortada a su contenido real antes de encajarla
// en cada tamaño, para que ocupe el cuadro en vez de perderse en el margen
// transparente del archivo original.
const src = join(root, "public", "brand", "logo-icono.png")
const out = join(root, "public", "icons")
const CREAM = { r: 246, g: 241, b: 231, alpha: 1 }

mkdirSync(out, { recursive: true })

const trimmed = await sharp(src).trim().toBuffer()
const trimmedMeta = await sharp(trimmed).metadata()

// La J recortada es más alta que ancha (560×701) — encajada entera con
// "contain" dentro de un cuadrado deja barras color crema visibles a los
// costados. El usuario pidió específicamente cero barras, así que acá se
// usa "cover": llena el cuadrado por completo, recortando el sobrante de
// arriba/abajo del gancho y la cola. Solo aplica a favicon/icon-192/
// icon-512 — los íconos con padding (maskable/apple-touch) ya reservan ese
// margen a propósito por la máscara de cada plataforma y no tienen el
// problema de las barras.
// "cover" con gravedad "top" en vez de centrada: la J recortada es más alta
// que ancha, así que "cover" tiene que recortar arriba/abajo para llenar el
// cuadrado sin barras. Con gravedad centrada eso recorta el gancho de
// arriba Y la cola de abajo por igual, dejando un ícono irreconocible (solo
// el trazo vertical + la chispa). Con gravedad "top" se conserva el gancho
// completo (el rasgo que hace reconocible la J) y solo se recorta la punta
// de la cola de abajo — se probaron ambas y se comparó visualmente.
const icons = [
  { name: "icon-192.png",         size: 192, padding: 0,    source: trimmed, fit: "cover",   position: "top" },
  { name: "icon-512.png",         size: 512, padding: 0,    source: trimmed, fit: "cover",   position: "top" },
  { name: "icon-maskable-192.png",size: 192, padding: 0.1,  source: trimmed, fit: "contain" },
  { name: "icon-maskable-512.png",size: 512, padding: 0.1,  source: trimmed, fit: "contain" },
  { name: "apple-touch-icon.png", size: 180, padding: 0.05, source: trimmed, fit: "contain" },
]

for (const { name, size, padding, source, fit, position } of icons) {
  const inner = Math.round(size * (1 - padding * 2))
  await sharp(source)
    .resize(inner, inner, { fit, position, background: CREAM })
    .extend({
      top:    Math.floor((size - inner) / 2),
      bottom: Math.ceil( (size - inner) / 2),
      left:   Math.floor((size - inner) / 2),
      right:  Math.ceil( (size - inner) / 2),
      background: CREAM,
    })
    .png()
    .toFile(join(out, name))
  console.log(`✓ ${name} (${size}x${size})`)
}

// favicon.ico: multi-resolución (16/32/48), mismo cover+top que icon-192/512.
const faviconSizes = [16, 32, 48]
const faviconPngs = await Promise.all(
  faviconSizes.map((size) =>
    sharp(trimmed).resize(size, size, { fit: "cover", position: "top", background: CREAM }).png().toBuffer()
  )
)
const icoBuffer = await pngToIco(faviconPngs)
writeFileSync(join(root, "app", "favicon.ico"), icoBuffer)
console.log(`✓ app/favicon.ico (${faviconSizes.join("/")})`)

console.log("Íconos generados a partir de logo-icono.png")
