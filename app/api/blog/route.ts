import { NextRequest, NextResponse } from "next/server"
import { getPublishedPosts, toCard } from "@/lib/blog-data"

export const dynamic = "force-dynamic"

/** Listado público del blog: solo publicados cuya fecha ya llegó. `?locale=en` devuelve la versión en inglés cuando existe. */
export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get("locale") === "en" ? "en" : "es"
  try {
    const posts = (await getPublishedPosts(locale)).map(toCard)
    return NextResponse.json({ posts })
  } catch {
    return NextResponse.json({ posts: [] })
  }
}
