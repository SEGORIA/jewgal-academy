// Agrega, al final de cada módulo, un material interactionKind:"reflection"
// real: el alumno escribe su respuesta en una caja de texto y queda
// guardada como parte de su progreso — en vez de la autoevaluación como
// texto fijo que ya estaba en el Workbook de cada módulo. Las preguntas de
// M3, M5, M6 y M7 son las "Preguntas de Autoevaluación — Portafolio"
// reales extraídas de las guías; las de M1, M2 y M4 son nuevas pero
// ancladas en el contenido real ya cargado de cada módulo (no inventan
// datos del curso, son preguntas de cierre pedagógico).
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const COURSE_ID = "cmqlprwm60001x4enblc8k4yy"

const REFLECTIONS = {
  1: [
    "¿Cómo cambió tu definición de \"qué es el coaching\" después de este módulo?",
    "De las 8 competencias ICF, ¿cuál sentís más desarrollada en vos y cuál necesita más trabajo?",
    "Pensando en la regla de oro de derivación, ¿te queda claro cuándo derivar a un profesional de salud mental?",
    "Entre GROW y CLEAR, ¿cuál elegirías para tu primera sesión real y por qué?",
    "¿Quién sos vos como coach, después de este módulo?",
  ],
  2: [
    "¿Cuál es tu Sefirá débil principal y qué Emunot de Tohu la sostiene?",
    "¿Qué diferencia notás entre la Tobaná (la historia que te contás) y la Deá (lo que en el fondo ya sabés) en tu propia vida?",
    "De las 5 técnicas del Jasidut, ¿cuál practicaste esta semana y qué notaste?",
    "¿Cómo cambia tu forma de escuchar a un coachee después de conocer el mapa de las Sefirot?",
    "Cerrá con el Cuento del Gallo: ¿qué \"camisa\" te vas a poner esta semana, en tu propio camino de Tikun?",
  ],
  3: [
    "¿Qué concepto de Frankl cambió tu manera de entender el sufrimiento?",
    "¿En qué área de tu vida sentís más vacío existencial en este momento? ¿Qué primer paso podrías dar?",
    "De las tres técnicas logoterapéuticas, ¿cuál te resulta más natural como coach y cuál más desafiante?",
    "Escribí tu enunciado de misión de vida en una sola oración. ¿Cómo se conecta con tu vocación de coach?",
    "¿Qué diferencia habrá en tus sesiones de coaching desde que conociste la Logoterapia?",
  ],
  4: [
    "¿Qué notaste en tu propia práctica de mindfulness a lo largo de estas semanas?",
    "¿En qué nivel de escucha (1, 2 o 3) sentís que estás la mayoría de las veces? ¿Qué te ayudaría a llegar más seguido al Nivel 3?",
    "Pensá en un momento donde tu crítico interior se activó en una sesión. ¿Cómo lo trabajaste desde la autocompasión?",
    "¿Cuál es la diferencia entre presencia real y presencia performativa en tu propia práctica?",
    "¿Qué vas a sostener de tu práctica personal de mindfulness después de este módulo?",
  ],
  5: [
    "¿Cuál de los 5 tipos de preguntas te sale más naturalmente? ¿Cuál te cuesta más y por qué?",
    "Describe una pregunta que hiciste en una sesión de práctica que abrió algo inesperado. ¿Qué la hizo poderosa?",
    "¿Cuál es el error al preguntar que cometés más frecuentemente? ¿Qué entrenamiento necesitás para corregirlo?",
    "De las preguntas avanzadas (milagro, observador, identidad, legado), ¿cuál te resuena más con tu estilo? ¿Por qué?",
    "Escribe las 5 preguntas de tu banco personal que sentís más propias. ¿Qué tienen en común?",
  ],
  6: [
    "¿Qué modelo de la TCC te resulta más natural integrar en tus sesiones de coaching?",
    "Describe una creencia nuclear propia que identificaste durante este programa. ¿Qué cambió en vos?",
    "¿Cómo vas a estructurar tus primeros procesos de coaching como profesional? ¿Qué modelo usarás?",
    "De los siete módulos, ¿cuál transformó más tu manera de ver al ser humano? ¿Cuál transformó más tu manera de estar en la sesión?",
    "¿Qué tipo de coach sos? Escribí en 5 líneas tu identidad profesional como Life Coach Integrativo.",
  ],
  7: [
    "¿Cuál de los 5 principios del Método Sholem te resultó más natural? ¿Cuál más desafiante?",
    "¿Qué aprendiste sobre vos mismo al trabajar el Mapa de Identidad?",
    "¿Cómo cambia tu forma de acompañar a un coachee después de este módulo?",
    "Elegí una frase de Sholem que más resuene con vos. ¿Por qué esa?",
    "¿Qué compromiso concreto tomás con vos mismo como líder, a partir de este módulo?",
  ],
}

async function main() {
  for (const [moduleNumberStr, questions] of Object.entries(REFLECTIONS)) {
    const moduleNumber = Number(moduleNumberStr)

    const already = await prisma.material.findFirst({
      where: { courseId: COURSE_ID, moduleNumber, interactionKind: "reflection" },
    })
    if (already) {
      console.log(`[M${moduleNumber}] ya tiene reflection, actualizando contenido`)
      await prisma.material.update({
        where: { id: already.id },
        data: {
          content: JSON.stringify([
            { type: "paragraph", text: "Cerrá el módulo con tu autoevaluación reflexiva. No hay respuestas correctas ni incorrectas — es tu espacio de integración personal." },
            { type: "list", ordered: true, items: questions },
          ]),
        },
      })
      continue
    }

    const maxOrder = await prisma.material.aggregate({
      where: { courseId: COURSE_ID, moduleNumber },
      _max: { order: true },
    })

    await prisma.material.create({
      data: {
        courseId: COURSE_ID,
        moduleNumber,
        order: (maxOrder._max.order ?? 0) + 1,
        title: `Autoevaluación Reflexiva — Módulo ${moduleNumber}`,
        description: "Cierre del módulo: portafolio personal.",
        type: "lesson",
        interactionKind: "reflection",
        estimatedMinutes: 20,
        content: JSON.stringify([
          { type: "paragraph", text: "Cerrá el módulo con tu autoevaluación reflexiva. No hay respuestas correctas ni incorrectas — es tu espacio de integración personal." },
          { type: "list", ordered: true, items: questions },
        ]),
      },
    })
    console.log(`✓ [M${moduleNumber}] Autoevaluación Reflexiva creada`)
  }
}

main().finally(() => prisma.$disconnect())
