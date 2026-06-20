import { randomBytes } from "crypto"

/**
 * Genera una contraseña temporal criptográficamente segura.
 * Reemplaza el inseguro Math.random() para credenciales.
 */
export function generateTempPassword(bytes = 9): string {
  return randomBytes(bytes).toString("base64url")
}

/**
 * Rate limiter simple en memoria (best-effort).
 * En serverless protege contra ráfagas dentro de una misma instancia caliente.
 * Para protección robusta multi-instancia, migrar a @upstash/ratelimit + Redis.
 */
const hits = new Map<string, { count: number; reset: number }>()

export function rateLimit(
  key: string,
  limit = 5,
  windowMs = 60_000
): { ok: boolean; retryAfter: number } {
  const now = Date.now()

  // Purga ocasional de entradas expiradas para evitar fuga de memoria
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (now > v.reset) hits.delete(k)
  }

  const entry = hits.get(key)
  if (!entry || now > entry.reset) {
    hits.set(key, { count: 1, reset: now + windowMs })
    return { ok: true, retryAfter: 0 }
  }

  entry.count++
  if (entry.count > limit) {
    return { ok: false, retryAfter: Math.ceil((entry.reset - now) / 1000) }
  }
  return { ok: true, retryAfter: 0 }
}

/** Extrae la IP del cliente desde los headers del proxy (Vercel). */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for")
  if (xff) return xff.split(",")[0].trim()
  return req.headers.get("x-real-ip") ?? "unknown"
}
