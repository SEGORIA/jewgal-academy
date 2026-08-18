// Carga de módulos con nombre + materiales reales para "Life Coaching
// Integrativo" (Etapa 5). Idempotente: upsert por [courseId, number] para
// CourseModule; para Material se borra e inserta por moduleNumber en cada
// corrida parcial (ver DELETE_MODULE_NUMBERS) para poder re-ejecutar mientras
// se sigue cargando módulo por módulo sin duplicar filas.
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const COURSE_ID = "cmqlprwm60001x4enblc8k4yy" // Life Coaching Integrativo

const COURSE_MODULES = [
  { number: 1, title: "Introducción al Coaching", description: "Historia, fundamentos epistemológicos, competencias ICF, ética y el proceso de coaching. Pregunta guía: ¿Quién soy yo como coach?" },
  { number: 2, title: "Kabalá Coach", description: "El método Kabbalá Coach de la Rabanit Devora Benchimol: el mapa de las Sefirot, las Emunot de Tohu y el camino del Tikún aplicados al coaching." },
  { number: 3, title: "Logoterapia", description: "La búsqueda de sentido como motor del cambio, a partir de Viktor Frankl. Pregunta guía: ¿Por qué hace lo que hace el coachee?" },
  { number: 4, title: "Coaching y Mindfulness", description: "Presencia, escucha y autocompasión. Pregunta guía: ¿Cómo está presente el coach en la sesión?" },
  { number: 5, title: "El Arte de Preguntar", description: "La herramienta esencial del coach: 5 tipos de preguntas, preguntas poderosas avanzadas y un banco de 50 preguntas." },
  { number: 6, title: "Diseño de Programas TCC", description: "Cierre e integración del programa: el modelo cognitivo-conductual aplicado al diseño de programas de coaching profesionales." },
  { number: 7, title: "Método Sholem", description: "Liderazgo atractivo desde el legado de Sholem: 5 principios de liderazgo para el coach y para quienes acompaña." },
]

// Números de módulo cuyos materiales se (re)cargan en esta corrida —
// permite ejecutar el script de nuevo al sumar módulos sin duplicar los ya
// cargados.
const DELETE_MODULE_NUMBERS = [1, 2, 3, 4, 5, 6, 7]

const p = (text) => ({ type: "paragraph", text })
const h = (level, text) => ({ type: "heading", level, text })
const list = (items, ordered = false) => ({ type: "list", ordered, items })
const divider = () => ({ type: "divider" })
const resources = ({ videos = [], readings = [], quotes = [], links = [] }) => ({
  type: "unit-resources", videos, readings, quotes, links,
})
const yt = (label, url) => ({ label, url })

const MODULE_1_MATERIALS = [
  {
    title: "Unidad 1: Historia y Orígenes del Coaching",
    description: "De Sócrates al coaching profesional del siglo XXI.",
    estimatedMinutes: 35,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 1 — Historia y Orígenes del Coaching"),
      p("El coaching profesional no nació de la nada: es la confluencia de varias tradiciones que, combinadas, dieron forma a la disciplina que existe hoy."),
      h(2, "1.1 Las raíces filosóficas: Sócrates y la mayéutica"),
      p("Sócrates desarrolló la mayéutica, el arte de \"dar a luz\" ideas a través de preguntas, partiendo de la convicción de que la verdad ya está dentro de la otra persona y que el rol de quien pregunta es ayudar a que emerja, no entregarla hecha."),
      p("\"Solo sé que no sé nada.\" — Sócrates"),
      h(2, "1.2 Timothy Gallwey y The Inner Game (1974)"),
      p("Gallwey, entrenador de tenis, propuso que el mayor obstáculo para el desempeño no es técnico sino interno. Su fórmula central: Rendimiento = Potencial − Interferencias. Distinguió el Self 1 (la voz crítica que juzga y da instrucciones) del Self 2 (el potencial natural del cuerpo y la mente cuando no es interferido). Esta distinción es la semilla directa del coaching moderno."),
      h(2, "1.3 Sir John Whitmore y el Modelo GROW"),
      p("Whitmore llevó las ideas de Gallwey del deporte al mundo corporativo y desarrolló el modelo GROW (Goal, Reality, Options, Will) — todavía el modelo de sesión más usado en coaching ejecutivo y de vida. Su libro Coaching for Performance (2009) es lectura optativa de esta unidad."),
      h(2, "1.4 Thomas Leonard y la ICF (1992)"),
      p("Thomas Leonard fundó Coach University en 1992 y en 1995 se crea la International Coaching Federation (ICF), hoy con más de 60.000 miembros en más de 160 países — la entidad que profesionalizó y estandarizó el coaching a nivel global."),
      h(2, "1.5 Las escuelas actuales del coaching"),
      list([
        "Coaching Ontológico — Heidegger, Maturana, Fernando Flores y Rafael Echeverría; el ser humano como ser lingüístico, actos de habla; predominante en América Latina.",
        "Coaching Sistémico — sistemas y contexto, constelaciones organizacionales, patrones transgeneracionales; Peter Hawkins, Bert Hellinger.",
        "Coaching Cognitivo-Conductual — TCC de Beck y Ellis, pensamientos limitantes, orientado a resultados, integrado con neurociencia.",
        "Coaching Positivo — Psicología Positiva de Seligman, fortalezas/flujo/bienestar, modelo PERMA, Appreciative Inquiry; Robert Biswas-Diener.",
      ]),
      p("Ejercicio de esta unidad: completá el Ejercicio 1.1 en tu Workbook."),
      resources({
        videos: [
          yt("Timothy Gallwey — resumen de The Inner Game of Tennis", "https://www.youtube.com/watch?v=G-YJePnMrGY"),
          yt("Sir John Whitmore on GROW Model coaching (Performance Consultants)", "https://www.youtube.com/watch?v=iyCroYn3Zr8"),
          yt("Canal oficial de la ICF en YouTube", "https://youtube.com/@ICFHeadquarters"),
        ],
        quotes: ["\"Solo sé que no sé nada.\" — Sócrates"],
      }),
    ],
  },
  {
    title: "Unidad 2: Fundamentos Epistemológicos y Ontológicos",
    description: "Qué es el coaching, la Ontología del Lenguaje y los tres dominios del ser.",
    estimatedMinutes: 40,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 2 — Fundamentos Epistemológicos y Ontológicos"),
      h(2, "2.1 ¿Qué es el coaching? Definición esencial"),
      p("Definición de la ICF: \"El coaching es asociarse con clientes en un proceso de reflexión y creatividad que les inspire a maximizar su potencial personal y profesional.\""),
      list([
        "Asociarse — una relación de igual a igual, no jerárquica.",
        "Proceso de reflexión y creatividad — el coach no entrega respuestas, abre el espacio para encontrarlas.",
        "Maximizar el potencial — el foco es el desarrollo, no la corrección de un déficit.",
      ]),
      h(2, "2.2 La Ontología del Lenguaje — Rafael Echeverría"),
      p("La Ontología del Lenguaje sostiene que el ser humano se constituye a sí mismo en el lenguaje. Es probablemente el contenido más abstracto de este módulo — si el docente grabó un video propio sobre este punto, es un buen momento para verlo."),
      list([
        "Somos seres lingüísticos — el lenguaje no describe una realidad ya dada, la genera.",
        "El lenguaje es generativo — hablar es actuar; los actos de habla producen realidad (una promesa, una declaración).",
        "Nos creamos a nosotros mismos en el lenguaje — la identidad es una narrativa que se sostiene y se puede transformar hablando distinto.",
      ], true),
      h(2, "2.3 Los Tres Dominios del Ser"),
      p("Echeverría propone que el ser humano existe simultáneamente en tres dominios inseparables, y que el coach necesita estar atento a los tres: el Lenguaje (narrativa, juicios, creencias — ¿qué historia se cuenta este coachee sobre sí mismo?), la Emoción (estado de ánimo — ¿desde qué emoción está observando su situación?) y la Corporalidad (postura, respiración, tensión — ¿qué le dice su cuerpo sobre esta situación?)."),
      p("Ejercicio de esta unidad: completá el Ejercicio 2.1 en tu Workbook."),
      h(2, "2.4 Coaching vs. otras disciplinas"),
      list([
        "Coaching — presente y futuro; el cliente es capaz y completo; sin diagnóstico clínico; el coach no da consejos; 4-12 sesiones típicamente.",
        "Psicoterapia — pasado y presente; el paciente tiene una herida; puede requerir diagnóstico; el terapeuta es experto clínico; meses o años posiblemente.",
        "Mentoring — presente y futuro; el mentee aprende del experto; sin diagnóstico clínico; el mentor comparte experiencia; proceso formativo variable.",
        "Consultoría — presente y futuro; el cliente necesita solución; diagnóstico de problema; el consultor da recomendaciones; proyecto con plazo definido.",
      ]),
      p("Regla de oro de derivación: si el coachee presenta síntomas clínicos (depresión mayor, ansiedad crónica, trauma, adicciones, ideas suicidas), el coach DEBE derivar a un profesional de la salud mental. No es cobardía ni incompetencia: es ética profesional."),
      resources({
        videos: [
          yt("De Coach a Coach: el aporte de la Ontología del Lenguaje, con Rafael Echeverría", "https://www.youtube.com/watch?v=3pQDvMcvkp4"),
          yt("Coaching: Dominios del observador (Cuerpo-Emoción-Lenguaje)", "https://www.youtube.com/watch?v=Vba4ubdXLE8"),
          yt("Cómo saber si necesito un coach o un psicólogo", "https://www.youtube.com/watch?v=3aquyn8Dj00"),
        ],
      }),
    ],
  },
  {
    title: "Unidad 3: Las 8 Competencias del Coach Profesional",
    description: "El modelo ICF 2019, la comunicación directa y la escucha en tres niveles.",
    estimatedMinutes: 40,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 3 — Las 8 Competencias del Coach Profesional"),
      p("En 2019 la ICF actualizó su modelo de competencias en 4 dominios:"),
      list([
        "BASE — 1. Ética y estándares; 2. Mentalidad de coaching.",
        "COCREACIÓN — 3. Acuerdo de coaching; 4. Presencia del coach.",
        "COMUNICACIÓN — 5. Escucha activa; 6. Comunicación directa.",
        "CRECIMIENTO — 7. Generar consciencia; 8. Facilitar el crecimiento.",
      ]),
      h(2, "Comunicación directa"),
      p("Es la competencia 6 de la ICF: compartir observaciones con precisión y sin juicio. Es distinta de dar consejos y también distinta de simplemente repetir palabras (paráfrasis vacía)."),
      list([
        "Consejo encubierto — \"Deberías hablar con tu jefe y pedir menos tareas.\" Resuelve el problema por el coachee.",
        "Paráfrasis vacía — \"Entonces sentís que no podés con el trabajo.\" Repite sin agregar valor.",
        "Observación directa — \"Noto que dijiste 'no puedo' tres veces en dos minutos. ¿Qué es lo que sentís que no podés, específicamente?\" Devuelve un dato concreto y sin juicio, y abre una pregunta.",
      ]),
      p("Tres herramientas de la comunicación directa: paráfrasis con precisión (repetir lo esencial sin agregar interpretación propia), feedback directo (nombrar un patrón observable sin diagnosticar por qué pasa) y metáforas (ofrecer una imagen que el coachee puede aceptar o descartar libremente)."),
      h(2, "La escucha en tres niveles"),
      list([
        "Nivel 1 — Escucha interna: la atención está en el propio diálogo interno del coach (\"¿qué voy a preguntar?\"). La forma más común y menos útil en coaching.",
        "Nivel 2 — Escucha enfocada: el coach pone su atención completamente en el coachee — palabras, emociones, pausas, energía.",
        "Nivel 3 — Escucha global: una consciencia de 360° de toda la experiencia de la conversación — lo dicho, lo no dicho, el ambiente emocional.",
      ], true),
      p("Ejercicios de esta unidad: completá los Ejercicios 3.1 y 3.2 en tu Workbook. Este curso es individual — para la práctica de escucha te va a servir buscar vos mismo a alguien dispuesto (familiar, amigo, colega)."),
      resources({
        videos: [
          yt("Exploring the Updated 2025 ICF Core Competencies (oficial)", "https://www.youtube.com/watch?v=8jmeMuMRwuM"),
          yt("ICF Core Competency 6: Listens Actively (oficial)", "https://www.youtube.com/watch?v=obmS_yLwpSo"),
        ],
      }),
    ],
  },
  {
    title: "Unidad 4: Ética y Código Deontológico",
    description: "Por qué la ética es el corazón del coaching y los cinco principios de la ICF.",
    estimatedMinutes: 30,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 4 — Ética y Código Deontológico"),
      h(2, "4.1 Por qué la ética es el corazón del coaching"),
      p("El coaching opera en el territorio más íntimo y vulnerable de la persona: sus metas, sus miedos, sus sueños, sus creencias más profundas. Esto crea una asimetría de poder que el coach debe gestionar con la mayor integridad."),
      h(2, "4.2 Los cinco principios éticos de la ICF"),
      list([
        "Responsabilidad con los clientes — el interés del coachee siempre primero, por encima del interés del coach o del patrocinador.",
        "Confidencialidad — proteger toda información compartida en el proceso, incluyendo la identidad del coachee.",
        "Conflictos de interés — identificarlos y gestionarlos transparentemente antes de que afecten el proceso.",
        "Conducta profesional — mantener los estándares más altos en todo contexto, dentro y fuera del espacio de coaching.",
        "Responsabilidad ante la sociedad — el coaching como fuerza de bien social: contribuir al florecimiento humano más amplio.",
      ], true),
      p("Ejercicio y entrega de esta unidad: leé el Código Ético completo de la ICF (enlace en Recursos), elegí uno de los 5 dilemas éticos del Workbook y escribí tu análisis (1 página) citando el principio en juego. Esta es la entrega del 20% de la nota del módulo."),
      resources({
        readings: [yt("Código Ético de la ICF (versión vigente)", "https://coachingfederation.org/credentialing/coaching-ethics/icf-code-of-ethics/")],
        videos: [yt("The New ICF Code of Ethics: What You Need to Know (oficial, con la CEO de ICF)", "https://www.youtube.com/watch?v=ReFv2DbkqS8")],
      }),
    ],
  },
  {
    title: "Unidad 5: El Proceso de Coaching",
    description: "Estructura de sesión, el Modelo GROW, el Modelo CLEAR y el contrato de coaching.",
    estimatedMinutes: 45,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 5 — El Proceso de Coaching"),
      h(2, "5.1 Estructura básica de una sesión"),
      list([
        "Apertura (5-10 min) — crear el clima de confianza. ¿Cómo llegás hoy?",
        "Foco (5 min) — acordar el tema central. ¿Qué es lo más importante para trabajar hoy?",
        "Exploración (30-40 min) — el núcleo del coaching: indagación profunda, preguntas poderosas, descubrimiento.",
        "Acción (10 min) — ¿qué vas a hacer diferente? ¿Cuál es el primer paso?",
        "Cierre (5 min) — ¿qué te llevás de esta sesión?",
      ]),
      h(2, "5.2 El Modelo GROW en profundidad"),
      list([
        "G — Goal (Objetivo): ¿Qué querés lograr específicamente? ¿Cómo sabrás que lo alcanzaste?",
        "R — Reality (Realidad): ¿Dónde estás ahora en relación a ese objetivo? ¿Qué obstáculos encontrás?",
        "O — Options (Opciones): ¿Qué opciones tenés? Si no hubiera límites, ¿qué intentarías?",
        "W — Will (Voluntad): ¿Qué vas a hacer concretamente y cuándo? En una escala del 1 al 10, ¿qué tan comprometido estás?",
      ], true),
      h(2, "5.3 El Modelo CLEAR"),
      p("Desarrollado por Peter Hawkins, pone el foco en el proceso relacional y emocional de la conversación — especialmente útil en coaching sistémico y cuando el coachee necesita explorar antes de decidir."),
      list([
        "C — Contract: acordar el foco y el resultado deseado de la sesión.",
        "L — Listen: escuchar en profundidad (Nivel 2-3) sin interrumpir con soluciones.",
        "E — Explore: ayudar al coachee a ver la situación desde nuevas perspectivas.",
        "A — Action: convertir la nueva comprensión en un paso concreto.",
        "R — Review: cerrar con aprendizaje y retroalimentación sobre la sesión misma.",
      ], true),
      p("GROW es más directivo y orientado a metas; CLEAR es más exploratorio y relacional. Un coach integrativo domina ambos y elige según lo que la conversación necesita."),
      h(2, "5.4 El contrato de coaching"),
      p("Un contrato explícito protege tanto al coach como al coachee: deja claro el objetivo, el número y duración de las sesiones, los compromisos de cada parte y los límites del proceso."),
      p("Ejercicio y entrega de esta unidad: practicá 2 sesiones de rol-playing (GROW o CLEAR) con alguien de tu entorno y registralas en tu Workbook. Junto con el contrato completado, esta es la entrega del 30% de la nota. Dejá tiempo suficiente: coordinar 2 sesiones con otra persona lleva más de lo que parece."),
      resources({
        videos: [
          yt("The GROW Model in Action — Workplace Career Coaching", "https://www.youtube.com/watch?v=_zVUltSayok"),
          yt("How to Write a Coaching Agreement (6-Part Framework)", "https://www.youtube.com/watch?v=pP1gl8g7z_k"),
          yt("Life Coaching Sample — 30 Minute Session (inviteCHANGE, coach PCC de la ICF)", "https://www.youtube.com/watch?v=WyVC3c5pUS0"),
        ],
      }),
    ],
  },
  {
    title: "Workbook — Módulo 1",
    description: "Ejercicios 1.1 a 5, contrato de coaching y análisis de dilema ético.",
    type: "document",
    estimatedMinutes: 60,
    fileUrl: null, // se completa al subir el PDF a Cloudinary
    content: [
      list([
        "Ejercicio 1.1 — Historia y orígenes del coaching",
        "Ejercicio 2.1 — Fundamentos epistemológicos y ontológicos",
        "Ejercicios 3.1 y 3.2 — Las 8 competencias y la escucha en tres niveles",
        "Análisis de un dilema ético (1 página) — 20%",
        "Registro de 2 sesiones de rol-playing + contrato de coaching — 30%",
        "Autoevaluación reflexiva del módulo (portafolio) — 30%",
      ]),
    ],
  },
]

