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
        "Programa completo que combina coaching, Cabalá y logoterapia para formar coaches integrales. Incluye módulos de mindfulness, logoterapia y trabajo con el trauma.",
      price: 1500,
      isFree: false,
      isPublished: true,
      totalHours: 120,
      durationWeeks: 24,
    },
    {
      title: "Instructor Certificado Joogalkids",
      slug: "joogalkids",
      shortDesc: "Formación para guías de desarrollo infantil con el método Jewgal.",
      description:
        "Certificación especializada para trabajar con niños a través del método Jewgal, combinando movimiento, juego y desarrollo emocional.",
      price: 360,
      isFree: false,
      isPublished: true,
      totalHours: 60,
      durationWeeks: 12,
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
      totalHours: 16,
      durationWeeks: 4,
    },
    {
      title: "Método Sholem",
      slug: "metodo-sholem",
      shortDesc: "Formación de instructores para el acompañamiento de jóvenes.",
      description:
        "Programa para formar instructores especializados en acompañar el desarrollo consciente de jóvenes con valores, identidad y propósito.",
      price: 360,
      isFree: false,
      isPublished: true,
      totalHours: 60,
      durationWeeks: 12,
    },
    {
      title: "Instructor Jewgal Adultos",
      slug: "joogal-adultos",
      shortDesc: "Certificación profesional en el método Jewgal para adultos.",
      description:
        "Formación completa para instructores que desean trabajar con adultos usando el método Jewgal de transformación personal.",
      price: 0,
      isFree: true,
      isPublished: true,
      totalHours: 48,
      durationWeeks: 12,
    },
  ]

  for (const course of courses) {
    await db.course.upsert({
      where:  { slug: course.slug },
      update: { isPublished: true, totalHours: course.totalHours, durationWeeks: course.durationWeeks },
      create: course,
    })
  }
  console.log("✅ 5 cursos creados")

  // ── Alumno demo con datos académicos de ejemplo ──
  const demoPassword = await bcrypt.hash("demo1234", 10)
  const student = await db.user.upsert({
    where: { email: "estudiante@demo.com" },
    update: {},
    create: { email: "estudiante@demo.com", name: "Ana Estudiante", password: demoPassword, role: "student" },
  })

  const lifeCoaching = await db.course.findUnique({ where: { slug: "life-coaching-integrativo" } })
  const cabala = await db.course.findUnique({ where: { slug: "cabala-coach" } })

  if (lifeCoaching && cabala) {
    const DAY = 864e5
    // Sesiones en vivo del programa (3 pasadas + 1 futura)
    await db.liveSession.deleteMany({ where: { courseId: lifeCoaching.id } })
    const sessionsData = [
      { courseId: lifeCoaching.id, title: "Módulo 1 · Fundamentos del coaching", scheduledAt: new Date(Date.now() - 21 * DAY), durationMin: 120, isCompleted: true },
      { courseId: lifeCoaching.id, title: "Módulo 2 · Escucha activa",          scheduledAt: new Date(Date.now() - 14 * DAY), durationMin: 120, isCompleted: true },
      { courseId: lifeCoaching.id, title: "Módulo 3 · Logoterapia y sentido",    scheduledAt: new Date(Date.now() - 7 * DAY),  durationMin: 120, isCompleted: true },
      { courseId: lifeCoaching.id, title: "Módulo 4 · Trabajo con el trauma",    scheduledAt: new Date(Date.now() + 5 * DAY),  durationMin: 120, isCompleted: false },
    ]
    const sessions = []
    for (const s of sessionsData) sessions.push(await db.liveSession.create({ data: s }))

    // Enrollment en progreso con asistencia
    const enr1 = await db.enrollment.upsert({
      where:  { userId_courseId: { userId: student.id, courseId: lifeCoaching.id } },
      update: { progress: 55, hoursCompleted: 66 },
      create: { userId: student.id, courseId: lifeCoaching.id, status: "active", progress: 55, hoursCompleted: 66 },
    })
    const pastSessions = sessions.filter((s) => s.isCompleted)
    const statuses = ["present", "present", "late"]
    for (let i = 0; i < pastSessions.length; i++) {
      await db.attendance.upsert({
        where:  { enrollmentId_liveSessionId: { enrollmentId: enr1.id, liveSessionId: pastSessions[i].id } },
        update: { status: statuses[i] },
        create: { enrollmentId: enr1.id, liveSessionId: pastSessions[i].id, status: statuses[i] },
      })
    }

    // Enrollment completado + certificado
    await db.enrollment.upsert({
      where:  { userId_courseId: { userId: student.id, courseId: cabala.id } },
      update: { progress: 100, hoursCompleted: 16, status: "completed", completedAt: new Date(Date.now() - 30 * DAY), certificateNumber: "JA-CABALA-0001" },
      create: { userId: student.id, courseId: cabala.id, status: "completed", progress: 100, hoursCompleted: 16, completedAt: new Date(Date.now() - 30 * DAY), certificateNumber: "JA-CABALA-0001" },
    })
    console.log("✅ Alumno demo (estudiante@demo.com / demo1234) con avances, horas y asistencia")
  }

  console.log("\n🎉 Seed completado!")
  console.log("   Admin: admin@jewgalacademy.com")
  console.log("   Password: admin123")
  console.log("   → Cambiá la contraseña en producción!")
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
