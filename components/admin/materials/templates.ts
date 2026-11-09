import { BookOpen, Presentation, FileText, PlayCircle, Link2, ListChecks, PenLine } from "lucide-react"
import type { ContentBlock, QuizQuestion } from "@/lib/materials-content"

// Los 7 "qué voy a agregar" del programa. El admin elige uno y el sistema
// completa el resto (tipo, grupo del sidebar, interacción, minutos, título
// sugerido) — no hace falta entender tipos ni bloques para empezar.
export type TemplateId = "unit" | "presentation" | "workbook" | "video" | "link" | "exam" | "reflection"

export const TEMPLATE_ICONS: Record<TemplateId, React.ComponentType<{ size?: number }>> = {
  unit: BookOpen, presentation: Presentation, workbook: FileText, video: PlayCircle, link: Link2, exam: ListChecks, reflection: PenLine,
}

export const TEMPLATES: { id: TemplateId; label: string; hint: string }[] = [
  { id: "unit", label: "Unidad", hint: "Texto, video y recursos de una clase" },
  { id: "presentation", label: "Presentación", hint: "Diapositivas del módulo (imágenes)" },
  { id: "workbook", label: "Workbook / archivo", hint: "PDF o documento para leer y descargar" },
  { id: "video", label: "Video", hint: "YouTube, Vimeo o un archivo propio" },
  { id: "link", label: "Enlace", hint: "Link a un recurso externo" },
  { id: "exam", label: "Examen", hint: "Preguntas con corrección automática" },
  { id: "reflection", label: "Autoevaluación", hint: "Pregunta abierta que el alumno responde y guarda" },
]

export type TemplateDefaults = {
  type: "document" | "video" | "link" | "lesson"
  title: string
  groupLabel: string
  interactionKind: "" | "reflection" | "quiz"
  estimatedMinutes: string
  content: ContentBlock[]
  quizData: QuizQuestion[]
}

export function templateDefaults(id: TemplateId, moduleNumber: number, unitCount: number): TemplateDefaults {
  const base: TemplateDefaults = { type: "lesson", title: "", groupLabel: "", interactionKind: "", estimatedMinutes: "", content: [], quizData: [] }
  switch (id) {
    case "unit": return { ...base, title: `Unidad ${unitCount + 1}: `, groupLabel: "Unidades", estimatedMinutes: "30" }
    case "presentation": return { ...base, title: `Presentación — Módulo ${moduleNumber}`, estimatedMinutes: "15", content: [{ type: "slides", images: [] }] }
    case "workbook": return { ...base, type: "document", title: `Workbook — Módulo ${moduleNumber}`, estimatedMinutes: "60" }
    case "video": return { ...base, title: "Video: ", groupLabel: "Unidades", estimatedMinutes: "10" }
    case "link": return { ...base, type: "link", title: "" }
    case "exam": return { ...base, title: `Examen — Módulo ${moduleNumber}`, interactionKind: "quiz", estimatedMinutes: "20" }
    case "reflection": return { ...base, title: `Autoevaluación Reflexiva — Módulo ${moduleNumber}`, interactionKind: "reflection", estimatedMinutes: "20" }
  }
}

// Qué "plantilla" es un material ya existente (para mostrar el formulario correcto al editar).
export function templateOf(m: { type: string; interactionKind: string | null; content: ContentBlock[] }): TemplateId {
  if (m.interactionKind === "quiz") return "exam"
  if (m.interactionKind === "reflection") return "reflection"
  if (m.type === "document") return "workbook"
  if (m.type === "link") return "link"
  if (m.type === "video") return "video"
  if (m.content.length > 0 && m.content.every((b) => b.type === "slides")) return "presentation"
  if (m.content.length > 0 && m.content.every((b) => b.type.startsWith("video"))) return "video"
  return "unit"
}
