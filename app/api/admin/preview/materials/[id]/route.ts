import { NextRequest, NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import { db } from "@/lib/db"
import { parseContent, parseQuizData } from "@/lib/materials-content"

// Espejo de /api/me/materials/[id] para la vista previa de superadmin: sin
// chequeo de inscripción (el admin no está inscripto como alumno) y sin
// progreso real (nadie "completa" nada acá, es solo para ver cómo queda).
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await adminGuard("cursos")
  if (!g.ok) return g.response
  g.enter()
  const session = g.session
  const { id } = await params

  const material = await db.material.findUnique({ where: { id } })
  if (!material) {
    return NextResponse.json({ error: "Material no encontrado" }, { status: 404 })
  }

  const quiz = material.interactionKind === "quiz"
    ? parseQuizData(material.quizData).map((q) => ({
        question: q.question,
        options: q.options,
        multiple: q.correctIndexes.length > 1,
      }))
    : null

  const [course, courseMaterials, courseModules] = await Promise.all([
    db.course.findUnique({ where: { id: material.courseId }, select: { title: true, slug: true, sequentialUnlock: true } }),
    db.material.findMany({
      where: { courseId: material.courseId },
      orderBy: [{ moduleNumber: "asc" }, { order: "asc" }, { createdAt: "asc" }],
      select: {
        id: true, title: true, type: true, fileUrl: true, videoUrl: true, linkUrl: true,
        moduleNumber: true, order: true, groupLabel: true, interactionKind: true, toolHref: true, estimatedMinutes: true,
      },
    }),
    db.courseModule.findMany({ where: { courseId: material.courseId }, orderBy: { number: "asc" } }),
  ])

  return NextResponse.json({
    material: {
      id: material.id,
      courseId: material.courseId,
      title: material.title,
      description: material.description,
      moduleNumber: material.moduleNumber,
      interactionKind: material.interactionKind,
      toolHref: material.toolHref,
      fileUrl: material.fileUrl,
      coverImageUrl: material.coverImageUrl,
      content: parseContent(material.content),
      quiz,
    },
    progress: null,
    curriculum: {
      course,
      modules: courseModules,
      materials: courseMaterials.map((m) => ({ ...m, progress: null })),
    },
  })
}
