import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

const patchSchema = z.object({
  enrollmentId: z.string().min(1),
  progress: z.number().int().min(0).max(100).optional(),
  hoursCompleted: z.number().min(0).max(10000).optional(),
})

/** Ajustar avance (%) y horas realizadas de una inscripción. Solo admin. */
export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const parsed = patchSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }
  const { enrollmentId, progress, hoursCompleted } = parsed.data

  const data: Record<string, number> = {}
  if (progress !== undefined) data.progress = progress
  if (hoursCompleted !== undefined) data.hoursCompleted = hoursCompleted
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nada para actualizar" }, { status: 400 })
  }

  const updated = await db.enrollment.update({ where: { id: enrollmentId }, data })
  return NextResponse.json({
    ok: true,
    enrollment: { id: updated.id, progress: updated.progress, hoursCompleted: updated.hoursCompleted },
  })
}
