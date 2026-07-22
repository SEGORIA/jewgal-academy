import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const [notifications, unreadCount] = await Promise.all([
    db.notification.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    db.notification.count({ where: { isRead: false } }),
  ])

  return NextResponse.json({ notifications, unreadCount })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json().catch(() => null)

  if (body?.markAllRead) {
    await db.notification.updateMany({ where: { isRead: false }, data: { isRead: true } })
    return NextResponse.json({ ok: true })
  }

  if (typeof body?.id === "string") {
    await db.notification.update({ where: { id: body.id }, data: { isRead: true } })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
}
