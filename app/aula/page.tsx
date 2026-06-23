"use client"

import { BookOpen, Video, PlayCircle, Calendar, ArrowRight, Sparkles, CheckCircle,
  Sprout, Compass, TrendingUp, Star, Crown, Footprints, Milestone, Target, CalendarCheck, Clock, Award, Trophy } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TiltCard } from "@/components/motion/TiltCard"
import { getLevel, getAchievements, getSummary, MILESTONES, type LevelIcon, type AchievementIcon } from "@/lib/gamification"

const LEVEL_ICONS: Record<LevelIcon, LucideIcon> = {
  sprout: Sprout, compass: Compass, trending: TrendingUp, star: Star, crown: Crown,
}
const ACH_ICONS: Record<AchievementIcon, LucideIcon> = {
  footprints: Footprints, milestone: Milestone, target: Target, calendar: CalendarCheck, clock: Clock, award: Award,
}

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
  status: string
  progress: number
  hoursCompleted: number
  completedAt: string | null
  certificateNumber: string | null
  attendance: { attended: number; held: number; rate: number | null }
  course: { id: string; title: string; slug: string; isFree: boolean; totalHours: number | null; durationWeeks: number | null }
}

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid rgba(165,141,102,.14)",
  borderRadius: 14,
}

const badge: React.CSSProperties = {
  fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase",
  padding: "4px 10px", borderRadius: 20, border: "1px solid",
  whiteSpace: "nowrap", flexShrink: 0,
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>{value}</div>
    </div>
  )
}

