import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { parseContent, parseQuizData } from "@/lib/materials-content"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }
  const { id } = await params

  const material = await db.material.findUnique({ where: { id } })
  if (!material || !material.isVisible) {
    return NextResponse.json({ error: "Material no encontrado" }, { status: 404 })
  }

  const enrollment = await db.enrollment.findFirst({
    where: { userId: session.user.id, courseId: material.courseId, status: { in: ["active", "completed"] } },
  })
  if (!enrollment) {
    return NextResponse.json({ error: "No inscripto en este curso" }, { status: 403 })
  }

  const progress = await db.materialProgress.findUnique({
    where: { userId_materialId: { userId: session.user.id, materialId: id } },
  })

  const quiz = material.interactionKind === "quiz"
    ? parseQuizData(material.quizData).map((q) => ({
        question: q.question,
        options: q.options,
        multiple: q.correctIndexes.length > 1,
      }))
    : null

  // El currículum (rail de la lección) se resuelve acá, escopeado al curso
  // de este material — antes el reproductor armaba su sidebar con
  // /api/me/materials sin escopear, que trae los materiales de TODAS las
  // inscripciones del alumno mezclados por moduleNumber. Con un solo
  // curso por alumno nunca se notó, pero con módulos con nombre el bug se
  // vuelve visible (dos programas mostrando el mismo "Módulo 1"). Devolver
  // el currículum acá evita cambiar la URL del reproductor.
  const [course, courseMaterials, courseModules] = await Promise.all([
    db.course.findUnique({ where: { id: material.courseId }, select: { title: true, slug: true } }),
    db.material.findMany({
      where: { courseId: material.courseId, isVisible: true },
      orderBy: [{ moduleNumber: "asc" }, { order: "asc" }],
      select: {
        id: true, title: true, type: true, fileUrl: true, videoUrl: true, linkUrl: true,
        moduleNumber: true, order: true, groupLabel: true, interactionKind: true, toolHref: true, estimatedMinutes: true,
      },
    }),
    db.courseModule.findMany({ where: { courseId: material.courseId }, orderBy: { number: "asc" } }),
  ])
  const courseProgress = await db.materialProgress.findMany({
    where: { userId: session.user.id, materialId: { in: courseMaterials.map((m) => m.id) } },
    select: { materialId: true, completedAt: true, quizScore: true, quizTotal: true },
  })
  const progressByMaterial = Object.fromEntries(courseProgress.map((p) => [p.materialId, p]))

  return NextResponse.json({
    material: {
      id: material.id,
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
    progress: progress
      ? { completedAt: progress.completedAt, response: progress.response, quizScore: progress.quizScore, quizTotal: progress.quizTotal }
      : null,
    curriculum: {
      course,
      modules: courseModules,
      materials: courseMaterials.map((m) => ({ ...m, progress: progressByMaterial[m.id] ?? null })),
    },
  })
}
