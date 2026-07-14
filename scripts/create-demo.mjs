import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const db = new PrismaClient()

async function main() {
  // Ver cursos disponibles
  const courses = await db.course.findMany({
    select: { id: true, title: true, isPublished: true },
    orderBy: { createdAt: "asc" },
  })
  console.log("Cursos en la DB:")
  courses.forEach((c) => console.log(`  [${c.isPublished ? "✓" : " "}] ${c.title} — ${c.id}`))

  // Buscar el primer curso (publicado o no)
  const course = courses.find((c) => c.isPublished) ?? courses[0]
  if (!course) {
    console.log("No hay cursos. Creá uno primero desde el superadmin.")
    return
  }

  const email = "devora@demo.jewgal.com"
  const password = "Jewgal2025"
  const hash = await bcrypt.hash(password, 10)

  // Crear o actualizar alumna demo
  const user = await db.user.upsert({
    where: { email },
    update: { password: hash },
    create: {
      name: "Devora (demo alumna)",
      email,
      password: hash,
      role: "student",
    },
  })

  // Inscribir en el curso si no está inscripta
  await db.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
    update: { status: "active" },
    create: {
      userId: user.id,
      courseId: course.id,
      status: "active",
      progress: 15,
    },
  })

  console.log("\n✅ Cuenta demo lista:")
  console.log(`   Email:     ${email}`)
  console.log(`   Contraseña: ${password}`)
  console.log(`   Inscripta en: ${course.title}`)
  console.log(`\n   Link: https://jewgal-academy.vercel.app/login`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
