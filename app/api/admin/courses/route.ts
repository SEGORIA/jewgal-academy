import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const courses = await db.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { enrollments: true, materials: true, liveSessions: true } },
    },
  })

  return NextResponse.json({ courses })
}

const createSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2).optional(),
  shortDesc: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  currency: z.string().min(1).default("USD"),
  isFree: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  totalHours: z.number().min(0).nullable().optional(),
  durationWeeks: z.number().int().min(0).nullable().optional(),
  thumbnail: z.string().url().nullable().optional().or(z.literal("")),
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
  const baseSlug = slugify(data.slug || data.title)
  if (!baseSlug) {
    return NextResponse.json({ error: "El título no genera un slug válido" }, { status: 400 })
  }

  let slug = baseSlug
  let n = 1
  while (await db.course.findUnique({ where: { slug } })) {
    n += 1
    slug = `${baseSlug}-${n}`
  }

  const course = await db.course.create({
    data: {
      title: data.title.trim(),
      slug,
      shortDesc: data.shortDesc.trim(),
      description: data.description.trim(),
      price: data.price,
      currency: data.currency,
      isFree: data.isFree,
      isPublished: data.isPublished,
      totalHours: data.totalHours ?? null,
      durationWeeks: data.durationWeeks ?? null,
      thumbnail: data.thumbnail || null,
    },
  })

  revalidatePath("/academia")
  revalidatePath("/")

  return NextResponse.json({ ok: true, course })
}
