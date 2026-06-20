"use client"

import { BookOpen, Video, PlayCircle, Calendar, ArrowRight, Sparkles, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TiltCard } from "@/components/motion/TiltCard"

const quickLinks = [
  { href: "/aula/clases",      icon: Video,       label: "Próxima clase en vivo", sub: "Ver calendario y acceso Zoom",  accent: "#4B7E8C", glow: "rgba(75,126,140,.18)" },
  { href: "/aula/materiales",  icon: BookOpen,    label: "Materiales del curso",  sub: "PDFs, guías y ejercicios",      accent: "#A58D66", glow: "rgba(165,141,102,.18)" },
  { href: "/aula/grabaciones", icon: PlayCircle,  label: "Grabaciones",           sub: "Revisá las clases pasadas",     accent: "#6BBF8E", glow: "rgba(107,191,142,.14)" },
]

const PROGRAM_META: Record<string, { icon: string; accent: string }> = {
  "life-coaching-integrativo": { icon: "⟡", accent: "#A58D66" },
  "joogal-adultos":            { icon: "✦", accent: "#6BBF8E" },
  "joogalkids":                { icon: "★", accent: "#7B9FD8" },
  "metodo-sholem":             { icon: "◈", accent: "#B07FD8" },
  "cabala-coach":              { icon: "✡", accent: "#CBB78B" },
}

type Enrollment = {
  id: string
  enrolledAt: string
  course: { id: string; title: string; slug: string; isFree: boolean }
}

const card: React.CSSProperties = {
  background: "rgba(255,255,255,.03)",
  border: "1px solid rgba(165,141,102,.14)",
  borderRadius: 14,
}

