"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import RevealInit from "@/components/RevealInit"

interface Post {
  slug: string
  category: string
  date: string
  title: string
  excerpt: string
  readTime: string
  accent: string
  content: string
}

const POSTS: Post[] = [
  {
    slug: "que-es-el-life-coaching-integrativo",
    category: "Coaching",
    date: "12 Jun 2026",
    title: "¿Qué es el Life Coaching Integrativo y por qué va más allá del coaching tradicional?",
    excerpt: "El coaching integrativo une psicología, logoterapia y herramientas espirituales para un acompañamiento más profundo y sostenido en el tiempo.",
    readTime: "5 min",
    accent: "#A58D66",
    content: `El Life Coaching Integrativo no es una moda pasajera ni un conjunto de técnicas de motivación. Es una disciplina que surge de la necesidad de acompañar a las personas de manera completa: integrando su mente, su cuerpo y su espíritu en un mismo proceso de transformación.

A diferencia del coaching tradicional, que muchas veces se enfoca en objetivos externos y estrategias de acción, el enfoque integrativo parte de una pregunta más profunda: ¿quién quiero ser? Antes de preguntarse qué quiero lograr, el proceso invita a explorar los valores, creencias y patrones que dan forma a nuestra identidad.

En Jewgal Academy, este enfoque integra herramientas de la psicología humanista, la logoterapia de Viktor Frankl, el mindfulness y la sabiduría de la Cabalá. No como un collage de técnicas, sino como un sistema coherente que parte del sentido de vida de cada persona.

El resultado es un proceso que no solo produce resultados visibles, sino que transforma la manera en que la persona habita su vida cotidiana. Los clientes de coaches integrativos suelen reportar no solo que alcanzaron sus metas, sino que se sienten más en paz con quiénes son, más capaces de sostener los cambios en el tiempo y más conectados con su propósito más profundo.

Si estás pensando en formarte como coach o en iniciar un proceso personal, el camino integrativo te ofrece una profundidad que difícilmente encontrarás en otros enfoques. Te invitamos a conocer nuestra formación en Life Coaching Integrativo y dar el primer paso.`,
  },
  {
    slug: "cabala-y-bienestar",
    category: "Cabalá",
    date: "04 Jun 2026",
    title: "Cabalá y bienestar: cómo la sabiduría ancestral transforma el coaching moderno",
    excerpt: "Exploramos el Árbol de la Vida y las sefirot como mapa interior para comprender tus patrones, tus fortalezas y el camino hacia tu propósito.",
    readTime: "7 min",
    accent: "#CBB78B",
    content: `La Cabalá no es religión, ni magia, ni esotericismo. Es un mapa. Un sistema de sabiduría milenaria que describe cómo funciona el alma humana, cuáles son sus dimensiones y cómo cada persona puede conocerse y transformarse desde adentro.

El Árbol de la Vida es la herramienta central de esta tradición. Está compuesto por diez sefirot, que representan diferentes cualidades del ser humano: la sabiduría, la comprensión, la bondad, el rigor, la compasión, el éxito, la constancia, el esplendor, el fundamento y la manifestación. Cada sefirá nos habla de un aspecto de nuestra psicología y nuestra espiritualidad.

Aplicado al coaching, el Árbol de la Vida se convierte en un espejo. Cuando un cliente llega con dificultades para tomar decisiones, podemos explorar juntos si hay un desequilibrio entre la sabiduría (Jojmá) y la comprensión (Biná). Cuando hay bloqueos para actuar, el trabajo puede estar en fortalecer Iessod, el pilar de la acción.

Lo fascinante de este sistema es que no impone una receta universal. Cada persona tiene su propio mapa, su propia combinación de fortalezas y áreas de crecimiento. Y el proceso de autoconocimiento cabalístico es, en sí mismo, un camino de sanación.

En nuestro Micro Curso de Cábala Coach, exploramos estas herramientas de manera práctica y accesible, sin necesidad de conocimientos previos de judaísmo ni espiritualidad. La sabiduría ancestral al servicio de tu transformación presente.`,
  },
  {
    slug: "joogal-movimiento-consciente",
    category: "Joogal",
    date: "28 May 2026",
    title: "El Método Joogal: cuando el movimiento se convierte en herramienta de transformación",
    excerpt: "Cómo integrar cuerpo, mente y emoción a través del movimiento consciente para acceder a estados de mayor bienestar y claridad.",
    readTime: "6 min",
    accent: "#6BBF8E",
    content: `Durante décadas, el mundo del desarrollo personal ignoró el cuerpo. Se llenaron páginas de libros sobre mentalidad, creencias y estrategias, pero muy pocos preguntaron: ¿qué pasa en el cuerpo cuando una persona se transforma? ¿Cómo el movimiento puede ser un catalizador del cambio?

El Método Joogal nació de estas preguntas. Es un sistema de movimiento consciente que integra principios del yoga, la expresión corporal, la danza terapéutica y el mindfulness en movimiento. No se trata de un ejercicio físico convencional, sino de una práctica que invita a habitar el cuerpo con presencia y a escuchar lo que el cuerpo tiene para decir.

Cuando practicamos Joogal, activamos el sistema nervioso parasimpático, reducimos el cortisol y aumentamos la producción de oxitocina y serotonina. Pero más allá de la bioquímica, lo que más reportan quienes lo practican es una sensación de integración: de que mente y cuerpo finalmente están en el mismo lugar, al mismo tiempo.

Para instructores y educadores, el Método Joogal ofrece una herramienta poderosa para acompañar grupos. Ya sea en colegios, empresas, comunidades o retiros, las clases Joogal crean estados de apertura y conexión que facilitan el aprendizaje y la transformación.

Si te interesa certificarte como instructor del Método Joogal Adultos o Joogalkids, te invitamos a explorar nuestras formaciones. Están diseñadas para ser accesibles incluso si no tienes experiencia previa en yoga o danza.`,
  },
  {
    slug: "liderazgo-con-proposito",
    category: "Liderazgo",
    date: "15 May 2026",
    title: "Liderazgo con propósito: la diferencia entre dirigir y verdaderamente inspirar",
    excerpt: "El verdadero liderazgo no se trata de posición sino de influencia genuina. Descubre cómo desarrollar autoridad desde la autenticidad y los valores.",
    readTime: "4 min",
    accent: "#B07FD8",
    content: `Hay líderes que dirigen porque tienen autoridad formal, y hay líderes que inspiran porque tienen autoridad real. La diferencia no está en el cargo ni en el puesto: está en la autenticidad con la que ejercen su influencia.

El liderazgo con propósito parte de una premisa simple pero poderosa: las personas no siguen a quienes tienen el poder, siguen a quienes les dan sentido. Un líder que conoce su propósito, que actúa desde sus valores y que tiene la valentía de ser vulnerable, genera una confianza que ninguna jerarquía puede producir artificialmente.

En nuestra tradición, el liderazgo siempre estuvo vinculado al servicio. En hebreo, la palabra "edá" (comunidad) comparte raíz con "testimonio": liderar es ser testigo de lo mejor que puede ser el otro, y sostener ese espejo con constancia y amor. Esa es la esencia del Método Sholem para adolescentes.

Desarrollar este tipo de liderazgo requiere trabajo interior. Implica conocer los propios patrones de respuesta al conflicto, los valores que guían las decisiones y las creencias que limitan o potencian nuestra influencia. El coaching integrativo es una de las herramientas más poderosas para este proceso.

Si trabajas con equipos, comunidades o adolescentes, te invitamos a preguntarte: ¿qué tipo de líder quiero ser? ¿Desde dónde quiero ejercer mi influencia? La respuesta a esas preguntas es el comienzo de un liderazgo que verdaderamente transforma.`,
  },
  {
    slug: "metodo-sholem-adolescentes",
    category: "Educación",
    date: "08 May 2026",
    title: "Método Sholem: formando líderes adolescentes desde los valores y la identidad",
    excerpt: "Un enfoque único para acompañar a los jóvenes en la construcción de una identidad sólida, un sentido de pertenencia y un liderazgo con corazón.",
    readTime: "5 min",
    accent: "#7B9FD8",
    content: `Los adolescentes de hoy enfrentan un desafío que ninguna generación anterior tuvo que afrontar de la misma manera: construir una identidad en el contexto de las redes sociales, la sobreinformación y la presión de ser alguien antes de saber quién uno quiere ser.

El Método Sholem surge como respuesta a este desafío. Fue desarrollado para acompañar a jóvenes en la construcción de su identidad desde los valores, la pertenencia comunitaria y el liderazgo positivo. No se trata de darles respuestas, sino de crear las condiciones para que encuentren las suyas.

El nombre Sholem hace referencia a la paz: paz interior, paz en las relaciones, paz en la comunidad. Pero no es una paz pasiva ni cómoda. Es la paz que surge de la integridad, de actuar en coherencia con los propios valores aunque eso implique ir contracorriente.

Los instructores certificados del Método Sholem aprenden a crear espacios de seguridad donde los adolescentes pueden explorar quiénes son, qué les importa y cómo quieren contribuir al mundo. Aprenden a facilitar conversaciones difíciles con herramientas pedagógicas concretas, y a sostener grupos con una presencia que inspira confianza.

Si trabajas con jóvenes en colegios, organizaciones comunitarias o programas de liderazgo, el Método Sholem puede ser la herramienta que estabas buscando. Te invitamos a conocer nuestra formación y unirte a la comunidad de instructores que ya trabajan con este enfoque en varios países.`,
  },
  {
    slug: "coaching-transformacion-profunda",
    category: "Coaching",
    date: "02 May 2026",
    title: "Transformación profunda: qué pasa cuando el coaching va más allá de los resultados",
    excerpt: "Las herramientas del coaching son el vehículo, pero el verdadero destino es el cambio de identidad. Reflexionamos sobre lo que significa transformarse de adentro hacia afuera.",
    readTime: "8 min",
    accent: "#A58D66",
    content: `Cuando una persona llega a un proceso de coaching, suele traer un objetivo concreto: mejorar su relación de pareja, avanzar en su carrera, superar un bloqueo creativo. Y eso está bien. Los objetivos concretos son el punto de entrada.

Pero los procesos de coaching más poderosos suceden cuando el objetivo inicial se convierte en una puerta hacia algo más profundo. Cuando la persona descubre que el bloqueo que traía no era un problema de gestión del tiempo, sino una creencia sobre su propio valor. Cuando descubre que la relación difícil con su jefe refleja un patrón que viene de mucho más atrás.

La transformación profunda no se parece al achievement de metas. Es más silenciosa, más gradual y más difícil de medir. Pero cuando ocurre, cambia todo: la manera en que la persona se percibe a sí misma, la manera en que se relaciona con los demás y la manera en que toma decisiones.

Viktor Frankl, el psiquiatra vienés que sobrevivió los campos de concentración y fundó la logoterapia, decía que el ser humano no busca placer ni poder, sino sentido. La transformación profunda ocurre cuando una persona encuentra o recupera su sentido. Cuando conecta con el porqué de su vida y deja que ese porqué guíe el cómo.

En Jewgal Academy, esto es lo que buscamos en cada proceso formativo. No coaches que apliquen técnicas, sino personas que hayan experimentado su propia transformación y puedan acompañar a otros desde ese lugar de autenticidad y profundidad.`,
  },
]

