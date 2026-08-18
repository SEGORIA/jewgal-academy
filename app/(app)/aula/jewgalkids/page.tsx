"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Wind, PersonStanding, HeartHandshake, Loader2, Lock } from "lucide-react"
import BreathingPacer from "@/components/aula/jewgalkids/BreathingPacer"
import PostureGallery from "@/components/aula/jewgalkids/PostureGallery"
import ValueCards from "@/components/aula/jewgalkids/ValueCards"

type Enrollment = { status: string; course: { slug: string } }
type Tab = "respiracion" | "posturas" | "valores"

const TABS: { id: Tab; label: string; icon: typeof Wind }[] = [
  { id: "respiracion", label: "Respiración", icon: Wind },
  { id: "posturas", label: "Posturas", icon: PersonStanding },
  { id: "valores", label: "Valores", icon: HeartHandshake },
]

function isTab(value: string | null): value is Tab {
  return value === "respiracion" || value === "posturas" || value === "valores"
}

// useSearchParams() requires a Suspense boundary — see components/LanguageSwitcher.tsx
export default function JewgalkidsToolsPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-dim)", padding: "40px 0" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Cargando…
      </div>
    }>
      <JewgalkidsToolsContent />
    </Suspense>
  )
}

function JewgalkidsToolsContent() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab")
  const [loading, setLoading] = useState(true)
  const [enrolled, setEnrolled] = useState(false)
  const [tab, setTab] = useState<Tab>(isTab(initialTab) ? initialTab : "respiracion")

  useEffect(() => {
    // useState's lazy initializer only runs on the very first render; if
    // useSearchParams() wasn't populated yet at that point (fresh page load
    // vs. client navigation), the tab would stay stuck on the default even
    // though the URL has ?tab=. Re-sync once searchParams resolves.
    if (isTab(initialTab)) setTab(initialTab)
  }, [initialTab])

  useEffect(() => {
    fetch("/api/me/enrollments?status=all")
      .then((r) => r.json())
      .then((d: { enrollments?: Enrollment[] }) => {
        const has = (d.enrollments ?? []).some(
          (e) => e.course?.slug === "joogalkids" && (e.status === "active" || e.status === "completed")
        )
        setEnrolled(has)
      })
      .catch(() => setEnrolled(false))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <span style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: 10 }}>
          Instructor Certificado Joogalkids
        </span>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 36, color: "var(--text)", marginBottom: 8 }}>
          Herramientas interactivas
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
          Practicá vos mismo/a y llevá estas herramientas a tus sesiones con niños y niñas.
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-dim)", padding: "40px 0" }}>
          <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Verificando tu inscripción…
        </div>
      ) : !enrolled ? (
        <div style={{
          background: "var(--surface)", border: "1px solid rgba(165,141,102,.14)", borderRadius: 14,
          padding: "56px 32px", textAlign: "center",
        }}>
          <Lock size={26} style={{ color: "rgba(165,141,102,.35)", margin: "0 auto 16px", display: "block" }} />
          <p style={{ color: "var(--text)", fontSize: 16, marginBottom: 8, fontFamily: "var(--serif)", fontWeight: 500 }}>
            Estas herramientas son parte del programa Joogalkids
          </p>
          <p style={{ color: "var(--text-dim)", fontSize: 14, maxWidth: 380, margin: "0 auto" }}>
            No encontramos una inscripción activa a este programa en tu cuenta. Si creés que es un error, escribinos desde Contacto.
          </p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 28, borderBottom: "1px solid var(--surface-2)", overflowX: "auto" }}>
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = tab === id
              return (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "12px 18px", fontSize: 13.5, fontWeight: active ? 600 : 400,
                    border: "none", borderBottom: active ? "2px solid var(--gold)" : "2px solid transparent",
                    background: "transparent", color: active ? "var(--gold)" : "var(--text-muted)",
                    cursor: "pointer", whiteSpace: "nowrap", transition: "color .2s",
                    marginBottom: -1,
                  }}
                >
                  <Icon size={15} /> {label}
                </button>
              )
            })}
          </div>

          <div style={{
            background: "var(--surface)", border: "1px solid rgba(165,141,102,.14)", borderRadius: 16,
            padding: "32px 28px",
          }}>
            {tab === "respiracion" && <BreathingPacer />}
            {tab === "posturas" && <PostureGallery />}
            {tab === "valores" && <ValueCards />}
          </div>
        </>
      )}
    </div>
  )
}
