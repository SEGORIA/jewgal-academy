import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { enrollUserInCourse } from "@/lib/enroll"
import { generateTempPassword, rateLimit, getClientIp } from "@/lib/security"

/**
 * DEMO checkout — simula un pago exitoso SIN cobrar nada.
 * Se usa para probar el flujo completo (comprar → crear cuenta → entrar al aula)
 * mientras no estén configuradas las credenciales reales de Stripe/PayPal.
 * Devuelve la contraseña temporal para iniciar sesión automáticamente.
 */
const bodySchema = z.object({
  courseId: z.string().min(1),
  email: z.string().email("Email inválido").max(160),
  name: z.string().trim().max(120).optional(),
})

export async function POST(req: NextRequest) {
  // Rate limit por IP: máx. 5 solicitudes por minuto
  const ip = getClientIp(req)
  const rl = rateLimit(`demo-enroll:${ip}`, 5, 60_000)
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Demasiados intentos. Esperá un momento." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    )
  }

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }
  const { courseId, email, name } = parsed.data

  const course = await db.course.findUnique({ where: { id: courseId } })
  if (!course) return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })

  const result = await enrollUserInCourse({
    email,
    name: name || "Estudiante Demo",
    courseId,
    amount: course.price,
    currency: course.currency,
    provider: "demo",
  })

  // Si el usuario ya existía, fijamos una contraseña segura conocida para el demo
  let tempPassword = result.tempPassword
  if (!tempPassword) {
    const bcrypt = (await import("bcryptjs")).default
    tempPassword = generateTempPassword()
    await db.user.update({
      where: { id: result.userId },
      data: { password: await bcrypt.hash(tempPassword, 10) },
    })
  }

  return NextResponse.json({
    ok: true,
    email: email.trim().toLowerCase(),
    tempPassword,
    courseTitle: course.title,
  })
}
