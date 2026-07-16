import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  // Obtener cursos con inscripción activa del alumno
  const enrollments = await db.enrollment.findMany({
    where: { userId: session.user.id, status: { in: ["active", "completed"] } },
    select: { courseId: true },
  })
  const activeCourseIds = enrollments.map((e) => e.courseId)

  // Recursos globales (courseId null) + recursos de sus cursos activos
  const resources = await db.exclusiveResource.findMany({
    where: {
      isVisible: true,
      OR: [
        { courseId: null },
        { courseId: { in: activeCourseIds } },
      ],
    },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { course: { select: { id: true, title: true } } },
  })

  return NextResponse.json({ resources })
}
