"use client"

import Link from "next/link"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import RevealInit from "@/components/RevealInit"
import { motion } from "framer-motion"

const credentials = [
  { n: "01", category: "Coaching",            items: ["Master Coach Internacional", "Formación de Coaches Integrativa", "Life Coaching Transformador"] },
  { n: "02", category: "Psicología & Terapia", items: ["Logoterapia y Propósito", "Tratamiento del Trauma", "Psicopedagogía", "Ciencias de la Educación"] },
  { n: "03", category: "Bienestar Holístico",  items: ["Mindfulness Certificada", "Flores de Bach", "Técnica del Tapping", "Masaje Terapéutico"] },
  { n: "04", category: "Tradición & Movimiento", items: ["Cabalá Aplicada", "Expresión Corporal", "Danza Terapéutica", "Educación Judía"] },
]

const timeline = [
  { code: "AR", place: "Argentina",     period: "Inicio · Formación", event: "Comienzos en Buenos Aires. Formación en psicopedagogía y ciencias de la educación." },
  { code: "IL", place: "Israel",        period: "Espiritualidad",     event: "Inmersión en la Cabalá y la espiritualidad judía aplicada al desarrollo personal." },
  { code: "GT", place: "Guatemala",     period: "Comunidad",          event: "Acompañamiento de procesos de transformación y formación de líderes en Centroamérica." },
  { code: "CO", place: "Colombia",      period: "Expansión",          event: "Expansión del método Jewgal y formación de coaches en Latinoamérica." },
  { code: "US", place: "Miami, EE.UU.", period: "2015 – Presente",    event: "Miami · Sede internacional. Desde Miami lidera programas en línea con alcance global, fundó la organización 501c3 Sholem Corazón Valiente y creó Jewgal Academy para transformar vidas." },
]