// Módulo 2 — fusión: estructura y bibliografía verificada de "Módulo 2
// Yael" (armada para asincrónico) + profundidad real de "MODULO 2 DEVORA"
// (cuento del gallo, 5 técnicas del jasidut, cuestionario completo de 60
// preguntas). Área de vida de Jesed corregida a la versión original de
// Devora (Desarrollo/Estudios/Espiritual) — las 2 fuentes de Yael se
// contradecían entre sí en ese punto.
const MODULE_2_MATERIALS = [
  {
    title: "Unidad 1: ¿Qué es el Kabbalá Coach?",
    description: "Kabbalá y Jasidut, el Shema Israel, Olam HaTohu y Olam HaTikun, las Dos Almas.",
    estimatedMinutes: 35,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 1 — ¿Qué es el Kabbalá Coach?"),
      p("El Kabbalá Coach integra dos fuentes: la Kabbalá, que aporta el mapa (las Sefirot, los Cuatro Mundos), y el Jasidut, que aporta la luz — la actitud amorosa que anima ese mapa. A eso se suman herramientas de coaching, mindfulness, logoterapia y neurociencia."),
      p("El cuento del gallo: un príncipe se convence de que es un gallo, se desnuda y se esconde bajo la mesa a picotear granos. Ningún médico logra curarlo. Un sabio se sienta a su lado, se desnuda también y dice \"yo también soy un gallo\". Con el tiempo, sentado junto a él, le va sugiriendo: un gallo puede usar camisa, puede comer con cubiertos, puede sentarse a la mesa... hasta que el príncipe vuelve a vivir como persona, sin que nadie le haya dicho de golpe \"dejá de creer que sos un gallo\". Así trabaja el Kabbalá Coach: no confronta la creencia limitante de frente, se sienta con ella y la acompaña hacia el Tikún paso a paso."),
      h(2, "Olam HaTohu y Olam HaTikun"),
      p("Dos mundos o estados posibles de una misma persona: Olam HaTohu (el mundo del caos, de las Emunot limitantes, donde las fuerzas actúan desconectadas y en exceso o en defecto) y Olam HaTikun (el mundo de la reparación, donde esas mismas fuerzas actúan integradas y equilibradas). El trabajo del coaching cabalístico es acompañar el paso de Tohu a Tikun."),
      h(2, "Las Dos Almas"),
      p("Según el Tanya, cada persona tiene el Néfesh HaBahamit (el alma animal, que busca supervivencia y placer inmediato) y el Néfesh HaElokit (el alma divina, que busca sentido y trascendencia). Ninguna de las dos es \"mala\": el trabajo del coach es ayudar al coachee a notar desde cuál de las dos está actuando en cada decisión."),
      p("Ejercicio de esta unidad: registrá en tu Workbook (Cuadro 1 — La Maleta) qué llevás contigo al empezar este módulo."),
      resources({
        videos: [
          yt("Kabbalah & Chassidut — video hub (Baal Shem Tov, Tanya: Soul Wrestling)", "https://www.chabad.org/multimedia/video_cdo/aid/4934681/jewish/Kabbalah.htm"),
          yt("Nefesh HaBahamis / Nefesh HoElokis (Two Souls)", "https://www.chabad.org/library/article_cdo/aid/80970/jewish/Nefesh-HaBahamis.htm"),
        ],
      }),
    ],
  },
  {
    title: "Unidad 2: El Tzimtzum y los Cuatro Mundos",
    description: "Cómo se despliega la creación: Adam Kadmon, Atzilut, Beriá, Yetzirá, Asiá.",
    estimatedMinutes: 35,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 2 — El Tzimtzum y los Cuatro Mundos"),
      p("El Tzimtzum es la \"contracción\" que hace lugar a la existencia: para que algo distinto de lo infinito pudiera existir, tuvo que abrirse un espacio. Es una metáfora poderosa para el coaching: para que el coachee pueda crecer, el coach necesita \"contraerse\" — hacer lugar, no llenar el espacio con su propia opinión."),
      p("La creación se despliega en Cuatro Mundos, cada uno una capa más densa/concreta que la anterior: Atzilut (emanación, cercanía pura), Beriá (creación, la primera idea con forma), Yetzirá (formación, el diseño detallado) y Asiá (acción, el mundo material y concreto donde todo finalmente se hace realidad)."),
      p("Para el coach: un objetivo también atraviesa estos cuatro mundos — nace como intención pura (Atzilut), se convierte en idea (Beriá), se diseña como plan (Yetzirá) y recién se vuelve real cuando se ejecuta en el mundo concreto (Asiá). Un coachee que se queda solo en la intención nunca llega a Asiá."),
      p("Ejercicio de esta unidad: elegí un objetivo actual y ubicalo en los 4 mundos — ¿en cuál está trabado?"),
      resources({
        videos: [
          yt("Tzimtzum — explicación", "https://www.chabad.org/library/article_cdo/aid/361884/jewish/Tzimtzum.htm"),
          yt("Los Cuatro Mundos", "https://www.chabad.org/library/article_cdo/aid/361902/jewish/The-Four-Worlds.htm"),
        ],
      }),
    ],
  },
  {
    title: "Unidad 3: Las Sefirot — Mapa Completo",
    description: "Los 5 significados de Sefirá, las 11 Sefirot y las 3 columnas del árbol.",
    estimatedMinutes: 40,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 3 — Las Sefirot: Mapa Completo"),
      p("La palabra Sefirá comparte raíz con Safir (zafiro/brillo), Mispar (número), Sipur (relato) y Lispor (contar) — una Sefirá es a la vez una cualidad que brilla, algo que puede contarse/ordenarse, y una historia que se narra. Las 11 Sefirot son las 11 cualidades a través de las cuales lo infinito se expresa en lo concreto, y a través de las cuales cada persona puede leer su propio mapa interior."),
      list([
        "Keter — Corona / voluntad más profunda",
        "Jojmá — Sabiduría / la primera chispa de una idea",
        "Biná — Entendimiento / lo que le da forma y estructura a esa idea",
        "Daát — Conocimiento / el puente entre saber algo y sentirlo propio",
        "Jesed — Bondad, amor, expansión",
        "Guevurá — Rigor, límite, fuerza",
        "Tiferet — Belleza, armonía, equilibrio entre Jesed y Guevurá",
        "Netzaj — Perseverancia, victoria, constancia",
        "Hod — Esplendor, humildad, reconocimiento",
        "Yesod — Fundamento, el canal que conecta y transmite",
        "Maljut — Reino, la acción concreta donde todo se manifiesta",
      ]),
      p("El árbol se organiza también en 3 columnas: derecha (Jesed, Netzaj — expansión), izquierda (Guevurá, Hod — contención) y central (Keter, Tiferet, Yesod, Maljut — equilibrio). Es una herramienta de diagnóstico rápido: un coachee que vive todo desde la columna derecha probablemente da sin límite y se agota; uno instalado en la izquierda probablemente se contiene de más y no se permite recibir."),
      p("Ejercicio de esta unidad: identificá en qué columna te reconocés más — ¿derecha, izquierda o central?"),
      resources({
        videos: [
          yt("El Árbol de la Vida — mapa de las Sefirot", "https://www.chabad.org/kabbalah/article_cdo/aid/630216/jewish/Tree.htm"),
          yt("Las Sefirot — detalle", "https://www.chabad.org/library/article_cdo/aid/361885/jewish/The-Sefirot.htm"),
        ],
      }),
    ],
  },
  {
    title: "Unidad 4: Sefirot Cognitivas",
    description: "Keter, Jojmá, Biná y Daát — de dónde nacen las creencias.",
    estimatedMinutes: 35,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 4 — Sefirot Cognitivas"),
      p("Las 4 Sefirot cognitivas explican cómo se forma una creencia: Keter es la voluntad/fe de base (por qué algo importa antes de pensarlo), Jojmá es el chispazo de la idea, Biná es lo que le da forma, argumento y relato a esa idea, y Daát es lo que la vuelve propia, sentida, no solo entendida intelectualmente."),
      p("Este es el origen de la cadena central del método: una Emuná de Tohu (creencia limitante) nace como una idea (Jojmá) a la que Biná le construye una Tobaná — una historia que la justifica y la sostiene, aunque no sea la verdad más profunda (la Deá) que el coachee ya conoce en algún lugar."),
      p("Preguntas de coach por Sefirá: ¿Qué es lo que de verdad querés, más allá de lo que creés que deberías querer? (Keter) · ¿Cuál fue la primera vez que se te ocurrió esa idea sobre vos mismo? (Jojmá) · ¿Qué historia te contás para sostener esa idea? (Biná) · Más allá de esa historia, ¿qué sabés en el fondo que es cierto? (Daát)"),
      p("Ejercicio de esta unidad: elegí una creencia limitante propia y recorré las 4 preguntas en tu Workbook."),
    ],
  },
  {
    title: "Unidad 5: Sefirot Emocionales",
    description: "Las 6 Midot y el Cuadro del Tikún.",
    estimatedMinutes: 40,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 5 — Sefirot Emocionales"),
      p("Las 6 Sefirot emocionales (Jesed, Guevurá, Tiferet, Netzaj, Hod, Yesod) son las Midot: los rasgos de carácter con los que cada persona se relaciona con el mundo. Cada una tiene un área de vida donde se expresa con más fuerza, y un Tohu y un Tikun posible."),
      list([
        "Jesed (bondad, expansión) — área de Desarrollo, Estudios y lo Espiritual. En Tohu: dar sin límite, no poder decir que no. En Tikun: generosidad con criterio.",
        "Guevurá (rigor, límite) — área de Riqueza, Trabajo y Dinero. En Tohu: rigidez, dureza excesiva. En Tikun: disciplina que sostiene sin asfixiar.",
        "Tiferet (belleza, equilibrio) — el punto medio entre Jesed y Guevurá; en Tohu, indecisión o vanidad; en Tikun, armonía real entre dar y contener.",
        "Netzaj (perseverancia) — en Tohu, tozudez o abandono prematuro; en Tikun, constancia sin rigidez.",
        "Hod (humildad, reconocimiento) — en Tohu, sumisión o necesidad de aprobación; en Tikun, gratitud genuina.",
        "Yesod (fundamento, conexión) — en Tohu, vínculos dependientes o evitativos; en Tikun, vínculos que sostienen sin ahogar.",
      ]),
      p("Ejercicio de esta unidad: completá el Cuadro del Tikún en tu Workbook — para cada Sefirá emocional, ¿dónde estás hoy y hacia dónde apunta tu Tikun?"),
    ],
  },
  {
    title: "Unidad 6: Las Emunot",
    description: "Las creencias de Tohu y de Tikun, y cómo identificarlas.",
    estimatedMinutes: 30,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 6 — Las Emunot"),
      p("Emuná significa creencia — no en el sentido de opinión, sino de aquello que se da por sentado sin cuestionar. Toda Emuná de Tohu nació alguna vez para proteger a la persona de algo real; el problema no es que haya nacido, sino que se quedó operando mucho después de que dejó de ser necesaria."),
      p("Ejemplo trabajado: una persona con la Emuná \"necesito tener todo bajo control\" (Guevurá en Tohu) puede rastrear su origen a una infancia caótica donde el control era, en ese momento, genuinamente protector. El Tikun no es abandonar el control: es poder soltarlo cuando ya no hace falta."),
      p("Ejercicio de esta unidad: usá el Cuadro de Creencias del Workbook — registrá un desencadenante reciente, la Emuná que se activó, la Tobaná (la historia que te contaste) y si esa reacción fue más de Tohu o de Tikun."),
    ],
  },
  {
    title: "Unidad 7: Tobaná, Deá y el Imun",
    description: "La justificación, la verdad de fondo, y la práctica diaria que las conecta.",
    estimatedMinutes: 35,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 7 — Tobaná, Deá y el Imun"),
      p("La Tobaná es la explicación que la mente construye para justificar una Emuná de Tohu — suena razonable, tiene lógica interna, pero no es la verdad más profunda. La Deá es esa verdad de fondo: lo que la persona ya sabe, aunque la Tobaná la tape."),
      p("El Tanya (Capítulo 42) compara este trabajo con el de un artesano: nadie nace sabiendo trabajar un material, se aprende a fuerza de práctica repetida hasta que el movimiento se vuelve natural. De la misma manera, pasar de vivir desde la Tobaná a vivir desde la Deá no es una decisión de un momento: es un entrenamiento, el Imun."),
      p("El Imun se practica en los 4 Mundos: una intención (Atzilut), convertida en pensamiento repetido (Beriá), en una frase o hábito concreto (Yetzirá), hasta que se vuelve una acción automática (Asiá)."),
      p("Ejercicio de esta unidad: elegí un Imun (una práctica diaria breve) relacionada con tu Emuná de la Unidad 6, y registrala 5 veces en el Cuadro del Imun del Workbook — qué notaste cada vez."),
      resources({
        readings: [yt("Tanya, Capítulo 42 (texto completo)", "https://www.chabad.org/library/tanya/tanya_cdo/aid/7921/jewish/Chapter-42.htm")],
        videos: [yt("Tanya — clases en video por tema", "https://www.chabad.org/library/tanya/tanya_cdo/aid/1271891/jewish/Video.htm")],
      }),
    ],
  },
  {
    title: "Unidad 8: El Proceso Completo Unificado",
    description: "La cadena de 7 pasos, de punta a punta.",
    estimatedMinutes: 30,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 8 — El Proceso Completo Unificado"),
      p("Todo lo visto hasta acá se integra en una sola cadena de trabajo:"),
      list([
        "Quiebre — algo no funciona, el coachee llega con una situación que le duele o lo bloquea.",
        "Sefirá débil — identificar qué Sefirá emocional está en Tohu en esa situación.",
        "Emuná de Tohu — nombrar la creencia limitante concreta.",
        "Tobaná — reconocer la historia que la sostiene.",
        "Deá — llegar a la verdad de fondo que el coachee ya sabía.",
        "Midot — traducir esa verdad a un rasgo de carácter a entrenar.",
        "Acción (Maljut) — bajarlo a una acción concreta en el mundo real.",
      ], true),
      p("Ejercicio de esta unidad: tomá una situación real (propia o de un coachee practicado) y recorré la cadena completa de los 7 pasos en tu Workbook — el Cuadro del Camino de la Felicidad."),
    ],
  },
  {
    title: "Unidad 9: Las 5 Herramientas y las Técnicas del Jasidut",
    description: "Cómo se aplica todo el mapa en una sesión real.",
    estimatedMinutes: 35,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 9 — Las 5 Herramientas y las Técnicas del Jasidut"),
      p("El Jasidut aporta técnicas concretas para sostener el proceso de Tikun en la vida diaria, más allá de entenderlo intelectualmente: la Hitbonenut (contemplación sostenida de una idea hasta que deja de ser solo un concepto), la Simjá (alegría como estado que abre en vez de cerrar), el Bitul (correrse del propio ego para ver con más claridad), la Ahavat Israel (el amor genuino como base de cualquier vínculo de acompañamiento) y el Imun ya visto en la Unidad 7."),
      p("Estas técnicas no reemplazan las preguntas de coaching: las sostienen. Un coach que solo pregunta bien pero no practica ninguna de estas técnicas en sí mismo, tarde o temprano actúa desde su propio Tohu en sesión."),
      p("Ejercicio de esta unidad: elegí una de las 5 técnicas del Jasidut y probala esta semana, dentro o fuera de una sesión de coaching. Registrá qué notaste."),
    ],
  },
  {
    title: "Unidad 10: Supervisión y Cierre",
    description: "Integración final y banco de preguntas de coaching por Sefirá.",
    estimatedMinutes: 30,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 10 — Supervisión y Cierre"),
      p("Cierre del módulo: \"El Kabbalá Coach no cambia a las personas — les ayuda a recordar quiénes ya eran antes de que el Tohu se instalara.\""),
      h(2, "Banco de preguntas de coaching por Sefirá (para identificar Tohu y activar Tikun)"),
      list([
        "Jesed — ¿Dónde estás dando sin límite? ¿Qué pasaría si dijeras que no una vez esta semana?",
        "Guevurá — ¿Dónde te estás conteniendo de más? ¿Qué necesitarías para soltar un poco el control?",
        "Tiferet — ¿Dónde sentís que hay desequilibrio entre dar y poner límites?",
        "Netzaj — ¿Qué sostenés hace tiempo aunque ya no te sirva? ¿Qué te haría seguir con más liviandad?",
        "Hod — ¿En qué situación buscás aprobación en vez de reconocer lo que ya lograste?",
        "Yesod — ¿Qué vínculo de tu vida necesita más conexión real y menos dependencia?",
      ]),
      p("Entrega de esta unidad: completá el Examen Final en tu Workbook (Parte A de opción múltiple, Parte B de desarrollo, Parte C el caso de Miriam) y tu Autoevaluación Reflexiva — portafolio del módulo."),
    ],
  },
  {
    title: "Workbook — Módulo 2",
    description: "Los 6 cuadros del método y el Examen Final.",
    type: "document",
    estimatedMinutes: 90,
    fileUrl: null,
    content: [
      list([
        "Cuadro 1 — La Maleta (registro de 10 días)",
        "Cuadro 2 — De Creencias",
        "Cuadro 3 — Del Tikún",
        "Cuadro 4 — Camino de la Felicidad",
        "Cuadro 5 — El Imun",
        "Cuadro 6 — Cuestionario de Emunot por Sefirá (60 preguntas)",
        "Examen Final — Parte A (opción múltiple), Parte B (desarrollo), Parte C (caso Miriam)",
        "Autoevaluación reflexiva del módulo (portafolio)",
      ]),
    ],
  },
]

