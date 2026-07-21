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
      title: "Instructor Certificado Jewgalkids",
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

  // ── Posts del blog (migración del contenido hardcodeado original) ──
  const posts = [
    {
      slug: "que-es-el-life-coaching-integrativo",
      title: "¿Qué es el Life Coaching Integrativo y por qué va más allá del coaching tradicional?",
      category: "Coaching",
      excerpt: "El coaching integrativo une logoterapia, mindfulness y herramientas espirituales para un acompañamiento más profundo y sostenido en el tiempo.",
      content: `El Life Coaching Integrativo no es una moda pasajera ni un conjunto de técnicas de motivación. Es una disciplina que surge de la necesidad de acompañar a las personas de manera completa: integrando su mente, su cuerpo y su alma en un mismo proceso de transformación.

A diferencia del coaching tradicional, que muchas veces se enfoca en objetivos externos y estrategias de acción, el enfoque integrativo parte de una pregunta más profunda: ¿quién quiero ser? Antes de preguntarse qué quiero lograr, el proceso invita a explorar los valores, creencias y patrones que dan forma a nuestra identidad.

En Jewgal Academy, este enfoque integra herramientas de la logoterapia de Viktor Frankl, el mindfulness y la sabiduría de la Cabalá. No como un collage de técnicas, sino como un sistema coherente que parte del sentido de vida de cada persona.

El resultado es un proceso que no solo produce resultados visibles, sino que transforma la manera en que la persona habita su vida cotidiana. Los clientes de coaches integrativos suelen reportar no solo que alcanzaron sus metas, sino que se sienten más en paz con quiénes son, más capaces de sostener los cambios en el tiempo y más conectados con su propósito más profundo.

Si estás pensando en formarte como coach o en iniciar un proceso personal, el camino integrativo te ofrece una profundidad que difícilmente encontrarás en otros enfoques. Te invitamos a conocer nuestra formación en Life Coaching Integrativo y dar el primer paso.`,
      publishedAt: new Date("2026-06-12"),
    },
    {
      slug: "cabala-y-bienestar",
      title: "Cabalá y bienestar: cómo la sabiduría ancestral transforma el coaching moderno",
      category: "Cabalá",
      excerpt: "Exploramos el Árbol de la Vida y las sefirot como mapa interior para comprender tus patrones, tus fortalezas y el camino hacia tu propósito.",
      content: `La Cabalá no es religión, ni magia, ni esotericismo. Es un mapa. Un sistema de sabiduría milenaria que describe cómo funciona el alma humana, cuáles son sus dimensiones y cómo cada persona puede conocerse y transformarse desde adentro.

El Árbol de la Vida es la herramienta central de esta tradición. Está compuesto por diez sefirot, que representan diferentes cualidades del ser humano: la sabiduría, la comprensión, la bondad, la fortaleza, la compasión, el éxito, la constancia, el esplendor, el fundamento y la manifestación. Cada sefirá nos habla de un aspecto de nuestra psicología y nuestra espiritualidad.

Aplicado al coaching, el Árbol de la Vida se convierte en un espejo. Cuando un cliente llega con dificultades para tomar decisiones, podemos explorar juntos si hay un desequilibrio entre la sabiduría (Jojmá) y la comprensión (Biná). Cuando hay bloqueos para actuar, el trabajo puede estar en fortalecer Iessod, el pilar de la acción.

Lo fascinante de este sistema es que no impone una receta universal. Cada persona tiene su propio mapa, su propia combinación de fortalezas y áreas de crecimiento. Y el proceso de autoconocimiento cabalístico es, en sí mismo, un camino de sanación.

En nuestro Micro Curso de Cábala Coach, exploramos estas herramientas de manera práctica y accesible, sin necesidad de conocimientos previos de judaísmo ni espiritualidad. La sabiduría ancestral al servicio de tu transformación presente.`,
      publishedAt: new Date("2026-06-04"),
    },
    {
      slug: "joogal-movimiento-consciente",
      title: "El Método Jewgal: cuando el movimiento se convierte en herramienta de transformación",
      category: "Jewgal",
      excerpt: "Cómo integrar cuerpo, mente y emoción a través del movimiento consciente para acceder a estados de mayor bienestar y claridad.",
      content: `Durante décadas, el mundo del desarrollo personal ignoró el cuerpo. Se llenaron páginas de libros sobre mentalidad, creencias y estrategias, pero muy pocos preguntaron: ¿qué pasa en el cuerpo cuando una persona se transforma? ¿Cómo el movimiento puede ser un catalizador del cambio?

El Método Jewgal nació de estas preguntas. Es un sistema de movimiento consciente que integra principios del yoga, la expresión corporal, la danza terapéutica y el mindfulness en movimiento. No se trata de un ejercicio físico convencional, sino de una práctica que invita a habitar el cuerpo con presencia y a escuchar lo que el cuerpo tiene para decir.

Cuando practicamos Jewgal, activamos el sistema nervioso parasimpático, reducimos el cortisol y aumentamos la producción de oxitocina y serotonina. Pero más allá de la bioquímica, lo que más reportan quienes lo practican es una sensación de integración: de que mente y cuerpo finalmente están en el mismo lugar, al mismo tiempo.

Para instructores y educadores, el Método Jewgal ofrece una herramienta poderosa para acompañar grupos. Ya sea en colegios, empresas, comunidades o retiros, las clases Jewgal crean estados de apertura y conexión que facilitan el aprendizaje y la transformación.

Si te interesa certificarte como instructor del Método Jewgal Adultos o Jewgalkids, te invitamos a explorar nuestras formaciones. Están diseñadas para ser accesibles incluso si no tienes experiencia previa en yoga o danza.`,
      publishedAt: new Date("2026-05-28"),
    },
    {
      slug: "liderazgo-con-proposito",
      title: "Liderazgo con propósito: la diferencia entre dirigir y verdaderamente inspirar",
      category: "Liderazgo",
      excerpt: "El verdadero liderazgo no se trata de posición sino de influencia genuina. Descubre cómo desarrollar autoridad desde la autenticidad y los valores.",
      content: `Hay líderes que dirigen porque tienen autoridad formal, y hay líderes que inspiran porque tienen autoridad real. La diferencia no está en el cargo ni en el puesto: está en la autenticidad con la que ejercen su influencia.

El liderazgo con propósito parte de una premisa simple pero poderosa: las personas no siguen a quienes tienen el poder, siguen a quienes les dan sentido. Un líder que conoce su propósito, que actúa desde sus valores y que tiene la valentía de ser vulnerable, genera una confianza que ninguna jerarquía puede producir artificialmente.

En nuestra tradición, el liderazgo siempre estuvo vinculado al servicio. En hebreo, la palabra "edá" (comunidad) comparte raíz con "testimonio": liderar es ser testigo de lo mejor que puede ser el otro, y sostener ese espejo con constancia y amor. Esa es la esencia del Método Sholem para adolescentes.

Desarrollar este tipo de liderazgo requiere trabajo interior. Implica conocer los propios patrones de respuesta al conflicto, los valores que guían las decisiones y las creencias que limitan o potencian nuestra influencia. El coaching integrativo es una de las herramientas más poderosas para este proceso.

Si trabajas con equipos, comunidades o adolescentes, te invitamos a preguntarte: ¿qué tipo de líder quiero ser? ¿Desde dónde quiero ejercer mi influencia? La respuesta a esas preguntas es el comienzo de un liderazgo que verdaderamente transforma.`,
      publishedAt: new Date("2026-05-15"),
    },
    {
      slug: "metodo-sholem-adolescentes",
      title: "Método Sholem: acompañando jóvenes desde los valores, la identidad y el propósito",
      category: "Formación",
      excerpt: "Un enfoque único para acompañar a los jóvenes en la construcción de una identidad sólida, un sentido de pertenencia y un liderazgo con corazón.",
      content: `Los adolescentes de hoy enfrentan un desafío que ninguna generación anterior tuvo que afrontar de la misma manera: construir una identidad en el contexto de las redes sociales, la sobreinformación y la presión de ser alguien antes de saber quién uno quiere ser.

El Método Sholem surge como respuesta a este desafío. Fue desarrollado para acompañar a jóvenes en la construcción de su identidad desde los valores, la pertenencia comunitaria y el liderazgo positivo. No se trata de darles respuestas, sino de crear las condiciones para que encuentren las suyas.

El nombre Sholem hace referencia a la paz: paz interior, paz en las relaciones, paz en la comunidad. Pero no es una paz pasiva ni cómoda. Es la paz que surge de la integridad, de actuar en coherencia con los propios valores aunque eso implique ir contracorriente.

Los instructores certificados del Método Sholem aprenden a crear espacios de seguridad donde los adolescentes pueden explorar quiénes son, qué les importa y cómo quieren contribuir al mundo. Aprenden a facilitar conversaciones difíciles con herramientas pedagógicas concretas, y a sostener grupos con una presencia que inspira confianza.

Si trabajas con jóvenes en colegios, organizaciones comunitarias o programas de liderazgo, el Método Sholem puede ser la herramienta que estabas buscando. Te invitamos a conocer nuestra formación y unirte a la comunidad de instructores que ya trabajan con este enfoque en varios países.`,
      publishedAt: new Date("2026-05-08"),
    },
    {
      slug: "coaching-transformacion-profunda",
      title: "Transformación profunda: qué pasa cuando el coaching va más allá de los resultados",
      category: "Coaching",
      excerpt: "Las herramientas del coaching son el vehículo, pero el verdadero destino es el cambio de identidad. Reflexionamos sobre lo que significa transformarse de adentro hacia afuera.",
      content: `Cuando una persona llega a un proceso de coaching, suele traer un objetivo concreto: mejorar su relación de pareja, avanzar en su carrera, superar un bloqueo creativo. Y eso está bien. Los objetivos concretos son el punto de entrada.

Pero los procesos de coaching más poderosos suceden cuando el objetivo inicial se convierte en una puerta hacia algo más profundo. Cuando la persona descubre que el bloqueo que traía no era un problema de gestión del tiempo, sino una creencia sobre su propio valor. Cuando descubre que la relación difícil con su jefe refleja un patrón que viene de mucho más atrás.

La transformación profunda no se parece al achievement de metas. Es más silenciosa, más gradual y más difícil de medir. Pero cuando ocurre, cambia todo: la manera en que la persona se percibe a sí misma, la manera en que se relaciona con los demás y la manera en que toma decisiones.

Viktor Frankl, el psiquiatra vienés que sobrevivió los campos de concentración y fundó la logoterapia, decía que el ser humano no busca placer ni poder, sino sentido. La transformación profunda ocurre cuando una persona encuentra o recupera su sentido. Cuando conecta con el porqué de su vida y deja que ese porqué guíe el cómo.

En Jewgal Academy, esto es lo que buscamos en cada proceso formativo. No coaches que apliquen técnicas, sino personas que hayan experimentado su propia transformación y puedan acompañar a otros desde ese lugar de autenticidad y profundidad.`,
      publishedAt: new Date("2026-05-02"),
    },
  ]

  for (const post of posts) {
    await db.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: { ...post, isPublished: true },
    })
  }
  console.log("✅ 6 posts de blog creados")

  console.log("\n🎉 Seed completado!")
  console.log("   Admin: admin@jewgalacademy.com")
  console.log("   Password: admin123")
  console.log("   → Cambiá la contraseña en producción!")
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
