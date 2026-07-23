import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { mergeSiteContent } from "@/lib/site-content"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get("locale") === "en" ? "en" : "es"

  let esContent = mergeSiteContent(null)
  try {
    const setting = await db.siteSetting.findUnique({ where: { key: "site_content" } })
    if (setting?.value) esContent = mergeSiteContent(JSON.parse(setting.value))
  } catch {}

  if (locale === "es") return NextResponse.json(esContent)

  try {
    const enSetting = await db.siteSetting.findUnique({ where: { key: "site_content_en" } })
    if (enSetting?.value) return NextResponse.json(mergeSiteContent(JSON.parse(enSetting.value), esContent))
  } catch {}

  return NextResponse.json(esContent)
}
