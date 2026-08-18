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

// La marca completa es "J" + chispa + una "g" chica entrelazada (560×701,
// más alta que ancha). A favicon/app-icon size esa "g" y la chispa se
// vuelven ruido ilegible, y como el conjunto no es cuadrado, cualquier
// "cover" recorta una de las dos puntas (el gancho de arriba o la cola de
// abajo de la J) dejando un ícono irreconocible — eso es lo que se veía
// roto en la pestaña del navegador. La solución no es un mejor recorte:
// es usar solo la J (el trazo reconocible del monograma) para los tamaños
// chicos, con "contain" en vez de "cover" — así nunca se amputa el glifo,
// solo se lo escala. 325px de ancho midieron el borde real del gancho de
// la J en el archivo fuente (logo-icono.png) sin tocar la chispa/"g" de al
// lado — si el logo fuente cambia, hay que volver a medir este valor.
const jOnly = await sharp(trimmed).extract({ left: 0, top: 0, width: 325, height: 701 }).toBuffer()

const icons = [
  // Sin padding entre paréntesis: iconos chicos/sin máscara — deben leerse
  // solos de lejos, así que usan solo la J con "contain" (nunca se recorta).
  { name: "icon-192.png",         size: 192, padding: 0.06, source: jOnly,   fit: "contain" },
  { name: "icon-512.png",         size: 512, padding: 0.06, source: jOnly,   fit: "contain" },
  // Estos ya reservan margen por la máscara de cada plataforma — ahí la
  // marca completa (J + chispa + g) entra bien y no hace falta recortarla.
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

// favicon.ico: multi-resolución (16/32/48), misma J sola con "contain" —
// a 16px un "cover" recortado era directamente irreconocible.
const faviconSizes = [16, 32, 48]
const faviconPadding = 0.08
const faviconPngs = await Promise.all(
  faviconSizes.map((size) => {
    const inner = Math.round(size * (1 - faviconPadding * 2))
    return sharp(jOnly)
      .resize(inner, inner, { fit: "contain", background: CREAM })
      .extend({
        top: Math.floor((size - inner) / 2), bottom: Math.ceil((size - inner) / 2),
        left: Math.floor((size - inner) / 2), right: Math.ceil((size - inner) / 2),
        background: CREAM,
      })
      .png()
      .toBuffer()
  })
)
const icoBuffer = await pngToIco(faviconPngs)
writeFileSync(join(root, "app", "favicon.ico"), icoBuffer)
console.log(`✓ app/favicon.ico (${faviconSizes.join("/")})`)

console.log("Íconos generados a partir de logo-icono.png")
