import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getCertificateDesign } from "@/lib/certificate-design"

export const dynamic = "force-dynamic"

const CACHE = "public, s-maxage=60, stale-while-revalidate=300"

export async function GET() {
  const design = await getCertificateDesign(db)
  return NextResponse.json(design, { headers: { "Cache-Control": CACHE } })
}
