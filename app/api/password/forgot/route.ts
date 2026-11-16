import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { baseDb } from "@/lib/db"
import { rateLimit, getClientIp } from "@/lib/security"
import { runAfterResponse } from "@/lib/background"
import { createResetToken, purgeOldResetTokens } from "@/lib/password-reset"
import { isEmailConfigured, sendPasswordResetEmail } from "@/lib/email"
import { SITE_URL } from "@/lib/site-url"

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  locale: z.enum(["es", "en"]).optional(),
})

/**
 * “Olvidé mi contraseña”. Responde SIEMPRE lo mismo, exista o no la cuenta, para que nadie pueda usar esta pantalla
 * para averiguar quién está registrado. El trabajo (buscar la cuenta, crear el token y mandar el correo) corre después
 * de responder, así la demora tampoco delata si la cuenta existe.
 */
export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Ingresá un correo electrónico válido." }, { status: 400 })
  const { email, locale } = parsed.data

  const byIp = rateLimit(`pw-forgot-ip:${getClientIp(req)}`, 8, 15 * 60_000)
  const byEmail = rateLimit(`pw-forgot-mail:${email}`, 3, 60 * 60_000)
  if (!byIp.ok || !byEmail.ok) {
    return NextResponse.json({ error: "Hiciste demasiados pedidos. Probá de nuevo en unos minutos." }, { status: 429, headers: { "Retry-After": String(Math.max(byIp.retryAfter, byEmail.retryAfter)) } })
  }

  runAfterResponse(async () => {
    const user = await baseDb.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } }, select: { id: true, name: true, email: true, password: true } })
    if (!user?.password) return // sin cuenta (o cuenta sin contraseña propia): no se envía nada
    const token = await createResetToken(user.id)
    const url = `${SITE_URL}${locale === "en" ? "/en" : ""}/restablecer-contrasena?token=${token}`

    if (!isEmailConfigured()) {
      // Sin Resend no hay forma de mandar el correo. En desarrollo se muestra el enlace en la consola para poder probar.
      if (process.env.NODE_ENV !== "production") console.log(`[password-reset] enlace (solo desarrollo) para ${user.email}: ${url}`)
      else console.error("[password-reset] no se pudo enviar: falta RESEND_API_KEY")
      return
    }
    const r = await sendPasswordResetEmail({ email: user.email, name: user.name?.split(" ")[0] || user.name || "", url })
    if (!r.ok) console.error("[password-reset] el correo no salió:", r.error)
    void purgeOldResetTokens()
  }, "recuperar contraseña")

  return NextResponse.json({ ok: true })
}
