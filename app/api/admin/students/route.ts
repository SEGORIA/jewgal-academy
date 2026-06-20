import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const students = await db.user.findMany({
    where: { role: "student" },
    include: {
      enrollments: {
        include: {
          course: { select: { title: true, slug: true, totalHours: true } },
          attendances: { select: { status: true } },
        },
      },
      payments: { select: { amount: true, status: true, paidAt: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  // Sesiones ya dictadas por curso (denominador de asistencia)
  const courseIds = [...new Set(students.flatMap((s) => s.enrollments.map((e) => e.courseId)))]
  const held = courseIds.length
    ? await db.liveSession.groupBy({
        by: ["courseId"],
        where: { courseId: { in: courseIds }, isCompleted: true },
        _count: { id: true },
      })
    : []
  const heldMap = Object.fromEntries(held.map((h) => [h.courseId, h._count.id]))

  const enriched = students.map((s) => ({
    ...s,
    enrollments: s.enrollments.map((e) => {
      const attended = e.attendances.filter((a) => a.status === "present" || a.status === "late").length
      const heldCount = heldMap[e.courseId] ?? 0
      return {
        ...e,
        attendance: { attended, held: heldCount, rate: heldCount > 0 ? Math.round((attended / heldCount) * 100) : null },
      }
    }),
  }))

  return NextResponse.json({ students: enriched })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { name, email, password, courseId } = await req.json()
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Nombre, email y contraseña son requeridos" }, { status: 400 })
  }

  const existing = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } })
  if (existing) {
    return NextResponse.json({ error: "Ya existe una cuenta con ese email" }, { status: 409 })
  }

  const user = await db.user.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: await bcrypt.hash(password, 10),
      role: "student",
    },
  })

  if (courseId) {
    const course = await db.course.findUnique({ where: { id: courseId } })
    if (course) {
      await db.enrollment.create({ data: { userId: user.id, courseId, status: "active" } })
      await db.payment.create({
        data: {
          userId: user.id,
          courseId,
          amount: course.price,
          currency: course.currency,
          status: "demo",
          paidAt: new Date(),
        },
      })
    }
  }

  return NextResponse.json({ ok: true, userId: user.id })
}