const MODULE_3_MATERIALS = [
  {
    title: "Unidad 1: Viktor Frankl y los Orígenes de la Logoterapia",
    description: "Quién fue Frankl, las tres escuelas vienesas y la dimensión noética.",
    estimatedMinutes: 35,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 1 — Viktor Frankl y los Orígenes de la Logoterapia"),
      h(2, "1.1 Quién fue Viktor Frankl"),
      p("Viktor Frankl (Viena, 1905-1997) fue neurólogo, psiquiatra y filósofo. Entre 1942 y 1945 fue prisionero en cuatro campos de concentración nazis, incluyendo Auschwitz y Dachau, donde perdió a su esposa, su madre y su hermano. Observó que los prisioneros que sobrevivían con mayor fortaleza interior no eran necesariamente los más fuertes físicamente, sino los que tenían un propósito por el que vivir."),
      p("\"A quien tiene un por qué para vivir puede soportar casi cualquier cómo.\" — Viktor E. Frankl, El Hombre en Busca de Sentido (1946) — más de 16 millones de copias vendidas."),
      h(2, "1.2 Las Tres Escuelas Vienesas de Psicoterapia"),
      list([
        "Primera (Sigmund Freud) — motivación central: búsqueda del placer.",
        "Segunda (Alfred Adler) — motivación central: búsqueda del poder y superioridad.",
        "Tercera (Viktor Frankl) — motivación central: búsqueda de sentido (voluntad de sentido).",
      ]),
      h(2, "1.3 La Dimensión Noética"),
      p("Frankl propone que el ser humano no puede reducirse a su dimensión biológica ni psicológica: existe una tercera dimensión, la noética o espiritual, desde la que elige sus valores y encuentra sentido. Para el coach, la dimensión noética es el territorio propio del coaching: no trabajamos con el cuerpo (medicina) ni con la psique enferma (psicoterapia), trabajamos con la capacidad de elegir, valorar y construir sentido."),
      p("Ejercicio de esta unidad: reflexión personal en tu Workbook."),
      resources({
        videos: [
          yt("Viktor Frankl — Why believe in others (TED, 1972)", "https://www.ted.com/talks/viktor_frankl_why_believe_in_others"),
          yt("Instituto Viktor Frankl — Sobre la Logoterapia (oficial)", "https://www.viktorfranklinstitute.org/about-logotherapy/"),
        ],
      }),
    ],
  },
  {
    title: "Unidad 2: Las Tres Fuentes del Sentido",
    description: "Valores de creación, experiencia y actitud — y la tríada trágica.",
    estimatedMinutes: 35,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 2 — Las Tres Fuentes del Sentido"),
      p("Frankl identifica tres tipos de valores, cada uno una puerta de acceso al sentido de la vida — y para el coach, tres áreas de indagación con el coachee:"),
      list([
        "Valores de Creación — lo que damos al mundo: trabajo, obras, contribución. Pregunta: ¿qué estás creando o construyendo que tenga valor para otros?",
        "Valores de Experiencia — lo que recibimos del mundo: amor, belleza, verdad, naturaleza. Pregunta: ¿qué experiencias te hacen sentir que la vida vale la pena?",
        "Valores de Actitud — cómo nos posicionamos ante lo que no podemos cambiar. Pregunta: ante lo que no podés cambiar, ¿qué actitud elegís tomar?",
      ]),
      h(2, "2.1 La Tríada Trágica"),
      p("Tres aspectos inevitables de la existencia — sufrimiento, culpa y muerte — ante los que el ser humano no puede cambiar la realidad, pero siempre puede cambiar su actitud: encontrar sentido en el sufrimiento, transformar la culpa en responsabilidad, y usar la conciencia de la finitud para vivir con más intención."),
      p("Actividad de esta unidad: completá \"Las Tres Fuentes de mi Sentido\" en tu Workbook."),
    ],
  },
  {
    title: "Unidad 3: Técnicas Logoterapéuticas Aplicadas al Coaching",
    description: "Intención paradójica, dereflexión y modulación de actitud.",
    estimatedMinutes: 40,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 3 — Técnicas Logoterapéuticas Aplicadas al Coaching"),
      h(2, "Técnica 1: Intención Paradójica"),
      p("Invitar al coachee a desear o incluso provocar activamente aquello que teme — al querer lo que se teme, se rompe el círculo de la anticipación ansiosa. Útil ante miedos recurrentes o ansiedad anticipatoria."),
      p("Ejemplo: Coachee: \"Siempre me pongo nervioso antes de hablar en público.\" Coach: \"¿Y si en lugar de evitar el nerviosismo, la próxima vez te propones ponerte lo más nervioso posible? ¿Qué creés que pasaría?\""),
      h(2, "Técnica 2: Dereflexión"),
      p("Alejar la atención del coachee de sí mismo hacia algo o alguien más allá de él — útil cuando está excesivamente centrado en sus propios síntomas o problemas."),
      p("Ejemplo: Coachee: \"No puedo dejar de pensar en que si fracaso, mi vida no tendrá sentido.\" Coach: \"Si dejaras de pensar en vos por un momento, ¿quién en tu entorno se beneficiaría si este proyecto sale bien?\""),
      h(2, "Técnica 3: Modulación de Actitud"),
      p("Trabaja con la única libertad que no puede quitarse: elegir la propia actitud ante lo que no puede cambiarse. Útil ante pérdidas, enfermedad o limitaciones."),
      p("Ejemplo: Coachee: \"Me diagnosticaron una enfermedad crónica y mi vida ya no tiene sentido.\" Coach: \"Es una pérdida real y el dolor es completamente válido. De todas las actitudes que podrías tomar ante esto, ¿cuál elegís? No la que deberías elegir: ¿cuál elegís vos?\""),
    ],
  },
  {
    title: "Unidad 4: El Mapa de Sentido y el Coaching de Misión de Vida",
    description: "El vacío existencial, el mapa de sentido y la misión de vida.",
    estimatedMinutes: 45,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 4 — El Mapa de Sentido y el Coaching de Misión de Vida"),
      h(2, "4.1 El Vacío Existencial"),
      p("La sensación de falta de sentido, de que nada vale realmente la pena — una de las condiciones más frecuentes del ser humano moderno, y una de las que más llegan al coaching disfrazada de otros problemas (falta de motivación, dificultad para decidir). No es una patología: es una invitación a preguntarse por algo más profundo."),
      h(2, "4.2 El Mapa de Sentido del Coachee"),
      p("Herramienta de exploración por áreas de vida — trabajo y carrera, relaciones, cuerpo y salud, espiritualidad, legado, sufrimiento actual — indagando en cada una: ¿por qué hago lo que hago? ¿qué me está enseñando esta etapa?"),
      h(2, "4.3 Misión de Vida vs. Meta"),
      list([
        "Meta — externa, específica, tiene fecha de vencimiento, se logra o no se logra. Ej.: publicar un libro este año.",
        "Misión de vida — interna, orientadora, no tiene fecha, se vive y no se termina. Ej.: contribuir a que las personas vivan con más consciencia.",
      ]),
      h(2, "4.4 Ejercicios para Construir el Enunciado de Misión"),
      list([
        "El Epitafio — si murieras hoy, ¿qué te gustaría que dijera tu epitafio?",
        "La Carta desde el Futuro — a los 80 años, mirando hacia atrás: ¿qué le dice tu yo futuro a tu yo presente?",
        "La Pregunta de Frankl — ¿qué espera la vida de vos?",
      ]),
      p("Entrega de esta unidad (25%): completá el Mapa de Sentido del Coachee en tu Workbook, sobre vos mismo, y comentalo por escrito."),
    ],
  },
  {
    title: "Unidad 5: La Sesión de Coaching Logoterapéutica",
    description: "Estructura de sesión y los límites del coaching frente a lo clínico.",
    estimatedMinutes: 35,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 5 — La Sesión de Coaching Logoterapéutica"),
      h(2, "5.1 Estructura de una Sesión con Perspectiva Frankliniana"),
      list([
        "Apertura (5-10 min) — ¿cómo llegaste hoy?",
        "Diagnóstico de sentido (10-15 min) — ¿en qué área de tu vida sentís más vacío ahora?",
        "Exploración profunda (20-25 min) — ¿para qué hacés lo que hacés?",
        "Técnica logoterapéutica (10-15 min) — según el diagnóstico: intención paradójica, dereflexión o modulación de actitud.",
        "Acción y sentido (10 min) — ¿qué paso pequeño podés dar esta semana?",
        "Cierre (5 min) — ¿qué te llevás de esta sesión?",
      ]),
      h(2, "5.2 Límites del Coaching Logoterapéutico"),
      p("Regla clínica fundamental: si el coachee presenta ideación suicida activa, depresión mayor, trauma no resuelto de alta intensidad o cualquier condición que requiera intervención clínica, el coach DEBE derivar a un profesional de salud mental. El coaching logoterapéutico trabaja con el vacío existencial de personas funcionales, no con patología clínica."),
      p("Entrega de esta unidad: registrá 2 sesiones de coaching usando la estructura logoterapéutica y al menos una de las tres técnicas (Formulario de Observación, 30%). Completá también tu Autoevaluación Reflexiva — portafolio (25%)."),
      resources({
        videos: [yt("Paradoxical Intention — A Logotherapy Technique by Dr. Viktor Frankl", "https://www.youtube.com/watch?v=50_r_3ooNwo")],
        readings: [yt("Psychology Today — Facing an Existential Vacuum Today", "https://www.psychologytoday.com/us/blog/heart-medicine-changing-world/202206/facing-existential-vacuum-today")],
      }),
    ],
  },
  {
    title: "Workbook — Módulo 3",
    description: "Actividades de reflexión, Mapa de Sentido, Formulario de Observación y portafolio.",
    type: "document",
    estimatedMinutes: 70,
    fileUrl: null,
    content: [
      list([
        "Actividad 1 — Las Tres Fuentes de mi Sentido",
        "Actividad 2 — La Carta desde el Lecho de Muerte (opcional)",
        "Actividad 3 — Práctica de Intención Paradójica",
        "Mapa de Sentido del Coachee — 25%",
        "Actividad 4 — Mi Enunciado de Misión de Vida",
        "Formulario de Observación (2 sesiones) — 30%",
        "Autoevaluación reflexiva del módulo (portafolio) — 25%",
      ]),
    ],
  },
]

