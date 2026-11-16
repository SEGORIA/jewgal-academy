import { NextRequest, NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

/** Reservas de Coaching 1:1. `?scope=upcoming` (por defecto) · `past` · `all`. */
export async function GET(req: NextRequest) {
  const g = await adminGuard("alumnos")
  if (!g.ok) return g.response
  g.enter()
  const scope = req.nextUrl.searchParams.get("scope") ?? "upcoming"
  const now = new Date()
  const where = scope === "past" ? { startsAt: { lt: now } } : scope === "all" ? {} : { startsAt: { gte: new Date(now.getTime() - 3_600_000) } }
  const bookings = await db.coachingBooking.findMany({ where, orderBy: { startsAt: scope === "past" ? "desc" : "asc" }, take: 300 })
  return NextResponse.json({ bookings })
}
