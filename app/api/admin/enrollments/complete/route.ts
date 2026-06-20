import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { enrollmentId } = await req.json()
  if (!enrollmentId) {
    return NextResponse.json({ error: "enrollmentId requerido" }, { status: 400 })
  }

  const existing = await db.enrollment.findUnique({ where: { id: enrollmentId } })
  if (!existing) {
    return NextResponse.json({ error: "Inscripción no encontrada" }, { status: 404 })
  }

  if (existing.completedAt) {
    return NextResponse.json({ error: "Ya fue marcada como completada" }, { status: 409 })
  }

  // Generar número de certificado único: JA-AÑO-NNNN
  const completedCount = await db.enrollment.count({ where: { completedAt: { not: null } } })
  const year = new Date().getFullYear()
  const certNum = `JA-${year}-${String(completedCount + 1).padStart(4, "0")}`

  const updated = await db.enrollment.update({
    where: { id: enrollmentId },
    data: {
      completedAt:       new Date(),
      certificateNumber: certNum,
      status:            "completed",
    },
    include: { course: { select: { title: true } }, user: { select: { name: true } } },
  })

  return NextResponse.json({ enrollment: updated, certificateNumber: certNum })
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { enrollmentId } = await req.json()
  if (!enrollmentId) return NextResponse.json({ error: "enrollmentId requerido" }, { status: 400 })

  await db.enrollment.update({
    where: { id: enrollmentId },
    data: { completedAt: null, certificateNumber: null, status: "active" },
  })

  return NextResponse.json({ ok: true })
}
