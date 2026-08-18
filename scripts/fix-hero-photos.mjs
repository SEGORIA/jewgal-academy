import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()

const setting = await db.siteSetting.findUnique({ where: { key: "hero_photos" } })

if (!setting) {
  console.log("ℹ️  No hay configuración guardada de hero_photos (se usan los defaults del código)")
} else {
  const photos = JSON.parse(setting.value)
  const filtered = photos
    .filter(p => !p.src.includes("devora-joven"))
    .map((p, i) => ({ ...p, order: i }))

  await db.siteSetting.update({
    where: { key: "hero_photos" },
    data: { value: JSON.stringify(filtered) },
  })
  console.log(`✅ Fotos antes: ${photos.length} → después: ${filtered.length} (joven eliminado)`)
}

await db.$disconnect()
