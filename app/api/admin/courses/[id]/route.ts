import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

const moduleSchema = z.object({ title: z.string(), items: z.array(z.string()) })
const contentSchema = z.object({
  eyebrow: z.string(),
  duration: z.string(),
  modality: z.string(),
  level: z.string(),
  includes: z.array(z.string()),
  modules: z.array(moduleSchema),
  forWhom: z.array(z.string()),
  outcome: z.string(),
})

const patchSchema = z.object({
  title: z.string().min(2).optional(),
  shortDesc: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  currency: z.string().min(1).optional(),
  isFree: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  totalHours: z.number().min(0).nullable().optional(),
  durationWeeks: z.number().int().min(0).nullable().optional(),
  thumbnail: z.string().url().nullable().optional().or(z.literal("")),
  videoUrl: z.string().nullable().optional().or(z.literal("")),
  content: contentSchema.optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const { id } = await params

  const parsed = patchSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 })
  }

  const { content, ...rest } = parsed.data
  const data: Record<string, unknown> = { ...rest }
  if (data.thumbnail === "") data.thumbnail = null
  if (data.videoUrl === "") data.videoUrl = null
  if (content) data.content = JSON.stringify(content)

  const course = await db.course.update({ where: { id }, data }).catch(() => null)
  if (!course) {
    return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })
  }

  revalidatePath("/academia")
  revalidatePath("/")
  revalidatePath(`/programas/${course.slug}`)

  return NextResponse.json({ ok: true, course })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const { id } = await params

  const [enrollmentCount, paymentCount] = await Promise.all([
    db.enrollment.count({ where: { courseId: id } }),
    db.payment.count({ where: { courseId: id } }),
  ])
  if (enrollmentCount > 0 || paymentCount > 0) {
    return NextResponse.json(
      { error: "No se puede eliminar: hay alumnos inscriptos o pagos asociados a este curso. Despublicalo en su lugar." },
      { status: 409 }
    )
  }

  await db.material.deleteMany({ where: { courseId: id } })
  await db.liveSession.deleteMany({ where: { courseId: id } })
  const deleted = await db.course.delete({ where: { id } }).catch(() => null)
  if (!deleted) {
    return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })
  }

  revalidatePath("/academia")
  revalidatePath("/")

  return NextResponse.json({ ok: true })
}
