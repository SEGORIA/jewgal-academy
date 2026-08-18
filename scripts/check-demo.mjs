import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()

const user = await db.user.findUnique({
  where: { email: "devora@demo.jewgal.com" },
  include: { enrollments: { include: { course: { select: { title: true } } } } },
})

if (!user) { console.log("Usuario no encontrado"); process.exit(1) }

console.log("Usuario:", user.name, "|", user.email, "| role:", user.role)
console.log("Inscripciones:")
user.enrollments.forEach(e => console.log(`  - ${e.course.title} | status: ${e.status}`))

// Verificar GROQ_API_KEY
const key = process.env.GROQ_API_KEY
console.log("\nGROQ_API_KEY local:", key ? (key.startsWith("gsk_") ? "✅ válida" : "⚠️ formato inesperado: " + key.slice(0,8)) : "❌ no configurada")

db.$disconnect()
