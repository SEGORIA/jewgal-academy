import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getAulaConfig } from "@/lib/aula-config-server"

export const dynamic = "force-dynamic"

/** Textos, niveles y logros del aula (editados desde el panel). Solo para quien tiene sesión. */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  return NextResponse.json(await getAulaConfig(), { headers: { "Cache-Control": "no-store" } })
}
