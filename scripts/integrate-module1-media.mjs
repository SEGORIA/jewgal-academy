// Integra el paquete multimedia del Módulo 1 de Life Coaching Integrativo:
//   · 24 clips de video narrados (uno por diapositiva)  → video héroe + grilla "Contenido de la unidad" en cada unidad
//   · 24 diapositivas (el PDF del módulo, 1600×900)      → "Presentación — Módulo 1" (con los clips de introducción)
//
// Uso (desde la carpeta jewgal-academy):
//   node scripts/integrate-module1-media.mjs --dry            # simula: valida la estructura, no sube ni escribe nada
//   node scripts/integrate-module1-media.mjs                  # sube a Cloudinary y escribe en la base
//   node scripts/integrate-module1-media.mjs --skip-icf       # omite los clips/diapositivas que hablan de ICF
//
// Requiere en .env.local: CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET (Cloudinary → Settings → API Keys).
// Es idempotente: si se corre de nuevo, reemplaza los bloques de video/diapositivas que puso antes.
import { PrismaClient } from "@prisma/client"
import { v2 as cloudinary } from "cloudinary"
import { pathToFileURL } from "node:url"
import { readdirSync } from "node:fs"
import { join } from "node:path"
import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })
dotenv.config() // .env (no pisa lo ya cargado)

const DRY = process.argv.includes("--dry")
const SKIP_ICF = process.argv.includes("--skip-icf")
const arg = (name, fallback) => { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : fallback }
const CLIPS_DIR = arg("--clips", "C:\\Users\\sgriv\\Downloads\\Modulo 1 PROGRAMA DE LIFE COACH INTEGRATIVO")
const SLIDES_DIR = arg("--slides", "C:\\Users\\sgriv\\AppData\\Local\\Temp\\claude\\2c4754a5937021ec\\3181981c-8514-41d7-9394-cd6d3e730e6f\\scratchpad\\m1-slides")
const CLOUD = process.env.CLOUDINARY_CLOUD_NAME || "dotnmrvkz"

// n → título visible + duración (medida del propio archivo)
const CLIPS = {
  1: ["Introducción al módulo", "0:18"], 2: ["Contenido del módulo", "0:05"],
  3: ["Unidad 1 — Historia y orígenes del coaching", "0:10"], 4: ["Las raíces filosóficas: Sócrates y la mayéutica", "0:23"],
  5: ["Timothy Gallwey y The Inner Game", "0:14"], 6: ["Whitmore y Leonard", "0:12"], 7: ["Las escuelas actuales del coaching", "0:40"],
  8: ["Unidad 1 — Resumen de recursos", "0:05"],
  9: ["Unidad 2 — Fundamentos epistemológicos y ontológicos", "0:14"], 10: ["¿Qué es el coaching?", "0:05"],
  11: ["Ontología del lenguaje", "0:23"], 12: ["Unidad 2 — Resumen de recursos", "0:05"],
  13: ["Unidad 3 — Las competencias del coach", "0:08"], 14: ["Las competencias", "0:05"],
  15: ["La escucha en tres niveles", "0:17"], 16: ["Unidad 3 — Resumen de recursos", "0:05"],
  17: ["Unidad 4 — Ética y código deontológico", "0:21"], 18: ["Los principios éticos", "0:05"], 19: ["Dilemas éticos", "0:09"],
  20: ["Unidad 5 — El proceso de coaching", "0:11"], 21: ["Estructura de una sesión de coaching", "0:05"],
  22: ["El modelo GROW", "0:32"], 23: ["El modelo CLEAR", "0:05"], 24: ["Unidades 4 y 5 — Resumen de recursos", "0:05"],
}
// Unidad → clip héroe + clips de la grilla
const UNITS = {
  1: { hero: 3, grid: [4, 5, 6, 7, 8] },
  2: { hero: 9, grid: [10, 11, 12] },
  3: { hero: 13, grid: [14, 15, 16] },
  4: { hero: 17, grid: [18, 19, 24] },
  5: { hero: 20, grid: [21, 22, 23, 24] },
}
const INTRO = [1, 2]
// Diapositivas/clips cuyo texto menciona ICF (versión previa a la actualización GCF de Devora)
const ICF_SLIDES = new Set([2, 6, 8, 10, 13, 14, 16, 18, 24])
const keep = (n) => !(SKIP_ICF && ICF_SLIDES.has(n))

const clipFile = (n) => readdirSync(CLIPS_DIR).find((f) => f.toLowerCase().endsWith(".mp4") && parseInt(f, 10) === n)
const slideFile = (n) => join(SLIDES_DIR, `slide-${String(n).padStart(2, "0")}.png`)

