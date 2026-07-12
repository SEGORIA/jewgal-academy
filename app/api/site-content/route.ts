import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { mergeSiteContent } from "@/lib/site-content"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const setting = await db.siteSetting.findUnique({ where: { key: "site_content" } })
    if (setting?.value) return NextResponse.json(mergeSiteContent(JSON.parse(setting.value)))
  } catch {}
  return NextResponse.json(mergeSiteContent(null))
}
