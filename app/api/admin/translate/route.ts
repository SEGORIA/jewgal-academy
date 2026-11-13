import { NextRequest, NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import { z } from "zod"
import { rateLimit, getClientIp } from "@/lib/security"
import { isDeepLConfigured, translateTexts } from "@/lib/deepl"

const schema = z.object({
  texts: z.array(z.string()).min(1).max(50),
  target: z.enum(["EN", "ES"]).default("EN"),
  /** Textos del sitio con variables {x} y marcas <b>: se protegen para que la traducción no las rompa. */
  preserveMarkup: z.boolean().default(false),
})

export async function POST(req: NextRequest) {
  const g = await adminGuard("sitio")
  if (!g.ok) return g.response
  g.enter()
  const session = g.session

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
    const translations = await translateTexts(parsed.data.texts, parsed.data.target, { preserveMarkup: parsed.data.preserveMarkup })
    return NextResponse.json({ translations })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al traducir" },
      { status: 502 }
    )
  }
}
