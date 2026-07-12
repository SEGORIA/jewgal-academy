import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest, { params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params

  const enrollment = await db.enrollment.findUnique({
    where: { certificateNumber: numero },
    select: {
      certificateNumber: true,
      completedAt: true,
      user: { select: { name: true } },
      course: { select: { title: true } },
    },
  })

  if (!enrollment || !enrollment.completedAt) {
    return NextResponse.json({ valid: false })
  }

  return NextResponse.json({
    valid: true,
    certificateNumber: enrollment.certificateNumber,
    studentName: enrollment.user.name,
    courseTitle: enrollment.course.title,
    completedAt: enrollment.completedAt,
  })
}
