import Link from "next/link"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Privacidad | Jewgal Academy",
  description: "Información sobre cómo Jewgal Academy recopila, usa y protege tus datos personales.",
}

const SECTIONS = [
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

export default function PoliticaPrivacidadPage() {
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
            Política de<br /><em style={{ fontStyle: "normal", color: "var(--gold-light)" }}>Privacidad</em>
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
            En Jewgal Academy nos tomamos muy en serio la privacidad de nuestros alumnos y visitantes. Esta política describe cómo recopilamos, usamos y protegemos tu información personal cuando usás nuestro sitio web y nuestros servicios educativos.
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
              ¿Tenés preguntas sobre esta política o sobre el tratamiento de tus datos?
            </p>
            <a href="mailto:hola@jewgalacademy.com" style={{ color: "var(--gold)", fontSize: 14, textDecoration: "none" }}>
              hola@jewgalacademy.com
            </a>
          </div>

          <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid var(--line-d)", display: "flex", gap: 20, flexWrap: "wrap" }}>
            <Link href="/terminos" style={{ fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--on-dark)", textDecoration: "none" }}>
              Términos de uso →
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
