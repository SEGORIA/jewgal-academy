/**
 * Textos originales de las páginas legales (Términos de uso y Política de privacidad).
 * Son el punto de partida: quien administra los puede editar desde “Páginas legales” y lo guardado
 * en la base reemplaza a estos valores. Si se restaura el original, se vuelve a lo de este archivo.
 */
export type LegalDoc = "terminos" | "privacidad"
export type LegalLocale = "es" | "en"
export type LegalSection = { title: string; content: string }
export type LegalContent = {
  /** Título del encabezado, en dos líneas (la segunda va resaltada). */
  title1: string
  title2: string
  /** Ej.: “Última actualización: 29 de junio de 2026”. */
  updated: string
  intro: string
  /** Frase sobre el recuadro de contacto, al final. */
  questions: string
  /** Correo que se muestra en el recuadro de contacto. */
  email: string
  sections: LegalSection[]
}

export const LEGAL_DEFAULTS: Record<LegalDoc, Record<LegalLocale, LegalContent>> = {
  "terminos": {
    "es": {
      "title1": "Términos",
      "title2": "de Uso",
      "updated": "Última actualización: 29 de junio de 2026",
      "intro": "Estos Términos de Uso regulan la relación entre Jewgal Academy y sus alumnos, visitantes y usuarios. Por favor leelos con atención antes de utilizar nuestros servicios.",
      "questions": "¿Tenés preguntas sobre estos términos?",
      "email": "hola@jewgalacademy.com",
      "sections": [
        {
          "title": "1. Aceptación de los términos",
          "content": "Al registrarte en Jewgal Academy o al acceder a cualquiera de nuestros servicios, aceptás estos Términos de Uso en su totalidad. Si no estás de acuerdo con alguna parte, te pedimos que no utilices nuestra plataforma.\n\nJewgal Academy es operada por Sholem Corazón Valiente Inc., non-profit organization con sede en Miami, Florida, EE.UU."
        },
        {
          "title": "2. Descripción del servicio",
          "content": "Jewgal Academy ofrece programas de formación en línea y presenciales en las áreas de Life Coaching Integrativo, Cabalá aplicada, Método Jewgal y liderazgo. Los servicios incluyen:\n\n• Acceso al Aula Virtual con materiales, videos y recursos de formación.\n• Participación en clases en vivo, retiros y eventos presenciales.\n• Certificaciones emitidas por Jewgal Academy según los programas completados.\n• Acceso a una comunidad de alumnos y egresados."
        },
        {
          "title": "3. Registro y cuenta",
          "content": "Para acceder al Aula Virtual debés crear una cuenta con información veraz y actualizada. Sos responsable de mantener la confidencialidad de tu contraseña y de todas las actividades realizadas desde tu cuenta.\n\nJewgal Academy se reserva el derecho de suspender o eliminar cuentas que incumplan estos términos o que utilicen el servicio de forma abusiva."
        },
        {
          "title": "4. Pagos y reembolsos",
          "content": "Los precios de los programas se indican en dólares estadounidenses (USD) al momento de la inscripción. Los pagos se procesan a través de Stripe, una plataforma segura certificada PCI-DSS.\n\nPolítica de reembolso: podés solicitar el reembolso completo dentro de los 7 días posteriores a tu inscripción, siempre que no hayas accedido a más del 20% del contenido del programa. Pasado ese plazo, los pagos no son reembolsables.\n\nPara solicitar un reembolso, escribinos a hola@jewgalacademy.com con el asunto \"Solicitud de reembolso\"."
        },
        {
          "title": "5. Propiedad intelectual",
          "content": "Todo el contenido de Jewgal Academy — incluyendo videos, textos, materiales de estudio, metodologías, marca, logotipos y diseños — es propiedad exclusiva de Sholem Corazón Valiente Inc. o de sus licenciantes.\n\nTenés derecho a acceder a los materiales para tu uso personal y educativo. No podés:\n\n• Reproducir, distribuir o vender el contenido sin autorización escrita.\n• Compartir tus credenciales de acceso con terceros.\n• Grabar o retransmitir clases en vivo sin permiso expreso."
        },
        {
          "title": "6. Código de conducta",
          "content": "Jewgal Academy es un espacio de crecimiento personal y colectivo. Esperamos que todos los participantes mantengan un trato respetuoso, honesto y empático hacia los demás alumnos, instructores y al equipo.\n\nNo está permitido el uso de lenguaje ofensivo, la difusión de contenido inapropiado ni cualquier conducta que afecte negativamente la experiencia de la comunidad. El incumplimiento puede derivar en la suspensión del acceso sin reembolso."
        },
        {
          "title": "7. Certificaciones",
          "content": "Las certificaciones emitidas por Jewgal Academy acreditan la finalización satisfactoria de un programa y el cumplimiento de los requisitos académicos establecidos (asistencia mínima, evaluaciones y trabajos prácticos).\n\nJewgal Academy no garantiza resultados específicos en términos de ingresos, empleo o desempeño profesional derivados de la obtención de una certificación."
        },
        {
          "title": "8. Limitación de responsabilidad",
          "content": "Jewgal Academy provee sus servicios \"tal como están\" y realiza esfuerzos razonables para mantener la disponibilidad de la plataforma. Sin embargo, no garantizamos un funcionamiento ininterrumpido ni libre de errores.\n\nEn ningún caso Jewgal Academy será responsable por daños indirectos, pérdida de datos o perjuicios económicos derivados del uso o la imposibilidad de uso de la plataforma, más allá de lo que establezca la legislación aplicable."
        },
        {
          "title": "9. Modificaciones",
          "content": "Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán notificados por correo electrónico a los usuarios registrados con al menos 15 días de anticipación. El uso continuado del servicio tras esa fecha implica la aceptación de los nuevos términos."
        },
        {
          "title": "10. Ley aplicable",
          "content": "Estos términos se rigen por las leyes del Estado de Florida, EE.UU. Cualquier disputa que no pueda resolverse de forma amistosa será sometida a la jurisdicción de los tribunales de Miami-Dade County, Florida."
        }
      ]
    },
    "en": {
      "title1": "Terms",
      "title2": "of Use",
      "updated": "Last updated: June 29, 2026",
      "intro": "These Terms of Use govern the relationship between Jewgal Academy and its students, visitors, and users. Please read them carefully before using our services.",
      "questions": "Have questions about these terms?",
      "email": "hola@jewgalacademy.com",
      "sections": [
        {
          "title": "1. Acceptance of terms",
          "content": "By registering with Jewgal Academy or accessing any of our services, you accept these Terms of Use in their entirety. If you do not agree with any part, we ask that you not use our platform.\n\nJewgal Academy is operated by Sholem Corazón Valiente Inc., a non-profit organization based in Miami, Florida, USA."
        },
        {
          "title": "2. Description of the service",
          "content": "Jewgal Academy offers online and in-person training programs in the areas of Integrative Life Coaching, applied Kabbalah, the Jewgal Method, and leadership. The services include:\n\n• Access to the Virtual Classroom with materials, videos, and training resources.\n• Participation in live classes, retreats, and in-person events.\n• Certifications issued by Jewgal Academy based on the programs completed.\n• Access to a community of students and graduates."
        },
        {
          "title": "3. Registration and account",
          "content": "To access the Virtual Classroom you must create an account with truthful and up-to-date information. You are responsible for keeping your password confidential and for all activities carried out from your account.\n\nJewgal Academy reserves the right to suspend or delete accounts that breach these terms or that use the service abusively."
        },
        {
          "title": "4. Payments and refunds",
          "content": "Program prices are listed in US dollars (USD) at the time of enrollment. Payments are processed through Stripe, a secure PCI-DSS certified platform.\n\nRefund policy: you may request a full refund within 7 days of your enrollment, provided you have not accessed more than 20% of the program content. After that period, payments are non-refundable.\n\nTo request a refund, write to us at hola@jewgalacademy.com with the subject \"Refund request\"."
        },
        {
          "title": "5. Intellectual property",
          "content": "All Jewgal Academy content — including videos, texts, study materials, methodologies, brand, logos, and designs — is the exclusive property of Sholem Corazón Valiente Inc. or its licensors.\n\nYou have the right to access the materials for your personal and educational use. You may not:\n\n• Reproduce, distribute, or sell the content without written authorization.\n• Share your access credentials with third parties.\n• Record or rebroadcast live classes without express permission."
        },
        {
          "title": "6. Code of conduct",
          "content": "Jewgal Academy is a space for personal and collective growth. We expect all participants to maintain respectful, honest, and empathetic treatment toward other students, instructors, and the team.\n\nThe use of offensive language, the sharing of inappropriate content, and any conduct that negatively affects the community experience are not permitted. Non-compliance may result in suspension of access without a refund."
        },
        {
          "title": "7. Certifications",
          "content": "Certifications issued by Jewgal Academy attest to the successful completion of a program and the fulfillment of the established academic requirements (minimum attendance, assessments, and practical work).\n\nJewgal Academy does not guarantee specific results in terms of income, employment, or professional performance derived from obtaining a certification."
        },
        {
          "title": "8. Limitation of liability",
          "content": "Jewgal Academy provides its services \"as is\" and makes reasonable efforts to maintain the platform's availability. However, we do not guarantee uninterrupted or error-free operation.\n\nIn no event shall Jewgal Academy be liable for indirect damages, data loss, or economic harm arising from the use or inability to use the platform, beyond what applicable law establishes."
        },
        {
          "title": "9. Modifications",
          "content": "We reserve the right to modify these terms at any time. Changes will be notified by email to registered users at least 15 days in advance. Continued use of the service after that date implies acceptance of the new terms."
        },
        {
          "title": "10. Governing law",
          "content": "These terms are governed by the laws of the State of Florida, USA. Any dispute that cannot be resolved amicably will be submitted to the jurisdiction of the courts of Miami-Dade County, Florida."
        }
      ]
    }
  },
  "privacidad": {
    "es": {
      "title1": "Política de",
      "title2": "Privacidad",
      "updated": "Última actualización: 29 de junio de 2026",
      "intro": "En Jewgal Academy nos tomamos muy en serio la privacidad de nuestros alumnos y visitantes. Esta política describe cómo recopilamos, usamos y protegemos tu información personal cuando usás nuestro sitio web y nuestros servicios educativos.",
      "questions": "¿Tenés preguntas sobre esta política o sobre el tratamiento de tus datos?",
      "email": "hola@jewgalacademy.com",
      "sections": [
        {
          "title": "1. Responsable del tratamiento",
          "content": "Jewgal Academy, operada por Sholem Corazón Valiente Inc. (non-profit organization), con sede en Miami, Florida, EE.UU., es responsable del tratamiento de los datos personales recopilados a través del sitio jewgalacademy.com y sus servicios asociados.\n\nContacto: hola@jewgalacademy.com"
        },
        {
          "title": "2. Datos que recopilamos",
          "content": "Recopilamos únicamente los datos necesarios para prestarte nuestros servicios:\n\n• Datos de registro: nombre, apellido, dirección de correo electrónico y contraseña (almacenada de forma cifrada).\n• Datos de contacto: número de teléfono cuando nos escribís a través del formulario de contacto.\n• Datos de uso: progreso en cursos, asistencia a clases y actividad dentro del Aula Virtual.\n• Datos de pago: procesados directamente por nuestros proveedores de pago (Stripe). Jewgal Academy no almacena datos de tarjetas de crédito.\n• Datos técnicos: dirección IP, tipo de navegador e identificadores de sesión para garantizar la seguridad del servicio."
        },
        {
          "title": "3. Finalidad del tratamiento",
          "content": "Utilizamos tus datos para:\n\n• Gestionar tu cuenta y acceso al Aula Virtual.\n• Enviarte información sobre tus cursos, certificaciones y progreso académico.\n• Comunicarte novedades, eventos y programas de Jewgal Academy (con tu consentimiento).\n• Mejorar nuestros servicios y detectar problemas técnicos.\n• Cumplir con obligaciones legales y fiscales aplicables."
        },
        {
          "title": "4. Base legal",
          "content": "El tratamiento de tus datos se basa en:\n\n• La ejecución del contrato de servicios educativos que aceptás al registrarte.\n• Tu consentimiento explícito para el envío de comunicaciones comerciales.\n• Nuestro interés legítimo en mejorar el servicio y garantizar la seguridad."
        },
        {
          "title": "5. Conservación de datos",
          "content": "Conservamos tus datos mientras mantengas una cuenta activa en Jewgal Academy. Si solicitás la eliminación de tu cuenta, borraremos tus datos personales en un plazo máximo de 30 días, salvo que debamos conservarlos por obligación legal (por ejemplo, datos fiscales durante el período exigido por la ley)."
        },
        {
          "title": "6. Terceros y transferencias internacionales",
          "content": "Compartimos tus datos únicamente con proveedores de confianza necesarios para prestar el servicio:\n\n• Neon (base de datos): alojamiento de datos en servidores seguros.\n• Stripe: procesamiento de pagos (certificado PCI-DSS).\n• Vercel: hosting de la plataforma.\n• Resend / Email: envío de notificaciones transaccionales.\n\nAlgunos proveedores pueden estar ubicados fuera del Espacio Económico Europeo. En todos los casos aplicamos garantías adecuadas de protección."
        },
        {
          "title": "7. Tus derechos",
          "content": "Tenés derecho a:\n\n• Acceder a los datos que conservamos sobre vos.\n• Rectificar datos inexactos o incompletos.\n• Solicitar la eliminación de tus datos (\"derecho al olvido\").\n• Oponerte al tratamiento para fines de marketing.\n• Portar tus datos a otro servicio.\n• Retirar tu consentimiento en cualquier momento.\n\nPara ejercer cualquiera de estos derechos, escribinos a hola@jewgalacademy.com."
        },
        {
          "title": "8. Seguridad",
          "content": "Aplicamos medidas técnicas y organizativas para proteger tus datos: cifrado en tránsito (HTTPS/TLS), contraseñas hasheadas, control de acceso por roles y monitoreo de seguridad. Sin embargo, ningún sistema es 100% infalible. Si detectás una vulnerabilidad, por favor notificanos inmediatamente."
        },
        {
          "title": "9. Cookies",
          "content": "Jewgal Academy utiliza cookies estrictamente necesarias para el funcionamiento de la sesión y la autenticación. No utilizamos cookies de seguimiento ni publicidad de terceros."
        },
        {
          "title": "10. Cambios en esta política",
          "content": "Podemos actualizar esta política periódicamente. Cuando lo hagamos, notificaremos a los usuarios registrados por correo electrónico y actualizaremos la fecha de \"última actualización\" al pie de esta página."
        }
      ]
    },
    "en": {
      "title1": "Privacy",
      "title2": "Policy",
      "updated": "Last updated: June 29, 2026",
      "intro": "At Jewgal Academy we take the privacy of our students and visitors very seriously. This policy describes how we collect, use, and protect your personal information when you use our website and our educational services.",
      "questions": "Have questions about this policy or how your data is handled?",
      "email": "hola@jewgalacademy.com",
      "sections": [
        {
          "title": "1. Data controller",
          "content": "Jewgal Academy, operated by Sholem Corazón Valiente Inc. (a non-profit organization) based in Miami, Florida, USA, is responsible for processing the personal data collected through the jewgalacademy.com site and its associated services.\n\nContact: hola@jewgalacademy.com"
        },
        {
          "title": "2. Data we collect",
          "content": "We collect only the data necessary to provide you with our services:\n\n• Registration data: first name, last name, email address, and password (stored in encrypted form).\n• Contact data: phone number when you write to us through the contact form.\n• Usage data: course progress, class attendance, and activity within the Virtual Classroom.\n• Payment data: processed directly by our payment providers (Stripe). Jewgal Academy does not store credit card data.\n• Technical data: IP address, browser type, and session identifiers to ensure the security of the service."
        },
        {
          "title": "3. Purpose of processing",
          "content": "We use your data to:\n\n• Manage your account and access to the Virtual Classroom.\n• Send you information about your courses, certifications, and academic progress.\n• Share news, events, and programs from Jewgal Academy (with your consent).\n• Improve our services and detect technical issues.\n• Comply with applicable legal and tax obligations."
        },
        {
          "title": "4. Legal basis",
          "content": "The processing of your data is based on:\n\n• The performance of the educational services contract you accept when registering.\n• Your explicit consent for sending commercial communications.\n• Our legitimate interest in improving the service and ensuring security."
        },
        {
          "title": "5. Data retention",
          "content": "We keep your data for as long as you maintain an active account with Jewgal Academy. If you request the deletion of your account, we will erase your personal data within a maximum of 30 days, unless we must retain it due to a legal obligation (for example, tax data for the period required by law)."
        },
        {
          "title": "6. Third parties and international transfers",
          "content": "We share your data only with trusted providers necessary to deliver the service:\n\n• Neon (database): data hosting on secure servers.\n• Stripe: payment processing (PCI-DSS certified).\n• Vercel: platform hosting.\n• Resend / Email: sending transactional notifications.\n\nSome providers may be located outside the European Economic Area. In all cases we apply appropriate protection safeguards."
        },
        {
          "title": "7. Your rights",
          "content": "You have the right to:\n\n• Access the data we hold about you.\n• Rectify inaccurate or incomplete data.\n• Request the deletion of your data (\"right to be forgotten\").\n• Object to processing for marketing purposes.\n• Port your data to another service.\n• Withdraw your consent at any time.\n\nTo exercise any of these rights, write to us at hola@jewgalacademy.com."
        },
        {
          "title": "8. Security",
          "content": "We apply technical and organizational measures to protect your data: encryption in transit (HTTPS/TLS), hashed passwords, role-based access control, and security monitoring. However, no system is 100% infallible. If you detect a vulnerability, please notify us immediately."
        },
        {
          "title": "9. Cookies",
          "content": "Jewgal Academy uses cookies strictly necessary for session functionality and authentication. We do not use third-party tracking or advertising cookies."
        },
        {
          "title": "10. Changes to this policy",
          "content": "We may update this policy periodically. When we do, we will notify registered users by email and update the \"last updated\" date at the bottom of this page."
        }
      ]
    }
  }
}
