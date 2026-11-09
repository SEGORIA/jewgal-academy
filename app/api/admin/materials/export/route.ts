import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { parseContent, parseQuizData } from "@/lib/materials-content"

// Exporta el contenido de un programa (módulos con nombre + materiales) en el
// mismo formato que acepta "Importar": sirve de respaldo y para copiar la
// estructura de un programa a otro sin recargar nada a mano.
export async function GET(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const courseId = req.nextUrl.searchParams.get("courseId")
  if (!courseId) {
    return NextResponse.json({ error: "courseId requerido" }, { status: 400 })
  }

  const course = await db.course.findUnique({ where: { id: courseId }, select: { title: true, slug: true } })
  if (!course) {
    return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })
  }

  const [modules, materials] = await Promise.all([
    db.courseModule.findMany({ where: { courseId }, orderBy: { number: "asc" } }),
    db.material.findMany({ where: { courseId }, orderBy: [{ moduleNumber: "asc" }, { order: "asc" }, { createdAt: "asc" }] }),
  ])

  const body = {
    format: "jewgal-materials",
    version: 1,
    course: course.title,
    modules: modules.map((m) => ({ number: m.number, title: m.title, description: m.description })),
    materials: materials.map((m) => {
      const content = parseContent(m.content)
      const quizData = parseQuizData(m.quizData)
      return {
        title: m.title,
        description: m.description,
        type: m.type,
        moduleNumber: m.moduleNumber,
        groupLabel: m.groupLabel,
        isVisible: m.isVisible,
        estimatedMinutes: m.estimatedMinutes,
        interactionKind: m.interactionKind,
        toolHref: m.toolHref,
        fileUrl: m.fileUrl,
        videoUrl: m.videoUrl,
        linkUrl: m.linkUrl,
        coverImageUrl: m.coverImageUrl,
        content: content.length ? content : null,
        quizData: quizData.length ? quizData : null,
      }
    }),
  }

  return new NextResponse(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${course.slug}-materiales.json"`,
    },
  })
}
