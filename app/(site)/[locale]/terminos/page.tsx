import { Link } from "@/i18n/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Términos de Uso | Jewgal Academy",
  description: "Condiciones generales de uso de los servicios educativos de Jewgal Academy.",
}

const SECTIONS_ES = [
  {
    title: "1. Aceptación de los términos",
    content: `Al registrarte en Jewgal Academy o al acceder a cualquiera de nuestros servicios, aceptás estos Términos de Uso en su totalidad. Si no estás de acuerdo con alguna parte, te pedimos que no utilices nuestra plataforma.

Jewgal Academy es operada por Sholem Corazón Valiente Inc., non-profit organization con sede en Miami, Florida, EE.UU.`,
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

const SECTIONS_EN = [
  {
    title: "1. Acceptance of terms",
    content: `By registering with Jewgal Academy or accessing any of our services, you accept these Terms of Use in their entirety. If you do not agree with any part, we ask that you not use our platform.

Jewgal Academy is operated by Sholem Corazón Valiente Inc., a non-profit organization based in Miami, Florida, USA.`,
  },
  {
    title: "2. Description of the service",
    content: `Jewgal Academy offers online and in-person training programs in the areas of Integrative Life Coaching, applied Kabbalah, the Jewgal Method, and leadership. The services include:

• Access to the Virtual Classroom with materials, videos, and training resources.
• Participation in live classes, retreats, and in-person events.
• Certifications issued by Jewgal Academy based on the programs completed.
• Access to a community of students and graduates.`,
  },
  {
    title: "3. Registration and account",
    content: `To access the Virtual Classroom you must create an account with truthful and up-to-date information. You are responsible for keeping your password confidential and for all activities carried out from your account.

Jewgal Academy reserves the right to suspend or delete accounts that breach these terms or that use the service abusively.`,
  },
  {
    title: "4. Payments and refunds",
    content: `Program prices are listed in US dollars (USD) at the time of enrollment. Payments are processed through Stripe, a secure PCI-DSS certified platform.

Refund policy: you may request a full refund within 7 days of your enrollment, provided you have not accessed more than 20% of the program content. After that period, payments are non-refundable.

To request a refund, write to us at hola@jewgalacademy.com with the subject "Refund request".`,
  },
  {
    title: "5. Intellectual property",
    content: `All Jewgal Academy content — including videos, texts, study materials, methodologies, brand, logos, and designs — is the exclusive property of Sholem Corazón Valiente Inc. or its licensors.

You have the right to access the materials for your personal and educational use. You may not:

• Reproduce, distribute, or sell the content without written authorization.
• Share your access credentials with third parties.
• Record or rebroadcast live classes without express permission.`,
  },
  {
    title: "6. Code of conduct",
    content: `Jewgal Academy is a space for personal and collective growth. We expect all participants to maintain respectful, honest, and empathetic treatment toward other students, instructors, and the team.

The use of offensive language, the sharing of inappropriate content, and any conduct that negatively affects the community experience are not permitted. Non-compliance may result in suspension of access without a refund.`,
  },
  {
    title: "7. Certifications",
    content: `Certifications issued by Jewgal Academy attest to the successful completion of a program and the fulfillment of the established academic requirements (minimum attendance, assessments, and practical work).

Jewgal Academy does not guarantee specific results in terms of income, employment, or professional performance derived from obtaining a certification.`,
  },
  {
    title: "8. Limitation of liability",
    content: `Jewgal Academy provides its services "as is" and makes reasonable efforts to maintain the platform's availability. However, we do not guarantee uninterrupted or error-free operation.

In no event shall Jewgal Academy be liable for indirect damages, data loss, or economic harm arising from the use or inability to use the platform, beyond what applicable law establishes.`,
  },
  {
    title: "9. Modifications",
    content: `We reserve the right to modify these terms at any time. Changes will be notified by email to registered users at least 15 days in advance. Continued use of the service after that date implies acceptance of the new terms.`,
  },
  {
    title: "10. Governing law",
    content: `These terms are governed by the laws of the State of Florida, USA. Any dispute that cannot be resolved amicably will be submitted to the jurisdiction of the courts of Miami-Dade County, Florida.`,
  },
]

const COPY = {
  es: {
    legal: "Legal",
    title1: "Términos",
    title2: "de Uso",
    updated: "Última actualización: 29 de junio de 2026",
    intro: "Estos Términos de Uso regulan la relación entre Jewgal Academy y sus alumnos, visitantes y usuarios. Por favor leelos con atención antes de utilizar nuestros servicios.",
    questions: "¿Tenés preguntas sobre estos términos?",
    privacy: "Política de privacidad →",
    home: "Volver al inicio",
    sections: SECTIONS_ES,
  },
  en: {
    legal: "Legal",
    title1: "Terms",
    title2: "of Use",
    updated: "Last updated: June 29, 2026",
    intro: "These Terms of Use govern the relationship between Jewgal Academy and its students, visitors, and users. Please read them carefully before using our services.",
    questions: "Have questions about these terms?",
    privacy: "Privacy policy →",
    home: "Back to home",
    sections: SECTIONS_EN,
  },
} as const

export default async function TerminosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const c = COPY[locale as keyof typeof COPY] ?? COPY.es

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
            {c.legal}
          </span>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(32px,5vw,60px)", color: "var(--text)", lineHeight: 1.05, letterSpacing: "-.01em", marginBottom: 16 }}>
            {c.title1}<br /><em style={{ fontStyle: "normal", color: "var(--gold-light)" }}>{c.title2}</em>
          </h1>
          <p style={{ color: "var(--on-dark)", fontSize: 14, lineHeight: 1.7 }}>
            {c.updated}
          </p>
        </div>
      </section>

      {/* Contenido */}
      <section style={{ background: "var(--navy)" }}>
        <div className="wrap" style={{ padding: "72px 36px", maxWidth: 760 }}>

          <p style={{ color: "var(--on-dark)", fontSize: 16, lineHeight: 1.8, marginBottom: 52 }}>
            {c.intro}
          </p>

          {c.sections.map((s) => (
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
              {c.questions}
            </p>
            <a href="mailto:hola@jewgalacademy.com" style={{ color: "var(--gold)", fontSize: 14, textDecoration: "none" }}>
              hola@jewgalacademy.com
            </a>
          </div>

          <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid var(--line-d)", display: "flex", gap: 20, flexWrap: "wrap" }}>
            <Link href="/politica-privacidad" style={{ fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--on-dark)", textDecoration: "none" }}>
              {c.privacy}
            </Link>
            <Link href="/" style={{ fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--on-dark)", textDecoration: "none" }}>
              {c.home}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
