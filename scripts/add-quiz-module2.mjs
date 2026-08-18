// Carga el Examen Final real de Devora (Parte A, opción múltiple) del
// Módulo 2 como quiz interactivo con corrección automática — extraído
// textualmente de kc_workbook_examen_v3.docx (10 preguntas + respuestas).
// Las Partes B (desarrollo) y C (caso Miriam) son de desarrollo libre y
// ya están en el Workbook — no se auto-corrigen, por eso no entran acá.
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const COURSE_ID = "cmqlprwm60001x4enblc8k4yy"

const quizData = [
  { question: "¿Qué es el Kabbalá Coach?", options: ["Una terapia espiritual", "Un método para descubrir al maestro interno usando Kabbalá y Jasidut", "Un curso de estudio de Kabbalá", "Un programa de meditación"], correctIndexes: [1] },
  { question: "¿Cuál es la diferencia principal entre la Kabbalá y el Jasidut?", options: ["No hay diferencia", "La Kabbalá es el recipiente de la luz y el Jasidut es la luz misma", "El Jasidut es más antiguo que la Kabbalá", "La Kabbalá es solo para hombres"], correctIndexes: [1] },
  { question: "¿Qué significa MITZRAIM en el Shema Israel aplicado al Kabbalá Coach?", options: ["La tierra de Egipto solamente", "El nombre hebreo de Egipto", "La estrechez personal — las limitaciones, miedos y creencias que aprisionan", "Un concepto solo histórico"], correctIndexes: [2] },
  { question: "¿Por qué la reparación (Tikun) es en lo emocional?", options: ["Porque lo espiritual no importa", "Porque solo se rompieron los Keilim de la parte emocional — lo cognitivo es perfecto", "Porque las emociones son más importantes que el intelecto", "Porque el intelecto no puede cambiar"], correctIndexes: [1] },
  { question: "¿Cuál es el rol del Alma Divina en el proceso de coaching?", options: ["El coachee siempre viene desde el Alma Divina", "El Alma Divina es la que genera el quiebre", "El Alma Divina ya está completa — el objetivo del coaching es activarla", "El Alma Divina y el Alma Animal son lo mismo"], correctIndexes: [2] },
  { question: "¿Qué es el IMUN según el Tanya Cap. 42?", options: ["Una meditación", "El entrenamiento para habituar la mente de modo que quede la impresión del Tikun", "Una técnica de respiración", "Un ritual semanal"], correctIndexes: [1] },
  { question: "¿A qué área de vida corresponde la Sefirá GUEVURÁ?", options: ["Familia e hijos", "Salud y cuerpo", "Riqueza, trabajo y logros materiales", "Pareja y paz"], correctIndexes: [2] },
  { question: "¿Cuál es la función de la TOBANÁ en el proceso?", options: ["Es la verdad profunda del coachee", "Es la historia que Biná construye alrededor de la Emunot de Tohu para justificarla", "Es el primer paso de acción", "Es una técnica del Jasidut"], correctIndexes: [1] },
  { question: "¿Qué es la DEÁ?", options: ["La lista de objetivos del coachee", "El diagnóstico de la Sefirá débil", "La verdad profunda que el coachee ya sabe pero que la Emunot de Tohu le impide ver", "Un ejercicio de meditación"], correctIndexes: [2] },
  { question: "¿Cuál describe mejor el proceso del Kabbalá Coach?", options: ["Tohu es malo y hay que eliminarlo", "El coachee siempre viene desde el Alma Divina", "Quiebre → Sefirá débil → Emunot → Tobaná → Deá → Midot → Acción", "El coaching solo trabaja con las Sefirot cognitivas"], correctIndexes: [2] },
]

const content = [
  { type: "heading", level: 1, text: "Examen Final — Parte A (opción múltiple)" },
  { type: "paragraph", text: "Las 10 preguntas de opción múltiple del examen de certificación de Devora Benchimol — 40 de los 100 puntos totales. Se corrige solo, al instante." },
  { type: "paragraph", text: "Las Partes B (desarrollo, 40 puntos) y C (caso práctico de Miriam, 20 puntos) son de respuesta libre y ya están en tu Workbook — junto con esta parte, completan el examen de certificación completo (puntaje mínimo: 70/100)." },
]

async function main() {
  const workbook = await prisma.material.findFirst({
    where: { courseId: COURSE_ID, moduleNumber: 2, title: { startsWith: "Workbook" } },
  })
  if (!workbook) throw new Error("No se encontró el Workbook del Módulo 2")

  const existing = await prisma.material.findFirst({
    where: { courseId: COURSE_ID, moduleNumber: 2, interactionKind: "quiz" },
  })
  if (existing) {
    console.log("Ya existe un quiz en Módulo 2, actualizando en vez de duplicar:", existing.id)
    await prisma.material.update({
      where: { id: existing.id },
      data: { quizData: JSON.stringify(quizData), content: JSON.stringify(content) },
    })
    return
  }

  await prisma.material.update({ where: { id: workbook.id }, data: { order: workbook.order + 1 } })

  await prisma.material.create({
    data: {
      courseId: COURSE_ID,
      moduleNumber: 2,
      order: workbook.order,
      title: "Examen Final — Parte A (opción múltiple)",
      description: "10 preguntas de opción múltiple del examen de certificación, con corrección automática.",
      type: "lesson",
      interactionKind: "quiz",
      groupLabel: null,
      estimatedMinutes: 15,
      content: JSON.stringify(content),
      quizData: JSON.stringify(quizData),
    },
  })
  console.log("✓ Quiz de Módulo 2 creado (10 preguntas)")
}

main().finally(() => prisma.$disconnect())
