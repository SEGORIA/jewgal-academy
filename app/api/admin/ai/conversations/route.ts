import { NextRequest, NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import { baseDb } from "@/lib/db"

export const dynamic = "force-dynamic"

/** Conversaciones recientes de los alumnos con el asistente (`?q=` busca por nombre o correo). Solo el super administrador. */
export async function GET(req: NextRequest) {
  const g = await adminGuard("superadmin")
  if (!g.ok) return g.response
  g.enter()
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 80)
  const rows = await baseDb.conversation.findMany({
    where: q ? { user: { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } } : {},
    orderBy: { updatedAt: "desc" },
    take: 60,
    select: { id: true, title: true, updatedAt: true, createdAt: true, user: { select: { name: true, email: true } }, _count: { select: { messages: true } } },
  })
  return NextResponse.json({
    conversations: rows.map((c) => ({ id: c.id, title: c.title, updatedAt: c.updatedAt, createdAt: c.createdAt, student: c.user.name, email: c.user.email, messages: c._count.messages })),
  })
}
