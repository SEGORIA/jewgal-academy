import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const { id } = await params

  const student = await db.user.findUnique({ where: { id } })
  if (!student || student.role !== "student") {
    return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 })
  }

  const [enrollmentCount, paymentCount] = await Promise.all([
    db.enrollment.count({ where: { userId: id } }),
    db.payment.count({ where: { userId: id } }),
  ])
  if (enrollmentCount > 0 || paymentCount > 0) {
    return NextResponse.json(
      { error: "Esta cuenta tiene inscripciones o pagos registrados. Por integridad de los registros académicos y de pago, contactá soporte para dar de baja una cuenta con historial." },
      { status: 409 }
    )
  }

  await db.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
