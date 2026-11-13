"use client"

import { useState } from "react"
import { Eye } from "lucide-react"
import { Modal, GhostButton, api, useToast } from "@/components/admin/ui"
import EnrollmentsTab, { StatusBadge } from "./EnrollmentsTab"
import ProfileTab from "./ProfileTab"
import PaymentsTab from "./PaymentsTab"
import type { CourseOption, DetailTab, Student } from "./types"

const TABS: { id: DetailTab; label: string }[] = [
  { id: "programas", label: "Programas" },
  { id: "datos", label: "Datos y cuenta" },
  { id: "pagos", label: "Pagos" },
]

type Props = { student: Student; courses: CourseOption[]; initialTab?: DetailTab; onClose: () => void; onChanged: () => void }

/** Ficha completa del alumno: inscripciones y avance, datos personales / cuenta, y pagos. */
export default function StudentDetail({ student, courses, initialTab = "programas", onClose, onChanged }: Props) {
  const [tab, setTab] = useState<DetailTab>(initialTab)
  const toast = useToast()
  const [viewing, setViewing] = useState(false)

  /** Abre el aula tal como la ve este alumno (solo lectura). */
  async function viewAs() {
    setViewing(true)
    try {
      await api("/api/admin/view-as", { method: "POST", json: { userId: student.id } })
      window.location.href = "/aula"
    } catch (e) { toast("error", (e as Error).message); setViewing(false) }
  }

  return (
    <Modal title={student.name} onClose={onClose} width={820} footer={<GhostButton onClick={onClose}>Cerrar</GhostButton>}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <span style={{ color: "var(--text-muted)", fontSize: 14 }}>{student.email}</span>
        {student.status === "banned" && <StatusBadge status="cancelled" />}
        {student.status === "banned" && <span style={{ fontSize: 12, color: "var(--danger)" }}>suspendido del foro</span>}
        <GhostButton icon={<Eye size={14} />} loading={viewing} onClick={viewAs} style={{ marginLeft: "auto" }} title="Abre el aula tal como la ve este alumno. Es solo lectura: no se puede cambiar nada.">Ver el aula como {student.name.split(" ")[0]}</GhostButton>
      </div>

      <div role="tablist" aria-label="Secciones de la ficha del alumno" style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", marginBottom: 18, overflowX: "auto" }}>
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <button key={t.id} role="tab" aria-selected={active} id={`tab-${t.id}`} aria-controls={`panel-${t.id}`} onClick={() => setTab(t.id)}
              style={{
                background: "none", border: "none", cursor: "pointer", padding: "10px 16px", fontSize: 14, fontWeight: active ? 600 : 500, whiteSpace: "nowrap",
                color: active ? "var(--gold-ink)" : "var(--text-muted)", borderBottom: `2px solid ${active ? "var(--gold-ink)" : "transparent"}`, marginBottom: -1,
              }}>
              {t.label}
              {t.id === "programas" && <span style={{ marginLeft: 6, fontSize: 12, color: "var(--text-faint)" }}>{student.enrollments.length}</span>}
              {t.id === "pagos" && <span style={{ marginLeft: 6, fontSize: 12, color: "var(--text-faint)" }}>{student.payments.length}</span>}
            </button>
          )
        })}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "programas" && <EnrollmentsTab student={student} courses={courses} onChanged={onChanged} />}
        {tab === "datos" && <ProfileTab student={student} onChanged={onChanged} />}
        {tab === "pagos" && <PaymentsTab student={student} courses={courses} onChanged={onChanged} />}
      </div>
    </Modal>
  )
}
