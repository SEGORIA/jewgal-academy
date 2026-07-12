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
    select: { id: true, courseId: true, course: { select: { title: true } } },
  })
  const courseIds = enrollments.map((e) => e.courseId)
  const titleByCourse = Object.fromEntries(enrollments.map((e) => [e.courseId, e.course.title]))
  const enrollmentByCourse = Object.fromEntries(enrollments.map((e) => [e.courseId, e.id]))

  if (courseIds.length === 0) {
    return NextResponse.json({ sessions: [] })
  }

  const sessions = await db.liveSession.findMany({
    where: { courseId: { in: courseIds } },
    orderBy: { scheduledAt: "asc" },
  })

  const enrollmentIds = Object.values(enrollmentByCourse)
  const attendances = await db.attendance.findMany({
    where: { enrollmentId: { in: enrollmentIds }, liveSessionId: { in: sessions.map((s) => s.id) } },
    select: { liveSessionId: true, status: true },
  })
  const attendanceBySession = Object.fromEntries(attendances.map((a) => [a.liveSessionId, a.status]))

  return NextResponse.json({
    sessions: sessions.map((s) => ({
      ...s,
      courseTitle: titleByCourse[s.courseId] ?? "",
      myAttendance: attendanceBySession[s.id] ?? null,
    })),
  })
}
