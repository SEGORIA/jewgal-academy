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

  const resources = await db.exclusiveResource.findMany({
    where: courseId ? { courseId } : {},
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { course: { select: { id: true, title: true } } },
  })

  return NextResponse.json({ resources })
}

const createSchema = z.object({
  courseId: z.string().nullable().optional(),
  title: z.string().min(2),
  description: z.string().nullable().optional(),
  type: z.enum(["audio", "video", "document"]),
  fileUrl: z.string().url(),
  duration: z.number().int().positive().nullable().optional(),
  isVisible: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
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

  const resource = await db.exclusiveResource.create({
    data: {
      courseId: data.courseId || null,
      title: data.title.trim(),
      description: data.description || null,
      type: data.type,
      fileUrl: data.fileUrl,
      duration: data.duration || null,
      isVisible: data.isVisible,
      order: data.order,
    },
  })

  revalidatePath("/aula/recursos")
  return NextResponse.json({ ok: true, resource })
}
