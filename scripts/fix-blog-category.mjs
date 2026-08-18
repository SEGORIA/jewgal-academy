import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()

const updated = await db.post.updateMany({
  where: { category: "Educación" },
  data: { category: "Formación" },
})

console.log(`✅ ${updated.count} post(s) actualizados de "Educación" → "Formación"`)
await db.$disconnect()
