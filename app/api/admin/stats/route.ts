import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const [studentCount, enrollmentCount, payments, enrollmentsByProgram, courses] = await Promise.all([
      db.user.count({ where: { role: "student" } }),
      db.enrollment.count({ where: { status: "active" } }),
      db.payment.findMany({ where: { status: { in: ["completed", "demo"] } } }),
      db.enrollment.groupBy({
        by: ["courseId"],
        _count: { courseId: true },
        where: { status: "active" },
      }),
      db.course.findMany({ select: { id: true, slug: true, title: true, isPublished: true }, orderBy: { createdAt: "asc" } }),
    ])

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)

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
      courses,
      publishedCourseCount: courses.filter((c) => c.isPublished).length,
      integrations: {
        stripe: !!process.env.STRIPE_SECRET_KEY,
        paypal: !!process.env.PAYPAL_CLIENT_ID,
        email: !!process.env.RESEND_API_KEY,
        ai: !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.startsWith("gsk_")),
        cloudinary: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET),
      },
    })
  } catch {
    return NextResponse.json({ error: "Error al cargar estadísticas" }, { status: 500 })
  }
}
