import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const courseId = req.nextUrl.searchParams.get("courseId")
  if (!courseId) {
    return NextResponse.json({ error: "courseId requerido" }, { status: 400 })
  }

  const sessions = await db.liveSession.findMany({
    where: { courseId },
    orderBy: { scheduledAt: "asc" },
    include: { _count: { select: { attendances: true } } },
  })

  return NextResponse.json({ sessions })
}

const createSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(2),
  description: z.string().nullable().optional(),
  scheduledAt: z.coerce.date(),
  durationMin: z.number().int().min(1).default(90),
  joinUrl: z.string().url().nullable().optional().or(z.literal("")),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const parsed = createSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 })
  }
  const data = parsed.data

  const course = await db.course.findUnique({ where: { id: data.courseId } })
  if (!course) {
    return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })
  }

  const liveSession = await db.liveSession.create({
    data: {
      courseId: data.courseId,
      title: data.title.trim(),
      description: data.description || null,
      scheduledAt: data.scheduledAt,
      durationMin: data.durationMin,
      joinUrl: data.joinUrl || null,
    },
  })

  revalidatePath("/aula/clases")
  revalidatePath("/superadmin/asistencia")

  return NextResponse.json({ ok: true, session: liveSession })
}
