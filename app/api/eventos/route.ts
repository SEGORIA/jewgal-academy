import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { DEFAULT_EVENTOS } from "@/lib/eventos"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const setting = await db.siteSetting.findUnique({ where: { key: "eventos" } })
    if (setting?.value) return NextResponse.json(JSON.parse(setting.value))
  } catch {}
  return NextResponse.json(DEFAULT_EVENTOS)
}
