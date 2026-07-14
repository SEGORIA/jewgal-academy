import sharp from "sharp"
import { mkdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")
const src = join(root, "public", "brand", "logo-cuadrado.png")
const out = join(root, "public", "icons")

mkdirSync(out, { recursive: true })

const icons = [
  { name: "icon-192.png",         size: 192, padding: 0    },
  { name: "icon-512.png",         size: 512, padding: 0    },
  { name: "icon-maskable-192.png",size: 192, padding: 0.1  },
  { name: "icon-maskable-512.png",size: 512, padding: 0.1  },
  { name: "apple-touch-icon.png", size: 180, padding: 0.05 },
]

for (const { name, size, padding } of icons) {
  const inner = Math.round(size * (1 - padding * 2))
  await sharp(src)
    .resize(inner, inner, { fit: "contain", background: { r: 246, g: 241, b: 231, alpha: 1 } })
    .extend({
      top:    Math.floor((size - inner) / 2),
      bottom: Math.ceil( (size - inner) / 2),
      left:   Math.floor((size - inner) / 2),
      right:  Math.ceil( (size - inner) / 2),
      background: { r: 246, g: 241, b: 231, alpha: 1 },
    })
    .png()
    .toFile(join(out, name))
  console.log(`✓ ${name} (${size}x${size})`)
}
console.log("PWA icons generated in public/icons/")
