import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireStudent } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await requireStudent()
  if (!session.ok) return session.response

  const [notifications, unreadCount] = await Promise.all([
    db.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, type: true, message: true, metadata: true, isRead: true, createdAt: true },
    }),
    db.notification.count({ where: { userId: session.userId, isRead: false } }),
  ])

  return NextResponse.json({ notifications, unreadCount })
}

export async function PATCH(req: NextRequest) {
  const session = await requireStudent()
  if (!session.ok) return session.response

  const body = await req.json().catch(() => null)

  if (body?.markAllRead) {
    await db.notification.updateMany({ where: { userId: session.userId, isRead: false }, data: { isRead: true } })
    return NextResponse.json({ ok: true })
  }

  if (typeof body?.id === "string") {
    await db.notification.updateMany({ where: { id: body.id, userId: session.userId }, data: { isRead: true } })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
}
