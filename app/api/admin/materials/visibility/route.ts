import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

// Mostrar / ocultar varios materiales a la vez (ej. todo un módulo).
const schema = z.object({
  courseId: z.string().min(1),
  ids: z.array(z.string().min(1)).min(1).max(500),
  isVisible: z.boolean(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 })
  }
  const { courseId, ids, isVisible } = parsed.data

  const result = await db.material.updateMany({ where: { courseId, id: { in: ids } }, data: { isVisible } })

  revalidatePath("/aula/materiales")
  return NextResponse.json({ ok: true, updated: result.count })
}
