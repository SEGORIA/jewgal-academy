import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

/**
 * GET sin courseId  → lista de programas (para el selector).
 * GET con courseId   → sesiones del programa + alumnos inscritos con su asistencia actual.
 */
export async function GET(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const courseId = new URL(req.url).searchParams.get("courseId")

  if (!courseId) {
    const courses = await db.course.findMany({
      where: { isPublished: true },
      select: { id: true, title: true, slug: true },
      orderBy: { title: "asc" },
    })
    return NextResponse.json({ courses })
  }

  const [sessions, enrollments] = await Promise.all([
    db.liveSession.findMany({
      where: { courseId },
      orderBy: { scheduledAt: "asc" },
      select: { id: true, title: true, scheduledAt: true, durationMin: true, isCompleted: true },
    }),
    db.enrollment.findMany({
      where: { courseId, status: { in: ["active", "completed"] } },
      include: {
        user: { select: { name: true, email: true } },
        attendances: { select: { liveSessionId: true, status: true } },
      },
      orderBy: { enrolledAt: "asc" },
    }),
  ])

  const students = enrollments.map((e) => ({
    enrollmentId: e.id,
    name: e.user.name,
    email: e.user.email,
    attendance: Object.fromEntries(e.attendances.map((a) => [a.liveSessionId, a.status])),
  }))

  return NextResponse.json({ sessions, students })
}

/** Guarda la lista de asistencia de una sesión (bulk upsert). */
const postSchema = z.object({
  liveSessionId: z.string().min(1),
  records: z
    .array(
      z.object({
        enrollmentId: z.string().min(1),
        status: z.enum(["present", "absent", "late"]),
      })
    )
    .max(500),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const parsed = postSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }
  const { liveSessionId, records } = parsed.data

  await Promise.all(
    records.map((r) =>
      db.attendance.upsert({
        where: { enrollmentId_liveSessionId: { enrollmentId: r.enrollmentId, liveSessionId } },
        update: { status: r.status },
        create: { enrollmentId: r.enrollmentId, liveSessionId, status: r.status },
      })
    )
  )

  // La sesión queda como dictada → cuenta en el denominador de asistencia (evita % > 100)
  await db.liveSession.update({ where: { id: liveSessionId }, data: { isCompleted: true } })

  return NextResponse.json({ ok: true, count: records.length })
}
