import { Link } from "@/i18n/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Privacidad | Jewgal Academy",
  description: "Información sobre cómo Jewgal Academy recopila, usa y protege tus datos personales.",
}

const SECTIONS_ES = [
  {
    title: "1. Responsable del tratamiento",
    content: `Jewgal Academy, operada por Sholem Corazón Valiente Inc. (non-profit organization), con sede en Miami, Florida, EE.UU., es responsable del tratamiento de los datos personales recopilados a través del sitio jewgalacademy.com y sus servicios asociados.

Contacto: hola@jewgalacademy.com`,
  },
  {
    title: "2. Datos que recopilamos",
    content: `Recopilamos únicamente los datos necesarios para prestarte nuestros servicios:

• Datos de registro: nombre, apellido, dirección de correo electrónico y contraseña (almacenada de forma cifrada).
• Datos de contacto: número de teléfono cuando nos escribís a través del formulario de contacto.
• Datos de uso: progreso en cursos, asistencia a clases y actividad dentro del Aula Virtual.
• Datos de pago: procesados directamente por nuestros proveedores de pago (Stripe). Jewgal Academy no almacena datos de tarjetas de crédito.
• Datos técnicos: dirección IP, tipo de navegador e identificadores de sesión para garantizar la seguridad del servicio.`,
  },
  {
    title: "3. Finalidad del tratamiento",
    content: `Utilizamos tus datos para:

• Gestionar tu cuenta y acceso al Aula Virtual.
• Enviarte información sobre tus cursos, certificaciones y progreso académico.
• Comunicarte novedades, eventos y programas de Jewgal Academy (con tu consentimiento).
• Mejorar nuestros servicios y detectar problemas técnicos.
• Cumplir con obligaciones legales y fiscales aplicables.`,
  },
  {
    title: "4. Base legal",
    content: `El tratamiento de tus datos se basa en:

• La ejecución del contrato de servicios educativos que aceptás al registrarte.
• Tu consentimiento explícito para el envío de comunicaciones comerciales.
• Nuestro interés legítimo en mejorar el servicio y garantizar la seguridad.`,
  },
  {
    title: "5. Conservación de datos",
    content: `Conservamos tus datos mientras mantengas una cuenta activa en Jewgal Academy. Si solicitás la eliminación de tu cuenta, borraremos tus datos personales en un plazo máximo de 30 días, salvo que debamos conservarlos por obligación legal (por ejemplo, datos fiscales durante el período exigido por la ley).`,
  },
  {
    title: "6. Terceros y transferencias internacionales",
    content: `Compartimos tus datos únicamente con proveedores de confianza necesarios para prestar el servicio:

• Neon (base de datos): alojamiento de datos en servidores seguros.
• Stripe: procesamiento de pagos (certificado PCI-DSS).
• Vercel: hosting de la plataforma.
• Resend / Email: envío de notificaciones transaccionales.

Algunos proveedores pueden estar ubicados fuera del Espacio Económico Europeo. En todos los casos aplicamos garantías adecuadas de protección.`,
  },
  {
    title: "7. Tus derechos",
    content: `Tenés derecho a:

• Acceder a los datos que conservamos sobre vos.
• Rectificar datos inexactos o incompletos.
• Solicitar la eliminación de tus datos ("derecho al olvido").
• Oponerte al tratamiento para fines de marketing.
• Portar tus datos a otro servicio.
• Retirar tu consentimiento en cualquier momento.

Para ejercer cualquiera de estos derechos, escribinos a hola@jewgalacademy.com.`,
  },
  {
    title: "8. Seguridad",
    content: `Aplicamos medidas técnicas y organizativas para proteger tus datos: cifrado en tránsito (HTTPS/TLS), contraseñas hasheadas, control de acceso por roles y monitoreo de seguridad. Sin embargo, ningún sistema es 100% infalible. Si detectás una vulnerabilidad, por favor notificanos inmediatamente.`,
  },
  {
    title: "9. Cookies",
    content: `Jewgal Academy utiliza cookies estrictamente necesarias para el funcionamiento de la sesión y la autenticación. No utilizamos cookies de seguimiento ni publicidad de terceros.`,
  },
  {
    title: "10. Cambios en esta política",
    content: `Podemos actualizar esta política periódicamente. Cuando lo hagamos, notificaremos a los usuarios registrados por correo electrónico y actualizaremos la fecha de "última actualización" al pie de esta página.`,
  },
]

