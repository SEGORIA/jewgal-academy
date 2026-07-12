import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true, phone: true, country: true, city: true, job: true, bio: true, interests: true },
  })
  if (!user) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  }

  return NextResponse.json({ user })
}

const patchSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(40).nullable().optional(),
  country: z.string().max(80).nullable().optional(),
  city: z.string().max(80).nullable().optional(),
  job: z.string().max(120).nullable().optional(),
  bio: z.string().max(1000).nullable().optional(),
  interests: z.array(z.string().max(60)).max(20).optional(),
  image: z.string().max(2_000_000).nullable().optional(),
})

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const parsed = patchSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 })
  }

  const user = await db.user.update({
    where: { id: session.user.id },
    data: parsed.data,
    select: { id: true, name: true, image: true, phone: true, country: true, city: true, job: true, bio: true, interests: true },
  })

  return NextResponse.json({ ok: true, user })
}
