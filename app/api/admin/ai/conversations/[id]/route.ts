import { NextRequest, NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import { baseDb } from "@/lib/db"

export const dynamic = "force-dynamic"

/** Los mensajes de una conversación. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await adminGuard("superadmin")
  if (!g.ok) return g.response
  g.enter()
  const { id } = await params
  const c = await baseDb.conversation.findUnique({
    where: { id },
    select: { id: true, title: true, user: { select: { name: true, email: true } }, messages: { orderBy: { createdAt: "asc" }, take: 500, select: { id: true, role: true, content: true, createdAt: true } } },
  })
  if (!c) return NextResponse.json({ error: "Conversación no encontrada" }, { status: 404 })
  return NextResponse.json({ conversation: { id: c.id, title: c.title, student: c.user.name, email: c.user.email, messages: c.messages } })
}
