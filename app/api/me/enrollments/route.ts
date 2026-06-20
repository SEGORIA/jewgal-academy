import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const filter = searchParams.get("status") // "active" | "completed" | "all" | null → activos

  const where: Record<string, unknown> = { userId: session.user.id }
  if (!filter || filter === "active") where.status = "active"
  if (filter === "completed") where.status = "completed"
  // filter === "all" → sin filtro de status

  const rows = await db.enrollment.findMany({
    where,
    include: {
      course: { select: { id: true, title: true, slug: true, isFree: true, totalHours: true, durationWeeks: true } },
      attendances: { select: { status: true } },
    },
    orderBy: { enrolledAt: "desc" },
  })

  // Sesiones ya dictadas por curso (denominador de asistencia)
  const courseIds = [...new Set(rows.map((e) => e.courseId))]
  const sessionCounts = courseIds.length
    ? await db.liveSession.groupBy({
        by: ["courseId"],
        where: { courseId: { in: courseIds }, isCompleted: true },
        _count: { id: true },
      })
    : []
  const heldByCourse = Object.fromEntries(sessionCounts.map((s) => [s.courseId, s._count.id]))

  const enrollments = rows.map((e) => {
    const attended = e.attendances.filter((a) => a.status === "present" || a.status === "late").length
    const held = heldByCourse[e.courseId] ?? 0
    const attendanceRate = held > 0 ? Math.round((attended / held) * 100) : null

    return {
      id: e.id,
      enrolledAt: e.enrolledAt,
      status: e.status,
      progress: e.progress,
      hoursCompleted: e.hoursCompleted,
      completedAt: e.completedAt,
      certificateNumber: e.certificateNumber,
      certificateUrl: e.certificateUrl,
      attendance: { attended, held, rate: attendanceRate },
      course: e.course,
    }
  })

  return NextResponse.json({ enrollments })
}
