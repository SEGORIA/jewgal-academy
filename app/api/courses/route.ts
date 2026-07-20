import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

// Cursos publicados con sus datos comerciales — para que las páginas
// públicas (home, academia) muestren precios reales de la DB.
export async function GET() {
  try {
    const courses = await db.course.findMany({
      where: { isPublished: true },
      select: {
        slug: true,
        title: true,
        price: true,
        currency: true,
        isFree: true,
        durationWeeks: true,
        totalHours: true,
      },
      orderBy: { createdAt: "asc" },
    })
    return NextResponse.json({ courses })
  } catch {
    return NextResponse.json({ courses: [] })
  }
}