const MODULE_4_MATERIALS = [
  {
    title: "Unidad 1: Fundamentos del Mindfulness",
    description: "Historia, filosofía y el nacimiento del MBSR con Jon Kabat-Zinn.",
    estimatedMinutes: 30,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 1 — Fundamentos del Mindfulness"),
      p("Raíces en tradiciones contemplativas budistas de más de 2.500 años; la versión secular y clínica nace en 1979 cuando Jon Kabat-Zinn fundó la Clínica de Reducción del Estrés en la Universidad de Massachusetts y desarrolló el MBSR (Mindfulness-Based Stress Reduction)."),
      p("\"Mindfulness es la consciencia que surge de prestar atención, a propósito, en el momento presente, sin juzgar.\" — Jon Kabat-Zinn"),
      h(2, "Las actitudes fundamentales del mindfulness"),
      list([
        "No juzgar — observar la experiencia sin etiquetarla como buena o mala.",
        "Paciencia — permitir que las cosas se desplieguen a su propio tiempo.",
        "Mente de principiante — ver cada momento como si fuera la primera vez.",
        "Confianza — confiar en la propia experiencia y en la propia intuición.",
        "No esforzarse — practicar sin la meta de \"llegar\" a algún lado.",
        "Aceptación — ver las cosas como realmente son en el momento presente.",
        "Soltar — no aferrarse a pensamientos, emociones o experiencias.",
      ]),
      p("Para el coach: estas actitudes son las que necesita sostener frente al coachee — no juzgar su proceso, tener paciencia con su ritmo, mente de principiante en cada sesión."),
      resources({ videos: [yt("Jon Kabat-Zinn Defines Mindfulness", "https://www.youtube.com/watch?v=wPNEmxWSNxg")] }),
    ],
  },
  {
    title: "Unidad 2: Neurociencia de la Meditación y la Atención Plena",
    description: "Qué cambia en el cerebro cuando meditamos.",
    estimatedMinutes: 30,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 2 — Neurociencia de la Meditación y la Atención Plena"),
      p("Dos décadas de investigación muestran cambios medibles en estructura y función cerebral con la práctica sostenida de meditación. Sara Lazar (Harvard) fue de las primeras en documentarlo con resonancia magnética."),
      list([
        "Corteza prefrontal (atención, decisiones, regulación emocional) — aumenta su grosor cortical en meditadores frecuentes.",
        "Amígdala (respuesta de miedo y estrés) — se reduce su tamaño y reactividad con la práctica sostenida.",
        "Hipocampo (memoria y aprendizaje) — aumenta la materia gris en esta región.",
      ]),
      p("Para el coach: la capacidad de presencia, regulación emocional y atención son entrenables a nivel cerebral, no solo un dato anecdótico."),
      p("Ejercicio de esta unidad: iniciá tu Diario de Práctica en el Workbook — no es un diario de reflexiones teóricas, es un registro de tu experiencia meditando."),
      resources({ videos: [yt("Sara Lazar — How Meditation Can Reshape Our Brains (TEDxCambridge)", "https://www.youtube.com/watch?v=m8rRzTtP7Tc")] }),
    ],
  },
  {
    title: "Unidad 3: Prácticas Formales — Respiración y Body Scan",
    description: "Las dos prácticas base del MBSR.",
    estimatedMinutes: 30,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 3 — Prácticas Formales: Respiración y Body Scan"),
      p("Meditación en la respiración: el ancla más simple — llevar la atención a la sensación de respirar, una y otra vez cada vez que la mente se distrae. La \"mente del mono\" no es un error de la práctica: es lo que la práctica entrena a notar y soltar."),
      p("\"No se trata de dejar de pensar. Se trata de notar cuándo te fuiste, y volver — sin juzgarte por haberte ido. Ese acto de volver, repetido cientos de veces, es el músculo que se entrena.\""),
      p("Body scan: recorrer el cuerpo con la atención de la cabeza a los pies (o al revés), notando sensaciones en cada zona sin intentar cambiarlas — una de las prácticas centrales del MBSR original."),
      p("Ejercicio de esta unidad: practicá la meditación en la respiración y el body scan al menos 3 veces cada una esta semana. Registrá cada práctica en tu Diario."),
      resources({ videos: [yt("Body Scan Meditation — guiado por Jon Kabat-Zinn", "https://www.youtube.com/watch?v=_DTmGtznab4")] }),
    ],
  },
  {
    title: "Unidad 4: El Coach Mindful — Presencia y Escucha",
    description: "Los tres niveles de escucha y la diferencia entre presencia real y performativa.",
    estimatedMinutes: 35,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 4 — El Coach Mindful: Presencia y Escucha"),
      list([
        "Nivel 1 — Escucha interna: la atención está en el propio diálogo interno.",
        "Nivel 2 — Escucha enfocada: la atención está completamente en el coachee.",
        "Nivel 3 — Escucha global: una consciencia de 360° de toda la experiencia de la conversación.",
      ], true),
      p("El silencio como herramienta: un coach mindful no llena el silencio por incomodidad propia. El silencio después de una pregunta poderosa suele ser el momento donde el coachee encuentra su respuesta."),
      p("Presencia real vs. presencia performativa: asentir y decir \"entiendo\" no es lo mismo que estar presente. La presencia performativa se ve bien pero está vacía por dentro — el coachee la siente, aunque no sepa nombrarla. La presencia real se entrena con la práctica personal, no se actúa."),
      p("Ejercicio de esta unidad: practicá con alguien de tu entorno — escuchalo 3 minutos con presencia total, sin interrumpir ni prepararte la siguiente pregunta. Registrá qué notaste."),
      resources({ readings: [yt("The Importance of Active Listening in Coaching (ICF)", "https://coachingfederation.org/blog/the-art-of-listening-in-coaching/")] }),
    ],
  },
  {
    title: "Unidad 5: Metta y Autocompasión",
    description: "Bondad amorosa y el trabajo con el crítico interior.",
    estimatedMinutes: 35,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 5 — Metta y Autocompasión"),
      p("Meditación Metta (bondad amorosa): cultiva deliberadamente buena voluntad hacia uno mismo y otros, expandiendo el círculo progresivamente — uno mismo, un ser querido, alguien neutral, alguien difícil, todos los seres."),
      p("Autocompasión (Mindful Self-Compassion, Kristin Neff y Christopher Germer), tres componentes: bondad hacia uno mismo (en vez de autocrítica), humanidad compartida (el sufrimiento es parte de la experiencia humana común) y mindfulness (observar el propio dolor sin exagerarlo ni negarlo)."),
      p("El crítico interior: muchos coaches en formación tienen un crítico interno muy activo. La autocompasión no es indulgencia — es la base emocional para seguir aprendiendo sin quedar paralizado por la vergüenza ante un error en sesión."),
      p("Ejercicio de esta unidad: practicá la meditación Metta al menos 3 veces esta semana. Identificá una situación reciente donde tu crítico interior estuvo muy presente, y reescribila desde la autocompasión."),
      resources({
        videos: [
          yt("10-Minute Guided Loving-Kindness Meditation — Sharon Salzberg", "https://www.youtube.com/watch?v=FyKKvCO_vSA"),
          yt("Kristin Neff — The Space Between Self-Esteem and Self-Compassion (TEDx)", "https://www.youtube.com/watch?v=IvtZBUSplr4"),
        ],
      }),
    ],
  },
  {
    title: "Unidad 6: Integración — La Sesión con Presencia Mindful",
    description: "Cierre del módulo: una sesión completa conducida con presencia de principio a fin.",
    estimatedMinutes: 30,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 6 — Integración: La Sesión con Presencia Mindful"),
      list([
        "Apertura — 1-2 minutos de anclaje en la respiración antes de que el coachee empiece a hablar, para vos, no para él.",
        "Durante la sesión — escucha de Nivel 2-3, tolerancia al silencio, atención a lo que pasa en tu propio cuerpo mientras escuchás.",
        "Ante un momento difícil — si sentís que tu crítico interior se activa, notalo sin actuar desde ahí.",
        "Cierre — un momento breve de silencio antes de despedirte, para que lo trabajado se asiente.",
      ]),
      p("\"La práctica de mindfulness no termina con el módulo: empieza con él. Un coach que practica mindfulness cada día tiene una ventaja que ningún libro ni técnica puede reemplazar: la capacidad de estar verdaderamente presente con otro ser humano.\""),
      p("Entrega de esta unidad: registrá 2 sesiones de coaching con presencia mindful documentada (Formulario de Observación, 30%). Completá tu Autoevaluación Reflexiva — portafolio (25%) y el cierre de tu Diario de Práctica."),
    ],
  },
  {
    title: "Workbook — Módulo 4",
    description: "Diario de práctica, ejercicios de escucha y autocompasión, y portafolio.",
    type: "document",
    estimatedMinutes: 60,
    fileUrl: null,
    content: [
      list([
        "Diario de Práctica Personal (5 semanas) — 25%",
        "Ejercicio — Escucha con Presencia",
        "Ejercicio — Trabajar el Crítico Interior",
        "Formulario de Observación (2 sesiones) — 30%",
        "Autoevaluación reflexiva del módulo (portafolio) — 25%",
      ]),
    ],
  },
]

