import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { rateLimit, getClientIp } from "@/lib/security"
import { isDeepLConfigured, translateTexts } from "@/lib/deepl"

const schema = z.object({
  texts: z.array(z.string()).min(1).max(50),
  target: z.enum(["EN", "ES"]).default("EN"),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const rl = rateLimit(`translate:${getClientIp(req)}`, 20, 60_000)
  if (!rl.ok) {
    return NextResponse.json({ error: "Demasiados intentos. Esperá un momento." }, { status: 429 })
  }

  if (!isDeepLConfigured()) {
    return NextResponse.json(
      { error: "La traducción automática no está configurada. Agregá DEEPL_API_KEY para activarla." },
      { status: 503 }
    )
  }

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }

  try {
    const translations = await translateTexts(parsed.data.texts, parsed.data.target)
    return NextResponse.json({ translations })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al traducir" },
      { status: 502 }
    )
  }
}
