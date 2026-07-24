import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { mergeSiteContent } from "@/lib/site-content"

export const dynamic = "force-dynamic"

// El contenido cambia rara vez (solo cuando la admin edita). Se cachea en el
// edge de Vercel 60s y se sirve viejo hasta 5 min mientras revalida — así las
// visitas repetidas no pegan a la base y el sitio carga mucho más rápido.
const CACHE = "public, s-maxage=60, stale-while-revalidate=300"

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get("locale") === "en" ? "en" : "es"

  let esContent = mergeSiteContent(null)
  try {
    const setting = await db.siteSetting.findUnique({ where: { key: "site_content" } })
    if (setting?.value) esContent = mergeSiteContent(JSON.parse(setting.value))
  } catch {}

  if (locale === "es") {
    return NextResponse.json(esContent, { headers: { "Cache-Control": CACHE } })
  }

  try {
    const enSetting = await db.siteSetting.findUnique({ where: { key: "site_content_en" } })
    if (enSetting?.value) {
      return NextResponse.json(mergeSiteContent(JSON.parse(enSetting.value), esContent), {
        headers: { "Cache-Control": CACHE },
      })
    }
  } catch {}

  return NextResponse.json(esContent, { headers: { "Cache-Control": CACHE } })
}
