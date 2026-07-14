import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const { id } = await params

  const conversation = await db.conversation
    .findFirst({
      where: { id, userId: session.user.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    })
    .catch(() => null)

  if (!conversation) {
    return NextResponse.json({ error: "Conversación no encontrada" }, { status: 404 })
  }

  return NextResponse.json({ conversation })
}
