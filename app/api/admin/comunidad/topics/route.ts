import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const session = await requireAdmin()
  if (!session.ok) return session.response

  const { searchParams } = new URL(req.url)
  const categoryId = searchParams.get("categoryId")
  const search = searchParams.get("search")?.trim()

  const topics = await db.forumTopic.findMany({
    where: {
      ...(categoryId && { categoryId }),
      ...(search && { title: { contains: search, mode: "insensitive" } }),
    },
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
      category: { select: { id: true, name: true } },
      _count: { select: { posts: true } },
    },
  })

  return NextResponse.json({ topics })
}
