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
  if (!filter || filter === "active")    where.status = "active"
  if (filter === "completed")            where.status = "completed"
  // filter === "all" → sin filtro de status

  const enrollments = await db.enrollment.findMany({
    where,
    include: { course: { select: { id: true, title: true, slug: true, isFree: true } } },
    orderBy: { enrolledAt: "desc" },
  })

  return NextResponse.json({ enrollments })
}
