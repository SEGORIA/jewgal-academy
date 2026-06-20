import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const payments = await db.payment.findMany({
    where: { userId: session.user.id },
    include: { course: { select: { title: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ payments })
}