const CATEGORIES = ["Todo", "Coaching", "Cabalá", "Joogal", "Liderazgo", "Educación"]

const spring = { type: "spring" as const, stiffness: 280, damping: 26 }

export default function BlogPage() {
  const [openPost, setOpenPost] = useState<Post | null>(null)
  const [activeCategory, setActiveCategory] = useState("Todo")

  const filtered = activeCategory === "Todo" ? POSTS : POSTS.filter((p) => p.category === activeCategory)

  return (
    <>
      <RevealInit />
      <Navbar />

      {/* ── HERO ── */}
      <section style={{
        background: "linear-gradient(120deg,var(--navy-2) 0%,var(--navy) 55%,#0a3140 100%)",
        paddingTop: 150, paddingBottom: 90, position: "relative", overflow: "hidden",
        borderBottom: "1px solid var(--line-d)",
      }}>
        <div style={{ position: "absolute", top: "-30%", right: "0", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(165,141,102,.07),transparent 70%)", pointerEvents: "none" }} />
        <div className="wrap">
          <span className="eyebrow" style={{ display: "block", marginBottom: 20 }}>Jewgal Academy</span>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(44px,6vw,78px)", color: "#eef4f4", lineHeight: 1.02, letterSpacing: "-.01em", marginBottom: 22 }}>
            Blog &amp;<br /><em style={{ fontStyle: "normal", color: "var(--gold-light)" }}>Recursos</em>
          </h1>
          <p style={{ color: "var(--on-dark)", fontSize: 17, maxWidth: 500, lineHeight: 1.7 }}>
            Artículos, reflexiones y herramientas sobre coaching, Cabalá, bienestar y liderazgo consciente.
          </p>
        </div>
      </section>

      {/* ── FILTROS ── */}
      <section style={{ background: "var(--navy-2)", borderBottom: "1px solid var(--line-d)" }}>
        <div className="wrap" style={{ padding: "22px 36px", display: "flex", gap: 10, flexWrap: "wrap" }}>
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={{
                background: activeCategory === cat ? "var(--gold)" : "transparent",
                color: activeCategory === cat ? "var(--navy)" : "var(--on-dark)",
                border: "1px solid",
                borderColor: activeCategory === cat ? "var(--gold)" : "var(--line-d)",
                borderRadius: 20, padding: "8px 20px",
                fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase",
                cursor: "pointer", fontFamily: "var(--sans)",
                transition: "background .25s, color .25s, border-color .25s",
              }}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </section>

      {/* ── POSTS ── */}
      <section style={{ background: "var(--navy)" }}>
        <div className="wrap" style={{ padding: "80px 36px" }}>
          {/* Post destacado */}
          {filtered[0] && (
            <motion.div
              key={filtered[0].slug + "-featured"}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={spring}
              onClick={() => setOpenPost(filtered[0])}
              style={{
                display: "grid", gridTemplateColumns: "1fr 1fr",
                borderRadius: 10, overflow: "hidden",
                border: "1px solid var(--line-d)", marginBottom: 28,
                cursor: "pointer",
              }}
              whileHover={{ y: -4, boxShadow: "0 20px 60px rgba(0,0,0,.3)" }}
            >
              <div style={{ background: "linear-gradient(135deg,#081E29,#0a3d4f)", padding: "52px 44px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 360 }}>
                <div>
                  <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                    <span style={{ fontSize: 11, border: "1px solid var(--line-d)", borderRadius: 16, padding: "4px 14px", color: filtered[0].accent, letterSpacing: ".12em", textTransform: "uppercase" }}>
                      {filtered[0].category}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--on-dark-faint)" }}>⏱ {filtered[0].readTime}</span>
                  </div>
                  <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(22px,2.8vw,34px)", color: "#eef4f4", lineHeight: 1.2, marginBottom: 18 }}>
                    {filtered[0].title}
                  </h2>
                  <p style={{ color: "var(--on-dark)", fontSize: 15.5, lineHeight: 1.7 }}>{filtered[0].excerpt}</p>
                </div>
                <motion.span
                  whileHover={{ x: 4 }}
                  style={{ fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: filtered[0].accent, marginTop: 28, display: "inline-block" }}
                >
                  Leer artículo →
                </motion.span>
              </div>
              <div style={{ background: "var(--navy-2)", padding: "52px 44px", display: "flex", alignItems: "center" }}>
                <blockquote style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: "clamp(17px,2vw,26px)", color: "#eef4f4", lineHeight: 1.5, borderLeft: `3px solid var(--gold)`, paddingLeft: 24 }}>
                  "El coaching integrativo no es solo una metodología. Es una manera de habitar el cambio desde adentro."
                  <cite style={{ display: "block", fontStyle: "normal", fontFamily: "var(--sans)", fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold)", marginTop: 16 }}>
                    — Devora Benchimol
                  </cite>
                </blockquote>
              </div>
            </motion.div>
          )}

          {/* Grid de posts */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
            <AnimatePresence>
              {filtered.slice(1).map((post, i) => (
                <motion.div
                  key={post.slug}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ ...spring, delay: i * 0.06 }}
                  onClick={() => setOpenPost(post)}
                  whileHover={{ y: -6, boxShadow: "0 16px 48px rgba(0,0,0,.25)", borderColor: "rgba(165,141,102,.4)" }}
                  style={{
                    border: "1px solid var(--line-d)", borderRadius: 8, padding: "32px 28px",
                    background: "rgba(255,255,255,.02)",
                    display: "flex", flexDirection: "column", justifyContent: "space-between",
                    cursor: "pointer", minHeight: 280,
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                      <span style={{ fontSize: 11, border: "1px solid var(--line-d)", borderRadius: 16, padding: "4px 14px", color: post.accent, letterSpacing: ".12em", textTransform: "uppercase" }}>
                        {post.category}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--on-dark-faint)" }}>{post.readTime}</span>
                    </div>
                    <h3 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 19, color: "#eef4f4", lineHeight: 1.25, marginBottom: 12 }}>{post.title}</h3>
                    <p style={{ color: "var(--on-dark)", fontSize: 14, lineHeight: 1.65 }}>{post.excerpt}</p>
                  </div>
                  <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--line-d)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "var(--on-dark-faint)" }}>{post.date}</span>
                    <motion.span whileHover={{ x: 3 }} style={{ fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: post.accent, display: "inline-block" }}>
                      Leer →
                    </motion.span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="join pad">
        <div className="glow" />
        <div className="wrap join-inner reveal">
          <span className="eyebrow" style={{ display: "inline-block" }}>Contenido exclusivo</span>
          <h2>Ideas que transforman,<br/>cada semana en tu correo.</h2>
          <p>Artículos nuevos cada semana sobre coaching, bienestar, Cabalá y liderazgo consciente.</p>
          <div className="join-actions">
            <Link href="/contacto" className="btn solid">Suscribirme gratis →</Link>
            <Link href="/academia" className="btn">Ver programas</Link>
          </div>
        </div>
      </section>

      <Footer />

      {/* ── MODAL ARTÍCULO ── */}
      <AnimatePresence>
        {openPost && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setOpenPost(null)}
              style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(8,30,41,.85)", backdropFilter: "blur(8px)", cursor: "pointer" }}
            />

            {/* Panel del artículo */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: 60, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={spring}
              style={{
                position: "fixed", inset: 0, zIndex: 81,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "24px 20px", pointerEvents: "none",
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: "var(--navy)", borderRadius: 16,
                  border: "1px solid var(--line-d)",
                  width: "100%", maxWidth: 720,
                  maxHeight: "90vh", overflowY: "auto",
                  position: "relative", pointerEvents: "all",
                  boxShadow: "0 40px 120px rgba(0,0,0,.5)",
                }}
              >
                {/* Header del modal */}
                <div style={{ padding: "36px 44px 28px", borderBottom: "1px solid var(--line-d)", position: "sticky", top: 0, background: "var(--navy)", zIndex: 2 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                    <div>
                      <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
                        <span style={{ fontSize: 11, border: "1px solid var(--line-d)", borderRadius: 16, padding: "4px 14px", color: openPost.accent, letterSpacing: ".12em", textTransform: "uppercase" }}>
                          {openPost.category}
                        </span>
                        <span style={{ fontSize: 12, color: "var(--on-dark-faint)" }}>{openPost.date} · {openPost.readTime}</span>
                      </div>
                      <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(20px,2.6vw,30px)", color: "#eef4f4", lineHeight: 1.2 }}>
                        {openPost.title}
                      </h2>
                    </div>
                    <motion.button
                      onClick={() => setOpenPost(null)}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      style={{ background: "var(--navy-2)", border: "1px solid var(--line-d)", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--on-dark)", fontSize: 20, flexShrink: 0 }}
                    >
                      ×
                    </motion.button>
                  </div>
                </div>

                {/* Contenido */}
                <div style={{ padding: "36px 44px 48px" }}>
                  <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 18, color: "var(--on-dark)", lineHeight: 1.7, marginBottom: 32, borderLeft: `3px solid ${openPost.accent}`, paddingLeft: 20 }}>
                    {openPost.excerpt}
                  </p>
                  {openPost.content.split("\n\n").map((paragraph, i) => (
                    <p key={i} style={{ color: "var(--on-dark)", fontSize: 16, lineHeight: 1.85, marginBottom: 22 }}>
                      {paragraph}
                    </p>
                  ))}
                  <div style={{ marginTop: 40, paddingTop: 28, borderTop: "1px solid var(--line-d)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                    <p style={{ fontSize: 13, color: "var(--on-dark-faint)" }}>Por <span style={{ color: "var(--gold)" }}>Devora Benchimol</span> · Jewgal Academy</p>
                    <Link href="/academia" className="btn solid" style={{ fontSize: 12, padding: "10px 22px" }} onClick={() => setOpenPost(null)}>
                      Ver programas →
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
