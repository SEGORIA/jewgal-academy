import { z } from "zod"

/** Validación de una oferta de Coaching 1:1 que llega desde el panel (alta y edición comparten reglas). */
export const offerSchema = z.object({
  title: z.string().trim().min(2, "Falta el nombre de la oferta").max(120),
  titleEn: z.string().trim().max(120).nullish(),
  description: z.string().trim().max(1000).default(""),
  descriptionEn: z.string().trim().max(1000).nullish(),
  durationMin: z.number().int().min(15, "La duración mínima es 15 minutos").max(480),
  price: z.number().min(0).max(100000),
  currency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/, "Moneda inválida (ej. USD)").default("USD"),
  isActive: z.boolean().default(true),
  order: z.number().int().min(0).max(10000).default(0),
})