function SummaryStat({ icon: Icon, value, label }: { icon: LucideIcon; value: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Icon size={16} style={{ color: "var(--gold)" }} />
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--text-faint)" }}>{label}</div>
      </div>
    </div>
  )
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

  const summary = !loading && enrollments.length > 0 ? getSummary(enrollments) : null
  const SummaryLevelIcon = summary ? LEVEL_ICONS[summary.level.icon] : null

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
              <p style={{ fontWeight: 600, color: "var(--text)", fontSize: 14, marginBottom: 2 }}>
                ¡Inscripción confirmada!
              </p>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Ya podés acceder a todos los materiales de tu programa.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Encabezado */}
      <div style={{ marginBottom: 40 }}>
        <span style={{ fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: 12 }}>
          Jewgal Academy · Aula Virtual
        </span>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(30px,4vw,46px)", color: "var(--text)", lineHeight: 1.08, marginBottom: 12 }}>
          {session?.user?.name
            ? <>Hola, <em style={{ fontStyle: "normal", color: "var(--gold)" }}>{session.user.name.split(" ")[0]}</em></>
            : <>Te damos la bienvenida a tu <em style={{ fontStyle: "normal", color: "var(--gold)" }}>espacio de aprendizaje</em></>
          }
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
          Aquí encontrás todo el contenido de tus programas activos.
        </p>
      </div>

      {/* Resumen gamificado */}
      {summary && SummaryLevelIcon && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ ...card, padding: "20px 24px", marginBottom: 28, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(165,141,102,.14)", border: "1px solid rgba(165,141,102,.28)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <SummaryLevelIcon size={24} style={{ color: "var(--gold)" }} />
            </div>
            <div>
              <div style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 3 }}>Tu nivel</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 21, color: "var(--text)", lineHeight: 1 }}>{summary.level.name}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 26, marginLeft: "auto", flexWrap: "wrap" }}>
            <SummaryStat icon={Trophy} value={`${summary.unlocked}/${summary.totalAch}`} label="Logros" />
            <SummaryStat icon={Clock} value={`${summary.totalHours} h`} label="Horas" />
            <SummaryStat icon={Sparkles} value={`${summary.avgProgress}%`} label="Avance medio" />
          </div>
        </motion.div>
      )}

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
                <p style={{ fontWeight: 600, color: "var(--text)", fontSize: 14, marginBottom: 4 }}>{label}</p>
                <p style={{ color: "var(--text-faint)", fontSize: 12 }}>{sub}</p>
              </div>
              <ArrowRight size={14} style={{ color: accent, marginTop: "auto" }} />
            </Link>
          </TiltCard>
        ))}
      </div>

      {/* Mis programas */}
      <div style={{ ...card, padding: "28px 26px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 20, color: "var(--text)" }}>
            Mis programas
          </h2>
          {!loading && (
            <span style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(165,141,102,.6)" }}>
              {enrollments.length} {enrollments.length === 1 ? "activo" : "activos"}
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "28px 0", gap: 10, color: "var(--text-dim)", fontSize: 14 }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(165,141,102,.3)", borderTopColor: "var(--gold)" }}
            />
            Cargando tus programas…
          </div>
        ) : enrollments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: 32, color: "rgba(165,141,102,.3)", marginBottom: 14 }}>✦</div>
            <p style={{ color: "var(--text-dim)", fontSize: 14, marginBottom: 16 }}>
              Aún no tienes ningún programa activo.
            </p>
            <Link
              href="/#programas"
              style={{ fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--gold)", textDecoration: "none" }}
            >
              Ver todos los programas →
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {enrollments.map((en, i) => {
              const meta = PROGRAM_META[en.course.slug] ?? { icon: "✦", accent: "#A58D66" }
              const isCertified = en.status === "completed" && en.certificateNumber
              const totalH = en.course.totalHours
              const level = getLevel(en.progress, !!isCertified)
              const LevelIcon = LEVEL_ICONS[level.icon]
              const achievements = getAchievements(en)
              return (
                <motion.div
                  key={en.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <TiltCard radius={12} intensity={4}>
                    <div style={{
                      padding: "20px 22px", borderRadius: 12,
                      background: `${meta.accent}0A`,
                      border: `1px solid ${meta.accent}25`,
                    }}>
                      {/* Encabezado */}
                      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 10,
                          background: `${meta.accent}20`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 22, flexShrink: 0,
                        }}>
                          {meta.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 600, color: "var(--text)", fontSize: 15, marginBottom: 2 }}>
                            {en.course.title}
                          </p>
                          <p style={{ fontSize: 11.5, color: "var(--text-faint)" }}>
                            {isCertified && en.completedAt
                              ? `Completado · ${new Date(en.completedAt).toLocaleDateString("es-AR", { month: "long", year: "numeric" })}`
                              : `Desde ${new Date(en.enrolledAt).toLocaleDateString("es-AR", { month: "long", year: "numeric" })}`}
                          </p>
                        </div>
                        {isCertified ? (
                          <span style={{ ...badge, color: "var(--gold-light)", background: "rgba(203,183,139,.1)", borderColor: "rgba(203,183,139,.35)" }}>
                            ✦ Certificado
                          </span>
                        ) : (
                          <span style={{ ...badge, color: meta.accent, background: `${meta.accent}14`, borderColor: `${meta.accent}40`, display: "inline-flex", alignItems: "center", gap: 5 }}>
                            <LevelIcon size={11} /> {level.name}
                          </span>
                        )}
                      </div>

                      {/* Barra de avance */}
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--text-faint)" }}>Avance del programa</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: meta.accent }}>{en.progress}%</span>
                        </div>
                        <div style={{ position: "relative" }}>
                          <div style={{ height: 6, borderRadius: 4, background: "var(--surface-2)", overflow: "hidden" }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${en.progress}%` }}
                              transition={{ duration: 1, delay: i * 0.06 + 0.2, ease: [0.16, 1, 0.3, 1] }}
                              style={{ height: "100%", borderRadius: 4, background: `linear-gradient(90deg, ${meta.accent}, ${meta.accent}cc)` }}
                            />
                          </div>
                          {MILESTONES.filter((m) => m < 100).map((m) => {
                            const reached = en.progress >= m
                            return (
                              <div key={m} title={`Hito ${m}%`} style={{
                                position: "absolute", top: "50%", left: `${m}%`, transform: "translate(-50%,-50%)",
                                width: 10, height: 10, borderRadius: "50%",
                                background: reached ? meta.accent : "var(--surface-solid)",
                                border: `2px solid ${reached ? meta.accent : "var(--border)"}`,
                                boxShadow: reached ? `0 0 8px ${meta.accent}88` : "none",
                                transition: "all .4s ease",
                              }} />
                            )
                          })}
                        </div>
                      </div>

                      {/* Mini-estadísticas */}
                      <div style={{ display: "flex", gap: 22, flexWrap: "wrap", alignItems: "center" }}>
                        <Stat label="Horas" value={totalH ? `${Math.round(en.hoursCompleted)}/${totalH} h` : `${Math.round(en.hoursCompleted)} h`} />
                        {en.attendance.rate !== null && <Stat label="Asistencia" value={`${en.attendance.rate}%`} />}
                        {en.course.durationWeeks && <Stat label="Duración" value={`${en.course.durationWeeks} sem`} />}
                        <Link
                          href={isCertified ? "/aula/certificaciones" : "/aula/materiales"}
                          style={{ marginLeft: "auto", fontSize: 11.5, letterSpacing: ".08em", textTransform: "uppercase", color: meta.accent, textDecoration: "none", whiteSpace: "nowrap" }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.7")}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                        >
                          {isCertified ? "Ver certificado →" : "Continuar →"}
                        </Link>
                      </div>

                      {/* Insignias / logros */}
                      <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
                        {achievements.map((a) => {
                          const AchIcon = ACH_ICONS[a.icon]
                          return (
                            <div key={a.id} title={`${a.label} — ${a.desc}`} style={{
                              width: 30, height: 30, borderRadius: 8,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              background: a.unlocked ? `${meta.accent}1a` : "var(--surface-2)",
                              border: `1px solid ${a.unlocked ? `${meta.accent}45` : "var(--border-soft)"}`,
                              opacity: a.unlocked ? 1 : 0.4,
                              transition: "all .3s",
                            }}>
                              <AchIcon size={15} style={{ color: a.unlocked ? meta.accent : "var(--text-dim)" }} />
                            </div>
                          )
                        })}
                      </div>
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
            <Calendar size={17} style={{ color: "var(--teal)" }} />
          </div>
          <div>
            <p style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--teal)", marginBottom: 2 }}>Próxima sesión</p>
            <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 17, color: "var(--text)" }}>
              Clases en vivo por Zoom
            </h2>
          </div>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.65, marginBottom: 18, paddingLeft: 48 }}>
          Revisá la sección <strong style={{ color: "var(--text-strong)" }}>Clases en vivo</strong> para ver el calendario completo y el link de acceso a Zoom.
        </p>
        <div style={{ paddingLeft: 48 }}>
          <Link
            href="/aula/clases"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--gold)", textDecoration: "none" }}
          >
            <Sparkles size={13} /> Ver calendario
          </Link>
        </div>
      </div>
    </div>
  )
}