export default function ConoceADevorPage() {
  return (
    <>
      <style>{`
        /* ── Conoce a Devora — responsive completo ── */

        .devora-section-pad { padding: 100px 36px; }
        .devora-hero-grid   { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
        .devora-hero-photo  { position: relative; aspect-ratio: 1/1; overflow: hidden; border-radius: 4px; }
        .devora-fund-grid   { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }

        /* Trayectoria — cada fila */
        .devora-tray-row {
          display: grid;
          grid-template-columns: 56px 200px 1fr;
          align-items: baseline;
          gap: 20px;
          padding: 28px 0;
          border-top: 1px solid var(--line-d);
        }
        .devora-tray-row:last-child { border-bottom: 1px solid var(--line-d); }
        .devora-tray-code  { font-family: var(--serif); font-size: 13px; color: var(--gold); font-style: italic; }
        .devora-tray-place { font-family: var(--serif); font-weight: 500; font-size: clamp(18px,2vw,26px); color: #eef4f4; }
        .devora-tray-period { display: none; }
        .devora-tray-event { font-size: 15px; color: var(--on-dark); line-height: 1.65; }

        /* Stats hero */
        .devora-stat-num   { font-family: var(--serif); font-size: clamp(52px,7vw,100px); font-weight: 500; color: var(--gold-light); line-height: 1; }
        .devora-stat-label { font-size: 11px; letter-spacing: .22em; text-transform: uppercase; color: var(--on-dark); margin-top: 8px; max-width: 200px; }

        /* ── Tablet ── */
        @media (max-width: 900px) {
          .devora-section-pad { padding: 72px 28px; }
          .devora-hero-grid   { gap: 40px; }
          .devora-fund-grid   { gap: 40px; }
          .devora-tray-row    { grid-template-columns: 44px 160px 1fr; gap: 16px; }
        }

        /* ── Móvil ── */
        @media (max-width: 680px) {
          .devora-section-pad { padding: 56px 20px; }

          /* Hero: apila en 1 columna (foto primero en DOM → queda arriba) */
          .devora-hero-grid  { grid-template-columns: 1fr; gap: 32px; }
          .devora-hero-photo { aspect-ratio: 4/3; }

          /* Fundación: apila */
          .devora-fund-grid  { grid-template-columns: 1fr; gap: 28px; }

          /* Trayectoria: colapsa a bloque vertical */
          .devora-tray-row {
            grid-template-columns: 1fr;
            gap: 6px;
            padding: 22px 0;
          }
          .devora-tray-code   { display: none; }
          .devora-tray-period { display: block; font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: var(--gold); margin-bottom: 6px; }
          .devora-tray-place  { font-family: var(--serif); font-weight: 500; font-size: 22px; color: #eef4f4; display: block; }
          .devora-tray-header { display: flex; flex-direction: column; gap: 2px; }
          .devora-tray-event  { font-size: 14px; margin-top: 4px; }
        }

        @media (max-width: 420px) {
          .devora-section-pad { padding: 44px 16px; }
          .devora-hero-photo  { aspect-ratio: 3/2; }
        }
      `}</style>

      <RevealInit />
      <Navbar />

      {/* ── HERO ── */}
      <section style={{
        background: "linear-gradient(120deg,var(--navy-2) 0%,var(--navy) 52%,#2A1D12 100%)",
        paddingTop: "clamp(100px,12vw,160px)", paddingBottom: "clamp(60px,8vw,100px)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: "-30%", right: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(165,141,102,.08),transparent 70%)", pointerEvents: "none" }} />

        <div className="wrap devora-hero-grid">
          {/* Foto */}
          <div className="devora-hero-photo">
            <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/brand/devora-hero.webp')", backgroundSize: "cover", backgroundPosition: "50% 22%" }} />
            <div style={{ position: "absolute", left: 20, bottom: 20, fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(238,244,244,.9)", background: "rgba(8,30,41,.62)", backdropFilter: "blur(4px)", padding: "8px 13px", border: "1px solid var(--line-d)", borderRadius: 4 }}>
              Master Coach Internacional · Miami
            </div>
          </div>

          {/* Texto */}
          <div>
            <span className="eyebrow" style={{ display: "block", marginBottom: 20 }}>Conoce a la fundadora</span>
            <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(38px,5vw,70px)", lineHeight: 1.02, color: "var(--text)", letterSpacing: "-.01em", marginBottom: 20 }}>
              Devora<br /><em style={{ color: "var(--gold-light)", fontStyle: "normal" }}>Benchimol</em>
            </h1>
            <div style={{ fontFamily: "var(--script)", fontSize: "clamp(20px,2.5vw,28px)", color: "var(--gold-light)", marginBottom: 24, lineHeight: 1 }}>
              Master Coach · Educadora · Fundadora
            </div>
            <p style={{ color: "var(--on-dark)", fontSize: "clamp(14px,1.5vw,16px)", maxWidth: 440, marginBottom: 16, lineHeight: 1.7 }}>
              Más de 40 años facilitando procesos de transformación que integran mente, cuerpo y alma, con trayectoria internacional en Argentina, Israel, Guatemala, Colombia y Estados Unidos.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
              <Link href="/#programas" className="btn solid">Ver programas →</Link>
              <Link href="/contacto" className="btn">Escribirme</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STAT BANNER ── */}
      <section style={{ background: "var(--navy-2)", borderTop: "1px solid var(--line-d)", borderBottom: "1px solid var(--line-d)" }}>
        <div className="wrap" style={{ padding: "clamp(40px,6vw,72px) 36px" }}>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "clamp(24px,4vw,48px)", alignItems: "start" }}
          >
            {[
              { num: "40+", label: "Años transformando vidas en 5 países" },
              { num: "5",   label: "Programas y certificaciones activos" },
              { num: "5",   label: "Países: Argentina · Israel · Guatemala · Colombia · EE.UU." },
              { num: "501(c)(3)", label: "Fundación Sholem Corazón Valiente, EE.UU." },
            ].map((s) => (
              <motion.div key={s.num}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16,1,0.3,1] } } }}
              >
                <div className="devora-stat-num">{s.num}</div>
                <p className="devora-stat-label">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── EN SUS PALABRAS (bio) ── */}
      <section style={{ background: "var(--navy)" }}>
        <div className="wrap devora-section-pad" style={{ maxWidth: 860 }}>
          <span className="eyebrow reveal" style={{ display: "block", marginBottom: 28 }}>En sus palabras</span>
          <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: 20, fontSize: "clamp(15px,1.6vw,17px)", lineHeight: 1.8, color: "var(--on-dark)" }}>
            <p>Soy <strong style={{ color: "var(--text)" }}>Devora Benchimol</strong>. Master Coach Internacional, educadora, Rabbanit y fundadora de Jewgal Academy.</p>
            <p>Durante más de 40 años he acompañado personas en Argentina, Israel, Guatemala, Colombia y Estados Unidos a atravesar sus procesos más profundos — los que se viven en el cuerpo, los que duelen en el alma, y los que transforman la vida para siempre.</p>
            <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: "clamp(19px,2.2vw,24px)", color: "var(--gold-light)", lineHeight: 1.45 }}>Mi camino no nació de un aula. Nació del encuentro real con el ser humano.</p>
            <p>De esa trayectoria surgió una forma de trabajar que integra lo que la mayoría separa: la mente y el cuerpo, la técnica y la intuición, el conocimiento académico y la sabiduría ancestral.</p>
            <p>Soy creadora de <strong style={{ color: "var(--text)" }}>Joogalkids</strong>, un programa de Mindfulness in Motion basado en el Alef Bet, diseñado para que los niños aprendan a conectar con su mundo interior a través del movimiento, el juego y la sabiduría de las letras hebreas. Y de <strong style={{ color: "var(--text)" }}>Jewgal</strong>, su versión para adultos — una metodología propia que lleva ese mismo principio de consciencia en movimiento a quienes guían, educan y lideran.</p>
            <p style={{ marginTop: 4 }}>En cada retiro traigo conmigo todo eso:</p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 14, paddingLeft: 0 }}>
              {[
                ["La profundidad de la ", "Logoterapia", " para encontrar sentido donde parece no haberlo."],
                ["La presencia del ", "Mindfulness", " y el trabajo con el trauma para sanar desde adentro."],
                ["La sabiduría de la ", "Cabalá", " como mapa del alma y herramienta de transformación real."],
                ["El lenguaje del ", "cuerpo", " a través de la Expresión Corporal, la Danza y el Masaje Terapéutico."],
                ["La delicadeza de las ", "Flores de Bach y el Tapping", " para liberar lo que las palabras no alcanzan."],
                ["Y la mirada de la ", "Psicopedagogía", " para que cada proceso sea también un aprendizaje que se integra y se sostiene."],
              ].map(([pre, strong, post]) => (
                <li key={strong} style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--gold)", flexShrink: 0, transform: "translateY(-2px)" }} />
                  <span>{pre}<strong style={{ color: "var(--text)" }}>{strong}</strong>{post}</span>
                </li>
              ))}
            </ul>
            <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: "clamp(20px,2.4vw,26px)", color: "var(--text)", lineHeight: 1.4, marginTop: 8 }}>No vengo a darte respuestas.<br />Vengo a acompañarte a encontrar las tuyas.</p>
          </div>
        </div>
      </section>

      {/* ── MISIÓN ── */}
      <section style={{ background: "var(--navy-2)" }}>
        <div className="wrap devora-section-pad">
          <span className="eyebrow reveal" style={{ display: "block", marginBottom: 24 }}>Mi misión</span>
          <p className="reveal" style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(20px,3vw,40px)", color: "var(--text)", lineHeight: 1.35, maxWidth: 820, letterSpacing: ".01em" }}>
            "Facilitar procesos de transformación que integren mente, cuerpo y alma,
            ayudando a cada persona a alcanzar su máximo potencial y liderazgo personal."
          </p>
        </div>
      </section>

      {/* ── CREDENCIALES ── */}
      <section style={{ background: "var(--navy)" }}>
        <div className="wrap devora-section-pad">
          <span className="eyebrow reveal" style={{ display: "block", marginBottom: 16 }}>Formación</span>
          <h2 className="reveal" style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(26px,3.5vw,48px)", color: "var(--text)", letterSpacing: ".01em", marginBottom: "clamp(32px,5vw,56px)" }}>
            Credenciales &amp; Especialidades
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "clamp(24px,3vw,32px)" }}>
            {credentials.map((g) => (
              <div key={g.category} className="reveal" style={{ borderTop: "1px solid var(--line-d)", paddingTop: 24 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 20 }}>
                  <span style={{ fontFamily: "var(--serif)", fontSize: 13, color: "var(--gold)", fontStyle: "italic" }}>{g.n}</span>
                  <h3 style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--text)" }}>{g.category}</h3>
                </div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                  {g.items.map((it) => (
                    <li key={it} style={{ fontSize: 14, color: "var(--on-dark)", display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--gold)", flexShrink: 0 }} />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRAYECTORIA ── */}
      <section style={{ background: "linear-gradient(180deg,var(--navy-2),#2A1D12)", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, opacity: .4, backgroundImage: "radial-gradient(1px 1px at 20% 30%,#cbb78b,transparent),radial-gradient(1px 1px at 70% 60%,#cbb78b,transparent),radial-gradient(1px 1px at 50% 80%,#c0d5d6,transparent)" }} />
        <div className="wrap devora-section-pad" style={{ position: "relative", zIndex: 2 }}>
          <span className="eyebrow reveal" style={{ display: "block", marginBottom: 16 }}>Trayectoria</span>
          <h2 className="reveal" style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(26px,3.5vw,48px)", color: "var(--text)", letterSpacing: ".01em", marginBottom: "clamp(32px,5vw,56px)" }}>
            Un camino que trasciende fronteras
          </h2>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}
            variants={{ visible: { transition: { staggerChildren: 0.16 } } }}
          >
            {timeline.map((t) => (
              <motion.div key={t.place} className="devora-tray-row"
                variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16,1,0.3,1] } } }}
              >
                <span className="devora-tray-code">{t.code}</span>
                <div>
                  <div className="devora-tray-header">
                    <span className="devora-tray-period">{t.period}</span>
                    <span className="devora-tray-place">{t.place}</span>
                  </div>
                </div>
                <p className="devora-tray-event">{t.event}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FUNDACIÓN ── */}
      <section style={{ background: "var(--navy)", borderTop: "1px solid var(--line-d)" }}>
        <div className="wrap devora-section-pad">
          <div className="devora-fund-grid">
            <div className="reveal">
              <span className="eyebrow" style={{ display: "block", marginBottom: 20 }}>Impacto Social</span>
              <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(26px,3.2vw,46px)", color: "var(--text)", lineHeight: 1.1, marginBottom: 20 }}>
                Fundación Sholem<br /><em style={{ color: "var(--gold-light)", fontStyle: "normal" }}>Corazón Valiente</em>
              </h2>
              <div style={{ display: "inline-block", border: "1px solid var(--line-d)", borderRadius: 4, padding: "8px 16px", fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", marginTop: 8 }}>
                501(c)(3) · Miami, Florida
              </div>
            </div>
            <div className="reveal">
              <p style={{ color: "var(--on-dark)", fontSize: "clamp(14px,1.5vw,16px)", lineHeight: 1.75, marginBottom: 18 }}>
                Organización sin fines de lucro comprometida con inspirar, empoderar y formar líderes con corazón valiente, comprometidos con transformar el mundo desde los valores judíos y el amor.
              </p>
              <p style={{ color: "var(--on-dark)", fontSize: "clamp(14px,1.5vw,16px)", lineHeight: 1.75 }}>
                A través de programas educativos, retiros y formaciones, acompañamos a personas de todas las edades a descubrir su propósito y construir comunidades más compasivas y conscientes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="join pad">
        <div className="glow" />
        <div className="wrap join-inner reveal">
          <span className="eyebrow" style={{ display: "inline-block" }}>Empieza hoy</span>
          <h2>¿Comenzamos tu <em>transformación</em>?</h2>
          <p>Elige el programa que mejor se adapta a tu camino y comienza esta semana.</p>
          <div className="join-actions">
            <Link href="/#programas" className="btn solid">Explorar programas →</Link>
            <Link href="/contacto" className="btn">Hablar con Devora</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
