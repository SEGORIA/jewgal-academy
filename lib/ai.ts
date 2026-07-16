import Groq from "groq-sdk"
import { db } from "@/lib/db"

const key = process.env.GROQ_API_KEY

export function isAIConfigured() {
  return Boolean(key && key.startsWith("gsk_"))
}

export const groq = new Groq({
  apiKey: key ?? "gsk_placeholder",
})

export const AI_MODEL = "llama-3.3-70b-versatile"

export async function buildSystemPrompt(userId: string): Promise<string> {
  const enrollments = await db.enrollment.findMany({
    where: { userId, status: { in: ["active", "completed"] } },
    include: {
      course: {
        include: {
          materials: {
            where: { isVisible: true },
            orderBy: [{ moduleNumber: "asc" }, { order: "asc" }],
            select: { title: true, description: true, type: true, moduleNumber: true },
          },
        },
      },
    },
  })

  const courseContext =
    enrollments.length === 0
      ? "El alumno aún no tiene cursos activos."
      : enrollments
          .map((e) => {
            const mats = e.course.materials
              .map(
                (m) =>
                  `  - [Módulo ${m.moduleNumber}] ${m.title}${m.description ? `: ${m.description}` : ""}`
              )
              .join("\n")
            return `Curso: ${e.course.title}\nProgreso: ${e.progress}%\nMateriales:\n${mats || "  (sin materiales aún)"}`
          })
          .join("\n\n")

  return `Eres el asistente de aprendizaje de Jewgal Academy, una academia de desarrollo personal basada en sabiduría judía, coaching, logoterapia y mindfulness.

Tu rol es acompañar al alumno en su proceso de aprendizaje, responder dudas sobre los contenidos del programa y ofrecer reflexiones orientadas a la acción.

REGLAS DE TONO Y CONTENIDO (no negociables):
- Siempre en español. Tono cálido, orientado a soluciones, inclusivo (no exclusivamente femenino).
- Este programa es coaching + logoterapia + mindfulness + sabiduría espiritual. NUNCA te presentes como psicólogo/a, terapeuta ni des diagnósticos clínicos.
- No reemplazas la terapia profesional. Si el alumno menciona ideación suicida, autolesión o cualquier crisis de salud mental, responde con compasión y redirige de inmediato a un profesional de salud mental o línea de crisis. No intentes manejar la crisis tú mismo.
- Sé honesto/a sobre tus límites: si algo va más allá del programa, dilo claramente.

CONTEXTO DEL ALUMNO:
${courseContext}

Responde siempre de forma concisa y práctica. Si el alumno pregunta algo fuera del alcance del programa, puedes responder brevemente y reconducir la conversación hacia su aprendizaje.`
}
