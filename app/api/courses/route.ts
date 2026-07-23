import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

// Cursos publicados con sus datos comerciales — para que las páginas
// públicas (home, academia) muestren precios reales de la DB.
// ?locale=en devuelve title/shortDesc en inglés cuando existe la traducción
// (si no, cae al español vigente — nunca se ve vacío).
export async function GET(req: NextRequest) {
  const isEn = req.nextUrl.searchParams.get("locale") === "en"

  try {
    const courses = await db.course.findMany({
      where: { isPublished: true },
      select: {
        slug: true,
        title: true,
        titleEn: true,
        shortDesc: true,
        shortDescEn: true,
        price: true,
        currency: true,
        isFree: true,
        durationWeeks: true,
        totalHours: true,
      },
      orderBy: { createdAt: "asc" },
    })
    const resolved = courses.map(({ titleEn, shortDescEn, ...c }) => ({
      ...c,
      title: (isEn && titleEn) || c.title,
      shortDesc: (isEn && shortDescEn) || c.shortDesc,
    }))
    return NextResponse.json({ courses: resolved })
  } catch {
    return NextResponse.json({ courses: [] })
  }
}
