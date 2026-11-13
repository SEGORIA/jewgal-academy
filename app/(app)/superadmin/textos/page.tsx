"use client"

import { useEffect, useState } from "react"
import { PageHeader, ToastProvider } from "@/components/admin/ui"
import TextsEditor from "@/components/admin/texts/TextsEditor"
import SeoEditor from "@/components/admin/texts/SeoEditor"

const TABS = [
  { id: "textos", label: "Textos del sitio" },
  { id: "seo", label: "SEO y vista previa en redes" },
] as const

function Inner() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("textos")
  const [section, setSection] = useState<string | undefined>()
  const [ready, setReady] = useState(false)

  // Atajos desde las páginas públicas: ?ns=Home abre esa sección; ?tab=seo#academia abre el SEO de esa página
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    if (q.get("tab") === "seo") setTab("seo")
    const ns = q.get("ns")
    if (ns) setSection(ns)
    setReady(true)
  }, [])
  return (
    <div style={{ maxWidth: 1180, margin: "0 auto" }}>
      <PageHeader
        eyebrow="Sitio público" title="Textos y SEO"
        subtitle="Cambiá cualquier texto de la web (en español e inglés) sin tocar código. Lo que no modifiques sigue como está; en cada texto podés volver al original."
      />
      <div role="tablist" aria-label="Secciones" style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", marginBottom: 22, overflowX: "auto" }}>
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <button key={t.id} role="tab" aria-selected={active} onClick={() => setTab(t.id)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "11px 18px", fontSize: 15, fontWeight: active ? 600 : 500, whiteSpace: "nowrap",
                color: active ? "var(--gold-ink)" : "var(--text-muted)", borderBottom: `2px solid ${active ? "var(--gold-ink)" : "transparent"}`, marginBottom: -1 }}>
              {t.label}
            </button>
          )
        })}
      </div>
      {ready && (tab === "textos" ? <TextsEditor initialSection={section} /> : <SeoEditor />)}
    </div>
  )
}

export default function TextosPage() { return <ToastProvider><Inner /></ToastProvider> }
