import Groq from "groq-sdk"
import { db } from "@/lib/db"

const key = process.env.GROQ_API_KEY

export function isAIConfigured() {
  return Boolean(key && key.startsWith("gsk_"))
}

export const groq = new Groq({
  apiKey: key ?? "gsk_placeholder",
})

/** Groq retira modelos de vez en cuando: GROQ_MODEL (en Vercel) permite cambiarlo sin tocar el código. */
export const AI_MODEL = process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile"

export type AiFailure = {
  code: "auth" | "rate" | "model" | "network" | "unknown"
  /** Código HTTP que ve el alumno. */
  status: number
  /** Mensaje para el alumno (sin detalles técnicos). */
  userMessage: string
  /** Diagnóstico para el administrador: qué pasó y cómo se arregla. */
  adminMessage: string
}

/** Traduce un error de Groq a algo que entienda el alumno y a un diagnóstico accionable para el panel. */
export function classifyAiError(e: unknown): AiFailure {
  const raw = (e instanceof Error ? e.message : String(e)).slice(0, 240)
  const status = typeof (e as { status?: unknown } | null)?.status === "number" ? (e as { status: number }).status : undefined
  const unavailable = "El asistente no está disponible en este momento. Intentá de nuevo en unos minutos."

  if (status === 401 || status === 403) {
    return { code: "auth", status: 503, userMessage: unavailable, adminMessage: "Groq rechazó la clave (GROQ_API_KEY): está mal copiada, revocada o es de otra cuenta. Creá una nueva en console.groq.com/keys, reemplazala en Vercel (Production) y volvé a desplegar." }
  }
  if (status === 429) {
    return { code: "rate", status: 429, userMessage: "El asistente está recibiendo muchas consultas. Esperá un momento e intentá de nuevo.", adminMessage: "Groq limitó las consultas (cuota o velocidad del plan gratuito agotada). Se recupera sola en unos minutos; si pasa seguido, conviene subir de plan en console.groq.com." }
  }
  if (status === 404 || (status === 400 && /model/i.test(raw))) {
    return { code: "model", status: 503, userMessage: unavailable, adminMessage: `Groq no encuentra el modelo “${AI_MODEL}” (puede haber sido retirado). Definí la variable GROQ_MODEL en Vercel con uno vigente (lista en console.groq.com/docs/models) y volvé a desplegar.` }
  }
  if (status === undefined) {
    return { code: "network", status: 503, userMessage: unavailable, adminMessage: `No se pudo contactar a Groq (${raw || "sin respuesta"}). Suele ser un corte momentáneo: probá de nuevo en unos minutos.` }
  }
  return { code: "unknown", status: 503, userMessage: unavailable, adminMessage: `Groq respondió con error ${status}: ${raw}` }
}

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
