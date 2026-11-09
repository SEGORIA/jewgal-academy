import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

// Copia un material con todo su contenido y lo deja justo debajo del original.
// La copia nace OCULTA: es un borrador para editar, el alumno no debe ver
// "Unidad 3 (copia)" a medio terminar. Se muestra con el ojo cuando esté lista.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const { id } = await params

  const src = await db.material.findUnique({ where: { id } })
  if (!src) {
    return NextResponse.json({ error: "Material no encontrado" }, { status: 404 })
  }

  const copy = await db.material.create({
    data: {
      courseId: src.courseId,
      title: `${src.title} (copia)`,
      description: src.description,
      type: src.type,
      fileUrl: src.fileUrl,
      videoUrl: src.videoUrl,
      linkUrl: src.linkUrl,
      moduleNumber: src.moduleNumber,
      order: src.order,
      isVisible: false,
      interactionKind: src.interactionKind,
      toolHref: src.toolHref,
      estimatedMinutes: src.estimatedMinutes,
      coverImageUrl: src.coverImageUrl,
      groupLabel: src.groupLabel,
      content: src.content,
      quizData: src.quizData,
    },
  })

  // Reubicar: la copia justo después del original y renumerar el módulo
  // entero (0..n-1) para que el orden quede inequívoco.
  const siblings = await db.material.findMany({
    where: { courseId: src.courseId, moduleNumber: src.moduleNumber },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true, order: true },
  })
  const ids = siblings.map((s) => s.id).filter((x) => x !== copy.id)
  const at = ids.indexOf(src.id)
  ids.splice(at + 1, 0, copy.id)
  const currentOrder = new Map(siblings.map((s) => [s.id, s.order]))
  const updates = ids
    .map((mid, i) => ({ mid, i }))
    .filter(({ mid, i }) => currentOrder.get(mid) !== i)
    .map(({ mid, i }) => db.material.update({ where: { id: mid }, data: { order: i } }))
  if (updates.length) await db.$transaction(updates)

  revalidatePath("/aula/materiales")
  const fresh = await db.material.findUnique({ where: { id: copy.id } })
  return NextResponse.json({ ok: true, material: fresh })
}
