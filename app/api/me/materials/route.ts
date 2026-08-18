import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const enrollments = await db.enrollment.findMany({
    where: { userId: session.user.id, status: { in: ["active", "completed"] } },
    select: { courseId: true, course: { select: { title: true } } },
  })
  const courseIds = enrollments.map((e) => e.courseId)
  const titleByCourse = Object.fromEntries(enrollments.map((e) => [e.courseId, e.course.title]))

  if (courseIds.length === 0) {
    return NextResponse.json({ materials: [] })
  }

  const materials = await db.material.findMany({
    where: { courseId: { in: courseIds }, isVisible: true },
    orderBy: [{ moduleNumber: "asc" }, { order: "asc" }],
    select: {
      id: true,
      courseId: true,
      title: true,
      description: true,
      type: true,
      fileUrl: true,
      videoUrl: true,
      linkUrl: true,
      moduleNumber: true,
      order: true,
      isVisible: true,
      interactionKind: true,
      toolHref: true,
      estimatedMinutes: true,
      coverImageUrl: true,
      groupLabel: true,
      createdAt: true,
    },
  })

  const progress = await db.materialProgress.findMany({
    where: { userId: session.user.id, materialId: { in: materials.map((m) => m.id) } },
    select: { materialId: true, completedAt: true, quizScore: true, quizTotal: true },
  })
  const progressByMaterial = Object.fromEntries(progress.map((p) => [p.materialId, p]))

  const courseModules = await db.courseModule.findMany({
    where: { courseId: { in: courseIds } },
    select: { courseId: true, number: true, title: true },
  })
  const moduleTitleByKey = Object.fromEntries(courseModules.map((cm) => [`${cm.courseId}:${cm.number}`, cm.title]))

  return NextResponse.json({
    materials: materials.map((m) => ({
      ...m,
      courseTitle: titleByCourse[m.courseId] ?? "",
      moduleTitle: moduleTitleByKey[`${m.courseId}:${m.moduleNumber}`] ?? null,
      progress: progressByMaterial[m.id] ?? null,
    })),
  })
}
