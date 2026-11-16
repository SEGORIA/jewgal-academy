import { createHash, randomBytes } from "crypto"
import { baseDb } from "./db"

/**
 * Recuperación de contraseña por correo.
 * - El enlace lleva un token aleatorio de 256 bits; en la base solo se guarda su hash SHA-256 (si alguien viera la
 *   tabla, no podría armar enlaces válidos).
 * - Vale una hora y se puede usar una sola vez. Pedir uno nuevo anula los anteriores.
 */

export const RESET_TTL_MS = 60 * 60 * 1000
export const MIN_PASSWORD_LENGTH = 8

export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex")

/** Crea un token nuevo para la cuenta y devuelve el valor para el enlace (el único momento en que existe en claro). */
export async function createResetToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url")
  await baseDb.$transaction([
    baseDb.passwordResetToken.deleteMany({ where: { userId } }),
    baseDb.passwordResetToken.create({ data: { userId, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + RESET_TTL_MS) } }),
  ])
  return token
}

/** El token de un enlace, si todavía sirve (existe, no se usó y no venció). */
export async function findValidResetToken(token: string | null | undefined) {
  if (!token || token.length < 20 || token.length > 200) return null
  try {
    const rec = await baseDb.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) }, select: { id: true, userId: true, expiresAt: true, usedAt: true } })
    if (!rec || rec.usedAt || rec.expiresAt.getTime() < Date.now()) return null
    return rec
  } catch {
    return null
  }
}

/** Borra los tokens vencidos o usados (limpieza oportunista; la tabla nunca crece sin control). */
export async function purgeOldResetTokens() {
  try {
    await baseDb.passwordResetToken.deleteMany({ where: { OR: [{ expiresAt: { lt: new Date() } }, { usedAt: { not: null } }] } })
  } catch { /* no es crítico */ }
}
