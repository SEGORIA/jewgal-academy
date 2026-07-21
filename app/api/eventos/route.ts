import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { DEFAULT_EVENTOS } from "@/lib/eventos"

export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "no-store, max-age=0" }

export async function GET() {
  try {
    const setting = await db.siteSetting.findUnique({ where: { key: "eventos" } })
    if (setting?.value) return NextResponse.json(JSON.parse(setting.value), { headers: NO_STORE })
  } catch {}
  return NextResponse.json(DEFAULT_EVENTOS, { headers: NO_STORE })
}
