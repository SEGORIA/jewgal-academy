"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Eye, ArrowLeft } from "lucide-react"
import LessonPlayer from "@/components/aula/materials/LessonPlayer"

export default function CoursePreviewPage() {
  const params = useParams<{ materialId: string }>()
  const router = useRouter()
  const materialId = params.materialId
  const [courseId, setCourseId] = useState<string | null>(null)

  useEffect(() => {
    if (!materialId) return
    fetch(`/api/admin/preview/materials/${materialId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setCourseId(d?.material?.courseId ?? null))
      .catch(() => setCourseId(null))
  }, [materialId])

  function goToEditor(id: string) {
    router.push(courseId ? `/superadmin/cursos?course=${courseId}&editMaterial=${id}` : "/superadmin/cursos")
  }

  const topBar = (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
      marginBottom: 24, padding: "12px 18px", borderRadius: 12,
      background: "rgba(165,141,102,.1)", border: "1px solid rgba(165,141,102,.25)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--gold)", fontSize: 12.5, fontWeight: 600 }}>
        <Eye size={14} /> Vista previa — así lo ve el alumno
      </div>
      <button
        onClick={() => router.push(courseId ? `/superadmin/cursos?course=${courseId}` : "/superadmin/cursos")}
        style={{
          display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
          color: "var(--text-muted)", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
        }}
      >
        <ArrowLeft size={14} /> Volver al editor
      </button>
    </div>
  )

  return (
    <LessonPlayer
      materialId={materialId}
      apiBase="/api/admin/preview/materials"
      basePath="/superadmin/cursos/preview"
      readOnly
      onEditMaterial={goToEditor}
      topBar={topBar}
    />
  )
}
