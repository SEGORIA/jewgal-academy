import type { Coupon } from "@prisma/client"
import { baseDb } from "./db"

/**
 * Cupones de descuento.
 *
 * El precio SIEMPRE lo calcula el servidor: el navegador solo manda el código. Se valida al mostrar el descuento
 * (/api/coupons/validate) y otra vez al crear el cobro (Stripe / PayPal / inscripción directa), así que un cupón
 * vencido, agotado o de otro programa nunca llega a cobrarse con descuento.
 */

/** Stripe no cobra menos de 0,50: un cupón que deja un monto entre 0 y 0,50 no se puede cobrar. */
export const MIN_CHARGE = 0.5

export class CouponError extends Error {
  constructor(message: string) { super(message); this.name = "CouponError" }
}

export const normalizeCouponCode = (raw: unknown): string =>
  typeof raw === "string" ? raw.trim().toUpperCase().replace(/\s+/g, "").slice(0, 40) : ""

const round2 = (n: number) => Math.round(n * 100) / 100

export function priceWithCoupon(coupon: Pick<Coupon, "type" | "value">, listPrice: number): { discount: number; finalAmount: number } {
  const raw = coupon.type === "percent" ? (listPrice * coupon.value) / 100 : coupon.value
  const discount = round2(Math.min(Math.max(raw, 0), listPrice))
  return { discount, finalAmount: round2(Math.max(0, listPrice - discount)) }
}

export type CouponQuote = { coupon: Coupon; listPrice: number; discount: number; finalAmount: number; currency: string }
type CourseForCoupon = { id: string; price: number; currency: string; isFree: boolean }

/** Verifica el cupón para un programa (y, si se conoce, para un correo). Lanza CouponError con un mensaje para mostrar. */
export async function quoteCoupon(input: { code: string; course: CourseForCoupon; email?: string | null }): Promise<CouponQuote> {
  const code = normalizeCouponCode(input.code)
  if (!code) throw new CouponError("Ingresá un código de cupón.")
  if (input.course.isFree || input.course.price <= 0) throw new CouponError("Este programa es gratuito: no necesita cupón.")

  const coupon = await baseDb.coupon.findUnique({ where: { code } })
  if (!coupon || !coupon.isActive) throw new CouponError("Ese cupón no existe o ya no está activo.")

  const now = new Date()
  if (coupon.startsAt && coupon.startsAt > now) throw new CouponError("Este cupón todavía no está vigente.")
  if (coupon.expiresAt && coupon.expiresAt < now) throw new CouponError("Este cupón venció.")
  if (coupon.courseIds.length && !coupon.courseIds.includes(input.course.id)) throw new CouponError("Este cupón no se puede usar en este programa.")
  if (coupon.maxRedemptions !== null && coupon.redemptions >= coupon.maxRedemptions) throw new CouponError("Este cupón alcanzó su límite de usos.")

  const email = input.email?.trim().toLowerCase()
  if (email) {
    const used = await baseDb.couponRedemption.count({ where: { couponId: coupon.id, email: { equals: email, mode: "insensitive" } } })
    if (used >= coupon.maxPerUser) throw new CouponError("Ya usaste este cupón con este correo.")
  }

  const { discount, finalAmount } = priceWithCoupon(coupon, input.course.price)
  if (discount <= 0) throw new CouponError("Este cupón no aplica descuento a este programa.")
  if (finalAmount > 0 && finalAmount < MIN_CHARGE) throw new CouponError("Con este cupón el monto queda por debajo del mínimo que se puede cobrar.")

  return { coupon, listPrice: input.course.price, discount, finalAmount, currency: input.course.currency }
}

/**
 * Anota el uso de un cupón en un pago ya realizado. Es idempotente por pago: si Stripe reenvía el aviso, no se cuenta dos veces.
 * Un pago ya hecho con el descuento no se rechaza aunque el cupón se haya agotado justo en ese momento.
 */
export async function recordRedemption(input: { code: string; email: string; userId?: string | null; paymentId: string }) {
  const coupon = await baseDb.coupon.findUnique({ where: { code: normalizeCouponCode(input.code) } })
  if (!coupon) return
  const already = await baseDb.couponRedemption.findFirst({ where: { couponId: coupon.id, paymentId: input.paymentId } })
  if (already) return
  await baseDb.$transaction([
    baseDb.couponRedemption.create({ data: { couponId: coupon.id, email: input.email.trim().toLowerCase(), userId: input.userId ?? null, paymentId: input.paymentId } }),
    baseDb.coupon.update({ where: { id: coupon.id }, data: { redemptions: { increment: 1 } } }),
  ])
}

/**
 * Reserva un uso del cupón ANTES de inscribir sin cobro (descuento del 100%). La condición del tope va en la misma
 * sentencia SQL, así dos pedidos simultáneos no pueden pasarse del límite. Devuelve false si ya no quedan usos.
 */
export async function claimCouponUse(couponId: string): Promise<boolean> {
  const n = await baseDb.$executeRaw`UPDATE "Coupon" SET "redemptions" = "redemptions" + 1 WHERE "id" = ${couponId} AND "isActive" = true AND ("maxRedemptions" IS NULL OR "redemptions" < "maxRedemptions")`
  return n === 1
}

/** Devuelve el uso reservado si la inscripción falló (compensación de claimCouponUse). */
export async function releaseCouponUse(couponId: string) {
  await baseDb.$executeRaw`UPDATE "Coupon" SET "redemptions" = GREATEST("redemptions" - 1, 0) WHERE "id" = ${couponId}`
}

/** Cupón que quedó anotado en los metadatos de una sesión de Stripe al crearla (lo escribe el servidor, no el comprador). */
export function couponFromMetadata(meta: Record<string, string> | null | undefined): { code: string; discount: number } | undefined {
  const code = meta?.couponCode ? normalizeCouponCode(meta.couponCode) : ""
  const discount = Number(meta?.discount)
  return code && Number.isFinite(discount) && discount > 0 ? { code, discount } : undefined
}

/** Texto corto del descuento de un cupón (para el panel). */
export function describeCoupon(c: Pick<Coupon, "type" | "value">, currency = "USD"): string {
  return c.type === "percent" ? `${c.value}% de descuento` : `${c.value.toFixed(2)} ${currency} de descuento`
}
