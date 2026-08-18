import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireStudent } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await requireStudent()
  if (!session.ok) return session.response

  const enrollments = await db.enrollment.findMany({
    where: { userId: session.userId, status: { in: ["active", "completed"] } },
    select: { courseId: true },
  })
  const courseIds = enrollments.map((e) => e.courseId)

  const categories = await db.forumCategory.findMany({
    where: {
      isVisible: true,
      OR: [{ courseId: null }, { courseId: { in: courseIds } }],
    },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: {
      course: { select: { title: true } },
      _count: { select: { topics: { where: { isVisible: true } } } },
    },
  })

  return NextResponse.json({ categories })
}