const MODULE_5_MATERIALS = [
  {
    title: "Unidad 1: Por Qué Pregunta el Coach",
    description: "La pregunta como herramienta de creación y la neurociencia de preguntar.",
    estimatedMinutes: 30,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 1 — Por Qué Pregunta el Coach"),
      p("\"Si el coach tiene una sola herramienta, esa es la pregunta. No el consejo, no la interpretación, no el plan de acción: la pregunta. Pero no cualquier pregunta. La pregunta que el coachee no pudo hacerse solo.\""),
      p("Una pregunta genuinamente nueva activa la corteza prefrontal en modo de búsqueda activa, creando nuevas conexiones neuronales. El consejo, en cambio, activa una \"red de defensa\": el coachee evalúa si el consejo coincide con lo que ya cree; si coincide, no hay aprendizaje nuevo; si no coincide, se rechaza."),
      h(2, "La diferencia entre preguntar e interrogar"),
      list([
        "Pregunta que abre — viene de la curiosidad genuina, no tiene respuesta implícita, invita a explorar. Ej.: \"¿Qué es lo más importante de esto para vos?\"",
        "Pregunta que cierra — viene del juicio o la agenda del coach, tiene una respuesta correcta esperada, pone al coachee a la defensiva. Ej.: \"¿No creés que deberías ser más directo?\"",
      ]),
      p("Ejercicio de esta unidad: ¿cuál es tu tendencia automática — dar consejos o hacer preguntas? ¿En qué situaciones más?"),
      resources({ videos: [yt("Questions Are the New Answers — Warren Berger (Big Think)", "https://www.youtube.com/watch?v=5ALlGU2GYbk")] }),
    ],
  },
  {
    title: "Unidad 2: Los 5 Tipos de Preguntas en Coaching",
    description: "Clarificación, reflexión, prospectivas, escala, y acción y compromiso.",
    estimatedMinutes: 40,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 2 — Los 5 Tipos de Preguntas en Coaching"),
      list([
        "Clarificación — entender exactamente qué quiere decir el coachee antes de avanzar. Ej.: \"Cuando decís que te sentís bloqueado, ¿a qué te referís exactamente?\"",
        "Reflexión — invitar al coachee a mirarse desde otra perspectiva. Ej.: \"¿Qué te dice esto de vos mismo?\"",
        "Prospectivas — llevar al coachee al futuro posible para que lo vea y lo sienta desde ahí. Ej.: \"Si supieras que vas a tener éxito, ¿qué harías diferente mañana?\"",
        "De escala — cuantificar lo subjetivo para hacer visible el progreso. Ej.: \"Del 1 al 10, ¿qué necesitarías para subir un punto?\" (la más potente del tipo)",
        "De acción y compromiso — cerrar la sesión con un compromiso concreto, específico y con fecha. Ej.: \"¿Cuál es el primer paso más pequeño que podés dar esta semana?\"",
      ], true),
      p("Ejercicio de esta unidad: ¿cuál de los 5 tipos te sale más naturalmente? ¿Cuál te cuesta más?"),
      resources({ videos: [yt("Counselling Microskills: Clarifying", "https://www.youtube.com/watch?v=XR1_2mR2SKg")] }),
    ],
  },
  {
    title: "Unidad 3: Preguntas Poderosas Avanzadas",
    description: "Pregunta milagro, del observador, de identidad, del legado — y preguntas integradas de los módulos anteriores.",
    estimatedMinutes: 40,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 3 — Preguntas Poderosas Avanzadas"),
      list([
        "Pregunta Milagro (Steve de Shazer e Insoo Kim Berg) — \"Suponé que esta noche ocurre un milagro y el problema desaparece, pero estabas durmiendo y no lo sabés. ¿Qué es lo primero que notás distinto al despertar?\"",
        "Pregunta del Observador — \"Si alguien que te quiere de verdad estuviera observando esta situación desde afuera, ¿qué diría que está pasando?\"",
        "Pregunta de Identidad — \"Si superaras este obstáculo, ¿quién serías?\"",
        "Pregunta del Legado — \"Cuando llegue el final de tu vida y mires hacia atrás, ¿qué querrás haber hecho con esta situación?\"",
      ]),
      h(2, "Preguntas integradas de los módulos anteriores"),
      list([
        "Kabalá — \"¿Desde cuál nivel de tu alma estás tomando esta decisión: desde el Néfesh que quiere seguridad o desde la Neshamá que sabe lo que importa?\"",
        "Logoterapia — \"¿Qué sentido puede tener para vos este momento difícil?\"",
        "Mindfulness — \"¿Qué está pasando en tu cuerpo ahora mismo mientras hablamos de esto?\"",
      ]),
      p("Ejercicio de esta unidad: ¿cuál de las 4 preguntas avanzadas te impactó más? ¿Por qué?"),
      resources({ videos: [yt("Insoo Kim Berg — La Pregunta Milagro", "https://www.youtube.com/watch?v=vTylNRr1RZM")] }),
    ],
  },
  {
    title: "Unidad 4: Errores Frecuentes al Preguntar",
    description: "Cómo detectarlos y corregirlos en el momento.",
    estimatedMinutes: 35,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 4 — Errores Frecuentes al Preguntar"),
      list([
        "\"¿Por qué no podés hablar con él?\" suena acusatorio y pone al coachee a la defensiva → mejor: \"¿Qué es lo que te impide tener esa conversación?\"",
        "\"¿No creés que la opción A es la mejor?\" tiene una respuesta implícita y anula la autonomía del coachee → mejor: \"¿Qué te dice tu intuición sobre cada opción desde tus valores más importantes?\"",
        "\"¿Qué vas a hacer, cómo lo vas a implementar y cuándo?\" son tres preguntas disfrazadas de una → mejor: \"¿Qué es lo más importante que necesitás resolver en esta relación?\"",
        "Llenar el silencio del coachee por ansiedad propia interrumpe justo el momento en que estaba procesando algo profundo → mejor: sostener el silencio, y si se extiende, preguntar \"¿qué está pasando en vos ahora mismo?\"",
      ]),
      p("Ejercicio de esta unidad: ¿cuál es el error al preguntar que cometés más frecuentemente? ¿Qué necesitás para corregirlo?"),
      resources({ videos: [yt("Leading Questions — Are They Bad? (Talking About Coaching, ep. 42)", "https://www.youtube.com/watch?v=sT3QeYwQeUs")] }),
    ],
  },
  {
    title: "Herramienta: Banco de 50 Preguntas Poderosas",
    description: "Referencia organizada por categoría — no para memorizar, para internalizar.",
    estimatedMinutes: 25,
    groupLabel: "Unidades",
    content: [
      h(1, "Banco de 50 Preguntas Poderosas"),
      p("El objetivo no es memorizar estas 50 preguntas, sino internalizar los tipos y principios que las generan."),
      h(2, "Clarificación"),
      list(["Cuando decís [palabra del coachee], ¿a qué te referís exactamente?", "¿Qué significa para vos el éxito en esta situación?", "¿Qué es lo que más te preocupa de esto?"]),
      h(2, "Reflexión"),
      list(["¿Qué te dice esto de vos mismo?", "¿Qué parte de esta situación depende de vos?", "Si miraras esta situación desde afuera, ¿qué verías?"]),
      h(2, "Prospectivas"),
      list(["Si supieras que vas a tener éxito, ¿qué harías diferente mañana?", "¿Cómo te verías dentro de un año si lograras esto?", "Si el miedo no fuera un factor, ¿qué elegirías?"]),
      h(2, "De escala"),
      list(["En una escala del 1 al 10, ¿dónde estás respecto a este objetivo?", "¿Qué necesitarías para subir un punto en esa escala?"]),
      h(2, "De acción y compromiso"),
      list(["¿Cuál es el primer paso más pequeño que podés dar esta semana?", "¿Cuándo exactamente lo vas a hacer?", "¿Qué podría impedirte y cómo lo vas a manejar?"]),
      h(2, "Para el silencio y la profundidad"),
      list(["¿Qué está pasando en vos ahora mismo?", "¿Qué emoción hay debajo de lo que acaba de decir?", "¿Hay algo más que no terminó de decir?"]),
      h(2, "De cierre"),
      list(["¿Qué te llevás de esta sesión?", "¿Qué descubriste que no sabías cuando llegaste?"]),
      p("\"El coach que domina el arte de preguntar no necesita ningún otro libro. La pregunta es el coach. Todo lo demás son adornos.\""),
    ],
  },
  {
    title: "Workbook — Módulo 5",
    description: "Banco personal de preguntas, registro de sesiones y portafolio.",
    type: "document",
    estimatedMinutes: 60,
    fileUrl: null,
    content: [
      list([
        "Participación en prácticas y juegos de preguntas — 20%",
        "Banco personal de 10 preguntas con justificación — 25%",
        "Registro de 2 sesiones con análisis de preguntas usadas — 30%",
        "Autoevaluación reflexiva del módulo (portafolio) — 25%",
      ]),
    ],
  },
]

