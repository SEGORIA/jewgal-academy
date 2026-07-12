import Link from "next/link"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import RevealInit from "@/components/RevealInit"
import { db } from "@/lib/db"
import { ShieldCheck, ShieldX } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function VerificarNumeroPage({ params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params

  const enrollment = await db.enrollment.findUnique({
    where: { certificateNumber: decodeURIComponent(numero) },
    select: {
      certificateNumber: true,
      completedAt: true,
      user: { select: { name: true } },
      course: { select: { title: true } },
    },
  })

  const valid = !!enrollment?.completedAt

  return (
    <>
      <RevealInit />
      <Navbar />
      <section style={{
        background: "linear-gradient(135deg,var(--bg) 0%,var(--surface-solid) 55%,#2A1D12 100%)",
        minHeight: "70vh", display: "flex", alignItems: "center",
        paddingTop: "clamp(120px,14vw,160px)", paddingBottom: 80,
      }}>
        <div className="wrap" style={{ maxWidth: 560, margin: "0 auto", padding: "0 24px" }}>
          <div style={{
            background: "var(--surface)",
            border: `1px solid ${valid ? "rgba(107,191,142,.35)" : "rgba(239,68,68,.3)"}`,
            borderRadius: 18, padding: "44px 40px", textAlign: "center",
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: valid ? "rgba(107,191,142,.12)" : "rgba(239,68,68,.1)",
              border: `1px solid ${valid ? "rgba(107,191,142,.35)" : "rgba(239,68,68,.3)"}`,
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px",
            }}>
              {valid
                ? <ShieldCheck size={28} style={{ color: "var(--success)" }} />
                : <ShieldX size={28} style={{ color: "var(--danger)" }} />
              }
            </div>

            {valid && enrollment ? (
              <>
                <span style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--success)", display: "block", marginBottom: 12 }}>
                  Certificado verificado
                </span>
                <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(24px,3vw,32px)", color: "var(--text)", marginBottom: 20 }}>
                  {enrollment.user.name}
                </h1>
                <p style={{ color: "var(--on-dark)", fontSize: 15, lineHeight: 1.7, marginBottom: 8 }}>
                  Completó exitosamente el programa
                </p>
                <p style={{ fontFamily: "var(--serif)", fontSize: 20, color: "var(--gold-light)", marginBottom: 20 }}>
                  {enrollment.course.title}
                </p>
                <p style={{ color: "var(--on-dark-faint)", fontSize: 13 }}>
                  {new Date(enrollment.completedAt!).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
                  {" · "}N° {enrollment.certificateNumber}
                </p>
              </>
            ) : (
              <>
                <span style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--danger)", display: "block", marginBottom: 12 }}>
                  No encontrado
                </span>
                <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(22px,2.8vw,28px)", color: "var(--text)", marginBottom: 16 }}>
                  Este número de certificado no es válido
                </h1>
                <p style={{ color: "var(--on-dark)", fontSize: 14.5, lineHeight: 1.7 }}>
                  Revisá que el número esté escrito correctamente, o contactanos si creés que se trata de un error.
                </p>
              </>
            )}

            <Link href="/verificar" className="btn" style={{ display: "inline-block", marginTop: 28 }}>
              Verificar otro certificado
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
