import { z } from "zod"
import { normalizeCouponCode } from "./coupons"

/** Validación de un cupón que llega desde el panel (alta y edición comparten reglas). */

const dateField = z
  .string()
  .refine((v) => !Number.isNaN(new Date(v).getTime()), "Fecha inválida")
  .nullish()

const base = z.object({
  code: z
    .string()
    .transform(normalizeCouponCode)
    .refine((v) => /^[A-Z0-9_-]{3,40}$/.test(v), "El código debe tener entre 3 y 40 letras, números, guiones o guion bajo (sin espacios)."),
  description: z.string().trim().max(200).nullish(),
  type: z.enum(["percent", "fixed"]),
  value: z.number().positive("El descuento tiene que ser mayor que 0.").max(100_000),
  courseIds: z.array(z.string().min(1).max(60)).max(100).default([]),
  maxRedemptions: z.number().int("El tope de usos debe ser un número entero.").min(1, "El tope de usos debe ser al menos 1.").nullish(),
  maxPerUser: z.number().int().min(1).max(100).default(1),
  startsAt: dateField,
  expiresAt: dateField,
  isActive: z.boolean().default(true),
})

type Base = z.infer<typeof base>

/** Reglas que dependen de más de un campo. */
const crossChecks = (v: Partial<Base>, ctx: z.RefinementCtx) => {
  if (v.type === "percent" && v.value !== undefined && v.value > 100) ctx.addIssue({ code: "custom", path: ["value"], message: "Un porcentaje no puede superar 100." })
  if (v.startsAt && v.expiresAt && new Date(v.startsAt) >= new Date(v.expiresAt)) ctx.addIssue({ code: "custom", path: ["expiresAt"], message: "El vencimiento tiene que ser posterior al inicio." })
}

export const createCouponSchema = base.superRefine(crossChecks)
export const patchCouponSchema = base.partial().superRefine(crossChecks)
export type CouponInput = z.infer<typeof patchCouponSchema>

/** Campos listos para guardar (solo los que vinieron en la petición). */
export function couponData(c: CouponInput): Record<string, unknown> {
  const d: Record<string, unknown> = {}
  if (c.code !== undefined) d.code = c.code
  if (c.description !== undefined) d.description = c.description?.trim() || null
  if (c.type !== undefined) d.type = c.type
  if (c.value !== undefined) d.value = c.value
  if (c.courseIds !== undefined) d.courseIds = [...new Set(c.courseIds)]
  if (c.maxRedemptions !== undefined) d.maxRedemptions = c.maxRedemptions ?? null
  if (c.maxPerUser !== undefined) d.maxPerUser = c.maxPerUser
  if (c.startsAt !== undefined) d.startsAt = c.startsAt ? new Date(c.startsAt) : null
  if (c.expiresAt !== undefined) d.expiresAt = c.expiresAt ? new Date(c.expiresAt) : null
  if (c.isActive !== undefined) d.isActive = c.isActive
  return d
}
