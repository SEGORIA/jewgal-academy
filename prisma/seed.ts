import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const db = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Super admin
  const adminPassword = await bcrypt.hash("admin123", 10)
  await db.user.upsert({
    where: { email: "admin@jewgalacademy.com" },
    update: {},
    create: {
      email: "admin@jewgalacademy.com",
      name: "Devora Benchimol",
      password: adminPassword,
      role: "admin",
    },
  })
  console.log("✅ Admin creado: admin@jewgalacademy.com / admin123")

  // Courses
  const courses = [
    {
      title: "Life Coaching Integrativo",
      slug: "life-coaching-integrativo",
      shortDesc: "Formación integral para guiar procesos de transformación personal.",
      description:
        "Programa completo que combina coaching, Cabalá y psicología para formar coaches integrales. Incluye módulos de mindfulness, logoterapia y trabajo con el trauma.",
      price: 1500,
      isFree: false,
      isPublished: true,
    },
    {
      title: "Instructor Certificado Joogalkids",
      slug: "joogalkids",
      shortDesc: "Formación para guías de desarrollo infantil con el método Joogal.",
      description:
        "Certificación especializada para trabajar con niños a través del método Joogal, combinando movimiento, juego y desarrollo emocional.",
      price: 360,
      isFree: false,
      isPublished: true,
    },
    {
      title: "Cábala Coach",
      slug: "cabala-coach",
      shortDesc: "Sabiduría milenaria de la Cabalá aplicada al bienestar y coaching.",
      description:
        "Micro curso intensivo que integra la sabiduría de la Cabalá con herramientas modernas de coaching para el desarrollo personal.",
      price: 360,
      isFree: false,
      isPublished: true,
    },
    {
      title: "Método Sholem",
      slug: "metodo-sholem",
      shortDesc: "Formación de instructores para líderes adolescentes.",
      description:
        "Programa para formar instructores especializados en acompañar adolescentes hacia su potencial máximo y liderazgo personal.",
      price: 360,
      isFree: false,
      isPublished: true,
    },
    {
      title: "Instructor Joogal Adultos",
      slug: "joogal-adultos",
      shortDesc: "Certificación profesional en el método Joogal para adultos.",
      description:
        "Formación completa para instructores que desean trabajar con adultos usando el método Joogal de transformación personal.",
      price: 0,
      isFree: true,
      isPublished: true,
    },
  ]

  for (const course of courses) {
    await db.course.upsert({
      where:  { slug: course.slug },
      update: { isPublished: true },
      create: course,
    })
  }
  console.log("✅ 5 cursos creados")

  console.log("\n🎉 Seed completado!")
  console.log("   Admin: admin@jewgalacademy.com")
  console.log("   Password: admin123")
  console.log("   → Cambiá la contraseña en producción!")
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
