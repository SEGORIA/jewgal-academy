"use client"

import Link from "next/link"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import RevealInit from "@/components/RevealInit"
import { motion } from "framer-motion"

const credentials = [
  { n: "01", category: "Coaching",            items: ["Master Coach Internacional", "Formación de Coaches Integrativa", "Life Coaching Transformador"] },
  { n: "02", category: "Mindfulness & Desarrollo", items: ["Logoterapia y Propósito", "Tratamiento del Trauma", "Mindfulness aplicado", "Desarrollo integral"] },
  { n: "03", category: "Bienestar Holístico",  items: ["Mindfulness Certificada", "Flores de Bach", "Técnica del Tapping", "Masaje Terapéutico"] },
  { n: "04", category: "Tradición & Movimiento", items: ["Cabalá Aplicada", "Expresión Corporal", "Danza Terapéutica", "Educación Judía"] },
]

const timeline = [
  { code: "AR", place: "Argentina",     period: "Inicio · Formación", event: "Comienzos en Buenos Aires. Primeros pasos en desarrollo humano, bienestar y acompañamiento integral." },
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
        .devora-tray-code  { font-family: var(--serif); font-size: 13px; color: #A76D61; font-style: italic; }
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
          .devora-tray-period { display: block; font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: #A76D61; margin-bottom: 6px; }
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
      <section className="tone-dark" style={{
        background: "linear-gradient(to bottom, #1A0806 0%, #5C2218 32%, #7A3028 52%, #3A1510 78%, #1A0806 100%)",
        paddingTop: "clamp(100px,12vw,160px)", paddingBottom: "clamp(60px,8vw,100px)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: "20%", right: "5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(167,109,97,.18),transparent 70%)", pointerEvents: "none" }} />

        <div className="wrap devora-hero-grid">
          {/* Foto */}
          <div className="devora-hero-photo">
            <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/brand/devora-hero.webp')", backgroundSize: "cover", backgroundPosition: "50% 22%" }} />
            <div style={{ position: "absolute", left: 20, bottom: 20, fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(238,244,244,.9)", background: "rgba(44,31,20,.70)", backdropFilter: "blur(4px)", padding: "8px 13px", border: "1px solid var(--line-d)", borderRadius: 4 }}>
              Master Coach Internacional · Miami
            </div>
          </div>

          {/* Texto */}
          <div>
            <span className="eyebrow" style={{ display: "block", marginBottom: 20 }}>Conoce a la fundadora</span>
            <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(38px,5vw,70px)", lineHeight: 1.02, color: "var(--text)", letterSpacing: "-.01em", marginBottom: 28 }}>
              Devora<br /><em style={{ color: "var(--gold-light)", fontStyle: "normal" }}>Benchimol</em>
            </h1>
            <div style={{ fontFamily: "var(--script)", fontStyle: "italic", fontSize: "clamp(20px,2.5vw,28px)", color: "#A76D61", marginBottom: 24, lineHeight: 1.2 }}>
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
      <section className="tone-dark" style={{ background: "linear-gradient(to bottom, #1A0806 0%, #3A1510 25%, #5C2218 50%, #3A1510 75%, #1A0806 100%)" }}>
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
              { num: "Non-Profit", label: "Fundación Sholem Corazón Valiente, EE.UU." },
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
      <section className="tone-dark" style={{ background: "linear-gradient(to bottom, #1A0806 0%, #2A1210 40%, #2A1210 60%, #1A0806 100%)" }}>
        <div className="wrap devora-section-pad" style={{ maxWidth: 860 }}>
          <span className="eyebrow reveal" style={{ display: "block", marginBottom: 28 }}>En sus palabras</span>
          <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: 20, fontSize: "clamp(15px,1.6vw,17px)", lineHeight: 1.8, color: "var(--on-dark)" }}>
            <p>Soy <strong style={{ color: "var(--text)" }}>Devora Benchimol</strong>. Master Coach Internacional, educadora, Rabbanit y fundadora de Jewgal Academy.</p>
            <p>Durante más de 40 años he acompañado personas en Argentina, Israel, Guatemala, Colombia y Estados Unidos a atravesar sus procesos más profundos — los que se viven en el cuerpo, los que duelen en el alma, y los que transforman la vida para siempre.</p>
            <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: "clamp(19px,2.2vw,24px)", color: "#A76D61", lineHeight: 1.45 }}>Mi camino no nació de un aula. Nació del encuentro real con el ser humano.</p>
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
                ["Y la mirada de la ", "educación consciente", " para que cada proceso sea también un aprendizaje que se integra y se sostiene."],
              ].map(([pre, strong, post]) => (
                <li key={strong} style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#A76D61", flexShrink: 0, transform: "translateY(-2px)" }} />
                  <span>{pre}<strong style={{ color: "var(--text)" }}>{strong}</strong>{post}</span>
                </li>
              ))}
            </ul>
            <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: "clamp(20px,2.4vw,26px)", color: "var(--text)", lineHeight: 1.4, marginTop: 8 }}>No vengo a darte respuestas.<br />Vengo a acompañarte a encontrar las tuyas.</p>
          </div>
        </div>
      </section>

      {/* ── COACHING PERSONAL 1:1 ── */}
      <section id="coaching-1-1" className="tone-dark" style={{
        background: "linear-gradient(to bottom, #1A0806 0%, #5C2218 22%, #8B3D2E 45%, #7A3028 68%, #1A0806 100%)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 40%, rgba(196,140,120,.22) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div className="wrap devora-section-pad" style={{ maxWidth: 720, position: "relative", zIndex: 1 }}>
          <span className="eyebrow reveal" style={{ display: "block", marginBottom: 20, color: "#F0D5C8" }}>Coaching personal</span>
          <h2 className="reveal" style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(28px,3.8vw,48px)", color: "#F6EEE8", letterSpacing: ".01em", lineHeight: 1.15, marginBottom: 20 }}>
            Sesiones 1:1 con Devora
          </h2>
          <p className="reveal" style={{ color: "rgba(246,238,232,.85)", fontSize: "clamp(15px,1.6vw,17px)", lineHeight: 1.75, marginBottom: 28, maxWidth: 600 }}>
            Un espacio de acompañamiento individual — vos y Devora, trabajando tu proceso particular. No es un curso ni una certificación: es tiempo dedicado enteramente a tu transformación.
          </p>

          <ul className="reveal" style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12, paddingLeft: 0, marginBottom: 32 }}>
            {[
              "Logoterapia y sentido de vida",
              "Mindfulness y regulación emocional",
              "Sabiduría de la Cábala aplicada al coaching",
              "Herramientas de expresión corporal y trabajo somático",
            ].map((item) => (
              <li key={item} style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#F0D5C8", flexShrink: 0, transform: "translateY(-2px)" }} />
                <span style={{ color: "rgba(246,238,232,.85)", fontSize: 15 }}>{item}</span>
              </li>
            ))}
          </ul>

          <div className="reveal" style={{
            display: "flex", flexWrap: "wrap", gap: "24px 48px",
            padding: "20px 24px", borderRadius: 8,
            background: "rgba(0,0,0,.15)", border: "1px solid rgba(246,238,232,.15)",
            marginBottom: 32,
          }}>
            <div>
              <div style={{ fontSize: 10.5, letterSpacing: ".18em", textTransform: "uppercase", color: "#F0D5C8", marginBottom: 4 }}>Modalidad</div>
              <div style={{ fontSize: 14.5, color: "rgba(246,238,232,.85)" }}>Online o presencial — a coordinar</div>
            </div>
            <div>
              <div style={{ fontSize: 10.5, letterSpacing: ".18em", textTransform: "uppercase", color: "#F0D5C8", marginBottom: 4 }}>Duración y precio</div>
              <div style={{ fontSize: 14.5, color: "rgba(246,238,232,.85)" }}>Se definen en la primera conversación, según tu proceso</div>
            </div>
          </div>

          <Link href="/contacto" className="btn solid">Agendar mi sesión de coaching →</Link>
        </div>
      </section>

      {/* ── DOCUMENTAL ── */}
      <section className="tone-dark" style={{ background: "linear-gradient(to bottom, #1A0806 0%, #1A0806 100%)", padding: "clamp(60px,8vw,100px) 36px", position: "relative", overflow: "hidden" }}>
        {/* Glow terracota central */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 1000, height: 600, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(167,109,97,.28) 0%,rgba(167,109,97,.06) 45%,transparent 70%)", pointerEvents: "none" }} />
        {/* Borde superior terracota */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#A76D61 30%,#C49F72 50%,#A76D61 70%,transparent)", opacity: 0.7, pointerEvents: "none" }} />

        <div className="wrap" style={{ maxWidth: 920, position: "relative", zIndex: 2 }}>

          {/* Header centrado */}
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <span className="eyebrow reveal" style={{ display: "block", marginBottom: 16, color: "#A76D61" }}>Documental</span>
            <h2 className="reveal" style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(26px,3.5vw,48px)", color: "var(--text)", letterSpacing: ".01em", lineHeight: 1.15, marginBottom: 14 }}>
              Escúchala en sus propias <em style={{ color: "#A76D61", fontStyle: "normal" }}>palabras</em>
            </h2>
            <p className="reveal" style={{ fontSize: 13, letterSpacing: ".08em", color: "rgba(246,238,232,.55)" }}>
              Dirigido por <span style={{ color: "#A76D61" }}>Devora Benchimol</span>
            </p>
          </div>

          {/* Contenedor del video — glow dorado */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: [0.16,1,0.3,1] }}
            style={{
              position: "relative",
              borderRadius: 14,
              overflow: "hidden",
              boxShadow: "0 0 0 1px rgba(167,109,97,.55), 0 40px 100px rgba(0,0,0,.65), 0 0 100px rgba(167,109,97,.35)",
            }}
          >
            {/* Línea terracota superior */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#A76D61,transparent)", zIndex: 3, pointerEvents: "none" }} />

            {/* 16:9 */}
            <div style={{ position: "relative", paddingTop: "56.25%", background: "var(--navy)" }}>
              <iframe
                src="https://www.youtube-nocookie.com/embed/6zZ2TgC8_gk?rel=0&modestbranding=1&color=white"
                title="Devora Benchimol — Documental"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
              />
            </div>
          </motion.div>

          {/* Cita debajo */}
          <p className="reveal" style={{
            textAlign: "center",
            fontFamily: "var(--script)", fontStyle: "italic",
            fontSize: "clamp(16px,2vw,21px)",
            color: "#A76D61", opacity: 0.9,
            marginTop: 32, lineHeight: 1.4,
          }}>
            "Más de 40 años acompañando procesos de transformación real."
          </p>
        </div>
      </section>

      {/* ── MISIÓN ── */}
      <section className="tone-dark" style={{
        background: "linear-gradient(to bottom, #1A0806 0%, #5C2218 20%, #8B3D2E 45%, #A76D61 55%, #7A3028 78%, #1A0806 100%)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, rgba(196,140,120,.22) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="wrap devora-section-pad" style={{ position: "relative", zIndex: 1 }}>
          <span className="eyebrow reveal" style={{ display: "block", marginBottom: 24, color: "#F0D5C8" }}>Mi misión</span>
          <p className="reveal" style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(20px,3vw,40px)", color: "#F6EEE8", lineHeight: 1.35, maxWidth: 820, letterSpacing: ".01em" }}>
            "Facilitar procesos de transformación que integren mente, cuerpo y alma,
            ayudando a cada persona a alcanzar su máximo potencial y liderazgo personal."
          </p>
        </div>
      </section>

      {/* ── CREDENCIALES ── */}
      <section className="tone-dark" style={{ background: "linear-gradient(to bottom, #1A0806 0%, #2A1210 35%, #3A1810 50%, #2A1210 65%, #1A0806 100%)" }}>
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
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#A76D61", flexShrink: 0 }} />
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
      <section className="tone-dark" style={{ background: "linear-gradient(to bottom, #1A0806 0%, #2A1210 40%, #3A1510 55%, #2A1210 75%, #1A0806 100%)", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, opacity: .35, backgroundImage: "radial-gradient(1px 1px at 20% 30%,#A76D61,transparent),radial-gradient(1px 1px at 70% 60%,#C49F72,transparent),radial-gradient(1px 1px at 50% 80%,#A76D61,transparent)" }} />
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
      <section className="tone-dark" style={{ background: "linear-gradient(to bottom, #1A0806 0%, #3A1510 25%, #6B2E22 50%, #3A1510 75%, #1A0806 100%)" }}>
        <div className="wrap devora-section-pad">
          <div className="devora-fund-grid">
            <div className="reveal">
              <span className="eyebrow" style={{ display: "block", marginBottom: 20 }}>Impacto Social</span>
              <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(26px,3.2vw,46px)", color: "var(--text)", lineHeight: 1.1, marginBottom: 20 }}>
                Fundación Sholem<br /><em style={{ color: "var(--gold-light)", fontStyle: "normal" }}>Corazón Valiente</em>
              </h2>
              <div style={{ display: "inline-block", border: "1px solid var(--line-d)", borderRadius: 4, padding: "8px 16px", fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", marginTop: 8 }}>
                Non-Profit Organization · Miami, Florida
              </div>
            </div>
            <div className="reveal">
              <p style={{ color: "var(--on-dark)", fontSize: "clamp(14px,1.5vw,16px)", lineHeight: 1.75, marginBottom: 18 }}>
                Fundada por <strong style={{ color: "var(--text)" }}>Devora Benchimol</strong>, CEO y creadora. Organización sin fines de lucro comprometida con inspirar, empoderar y formar líderes con corazón valiente, comprometidos con transformar el mundo desde los valores judíos y el amor.
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
