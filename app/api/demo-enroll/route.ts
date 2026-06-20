import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { enrollUserInCourse } from "@/lib/enroll"

/**
 * DEMO checkout — simula un pago exitoso SIN cobrar nada.
 * Se usa para probar el flujo completo (comprar → crear cuenta → entrar al aula)
 * mientras no estén configuradas las credenciales reales de Stripe/PayPal.
 * Devuelve la contraseña temporal para iniciar sesión automáticamente.
 */
export async function POST(req: NextRequest) {
  const { courseId, email, name } = await req.json()
  if (!courseId || !email) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
  }

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

  // Si el usuario ya existía, fijamos una contraseña conocida para el demo
  let tempPassword = result.tempPassword
  if (!tempPassword) {
    const bcrypt = (await import("bcryptjs")).default
    tempPassword = "demo" + Math.random().toString(36).slice(-6)
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