export default function AulaDashboard() {
  const { data: session } = useSession()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading]         = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    if (window.location.search.includes("enrolled=true")) {
      setShowWelcome(true)
      window.history.replaceState({}, "", "/aula")
      setTimeout(() => setShowWelcome(false), 6000)
    }
    fetch("/api/me/enrollments")
      .then((r) => r.json())
      .then((data) => setEnrollments(data.enrollments ?? []))
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>

      {/* Toast inscripción exitosa */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              background: "rgba(107,191,142,.1)",
              border: "1px solid rgba(107,191,142,.35)",
              borderRadius: 12, padding: "14px 20px",
              marginBottom: 28,
            }}
          >
            <CheckCircle size={20} style={{ color: "#6BBF8E", flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 600, color: "#eef4f4", fontSize: 14, marginBottom: 2 }}>
                ¡Inscripción confirmada!
              </p>
              <p style={{ fontSize: 13, color: "rgba(224,233,234,.6)" }}>
                Ya podés acceder a todos los materiales de tu programa.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Encabezado */}
      <div style={{ marginBottom: 40 }}>
        <span style={{ fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--gold,#A58D66)", display: "block", marginBottom: 12 }}>
          Jewgal Academy · Aula Virtual
        </span>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(30px,4vw,46px)", color: "#eef4f4", lineHeight: 1.08, marginBottom: 12 }}>
          {session?.user?.name
            ? <>Hola, <em style={{ fontStyle: "normal", color: "var(--gold,#A58D66)" }}>{session.user.name.split(" ")[0]}</em></>
            : <>Bienvenida a tu <em style={{ fontStyle: "normal", color: "var(--gold,#A58D66)" }}>espacio de aprendizaje</em></>
          }
        </h1>
        <p style={{ color: "rgba(224,233,234,.6)", fontSize: 15 }}>
          Aquí encontrás todo el contenido de tus programas activos.
        </p>
      </div>

      {/* Accesos rápidos */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 16, marginBottom: 32 }}>
        {quickLinks.map(({ href, icon: Icon, label, sub, accent, glow }) => (
          <TiltCard key={href} radius={14} intensity={8}>
            <Link
              href={href}
              style={{ ...card, padding: "24px 22px", display: "flex", flexDirection: "column", gap: 14, textDecoration: "none", transition: "box-shadow .25s, border-color .25s", position: "relative", overflow: "hidden" }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.boxShadow   = `0 12px 40px ${glow}`
                el.style.borderColor = `${accent}55`
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement
                el.style.boxShadow   = "none"
                el.style.borderColor = "rgba(165,141,102,.14)"
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${accent}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={20} style={{ color: accent }} />
              </div>
              <div>
                <p style={{ fontWeight: 600, color: "#eef4f4", fontSize: 14, marginBottom: 4 }}>{label}</p>
                <p style={{ color: "rgba(224,233,234,.45)", fontSize: 12 }}>{sub}</p>
              </div>
              <ArrowRight size={14} style={{ color: accent, marginTop: "auto" }} />
            </Link>
          </TiltCard>
        ))}
      </div>

      {/* Mis programas */}
      <div style={{ ...card, padding: "28px 26px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 20, color: "#eef4f4" }}>
            Mis programas
          </h2>
          {!loading && (
            <span style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(165,141,102,.6)" }}>
              {enrollments.length} {enrollments.length === 1 ? "activo" : "activos"}
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "28px 0", gap: 10, color: "rgba(224,233,234,.3)", fontSize: 14 }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(165,141,102,.3)", borderTopColor: "var(--gold,#A58D66)" }}
            />
            Cargando tus programas…
          </div>
        ) : enrollments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: 32, color: "rgba(165,141,102,.3)", marginBottom: 14 }}>✦</div>
            <p style={{ color: "rgba(224,233,234,.35)", fontSize: 14, marginBottom: 16 }}>
              Aún no estás inscripta en ningún programa.
            </p>
            <Link
              href="/#programas"
              style={{ fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--gold,#A58D66)", textDecoration: "none" }}
            >
              Ver todos los programas →
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {enrollments.map((en, i) => {
              const meta = PROGRAM_META[en.course.slug] ?? { icon: "✦", accent: "#A58D66" }
              return (
                <motion.div
                  key={en.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <TiltCard radius={10} intensity={5}>
                    <div
                      style={{
                        display: "flex", alignItems: "center", gap: 16,
                        padding: "16px 20px", borderRadius: 10,
                        background: `${meta.accent}0A`,
                        border: `1px solid ${meta.accent}25`,
                      }}
                    >
                      <div style={{
                        width: 44, height: 44, borderRadius: 10,
                        background: `${meta.accent}20`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 22, flexShrink: 0,
                      }}>
                        {meta.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, color: "#eef4f4", fontSize: 14, marginBottom: 3 }}>
                          {en.course.title}
                        </p>
                        <p style={{ fontSize: 12, color: "rgba(224,233,234,.4)" }}>
                          Inscripta · Activo · desde{" "}
                          {new Date(en.enrolledAt).toLocaleDateString("es-AR", { month: "long", year: "numeric" })}
                        </p>
                      </div>
                      <Link
                        href="/aula/materiales"
                        style={{ fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", color: meta.accent, textDecoration: "none", whiteSpace: "nowrap" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.7")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                      >
                        Ver materiales →
                      </Link>
                    </div>
                  </TiltCard>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Próxima clase */}
      <div style={{ ...card, padding: "28px 26px", borderColor: "rgba(75,126,140,.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(75,126,140,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Calendar size={17} style={{ color: "#4B7E8C" }} />
          </div>
          <div>
            <p style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "#4B7E8C", marginBottom: 2 }}>Próxima sesión</p>
            <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 17, color: "#eef4f4" }}>
              Clases en vivo por Zoom
            </h2>
          </div>
        </div>
        <p style={{ color: "rgba(224,233,234,.5)", fontSize: 14, lineHeight: 1.65, marginBottom: 18, paddingLeft: 48 }}>
          Revisá la sección <strong style={{ color: "rgba(224,233,234,.75)" }}>Clases en vivo</strong> para ver el calendario completo y el link de acceso a Zoom.
        </p>
        <div style={{ paddingLeft: 48 }}>
          <Link
            href="/aula/clases"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--gold,#A58D66)", textDecoration: "none" }}
          >
            <Sparkles size={13} /> Ver calendario
          </Link>
        </div>
      </div>
    </div>
  )
}
