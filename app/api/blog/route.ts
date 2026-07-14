import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const posts = await db.post.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
    })
    return NextResponse.json({ posts })
  } catch {
    return NextResponse.json({ posts: [] })
  }
}