const SECTIONS_EN = [
  {
    title: "1. Data controller",
    content: `Jewgal Academy, operated by Sholem Corazón Valiente Inc. (a non-profit organization) based in Miami, Florida, USA, is responsible for processing the personal data collected through the jewgalacademy.com site and its associated services.

Contact: hola@jewgalacademy.com`,
  },
  {
    title: "2. Data we collect",
    content: `We collect only the data necessary to provide you with our services:

• Registration data: first name, last name, email address, and password (stored in encrypted form).
• Contact data: phone number when you write to us through the contact form.
• Usage data: course progress, class attendance, and activity within the Virtual Classroom.
• Payment data: processed directly by our payment providers (Stripe). Jewgal Academy does not store credit card data.
• Technical data: IP address, browser type, and session identifiers to ensure the security of the service.`,
  },
  {
    title: "3. Purpose of processing",
    content: `We use your data to:

• Manage your account and access to the Virtual Classroom.
• Send you information about your courses, certifications, and academic progress.
• Share news, events, and programs from Jewgal Academy (with your consent).
• Improve our services and detect technical issues.
• Comply with applicable legal and tax obligations.`,
  },
  {
    title: "4. Legal basis",
    content: `The processing of your data is based on:

• The performance of the educational services contract you accept when registering.
• Your explicit consent for sending commercial communications.
• Our legitimate interest in improving the service and ensuring security.`,
  },
  {
    title: "5. Data retention",
    content: `We keep your data for as long as you maintain an active account with Jewgal Academy. If you request the deletion of your account, we will erase your personal data within a maximum of 30 days, unless we must retain it due to a legal obligation (for example, tax data for the period required by law).`,
  },
  {
    title: "6. Third parties and international transfers",
    content: `We share your data only with trusted providers necessary to deliver the service:

• Neon (database): data hosting on secure servers.
• Stripe: payment processing (PCI-DSS certified).
• Vercel: platform hosting.
• Resend / Email: sending transactional notifications.

Some providers may be located outside the European Economic Area. In all cases we apply appropriate protection safeguards.`,
  },
  {
    title: "7. Your rights",
    content: `You have the right to:

• Access the data we hold about you.
• Rectify inaccurate or incomplete data.
• Request the deletion of your data ("right to be forgotten").
• Object to processing for marketing purposes.
• Port your data to another service.
• Withdraw your consent at any time.

To exercise any of these rights, write to us at hola@jewgalacademy.com.`,
  },
  {
    title: "8. Security",
    content: `We apply technical and organizational measures to protect your data: encryption in transit (HTTPS/TLS), hashed passwords, role-based access control, and security monitoring. However, no system is 100% infallible. If you detect a vulnerability, please notify us immediately.`,
  },
  {
    title: "9. Cookies",
    content: `Jewgal Academy uses cookies strictly necessary for session functionality and authentication. We do not use third-party tracking or advertising cookies.`,
  },
  {
    title: "10. Changes to this policy",
    content: `We may update this policy periodically. When we do, we will notify registered users by email and update the "last updated" date at the bottom of this page.`,
  },
]

const COPY = {
  es: {
    legal: "Legal",
    title1: "Política de",
    title2: "Privacidad",
    updated: "Última actualización: 29 de junio de 2026",
    intro: "En Jewgal Academy nos tomamos muy en serio la privacidad de nuestros alumnos y visitantes. Esta política describe cómo recopilamos, usamos y protegemos tu información personal cuando usás nuestro sitio web y nuestros servicios educativos.",
    questions: "¿Tenés preguntas sobre esta política o sobre el tratamiento de tus datos?",
    terms: "Términos de uso →",
    home: "Volver al inicio",
    sections: SECTIONS_ES,
  },
  en: {
    legal: "Legal",
    title1: "Privacy",
    title2: "Policy",
    updated: "Last updated: June 29, 2026",
    intro: "At Jewgal Academy we take the privacy of our students and visitors very seriously. This policy describes how we collect, use, and protect your personal information when you use our website and our educational services.",
    questions: "Have questions about this policy or how your data is handled?",
    terms: "Terms of use →",
    home: "Back to home",
    sections: SECTIONS_EN,
  },
} as const

export default async function PoliticaPrivacidadPage({ params }: { params: Promise<{ locale: string }> }) {
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
            <Link href="/terminos" style={{ fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--on-dark)", textDecoration: "none" }}>
              {c.terms}
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
