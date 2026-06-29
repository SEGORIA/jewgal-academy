import Link from "next/link"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Términos de Uso | Jewgal Academy",
  description: "Condiciones generales de uso de los servicios educativos de Jewgal Academy.",
}

const SECTIONS = [
  {
    title: "1. Aceptación de los términos",
    content: `Al registrarte en Jewgal Academy o al acceder a cualquiera de nuestros servicios, aceptás estos Términos de Uso en su totalidad. Si no estás de acuerdo con alguna parte, te pedimos que no utilices nuestra plataforma.

Jewgal Academy es operada por Sholem Corazón Valiente Inc., organización 501(c)(3) sin fines de lucro con sede en Miami, Florida, EE.UU.`,
  },
  {
    title: "2. Descripción del servicio",
    content: `Jewgal Academy ofrece programas de formación en línea y presenciales en las áreas de Life Coaching Integrativo, Cabalá aplicada, Método Jewgal y liderazgo. Los servicios incluyen:

• Acceso al Aula Virtual con materiales, videos y recursos de formación.
• Participación en clases en vivo, retiros y eventos presenciales.
• Certificaciones emitidas por Jewgal Academy según los programas completados.
• Acceso a una comunidad de alumnos y egresados.`,
  },
  {
    title: "3. Registro y cuenta",
    content: `Para acceder al Aula Virtual debés crear una cuenta con información veraz y actualizada. Sos responsable de mantener la confidencialidad de tu contraseña y de todas las actividades realizadas desde tu cuenta.

Jewgal Academy se reserva el derecho de suspender o eliminar cuentas que incumplan estos términos o que utilicen el servicio de forma abusiva.`,
  },
  {
    title: "4. Pagos y reembolsos",
    content: `Los precios de los programas se indican en dólares estadounidenses (USD) al momento de la inscripción. Los pagos se procesan a través de Stripe, una plataforma segura certificada PCI-DSS.

Política de reembolso: podés solicitar el reembolso completo dentro de los 7 días posteriores a tu inscripción, siempre que no hayas accedido a más del 20% del contenido del programa. Pasado ese plazo, los pagos no son reembolsables.

Para solicitar un reembolso, escribinos a hola@jewgalacademy.com con el asunto "Solicitud de reembolso".`,
  },
  {
    title: "5. Propiedad intelectual",
    content: `Todo el contenido de Jewgal Academy — incluyendo videos, textos, materiales de estudio, metodologías, marca, logotipos y diseños — es propiedad exclusiva de Sholem Corazón Valiente Inc. o de sus licenciantes.

Tenés derecho a acceder a los materiales para tu uso personal y educativo. No podés:

• Reproducir, distribuir o vender el contenido sin autorización escrita.
• Compartir tus credenciales de acceso con terceros.
• Grabar o retransmitir clases en vivo sin permiso expreso.`,
  },
  {
    title: "6. Código de conducta",
    content: `Jewgal Academy es un espacio de crecimiento personal y colectivo. Esperamos que todos los participantes mantengan un trato respetuoso, honesto y empático hacia los demás alumnos, instructores y al equipo.

No está permitido el uso de lenguaje ofensivo, la difusión de contenido inapropiado ni cualquier conducta que afecte negativamente la experiencia de la comunidad. El incumplimiento puede derivar en la suspensión del acceso sin reembolso.`,
  },
  {
    title: "7. Certificaciones",
    content: `Las certificaciones emitidas por Jewgal Academy acreditan la finalización satisfactoria de un programa y el cumplimiento de los requisitos académicos establecidos (asistencia mínima, evaluaciones y trabajos prácticos).

Jewgal Academy no garantiza resultados específicos en términos de ingresos, empleo o desempeño profesional derivados de la obtención de una certificación.`,
  },
  {
    title: "8. Limitación de responsabilidad",
    content: `Jewgal Academy provee sus servicios "tal como están" y realiza esfuerzos razonables para mantener la disponibilidad de la plataforma. Sin embargo, no garantizamos un funcionamiento ininterrumpido ni libre de errores.

En ningún caso Jewgal Academy será responsable por daños indirectos, pérdida de datos o perjuicios económicos derivados del uso o la imposibilidad de uso de la plataforma, más allá de lo que establezca la legislación aplicable.`,
  },
  {
    title: "9. Modificaciones",
    content: `Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán notificados por correo electrónico a los usuarios registrados con al menos 15 días de anticipación. El uso continuado del servicio tras esa fecha implica la aceptación de los nuevos términos.`,
  },
  {
    title: "10. Ley aplicable",
    content: `Estos términos se rigen por las leyes del Estado de Florida, EE.UU. Cualquier disputa que no pueda resolverse de forma amistosa será sometida a la jurisdicción de los tribunales de Miami-Dade County, Florida.`,
  },
]

export default function TerminosPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section style={{
        background: "linear-gradient(120deg,var(--navy-2) 0%,var(--navy) 60%,#2A1D12 100%)",
        paddingTop: 140, paddingBottom: 72,
        borderBottom: "1px solid var(--line-d)",
      }}>
        <div className="wrap">
          <span style={{ fontSize: 10, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: 18 }}>
            Legal
          </span>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(32px,5vw,60px)", color: "var(--text)", lineHeight: 1.05, letterSpacing: "-.01em", marginBottom: 16 }}>
            Términos<br /><em style={{ fontStyle: "normal", color: "var(--gold-light)" }}>de Uso</em>
          </h1>
          <p style={{ color: "var(--on-dark)", fontSize: 14, lineHeight: 1.7 }}>
            Última actualización: 29 de junio de 2026
          </p>
        </div>
      </section>

      {/* Contenido */}
      <section style={{ background: "var(--navy)" }}>
        <div className="wrap" style={{ padding: "72px 36px", maxWidth: 760 }}>

          <p style={{ color: "var(--on-dark)", fontSize: 16, lineHeight: 1.8, marginBottom: 52 }}>
            Estos Términos de Uso regulan la relación entre Jewgal Academy y sus alumnos, visitantes y usuarios. Por favor leelos con atención antes de utilizar nuestros servicios.
          </p>

          {SECTIONS.map((s) => (
            <div key={s.title} style={{ marginBottom: 44, paddingBottom: 44, borderBottom: "1px solid var(--line-d)" }}>
              <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(18px,2vw,24px)", color: "var(--text)", marginBottom: 16, lineHeight: 1.2 }}>
                {s.title}
              </h2>
              {s.content.split("\n\n").map((p, i) => (
                <p key={i} style={{ color: "var(--on-dark)", fontSize: 15, lineHeight: 1.8, marginBottom: 12, whiteSpace: "pre-line" }}>
                  {p}
                </p>
              ))}
            </div>
          ))}

          {/* Contacto */}
          <div style={{ background: "var(--navy-2)", border: "1px solid var(--line-d)", borderRadius: 10, padding: "28px 32px", marginTop: 8 }}>
            <p style={{ color: "var(--on-dark)", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
              ¿Tenés preguntas sobre estos términos?
            </p>
            <a href="mailto:hola@jewgalacademy.com" style={{ color: "var(--gold)", fontSize: 14, textDecoration: "none" }}>
              hola@jewgalacademy.com
            </a>
          </div>

          <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid var(--line-d)", display: "flex", gap: 20, flexWrap: "wrap" }}>
            <Link href="/politica-privacidad" style={{ fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--on-dark)", textDecoration: "none" }}>
              Política de privacidad →
            </Link>
            <Link href="/" style={{ fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--on-dark)", textDecoration: "none" }}>
              Volver al inicio
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
