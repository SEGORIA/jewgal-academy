import { NextRequest, NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  const g = await adminGuard("any")
  if (!g.ok) return g.response
  g.enter()
  const session = g.session

  const [notifications, unreadCount] = await Promise.all([
    db.notification.findMany({ where: { userId: null }, orderBy: { createdAt: "desc" }, take: 50 }),
    db.notification.count({ where: { userId: null, isRead: false } }),
  ])

  return NextResponse.json({ notifications, unreadCount })
}

export async function PATCH(req: NextRequest) {
  const g = await adminGuard("any")
  if (!g.ok) return g.response
  g.enter()
  const session = g.session

  const body = await req.json().catch(() => null)

  if (body?.markAllRead) {
    await db.notification.updateMany({ where: { userId: null, isRead: false }, data: { isRead: true } })
    return NextResponse.json({ ok: true })
  }

  if (typeof body?.id === "string") {
    await db.notification.updateMany({ where: { id: body.id, userId: null }, data: { isRead: true } })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
}
