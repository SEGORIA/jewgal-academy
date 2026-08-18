"use client"

import { useEffect, useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Award, Download, X, ExternalLink, Loader2, FileDown } from "lucide-react"
import Link from "next/link"
import { PROGRAM_META, DEFAULT_PROGRAM_META } from "@/lib/program-meta"
import { DEFAULT_CERTIFICATE_DESIGN, resolveProgramAccent, type CertificateDesign } from "@/lib/certificate-design"
import CertificatePreview from "@/components/certificates/CertificatePreview"

type Enrollment = {
  id: string
  completedAt: string
  certificateNumber: string
  certificateUrl: string | null
  enrolledAt: string
  course: { id: string; title: string; slug: string; isFree: boolean; accreditations: { logoUrl: string | null }[] }
}

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid rgba(165,141,102,.13)",
  borderRadius: 14,
}

export default function CertificacionesPage() {
  const { data: session } = useSession()
  const [certs,   setCerts]   = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [active,  setActive]  = useState<Enrollment | null>(null)
  const [design,  setDesign]  = useState<CertificateDesign>(DEFAULT_CERTIFICATE_DESIGN)
  const certRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/me/enrollments?status=completed")
      .then((r) => r.json())
      .then((d) => setCerts(d.enrollments ?? []))
      .catch(() => setCerts([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetch("/api/certificate-design")
      .then((r) => r.json())
      .then((d) => setDesign(d))
      .catch(() => {})
  }, [])

  function printCert() {
    window.print()
  }

  const name      = session?.user?.name ?? "Estudiante"

  return (
    <>
      {/* ── CSS print — solo el certificado se imprime ── */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #cert-print { display: flex !important; position: fixed; inset: 0; z-index: 9999;
            background: #fff; align-items: center; justify-content: center; }
        }
      `}</style>

      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ marginBottom: 36 }}>
          <span style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: 10 }}>
            Aula Virtual
          </span>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 36, color: "var(--text)", marginBottom: 6 }}>
            Mis certificaciones
          </h1>
          <p style={{ color: "var(--text-faint)", fontSize: 14 }}>
            Tus logros y certificados de programas completados.
          </p>
        </div>

        {loading ? (
          <div style={{ padding: "80px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "var(--text-dim)" }}>
            <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
            Cargando certificaciones…
          </div>
        ) : certs.length === 0 ? (
          /* Estado vacío — todavía no completó ningún programa */
          <div style={{ ...card, padding: "60px 40px", textAlign: "center" }}>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ fontSize: 52, marginBottom: 20, filter: "drop-shadow(0 0 18px rgba(165,141,102,0.3))" }}
            >
              🎓
            </motion.div>
            <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 24, color: "var(--text)", marginBottom: 12 }}>
              Tu primer certificado te espera
            </h2>
            <p style={{ color: "var(--text-faint)", fontSize: 15, maxWidth: 440, margin: "0 auto 28px", lineHeight: 1.7 }}>
              Al completar cualquiera de nuestros programas, recibirás aquí tu certificado oficial firmado por Devora Benchimol.
            </p>
            <Link href="/#programas"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--gold)", color: "#2C1F14", textDecoration: "none", padding: "12px 28px", borderRadius: 10, fontSize: 13, fontWeight: 700, letterSpacing: ".08em" }}>
              Explorar programas →
            </Link>

            {/* Preview decorativo del certificado */}
            <div style={{
              marginTop: 48, padding: "32px 40px",
              background: "rgba(165,141,102,.04)",
              border: "1px dashed rgba(165,141,102,.2)",
              borderRadius: 12, opacity: 0.5,
            }}>
              <p style={{ fontSize: 10, letterSpacing: ".3em", textTransform: "uppercase", color: "rgba(165,141,102,.6)", marginBottom: 12 }}>✦ JEWGAL ACADEMY ✦</p>
              <p style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--text)", marginBottom: 8 }}>Certificado de Finalización</p>
              <p style={{ fontSize: 12, color: "var(--text-faint)" }}>Otorgado con honor a · Tu nombre aquí</p>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 18 }}>
            {certs.map((c, i) => {
              const meta = PROGRAM_META[c.course.slug] ?? { ...DEFAULT_PROGRAM_META, desc: c.course.title }
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, ease: [0.23,1,.32,1] }}
                  style={{
                    background: `linear-gradient(145deg, rgba(165,141,102,.06), rgba(165,141,102,.02))`,
                    border: `1px solid ${meta.accent}40`,
                    borderRadius: 16, padding: "28px 24px",
                    position: "relative", overflow: "hidden",
                  }}
                >
                  {/* Ornamento de fondo */}
                  <div style={{
                    position: "absolute", right: -16, top: -16,
                    fontSize: 80, opacity: 0.04, pointerEvents: "none",
                    fontFamily: "var(--serif)", color: meta.accent,
                  }}>{meta.icon}</div>

                  {/* Medalla */}
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: `${meta.accent}22`, border: `2px solid ${meta.accent}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 18 }}>
                    {meta.icon}
                  </div>

                  <p style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: meta.accent, marginBottom: 8, opacity: .8 }}>
                    Certificado oficial
                  </p>
                  <h3 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 18, color: "var(--text)", marginBottom: 6, lineHeight: 1.25 }}>
                    {c.course.title}
                  </h3>
                  <p style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 6 }}>
                    Completado el {new Date(c.completedAt).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <p style={{ fontSize: 11, color: "rgba(165,141,102,.5)", letterSpacing: ".1em", marginBottom: 22 }}>
                    N° {c.certificateNumber}
                  </p>

                  <button
                    onClick={() => setActive(c)}
                    style={{ display: "flex", alignItems: "center", gap: 7, background: `${meta.accent}18`, border: `1px solid ${meta.accent}40`, color: meta.accent, borderRadius: 9, padding: "10px 18px", fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: ".08em", transition: "all .2s" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = `${meta.accent}30`)}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = `${meta.accent}18`)}
                  >
                    <Award size={14} /> Ver certificado
                  </button>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── MODAL CERTIFICADO ── */}
      <AnimatePresence>
        {active && (
          <motion.div
            key="cert-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 80, background: "var(--bar)", backdropFilter: "blur(14px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}
            onClick={() => setActive(null)}
          >
            {/* Controles */}
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }} onClick={(e) => e.stopPropagation()}>
              {active.certificateUrl ? (
                <a href={active.certificateUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 7, background: "var(--gold)", border: "1px solid var(--gold)", color: "#2C1F14", borderRadius: 9, padding: "10px 20px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                  <FileDown size={15} /> Descargar PDF
                </a>
              ) : (
                <button onClick={printCert}
                  style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(165,141,102,.15)", border: "1px solid rgba(165,141,102,.35)", color: "var(--gold)", borderRadius: 9, padding: "10px 20px", fontSize: 13, cursor: "pointer" }}>
                  <Download size={15} /> Imprimir / Descargar
                </button>
              )}
              <Link href={`/verificar/${active.certificateNumber}`} target="_blank"
                style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(165,141,102,.15)", border: "1px solid rgba(165,141,102,.35)", color: "var(--gold)", borderRadius: 9, padding: "10px 20px", fontSize: 13, textDecoration: "none" }}>
                <ExternalLink size={15} /> Verificar en línea
              </Link>
              <button onClick={() => setActive(null)}
                style={{ display: "flex", alignItems: "center", gap: 7, background: "var(--surface-2)", border: "1px solid rgba(255,255,255,.1)", color: "var(--text-muted)", borderRadius: 9, padding: "10px 16px", fontSize: 13, cursor: "pointer" }}>
                <X size={15} /> Cerrar
              </button>
            </div>

            {/* El certificado en sí */}
            <motion.div
              id="cert-print"
              ref={certRef}
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              style={{ width: "min(780px, 100%)" }}
            >
              <CertificatePreview
                studentName={name}
                courseTitle={active.course.title}
                certificateNumber={active.certificateNumber}
                completedAt={active.completedAt}
                accent={resolveProgramAccent(design, active.course.slug)}
                design={design}
                accreditationLogos={active.course.accreditations.map((a) => a.logoUrl).filter((u): u is string => !!u)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
