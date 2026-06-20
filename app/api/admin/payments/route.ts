import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const payments = await db.payment.findMany({
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const byProgram = await db.payment.groupBy({
    by: ["courseId"],
    _count: { courseId: true },
    _sum: { amount: true },
    where: { status: { in: ["completed", "demo"] } },
  })

  return NextResponse.json({ payments, byProgram })
}
