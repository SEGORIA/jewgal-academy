import { NextRequest, NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "@/lib/db"

// Reordenar / mover entre módulos (arrastrar y soltar): el cliente manda la
// posición final de los materiales afectados y acá se aplica en una sola
// transacción, solo sobre las filas que realmente cambiaron.
const schema = z.object({
  courseId: z.string().min(1),
  items: z.array(z.object({
    id: z.string().min(1),
    moduleNumber: z.number().int().min(1).max(99),
    order: z.number().int().min(0),
  })).min(1).max(500),
})

export async function POST(req: NextRequest) {
  const g = await adminGuard("cursos")
  if (!g.ok) return g.response
  g.enter()
  const session = g.session

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 })
  }
  const { courseId, items } = parsed.data

  const existing = await db.material.findMany({
    where: { courseId, id: { in: items.map((i) => i.id) } },
    select: { id: true, moduleNumber: true, order: true },
  })
  if (existing.length !== new Set(items.map((i) => i.id)).size) {
    return NextResponse.json({ error: "Algún material no pertenece a este curso" }, { status: 400 })
  }

  const current = new Map(existing.map((m) => [m.id, m]))
  const updates = items
    .filter((i) => {
      const c = current.get(i.id)!
      return c.moduleNumber !== i.moduleNumber || c.order !== i.order
    })
    .map((i) => db.material.update({ where: { id: i.id }, data: { moduleNumber: i.moduleNumber, order: i.order } }))

  if (updates.length) await db.$transaction(updates)

  revalidatePath("/aula/materiales")
  return NextResponse.json({ ok: true, updated: updates.length })
}
