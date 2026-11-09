export type AdminMaterial = {
  id: string; title: string; description: string | null; type: "document" | "video" | "link" | "lesson"
  fileUrl: string | null; videoUrl: string | null; linkUrl: string | null
  moduleNumber: number; order: number; isVisible: boolean
  interactionKind: string | null; toolHref: string | null; estimatedMinutes: number | null
  coverImageUrl: string | null; groupLabel: string | null
  content: string | null; quizData: string | null
}

export type AdminCourseModule = { id: string; number: number; title: string; description: string | null; isVisible: boolean }
