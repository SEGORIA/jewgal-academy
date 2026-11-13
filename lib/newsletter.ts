import { createHmac, timingSafeEqual } from "crypto"
import { db } from "./db"
import { SITE_URL } from "./site-url"

/**
 * Newsletter: lista de personas suscriptas (SiteSetting "newsletter_subscribers") y enlace de baja firmado.
 * El enlace de baja lleva el correo y una firma (HMAC con el secreto del sitio): nadie puede dar de baja
 * a otra persona adivinando la dirección.
 */

export type Subscriber = { email: string; date: string }
export const SUBSCRIBERS_KEY = "newsletter_subscribers"
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function readSubscribers(): Promise<Subscriber[]> {
  try {
    const s = await db.siteSetting.findUnique({ where: { key: SUBSCRIBERS_KEY } })
    const list = s?.value ? JSON.parse(s.value) : []
    return Array.isArray(list)
      ? list.filter((x): x is Subscriber => typeof x?.email === "string").map((x) => ({ email: x.email.toLowerCase(), date: typeof x.date === "string" ? x.date : new Date(0).toISOString() }))
      : []
  } catch {
    return []
  }
}

export async function writeSubscribers(list: Subscriber[]) {
  const value = JSON.stringify(list)
  await db.siteSetting.upsert({ where: { key: SUBSCRIBERS_KEY }, update: { value }, create: { key: SUBSCRIBERS_KEY, value } })
}

const secret = () => process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || ""

export function unsubscribeToken(email: string): string {
  return createHmac("sha256", secret()).update(`unsubscribe:${email.trim().toLowerCase()}`).digest("hex").slice(0, 40)
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  if (!secret() || !token) return false
  const expected = Buffer.from(unsubscribeToken(email))
  const given = Buffer.from(token)
  return expected.length === given.length && timingSafeEqual(expected, given)
}

export function unsubscribeUrl(email: string): string {
  return `${SITE_URL}/api/newsletter/unsubscribe?e=${encodeURIComponent(email.trim().toLowerCase())}&t=${unsubscribeToken(email)}`
}

/** Encabezados que habilitan el botón “Cancelar suscripción” de Gmail/Apple Mail (baja en un clic). */
export function unsubscribeHeaders(email: string): Record<string, string> {
  return { "List-Unsubscribe": `<${unsubscribeUrl(email)}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" }
}