const MODULE_6_MATERIALS = [
  {
    title: "Unidad 1: Fundamentos de la TCC Aplicada al Coaching",
    description: "Beck, Ellis, el triángulo cognitivo y la diferencia con la terapia.",
    estimatedMinutes: 35,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 1 — Fundamentos de la TCC Aplicada al Coaching"),
      p("Aaron Beck desarrolló la Terapia Cognitivo-Conductual en los años 60 a partir de su trabajo con pacientes depresivos: observó un flujo continuo de pensamientos automáticos negativos que no se cuestionaban y afectaban directamente el estado emocional y la conducta. Albert Ellis, en paralelo, desarrolló la Terapia Racional Emotiva Conductual con su modelo ABC (Acontecimiento, Creencia, Consecuencia emocional): no son los eventos los que causan el sufrimiento, sino las creencias sobre esos eventos."),
      h(2, "El triángulo cognitivo"),
      p("Pensamiento (interpretación de la situación), Emoción (estado afectivo que surge del pensamiento) y Conducta (lo que el coachee hace o deja de hacer) se influyen mutuamente en un sistema circular. El punto de entrada puede ser cualquiera de los tres vértices — la habilidad del coach es moverse fluidamente entre ellos según lo que el coachee necesita."),
      list([
        "TCC en psicoterapia — trabaja con patología clínica diagnosticada; el terapeuta dirige el proceso; trabaja el pasado; proceso largo.",
        "TCC en coaching — trabaja con limitaciones funcionales sin patología; el coach facilita, el coachee tiene las respuestas; usa el presente para construir el futuro; 4, 8 o 12 sesiones.",
      ]),
    ],
  },
  {
    title: "Unidad 2: Pensamientos Automáticos y Distorsiones Cognitivas",
    description: "Las 10 distorsiones cognitivas más frecuentes en coaching.",
    estimatedMinutes: 40,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 2 — Pensamientos Automáticos y Distorsiones Cognitivas"),
      p("Los pensamientos automáticos son interpretaciones rápidas e involuntarias que el coachee toma como hechos en lugar de interpretaciones. La tarea del coach no es eliminarlos, sino ayudar a identificarlos, examinar su validez y generar alternativas más funcionales."),
      list([
        "Todo o nada — \"Si no soy el mejor, soy un fracaso total.\"",
        "Catastrofización — \"Si cometo un error, mi carrera se termina.\"",
        "Filtraje negativo — enfocarse solo en lo negativo ignorando lo positivo.",
        "Lectura mental — \"Sé que mi jefe piensa que soy incompetente.\"",
        "Personalización — asumir responsabilidad excesiva por eventos externos.",
        "Generalización excesiva — sacar conclusiones amplias de un solo evento.",
        "Deber y deberías — reglas rígidas sobre uno mismo y los demás.",
        "Razonamiento emocional — \"me siento incompetente, por lo tanto soy incompetente.\"",
        "Etiquetado — \"cometí un error, soy un fracasado.\"",
        "Adivinación del futuro — predecir el futuro de manera negativa como si fuera un hecho.",
      ]),
      p("Ejercicio de esta unidad: ¿cuál de las 10 distorsiones reconocés más en vos mismo? Dá un ejemplo concreto."),
      resources({ videos: [yt("Cognitive Restructuring in CBT — Dr. Aaron Beck (Beck Institute)", "https://www.youtube.com/watch?v=orPPdMvaNGA")] }),
    ],
  },
  {
    title: "Unidad 3: Creencias Nucleares y la Flecha Descendente",
    description: "Los tres niveles de creencia y la técnica para llegar al núcleo.",
    estimatedMinutes: 40,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 3 — Creencias Nucleares y la Flecha Descendente"),
      list([
        "Superficial — pensamientos automáticos (\"no voy a poder con esta presentación\"). Alta accesibilidad.",
        "Intermedio — creencias intermedias, supuestos, reglas (\"si no soy perfecto, los demás me rechazarán\"). Accesibilidad media.",
        "Núcleo — creencias nucleares (\"soy incompetente / no soy querible\"). Baja accesibilidad, requiere trabajo profundo.",
      ]),
      p("La flecha descendente pregunta repetidamente \"¿y si eso fuera verdad, qué significaría para vos?\" hasta llegar a la creencia nuclear:"),
      p("Coachee: \"No puedo hablar en público sin ponerme nervioso.\" → \"¿Y si eso fuera verdad, qué significaría?\" → \"Que no soy un líder convincente.\" → \"¿Y eso qué implicaría?\" → \"Que mi equipo no me respeta.\" → \"¿Y eso qué diría de vos?\" → (pausa larga) \"...Que no soy suficientemente bueno para este puesto.\" — creencia nuclear identificada."),
      p("Cuándo usarla: cuando el coachee lleva varias sesiones con el mismo patrón y los abordajes superficiales no generan cambio sostenible, y solo si hay suficiente confianza construida en la relación."),
      resources({ videos: [yt("CBT Downward Arrow Technique — Cómo Identificar Creencias Nucleares", "https://www.youtube.com/watch?v=8jNUAuDkeRI")] }),
    ],
  },
  {
    title: "Unidad 4: Reestructuración Cognitiva en Coaching",
    description: "El proceso de 5 pasos y el experimento conductual.",
    estimatedMinutes: 40,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 4 — Reestructuración Cognitiva en Coaching"),
      p("Reestructurar no es convencer al coachee de pensar distinto: es ayudarlo a examinar la validez de sus pensamientos automáticos y generar interpretaciones más funcionales. No es pensamiento positivo, es pensamiento realista y flexible."),
      list([
        "1. Identificar el pensamiento automático — ¿qué pasa por tu cabeza cuando pensás en esa situación?",
        "2. Examinar la evidencia a favor — ¿qué evidencia tenés de que ese pensamiento es verdad?",
        "3. Examinar la evidencia en contra — ¿qué evidencia tenés de que NO es verdad?",
        "4. Generar alternativas — ¿qué otra manera hay de ver esta situación?",
        "5. Evaluar la alternativa — si pensaras así, ¿qué cambiaría en cómo te sentís y en lo que hacés?",
      ], true),
      p("El experimento conductual pone a prueba una creencia en la realidad en vez de debatirla: el coachee diseña un pequeño experimento y trae los resultados a la próxima sesión. Ejemplo: creencia \"si soy directo con mi equipo, van a dejar de respetarme\" → experimento: expresar una opinión directa en una reunión y observar la reacción real."),
      resources({ videos: [yt("Developing a Behavioural Experiment — CBT Clinical Demonstration", "https://www.youtube.com/watch?v=wKPPf9YNv5c")] }),
    ],
  },
  {
    title: "Unidad 5: Diseño de Programas de Coaching Profesional",
    description: "Las 6 fases del proceso y el objetivo SMART integrativo.",
    estimatedMinutes: 40,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 5 — Diseño de Programas de Coaching Profesional"),
      list([
        "Diagnóstico — evaluación inicial: rueda de la vida, mapa de sefirot, valores, fortalezas.",
        "Foco — definición del objetivo central: SMART + dimensión de sentido.",
        "Diseño — plan de sesiones: cuántas, con qué frecuencia, cómo se mide el progreso.",
        "Intervención — las sesiones en sí: preguntas, herramientas TCC, integración de Kabalá, Logoterapia y Mindfulness.",
        "Seguimiento — tareas entre sesiones, revisión de compromisos, ajuste del plan.",
        "Cierre — medición de resultados, consolidación, plan de autonomía post-coaching.",
      ], true),
      h(2, "El Objetivo SMART Integrativo"),
      list([
        "Específico — ¿qué exactamente querés lograr? + Kabalá: ¿desde qué nivel del alma viene este objetivo?",
        "Medible — ¿cómo sabremos que lo lograste? + Maljut: ¿cómo se ve en la realidad material?",
        "Alcanzable — ¿es realista dado tu contexto? + Histadlut: ¿qué esfuerzo genuino requiere?",
        "Relevante — ¿por qué este objetivo y no otro? + Logoterapia: ¿qué sentido tiene en tu vida?",
        "Temporal — ¿para cuándo, con qué hitos? + Tikún: ¿qué etapas de crecimiento implica?",
      ]),
      resources({ videos: [yt("Life Coaching: Setting Coaching SMART Goals & Objectives", "https://www.youtube.com/watch?v=4mWGz2FYWsA")] }),
    ],
  },
  {
    title: "Unidad 6: Los Tres Modelos de Programa",
    description: "Programas de 4, 8 y 12 sesiones, y el cierre del programa completo.",
    estimatedMinutes: 45,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 6 — Los Tres Modelos de Programa"),
      h(2, "Modelo A: 4 sesiones — Intervención Focalizada"),
      p("Para coachees con un objetivo específico y acotado, sin patrones profundos que trabajar. Secuencia: Sesión 1 (diagnóstico y foco), Sesión 2 (diagnóstico cognitivo — triángulo y pensamientos automáticos), Sesión 3 (diseño del experimento conductual), Sesión 4 (cierre, evaluación del SMART y plan de autonomía)."),
      h(2, "Modelo B: 8 sesiones — Proceso Estándar"),
      p("El formato más frecuente en la práctica profesional: diagnóstico inicial, foco y objetivo, triángulo cognitivo, distorsiones y primera flecha descendente, reestructuración, experimento conductual, consolidación, cierre y autonomía — con una integración explícita de Kabalá, Logoterapia y Mindfulness en cada etapa."),
      h(2, "Modelo C: 12 sesiones — Transformación Profunda"),
      p("Para creencias nucleares profundamente arraigadas o procesos de transformación identitaria: diagnóstico profundo (2 sesiones), arquitectura cognitiva (2), creencias nucleares (2), reestructuración profunda (2), acción y consolidación (2), integración y cierre (2) — con supervisión durante el proceso."),
      h(2, "Resumen del Programa Completo — Los 7 Módulos"),
      list([
        "M1 Introducción al Coaching — su comprensión de qué es el coaching y quién es él como coach.",
        "M2 Kabalá Coach — su capacidad de ver la Neshamá del coachee detrás del problema.",
        "M3 Logoterapia — su capacidad de acompañar el vacío existencial sin apresurarse.",
        "M4 Coaching y Mindfulness — su presencia: la calidad de estar completamente ahí.",
        "M5 El Arte de Preguntar — su herramienta central: la pregunta que el coachee no pudo hacerse solo.",
        "M6 Diseño de Programas TCC — su capacidad de estructurar un proceso profesional completo.",
        "M7 Método Sholem — su liderazgo: quién es cuando nadie se lo exige.",
      ]),
      p("\"El Life Coach Integrativo que completa este programa tiene algo que ningún otro programa de coaching convencional puede ofrecer: la profundidad del alma junto con el rigor de la estructura. No forma motivadores. Forma líderes conscientes de sí mismos y de los seres humanos que acompañan.\""),
      p("Entrega de esta unidad: diseño del programa propio completo (30%), presentación al grupo (10%) y sesión final integradora (25%)."),
      resources({ videos: [yt("How to Structure Your Coaching Program for Maximum Results", "https://www.youtube.com/watch?v=NsoQ7EkNIec")] }),
    ],
  },
  {
    title: "Workbook — Módulo 6",
    description: "Registro de sesiones, diseño del programa propio y cierre del programa completo.",
    type: "document",
    estimatedMinutes: 90,
    fileUrl: null,
    content: [
      list([
        "Participación en talleres de diseño y prácticas — 15%",
        "Registro de 2 sesiones con triángulo cognitivo documentado — 20%",
        "Diseño del programa propio (plantilla completa) — 30%",
        "Presentación del programa al grupo — 10%",
        "Sesión final integradora evaluada — 25%",
      ]),
    ],
  },
]

