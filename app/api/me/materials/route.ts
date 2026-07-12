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
  })

  return NextResponse.json({
    materials: materials.map((m) => ({ ...m, courseTitle: titleByCourse[m.courseId] ?? "" })),
  })
}
