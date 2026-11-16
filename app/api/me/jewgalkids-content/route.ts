import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getJewgalkids } from "@/lib/aula-config-server"

export const dynamic = "force-dynamic"

/** Respiración, posturas y valores de Joogalkids (los originales o los editados desde el panel). Solo con sesión. */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  return NextResponse.json((await getJewgalkids()).content, { headers: { "Cache-Control": "no-store" } })
}
