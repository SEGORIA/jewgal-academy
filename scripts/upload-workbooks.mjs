// Sube los 7 PDF de Workbook reales a Cloudinary (vía el endpoint firmado de
// producción, ya que las credenciales de Cloudinary solo existen en Vercel)
// y actualiza el fileUrl de cada Material "Workbook — Módulo N" en la base
// (misma base Neon usada por producción y por este script, así que el
// update via Prisma directo alcanza sin pasar por la API de materiales).
import { PrismaClient } from "@prisma/client"
import { readFile } from "fs/promises"

const prisma = new PrismaClient()
const BASE_URL = "https://jewgalacademy.com"
const COURSE_ID = "cmqlprwm60001x4enblc8k4yy"
const SRC = "C:\\Users\\sgriv\\Documents\\JEWGAL ACADEMY\\Curso Life Coaching"

const WORKBOOKS = [
  { module: 1, file: `${SRC}\\Modulo 1 - Introduccion\\Workbook_Modulo1.pdf` },
  { module: 2, file: `${SRC}\\Modulo 2 - Kabala Coach\\Módulo 2 Yael\\Workbook_Modulo2.pdf` },
  { module: 3, file: `${SRC}\\Modulo 3 - Logoterapia\\Workbook_Modulo3.pdf` },
  { module: 4, file: `${SRC}\\Modulo 4 - Jewgal Mindfulness\\Workbook_Modulo4.pdf` },
  { module: 5, file: `${SRC}\\Modulo 5 - El Arte de Preguntar\\m5_workbook_alumno-1.pdf` },
  { module: 6, file: `${SRC}\\Modulo 6 - TCC Coaching Cognitigo\\m6_workbook_alumno.pdf` },
  { module: 7, file: `${SRC}\\Modulo 7 - Metrodo Sholem Facilitadores\\Workbook_Modulo7.pdf` },
]

function pickCookies(res) {
  // undici expone múltiples Set-Cookie vía getSetCookie(); headers.get()
  // solo devuelve el primero (o los pega mal) si hay más de uno.
  const raw = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [res.headers.get("set-cookie")].filter(Boolean)
  return raw.map((c) => c.split(";")[0])
}

async function login() {
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`)
  const jar = new Map(pickCookies(csrfRes).map((c) => [c.split("=")[0], c]))
  const { csrfToken } = await csrfRes.json()

  const body = new URLSearchParams({
    csrfToken,
    email: "admin@jewgalacademy.com",
    password: "admin123",
    json: "true",
  })

  const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", cookie: [...jar.values()].join("; ") },
    body,
    redirect: "manual",
  })

  for (const c of pickCookies(loginRes)) jar.set(c.split("=")[0], c)

  const cookieHeader = [...jar.values()].join("; ")
  if (![...jar.keys()].some((k) => /session/i.test(k))) {
    console.warn(`Aviso: no se detectó cookie de sesión entre [${[...jar.keys()].join(", ")}] — probablemente el login falló.`)
  }
  return cookieHeader
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

async function uploadPdf(filePath, sig) {
  const buffer = await readFile(filePath)
  const form = new FormData()
  form.append("file", new Blob([buffer], { type: "application/pdf" }), filePath.split("\\").pop())
  form.append("api_key", sig.apiKey)
  form.append("timestamp", String(sig.timestamp))
  form.append("signature", sig.signature)
  form.append("folder", sig.folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`, {
    method: "POST",
    body: form,
  })
  if (!res.ok) throw new Error(`Upload a Cloudinary falló (${res.status}): ${await res.text()}`)
  const json = await res.json()
  return json.secure_url
}

async function main() {
  console.log("Iniciando sesión en producción…")
  const cookie = await login()

  for (const { module, file } of WORKBOOKS) {
    console.log(`\nMódulo ${module} — ${file.split("\\").pop()}`)
    const sig = await getSignature(cookie, "jewgal-workbooks")
    const url = await uploadPdf(file, sig)
    console.log(`  ✓ subido: ${url}`)

    const updated = await prisma.material.updateMany({
      where: { courseId: COURSE_ID, moduleNumber: module, title: { startsWith: "Workbook — Módulo" } },
      data: { fileUrl: url },
    })
    console.log(`  ✓ Material actualizado (${updated.count} fila/s)`)
  }

  console.log("\nListo — los 7 workbooks tienen su PDF real.")
}

main().catch((err) => { console.error(err); process.exitCode = 1 }).finally(() => prisma.$disconnect())
