import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { parseQuizData } from "@/lib/materials-content"
import { syncEnrollmentProgress } from "@/lib/certificates"

export const maxDuration = 30

const bodySchema = z.object({ answers: z.array(z.array(z.number().int())) })

function sameSet(a: number[], b: number[]) {
  if (a.length !== b.length) return false
  const setA = new Set(a)
  return b.every((v) => setA.has(v))
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }
  const { id } = await params

  const material = await db.material.findUnique({ where: { id } })
  if (!material || !material.isVisible || material.interactionKind !== "quiz") {
    return NextResponse.json({ error: "Material no encontrado" }, { status: 404 })
  }

  const enrollment = await db.enrollment.findFirst({
    where: { userId: session.user.id, courseId: material.courseId, status: { in: ["active", "completed"] } },
  })
  if (!enrollment) {
    return NextResponse.json({ error: "No inscripto en este curso" }, { status: 403 })
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }

  const questions = parseQuizData(material.quizData)
  const { answers } = parsed.data

  const perQuestion = questions.map((q, i) => {
    const submitted = answers[i] ?? []
    const correct = sameSet(submitted, q.correctIndexes)
    return { correct, correctIndexes: q.correctIndexes }
  })
  const score = perQuestion.filter((q) => q.correct).length
  const total = questions.length

  await db.materialProgress.upsert({
    where: { userId_materialId: { userId: session.user.id, materialId: id } },
    update: { completedAt: new Date(), quizScore: score, quizTotal: total },
    create: { userId: session.user.id, materialId: id, completedAt: new Date(), quizScore: score, quizTotal: total },
  })

  const sync = await syncEnrollmentProgress(db, session.user.id, material.courseId)

  return NextResponse.json({
    score,
    total,
    perQuestion,
    certificateIssued: sync.certificateIssued,
    certificateNumber: sync.certificateNumber,
  })
}
