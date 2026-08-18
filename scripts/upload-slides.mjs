// Sube todas las imágenes de diapositivas (module 2 = capturas reales del
// PPTX; 1,3,4,5,6,7 = diapositivas regeneradas con el texto real) a
// Cloudinary vía el endpoint firmado de producción, y crea/actualiza el
// material "Presentación — Módulo N" con un bloque slides por módulo.
import { PrismaClient } from "@prisma/client"
import { readFile, readdir } from "fs/promises"
import { join } from "path"

const prisma = new PrismaClient()
const BASE_URL = "https://jewgalacademy.com"
const COURSE_ID = "cmqlprwm60001x4enblc8k4yy"
const SLIDES_ROOT = "C:\\Users\\sgriv\\AppData\\Local\\Temp\\claude\\C--Users-sgriv-Documents-CLAUDE-JEWGAL-ACADEMY---DEBORA-BENCHIMOL\\41db3709-74ca-4621-b910-4474e027b3b0\\scratchpad\\slides"

const MODULE_TITLES = {
  1: "Introducción al Coaching",
  2: "Kabalá Coach",
  3: "Logoterapia",
  4: "Coaching y Mindfulness",
  5: "El Arte de Preguntar",
  6: "Diseño de Programas TCC",
  7: "Método Sholem",
}

function pickCookies(res) {
  const raw = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [res.headers.get("set-cookie")].filter(Boolean)
  return raw.map((c) => c.split(";")[0])
}

async function login() {
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`)
  const jar = new Map(pickCookies(csrfRes).map((c) => [c.split("=")[0], c]))
  const { csrfToken } = await csrfRes.json()
  const body = new URLSearchParams({ csrfToken, email: "admin@jewgalacademy.com", password: "admin123", json: "true" })
  const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", cookie: [...jar.values()].join("; ") },
    body,
    redirect: "manual",
  })
  for (const c of pickCookies(loginRes)) jar.set(c.split("=")[0], c)
  return [...jar.values()].join("; ")
}

async function getSignature(cookie, folder) {
  const res = await fetch(`${BASE_URL}/api/admin/cloudinary-signature`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ folder }),
  })
  if (!res.ok) throw new Error(`Firma falló (${res.status}): ${await res.text()}`)
  return res.json()
}

async function uploadPng(filePath, sig) {
  const buffer = await readFile(filePath)
  const form = new FormData()
  form.append("file", new Blob([buffer], { type: "image/png" }), filePath.split("\\").pop())
  form.append("api_key", sig.apiKey)
  form.append("timestamp", String(sig.timestamp))
  form.append("signature", sig.signature)
  form.append("folder", sig.folder)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`, { method: "POST", body: form })
  if (!res.ok) throw new Error(`Upload falló (${res.status}): ${await res.text()}`)
  const json = await res.json()
  return json.secure_url
}

async function main() {
  console.log("Iniciando sesión en producción…")
  const cookie = await login()

  for (let mod = 1; mod <= 7; mod++) {
    const dir = join(SLIDES_ROOT, `m${mod}`)
    const files = (await readdir(dir)).filter((f) => f.endsWith(".png")).sort()
    console.log(`\nMódulo ${mod}: ${files.length} diapositivas`)

    const urls = []
    for (const file of files) {
      const sig = await getSignature(cookie, `jewgal-slides/modulo-${mod}`)
      const url = await uploadPng(join(dir, file), sig)
      urls.push(url)
      process.stdout.write(".")
    }
    console.log(` ✓ subidas ${urls.length}`)

    const content = [{ type: "slides", images: urls }]

    const existing = await prisma.material.findFirst({
      where: { courseId: COURSE_ID, moduleNumber: mod, title: { startsWith: "Presentación" } },
    })

    if (existing) {
      await prisma.material.update({ where: { id: existing.id }, data: { content: JSON.stringify(content) } })
      console.log(`  ✓ Material actualizado: ${existing.title}`)
    } else {
      // se ubica justo después de la última "Unidad" del módulo (antes de
      // workbook/quiz/reflexión), empujando esos materiales +1 en su orden.
      const materials = await prisma.material.findMany({
        where: { courseId: COURSE_ID, moduleNumber: mod },
        orderBy: { order: "asc" },
      })
      const lastUnitIdx = materials.findLastIndex((m) => (m.groupLabel === "Unidades") || m.title.startsWith("Unidad") || m.title.startsWith("Herramienta"))
      const insertOrder = lastUnitIdx >= 0 ? materials[lastUnitIdx].order + 1 : 0

      for (const m of materials) {
        if (m.order >= insertOrder) {
          await prisma.material.update({ where: { id: m.id }, data: { order: m.order + 1 } })
        }
      }

      await prisma.material.create({
        data: {
          courseId: COURSE_ID,
          moduleNumber: mod,
          order: insertOrder,
          title: `Presentación — Módulo ${mod}`,
          description: `Diapositivas de ${MODULE_TITLES[mod]}, navegables.`,
          type: "lesson",
          groupLabel: "Unidades",
          estimatedMinutes: 15,
          content: JSON.stringify(content),
        },
      })
      console.log(`  ✓ Material creado: Presentación — Módulo ${mod}`)
    }
  }

  console.log("\nListo — las 7 presentaciones están cargadas.")
}

main().catch((err) => { console.error(err); process.exitCode = 1 }).finally(() => prisma.$disconnect())