const MODULE_7_MATERIALS = [
  {
    title: "Unidad 1: Ser un Líder Atractivo",
    description: "Quién fue Sholem y la diferencia entre esfuerzo real y performativo.",
    estimatedMinutes: 30,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 1 — Ser un Líder Atractivo"),
      p("Principio 1 del Método Sholem: \"No me siguen porque les ordeno, me siguen porque quieren estar cerca.\" El liderazgo atractivo no se basa en el miedo ni en la autoridad, sino en la calidad humana."),
      h(2, "1.1 Quién fue Sholem"),
      p("Sholem fue un joven cuya vida, aunque breve, dejó una marca profunda en todos los que lo rodeaban. Su liderazgo no se enseñaba con palabras: se vivía. Su mayor enseñanza fue que el verdadero líder no necesita decir \"síganme\" — simplemente actúa, y los demás quieren estar cerca."),
      h(2, "1.2 El trabajo duro como combustible"),
      list([
        "Esfuerzo performativo — se hace para ser visto, busca reconocimiento inmediato, se apaga cuando falta la audiencia.",
        "Esfuerzo real — se hace porque importa aunque nadie mire, sostiene aunque no haya aplausos, es contagioso.",
      ]),
      p("Ejercicio de esta unidad: describí a alguien de tu vida real que sea un líder atractivo — ¿qué hace concretamente que te da ganas de seguirlo?"),
      resources({ videos: [yt("Simon Sinek — How great leaders inspire action (TED)", "https://www.ted.com/talks/simon_sinek_how_great_leaders_inspire_action")] }),
    ],
  },
  {
    title: "Unidad 2: Certidumbre Absoluta",
    description: "La diferencia entre autoconfianza y certidumbre.",
    estimatedMinutes: 25,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 2 — Certidumbre Absoluta"),
      p("Principio 2 del Método Sholem: \"Cuando creo de verdad, los demás también creen.\""),
      list([
        "Autoconfianza — \"creo que puedo\", puede debilitarse ante la duda, depende de la evidencia previa de éxito.",
        "Certidumbre Absoluta — \"lo haré\", se sostiene aunque haya dudas, nace de que los valores son más fuertes que los miedos.",
      ]),
      p("Sholem tenía certidumbre no porque no tuviera dudas, sino porque sus valores eran más fuertes que sus miedos."),
      p("Ejercicio de esta unidad: elegí una meta actual y escribila primero como \"voy a intentar...\" y después como \"lo voy a hacer...\". Notá qué cambia en el cuerpo al leerlas en voz alta."),
    ],
  },
  {
    title: "Unidad 3: El Equipo Ante Todo",
    description: "Brillar vs. hacer brillar al equipo.",
    estimatedMinutes: 25,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 3 — El Equipo Ante Todo"),
      p("Principio 3 del Método Sholem: \"El mejor resultado del equipo es más importante que mi brillo personal.\" Sholem sabía que lo que lograba con otros era infinitamente más que lo que lograría solo."),
      p("Hay una pregunta que distingue al líder centrado en el ego del líder centrado en el equipo: ¿querés brillar VOS, o querés que brille el equipo? La diferencia se nota en decisiones concretas: a quién se le da el crédito, quién habla primero, qué se prioriza cuando hay que elegir."),
      p("Ejercicio de esta unidad: ¿cuándo pusiste tus intereses por encima del equipo? Esta semana, hacé algo que beneficie a tu equipo sin esperar reconocimiento personal, y registrá qué se sintió."),
      resources({ videos: [yt("Simon Sinek — Why good leaders make you feel safe (TED)", "https://www.ted.com/talks/simon_sinek_why_good_leaders_make_you_feel_safe")] }),
    ],
  },
  {
    title: "Unidad 4: Persuasión Efectiva",
    description: "Credibilidad, conexión emocional y lógica clara.",
    estimatedMinutes: 35,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 4 — Persuasión Efectiva"),
      p("Principio 4 del Método Sholem: \"No convenzo con argumentos: convenzo con mi presencia y mi cuidado.\" Persuadir no es manipular: es comunicar con claridad, con frecuencia y desde un interés genuino por el otro."),
      h(2, "4.1 Los tres principios de la persuasión genuina"),
      list([
        "Credibilidad — te creen porque sos coherente entre lo que decís y lo que hacés.",
        "Conexión emocional — tocás el corazón antes que la mente.",
        "Lógica clara — das razones que tienen sentido, no solo apelás a la emoción.",
      ]),
      p("Persuasión vs. manipulación: el persuasor respeta la autonomía del otro y busca un beneficio mutuo; el manipulador antepone su interés y no le importan las consecuencias para el otro."),
      h(2, "4.2 y 4.3 El cuidado y la comunicación clara"),
      p("Cuando las personas sienten que les importan de verdad, se abren a escucharte y seguirte. Y la claridad es un acto de respeto: cuando sos claro, respetás el tiempo del otro."),
      p("Ejercicio de esta unidad: practicá con alguien de tu entorno — elegí una causa e intentá persuadirla usando los tres principios. Registrá qué funcionó y qué no."),
      resources({ readings: [yt("Persuasion vs. Manipulation: Real Differences + Examples", "https://thepowermoves.com/persuasion-vs-manipulation/")] }),
    ],
  },
  {
    title: "Unidad 5: Identidad Sólida",
    description: "Los componentes de la identidad de liderazgo, el Mapa de Identidad y la Declaración de Liderazgo.",
    estimatedMinutes: 40,
    groupLabel: "Unidades",
    content: [
      h(1, "Unidad 5 — Identidad Sólida"),
      p("Principio 5 del Método Sholem: \"Sé quién soy, eso es lo que me hace irremplazable.\" Alguien que sabe quién es, de dónde viene y qué valores lo definen no necesita la aprobación de los demás para actuar."),
      h(2, "5.1 Los componentes de la identidad de liderazgo"),
      list([
        "Historia personal y familiar — ¿de dónde vengo?",
        "Valores centrales — ¿qué valores son innegociables para mí?",
        "Fortalezas únicas — ¿cuáles son mis 3 mayores fortalezas como líder?",
        "Visión de liderazgo — ¿cómo quiero que me recuerden?",
      ]),
      h(2, "5.2 Identidad y raíces como fuente de fortaleza"),
      p("Las raíces de una persona —culturales, familiares, religiosas— no son una limitación para el liderazgo: son una fuente única de fortaleza. En el caso de Sholem, su identidad judía se expresaba en su forma de liderar; para cada coach y cada coachee, sus propias raíces cumplen ese mismo rol."),
      h(2, "5.3 El Mapa de Identidad y la Declaración de Liderazgo"),
      p("El Mapa de Identidad organiza los cuatro componentes de arriba; la Declaración de Liderazgo es un compromiso escrito: quién sos, desde qué valores lideras, y qué compromiso hacés."),
      p("Entregas de esta unidad: completá el Mapa de Identidad (25%) y escribí tu Declaración de Liderazgo (30%). Completá también tu Autoevaluación Reflexiva — portafolio (25%)."),
      resources({ videos: [yt("Herminia Ibarra — What does it really mean for leaders to be authentic? (TED)", "https://www.ted.com/talks/herminia_ibarra_what_does_it_really_mean_for_leaders_to_be_authentic")] }),
    ],
  },
  {
    title: "Workbook — Módulo 7",
    description: "Mapa de Identidad, Declaración de Liderazgo y portafolio.",
    type: "document",
    estimatedMinutes: 70,
    fileUrl: null,
    content: [
      list([
        "El líder que yo conozco",
        "Mi termómetro de certidumbre",
        "El equipo ante todo",
        "Práctica de persuasión",
        "Mapa de Identidad — 25%",
        "Declaración de Liderazgo — 30%",
        "Autoevaluación reflexiva del módulo (portafolio) — 25%",
      ]),
    ],
  },
]

