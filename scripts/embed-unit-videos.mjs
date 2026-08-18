// Post-procesa los materiales "lesson" de Life Coaching Integrativo: toma el
// primer video del bloque unit-resources de cada unidad (ya cargado) y lo
// incrusta como bloque video-youtube real dentro del cuerpo, en vez de dejar
// que el alumno solo lo vea como link en "Recursos". Idempotente: si ya hay
// un video-youtube en el content, no lo duplica.
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const COURSE_ID = "cmqlprwm60001x4enblc8k4yy"

function insertAfterIntro(content, videoBlock) {
  const firstParagraphIdx = content.findIndex((b) => b.type === "paragraph")
  const insertAt = firstParagraphIdx >= 0 ? firstParagraphIdx + 1 : 1
  const next = [...content]
  next.splice(insertAt, 0, videoBlock)
  return next
}

async function main() {
  const materials = await prisma.material.findMany({
    where: { courseId: COURSE_ID, type: "lesson" },
    orderBy: [{ moduleNumber: "asc" }, { order: "asc" }],
  })

  let updated = 0
  let skippedNoVideo = 0
  let skippedAlready = 0

  for (const mat of materials) {
    const content = JSON.parse(mat.content ?? "[]")

    if (content.some((b) => b.type === "video-youtube")) {
      skippedAlready++
      continue
    }

    const resourcesBlock = content.find((b) => b.type === "unit-resources")
    const firstVideo = resourcesBlock?.videos?.[0]
    if (!firstVideo) {
      skippedNoVideo++
      continue
    }

    const videoBlock = { type: "video-youtube", url: firstVideo.url, caption: firstVideo.label }
    const nextContent = insertAfterIntro(content, videoBlock)

    await prisma.material.update({
      where: { id: mat.id },
      data: { content: JSON.stringify(nextContent) },
    })
    console.log(`✓ [M${mat.moduleNumber}] ${mat.title} — incrustado: ${firstVideo.label}`)
    updated++
  }

  console.log(`\nListo. Actualizados: ${updated} · sin video de recursos: ${skippedNoVideo} · ya tenían video incrustado: ${skippedAlready}`)
}

main().finally(() => prisma.$disconnect())
