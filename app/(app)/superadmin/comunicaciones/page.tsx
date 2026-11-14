"use client"

import { useState } from "react"
import { PageHeader, ToastProvider } from "@/components/admin/ui"
import InboxTab from "@/components/admin/comms/InboxTab"
import AnnouncementsTab from "@/components/admin/comms/AnnouncementsTab"
import NewsletterTab from "@/components/admin/comms/NewsletterTab"
import TemplatesTab from "@/components/admin/comms/TemplatesTab"
import EmailStatusTab from "@/components/admin/comms/EmailStatusTab"

const TABS = [
  { id: "mensajes", label: "Mensajes recibidos" },
  { id: "anuncios", label: "Anuncios a alumnos" },
  { id: "newsletter", label: "Newsletter" },
  { id: "plantillas", label: "Plantillas de correo" },
  { id: "estado", label: "Estado del correo" },
] as const
type TabId = (typeof TABS)[number]["id"]

function Inner() {
  const [tab, setTab] = useState<TabId>("mensajes")
  const [unread, setUnread] = useState(0)
  return (
    <div style={{ maxWidth: 1180, margin: "0 auto" }}>
      <PageHeader
        eyebrow="Comunicación" title="Comunicaciones"
        subtitle="Respondé los mensajes del sitio, avisá a tus alumnos dentro del aula o por correo, enviá el newsletter y editá los correos automáticos."
      />
      <div role="tablist" aria-label="Secciones de comunicaciones" style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", marginBottom: 22, overflowX: "auto" }}>
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <button key={t.id} role="tab" aria-selected={active} onClick={() => setTab(t.id)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "11px 18px", fontSize: 15, fontWeight: active ? 600 : 500, whiteSpace: "nowrap", color: active ? "var(--gold-ink)" : "var(--text-muted)", borderBottom: `2px solid ${active ? "var(--gold-ink)" : "transparent"}`, marginBottom: -1 }}>
              {t.label}
              {t.id === "mensajes" && unread > 0 && <span aria-label={`${unread} sin leer`} style={{ marginLeft: 8, minWidth: 20, height: 20, borderRadius: 10, padding: "0 6px", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "var(--terra)", color: "#fff", fontSize: 11.5, fontWeight: 700 }}>{unread}</span>}
            </button>
          )
        })}
      </div>
      <div hidden={tab !== "mensajes"}><InboxTab onUnread={setUnread} /></div>
      {tab === "anuncios" && <AnnouncementsTab />}
      {tab === "newsletter" && <NewsletterTab />}
      {tab === "plantillas" && <TemplatesTab />}
      {tab === "estado" && <EmailStatusTab />}
    </div>
  )
}

export default function ComunicacionesPage() { return <ToastProvider><Inner /></ToastProvider> }
