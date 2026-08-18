"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Users2, MessagesSquare, Loader2, Sparkles, ChevronRight } from "lucide-react"

type Category = {
  id: string
  name: string
  description: string | null
  course: { title: string } | null
  _count: { topics: number }
}

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid rgba(165,141,102,.14)",
  borderRadius: 14,
}

export default function ComunidadPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/me/comunidad/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 36 }}>
        <span style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: 10 }}>
          Aula Virtual
        </span>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 38, color: "var(--text)", marginBottom: 8 }}>
          Comunidad
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
          Compartí, preguntá y acompañá a otros alumnos del programa.
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-dim)", padding: "40px 0" }}>
          <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Cargando comunidad…
        </div>
      ) : categories.length === 0 ? (
        <div style={{ ...card, padding: "56px 32px", textAlign: "center" }}>
          <Sparkles size={28} style={{ color: "rgba(165,141,102,.3)", margin: "0 auto 16px", display: "block" }} />
          <p style={{ color: "var(--text-muted)", fontSize: 16, marginBottom: 8, fontFamily: "var(--serif)", fontWeight: 500 }}>
            Todavía no hay categorías
          </p>
          <p style={{ color: "var(--text-dim)", fontSize: 14, maxWidth: 360, margin: "0 auto" }}>
            La comunidad de tu programa va a aparecer acá en cuanto esté disponible.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/aula/comunidad/${c.id}`}
              style={{ ...card, display: "flex", flexDirection: "column", gap: 12, padding: "20px 22px", textDecoration: "none", transition: "border-color .2s, box-shadow .2s" }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = "rgba(165,141,102,.3)"
                el.style.boxShadow = "0 6px 24px rgba(165,141,102,.08)"
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = "rgba(165,141,102,.14)"
                el.style.boxShadow = "none"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(165,141,102,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Users2 size={17} style={{ color: "var(--gold)" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, color: "var(--text)", fontSize: 15 }}>{c.name}</p>
                  <span style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: ".1em" }}>
                    {c.course?.title ?? "General"}
                  </span>
                </div>
                <ChevronRight size={16} style={{ color: "var(--text-dim)", flexShrink: 0 }} />
              </div>
              {c.description && (
                <p style={{ fontSize: 13, color: "var(--text-faint)", lineHeight: 1.5 }}>{c.description}</p>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-dim)", marginTop: "auto" }}>
                <MessagesSquare size={13} />
                {c._count.topics} {c._count.topics === 1 ? "tema" : "temas"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