// 1) Subida (o URLs simuladas en --dry)
const urls = { clips: {}, slides: {} }
if (DRY) {
  for (const n of Object.keys(CLIPS)) urls.clips[n] = `https://res.cloudinary.com/${CLOUD}/video/upload/v1/jewgal-lecciones-video/modulo-1/clip-${String(n).padStart(2, "0")}.mp4`
  for (let n = 1; n <= 24; n++) urls.slides[n] = `https://res.cloudinary.com/${CLOUD}/image/upload/v1/jewgal-slides/modulo-1-v2/slide-${String(n).padStart(2, "0")}.png`
} else {
  if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) { console.error("Faltan CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET en .env.local"); process.exit(1) }
  cloudinary.config({ cloud_name: CLOUD, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, secure: true })
  const jobs = []
  for (const n of Object.keys(CLIPS).map(Number).filter(keep)) {
    const f = clipFile(n); if (!f) throw new Error(`no encuentro el clip ${n}`)
    jobs.push(async () => { const r = await cloudinary.uploader.upload(join(CLIPS_DIR, f), { resource_type: "video", public_id: `jewgal-lecciones-video/modulo-1/clip-${String(n).padStart(2, "0")}`, overwrite: false }); urls.clips[n] = r.secure_url; console.log(`  ✓ clip ${n}`) })
  }
  for (let n = 1; n <= 24; n++) {
    if (!keep(n)) continue
    jobs.push(async () => { const r = await cloudinary.uploader.upload(slideFile(n), { resource_type: "image", public_id: `jewgal-slides/modulo-1-v2/slide-${String(n).padStart(2, "0")}`, overwrite: false }); urls.slides[n] = r.secure_url; console.log(`  ✓ diapositiva ${n}`) })
  }
  let next = 0
  await Promise.all(Array.from({ length: 3 }, async () => { while (next < jobs.length) await jobs[next++]() }))
}

// 2) Bloques
const poster = (u) => u.replace("/video/upload/", "/video/upload/so_1,w_960,c_fill,ar_16:9/").replace(/\.\w+$/, ".jpg")
const item = (n) => ({ title: CLIPS[n][0], durationLabel: CLIPS[n][1], provider: "cloudinary", url: urls.clips[n], posterUrl: poster(urls.clips[n]) })
const hero = (n) => ({ type: "video-cloudinary", url: urls.clips[n], posterUrl: poster(urls.clips[n]), caption: CLIPS[n][0] })
const grid = (title, ns) => { const items = ns.filter((n) => urls.clips[n]).map(item); return items.length ? { type: "video-grid", title, items } : null }
const MEDIA_TYPES = new Set(["video-cloudinary", "video-grid"])

const db = new PrismaClient()
const course = await db.course.findFirst({ where: { title: { contains: "Life Coaching" } } })
const mats = await db.material.findMany({ where: { courseId: course.id, moduleNumber: 1 } })
const updates = []

for (const [u, spec] of Object.entries(UNITS)) {
  const m = mats.find((x) => new RegExp(`^Unidad ${u}\\b`).test(x.title))
  if (!m) throw new Error(`no encuentro la Unidad ${u} del Módulo 1`)
  const blocks = JSON.parse(m.content).filter((b) => !MEDIA_TYPES.has(b.type))
  const media = []
  if (keep(spec.hero) && urls.clips[spec.hero]) media.push(hero(spec.hero))
  const g = grid("Contenido de la unidad", spec.grid.filter(keep)); if (g) media.push(g)
  // El video va justo después del primer párrafo de introducción (o al inicio si no hay)
  const at = blocks.findIndex((b) => b.type === "paragraph") + 1
  blocks.splice(at, 0, ...media)
  updates.push({ id: m.id, title: m.title, data: { content: JSON.stringify(blocks) } })
}

const pres = mats.find((x) => /^Presentaci/i.test(x.title))
{
  const slides = Array.from({ length: 24 }, (_, i) => i + 1).filter(keep).map((n) => urls.slides[n]).filter(Boolean)
  const blocks = []
  const g = grid("Introducción al módulo", INTRO.filter(keep)); if (g) blocks.push(g)
  if (slides.length) blocks.push({ type: "slides", images: slides })
  updates.push({ id: pres.id, title: pres.title, data: { content: JSON.stringify(blocks), isVisible: true, estimatedMinutes: 15 } })
}

// 3) Validar contra el esquema real (lo inválido no se mostraría al alumno)
const { contentBlockSchema } = await import(pathToFileURL(join(process.cwd(), "lib", "materials-content.ts")).href)
let bad = 0
for (const u of updates) for (const b of JSON.parse(u.data.content)) { const r = contentBlockSchema.safeParse(b); if (!r.success) { bad++; console.error("BLOQUE INVÁLIDO en", u.title, r.error.issues[0]) } }
console.log(`\nMódulo 1 — ${updates.length} materiales a actualizar${SKIP_ICF ? " (sin los clips/diapositivas ICF)" : ""}:`)
for (const u of updates) { const b = JSON.parse(u.data.content); console.log(` - ${u.title}: ${b.map((x) => x.type === "video-grid" ? `grilla(${x.items.length})` : x.type === "slides" ? `diapositivas(${x.images.length})` : x.type === "video-cloudinary" ? "héroe" : x.type).filter((t) => /grilla|diapositivas|héroe/.test(t)).join(", ")}`) }
if (bad) { console.error(`${bad} bloques inválidos — no se escribe nada`); process.exit(1) }
if (DRY) { console.log("\n(simulación: no se subió ni escribió nada)"); await db.$disconnect(); process.exit(0) }

await db.$transaction(updates.map((u) => db.material.update({ where: { id: u.id }, data: u.data })))
console.log("\nOK — Módulo 1 actualizado.")
await db.$disconnect()
