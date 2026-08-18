import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()

const user = await db.user.findUnique({ where: { email: "devora@demo.jewgal.com" } })
if (!user) { console.log("Usuario no encontrado"); process.exit(1) }

const updated = await db.enrollment.updateMany({
  where: { userId: user.id },
  data: { status: "active" },
})

console.log(`✅ ${updated.count} inscripción(es) actualizadas a "active"`)
db.$disconnect()
