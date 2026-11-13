import { z } from "zod"
import { db } from "./db"

/**
 * Anuncios a alumnos: a quién se envían y cómo se valida lo que escribe quien administra.
 * Audiencia: todos los alumnos · alumnos de uno o varios programas · alumnos concretos.
 */

export const audienceSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("all") }),
  z.object({ type: z.literal("courses"), courseIds: z.array(z.string().min(1)).min(1, "Elegí al menos un programa").max(20) }),
  z.object({ type: z.literal("users"), userIds: z.array(z.string().min(1)).min(1, "Elegí al menos un alumno").max(500) }),
])
export type Audience = z.infer<typeof audienceSchema>

export type Recipient = { id: string; name: string; email: string }

/** Alumnos que van a recibir el anuncio (sin repetidos). */
export async function resolveRecipients(aud: Audience): Promise<Recipient[]> {
  const select = { id: true, name: true, email: true } as const
  if (aud.type === "all") {
    return db.user.findMany({ where: { role: "student" }, select, orderBy: { name: "asc" } })
  }
  if (aud.type === "users") {
    return db.user.findMany({ where: { role: "student", id: { in: aud.userIds } }, select, orderBy: { name: "asc" } })
  }
  return db.user.findMany({
    where: { role: "student", enrollments: { some: { courseId: { in: aud.courseIds }, status: { in: ["active", "completed"] } } } },
    select, orderBy: { name: "asc" },
  })
}

/** Enlace opcional del anuncio: una ruta interna (/aula/…) o una dirección https. */
export const linkSchema = z
  .string().trim().max(500)
  .refine((v) => v === "" || (v.startsWith("/") && !v.startsWith("//")) || /^https?:\/\//i.test(v), "El enlace tiene que empezar con / (una página del sitio) o con https://")
  .optional()

export const announcementSchema = z.object({
  title: z.string().trim().min(3, "Escribí un título (mínimo 3 caracteres)").max(120, "El título admite hasta 120 caracteres"),
  body: z.string().trim().min(5, "Escribí el mensaje").max(4000, "El mensaje admite hasta 4000 caracteres"),
  linkUrl: linkSchema,
  audience: audienceSchema,
  channels: z.object({ app: z.boolean(), email: z.boolean() }).refine((c) => c.app || c.email, "Elegí al menos un canal"),
})