const ALL_MODULES = {
  1: MODULE_1_MATERIALS,
  2: MODULE_2_MATERIALS,
  3: MODULE_3_MATERIALS,
  4: MODULE_4_MATERIALS,
  5: MODULE_5_MATERIALS,
  6: MODULE_6_MATERIALS,
  7: MODULE_7_MATERIALS,
}

async function main() {
  for (const mod of COURSE_MODULES) {
    await prisma.courseModule.upsert({
      where: { courseId_number: { courseId: COURSE_ID, number: mod.number } },
      update: { title: mod.title, description: mod.description },
      create: { courseId: COURSE_ID, ...mod },
    })
    console.log(`✓ CourseModule ${mod.number} — ${mod.title}`)
  }

  if (DELETE_MODULE_NUMBERS.length) {
    const del = await prisma.material.deleteMany({
      where: { courseId: COURSE_ID, moduleNumber: { in: DELETE_MODULE_NUMBERS } },
    })
    console.log(`— borrados ${del.count} materiales previos de los módulos ${DELETE_MODULE_NUMBERS.join(", ")} (re-carga idempotente)`)
  }

  for (const [moduleNumber, materials] of Object.entries(ALL_MODULES)) {
    let order = 0
    for (const mat of materials) {
      await prisma.material.create({
        data: {
          courseId: COURSE_ID,
          moduleNumber: Number(moduleNumber),
          order: order++,
          title: mat.title,
          description: mat.description ?? null,
          type: mat.type ?? "lesson",
          estimatedMinutes: mat.estimatedMinutes ?? null,
          groupLabel: mat.groupLabel ?? null,
          fileUrl: mat.fileUrl ?? null,
          content: JSON.stringify(mat.content),
        },
      })
      console.log(`  ✓ [M${moduleNumber}] ${mat.title}`)
    }
  }

  console.log("Listo.")
}

main().finally(() => prisma.$disconnect())
