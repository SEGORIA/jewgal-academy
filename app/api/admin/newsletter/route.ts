import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const setting = await db.siteSetting.findUnique({ where: { key: "newsletter_subscribers" } })
    const subscribers = setting?.value ? JSON.parse(setting.value) : []
    return NextResponse.json({ subscribers })
  } catch {
    return NextResponse.json({ subscribers: [] })
  }
}
