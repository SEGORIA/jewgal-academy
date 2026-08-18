"use client"

import { useParams } from "next/navigation"
import LessonPlayer from "@/components/aula/materials/LessonPlayer"

export default function ProgramaLessonPage() {
  const params = useParams<{ materialId: string }>()
  return <LessonPlayer materialId={params.materialId} apiBase="/api/me/materials" basePath="/aula/programa" />
}
