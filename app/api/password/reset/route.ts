import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { baseDb } from "@/lib/db"
import { rateLimit, getClientIp } from "@/lib/security"
import { MIN_PASSWORD_LENGTH, findValidResetToken, hashToken } from "@/lib/password-reset"

const schema = z.object({
  token: z.string().min(20).max(200),
  password: z.string().min(MIN_PASSWORD_LENGTH, `Usá al menos ${MIN_PASSWORD_LENGTH} caracteres.`).max(100, "La contraseña es demasiado larga."),
})

/** Guarda la contraseña nueva con el token del enlace. El token se consume en la misma operación (no se puede usar dos veces). */
export async function POST(req: NextRequest) {
  const rl = rateLimit(`pw-reset-ip:${getClientIp(req)}`, 12, 15 * 60_000)
  if (!rl.ok) return NextResponse.json({ error: "Demasiados intentos. Probá de nuevo en unos minutos." }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } })

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
  const { token, password } = parsed.data

  const rec = await findValidResetToken(token)
  if (!rec) return NextResponse.json({ error: "El enlace venció o ya se usó. Pedí uno nuevo.", code: "invalid_token" }, { status: 400 })

  try {
    const hash = await bcrypt.hash(password, 10)
    const consumed = await baseDb.$transaction(async (tx) => {
      // Solo gana quien marca el token como usado primero (evita que dos pedidos simultáneos lo usen a la vez).
      const claim = await tx.passwordResetToken.updateMany({ where: { tokenHash: hashToken(token), usedAt: null, expiresAt: { gt: new Date() } }, data: { usedAt: new Date() } })
      if (claim.count !== 1) return false
      await tx.user.update({ where: { id: rec.userId }, data: { password: hash } })
      await tx.passwordResetToken.deleteMany({ where: { userId: rec.userId, tokenHash: { not: hashToken(token) } } })
      return true
    })
    if (!consumed) return NextResponse.json({ error: "El enlace venció o ya se usó. Pedí uno nuevo.", code: "invalid_token" }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[password-reset] no se pudo guardar la contraseña:", e)
    return NextResponse.json({ error: "No se pudo guardar la contraseña. Probá de nuevo." }, { status: 500 })
  }
}
