import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { syncEnrollmentProgress } from "@/lib/certificates"

export const maxDuration = 30

const bodySchema = z.object({ response: z.string().max(5000).optional() })

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }
  const { id } = await params

  const material = await db.material.findUnique({ where: { id } })
  if (!material || !material.isVisible) {
    return NextResponse.json({ error: "Material no encontrado" }, { status: 404 })
  }

  const enrollment = await db.enrollment.findFirst({
    where: { userId: session.user.id, courseId: material.courseId, status: { in: ["active", "completed"] } },
  })
  if (!enrollment) {
    return NextResponse.json({ error: "No inscripto en este curso" }, { status: 403 })
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }

  const progress = await db.materialProgress.upsert({
    where: { userId_materialId: { userId: session.user.id, materialId: id } },
    update: { completedAt: new Date(), response: parsed.data.response },
    create: { userId: session.user.id, materialId: id, completedAt: new Date(), response: parsed.data.response },
  })

  const sync = await syncEnrollmentProgress(db, session.user.id, material.courseId)

  return NextResponse.json({
    ok: true,
    progress,
    certificateIssued: sync.certificateIssued,
    certificateNumber: sync.certificateNumber,
  })
}
