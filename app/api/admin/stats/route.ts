import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const [studentCount, enrollmentCount, payments, enrollmentsByProgram] = await Promise.all([
    db.user.count({ where: { role: "student" } }),
    db.enrollment.count({ where: { status: "active" } }),
    db.payment.findMany({ where: { status: { in: ["completed", "demo"] } } }),
    db.enrollment.groupBy({
      by: ["courseId"],
      _count: { courseId: true },
      where: { status: "active" },
    }),
  ])

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)

  // Mapear courseId → slug para poder agrupar por programa en el front
  const courses = await db.course.findMany({ select: { id: true, slug: true } })
  const slugById = Object.fromEntries(courses.map((c) => [c.id, c.slug]))
  const byProgram = enrollmentsByProgram.map((e) => ({
    slug: slugById[e.courseId] ?? null,
    count: e._count.courseId,
  }))

  return NextResponse.json({
    studentCount,
    enrollmentCount,
    totalRevenue,
    paymentCount: payments.length,
    enrollmentsByProgram: byProgram,
  })
}
