"use client"

import { useEffect } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import Image from "next/image"
import Navbar from "@/components/Navbar"
import HeroVideo from "@/components/HeroVideo"
import Footer from "@/components/Footer"
import { TiltCard } from "@/components/motion/TiltCard"
import { FloatingParticles } from "@/components/motion/FloatingParticles"
import { CursorLight } from "@/components/motion/CursorLight"
import MagneticButton from "@/components/motion/MagneticButton"

// Mapa interactivo: below-the-fold y con código propio → se carga diferido
const ComunidadMap = dynamic(() => import("@/components/ComunidadMap"), {
  ssr: false,
  loading: () => <div style={{ minHeight: 360 }} aria-hidden="true" />,
})

const CERT_INSTITUTES = [
  { slug: "idc",           name: "IDC",  fullName: "International Development Community" },
  { slug: "hbdt",          name: "HBDT", fullName: "Acreditación Institución de Formación en Desarrollo Humano" },
  { slug: "hdp",           name: "HDP",  fullName: "Programas de Desarrollo Humano" },
  { slug: "thd",           name: "THD",  fullName: "Acreditación de Entrenador Humano" },
  { slug: "cel",           name: "CEL",  fullName: "Center for Executive Leadership" },
  { slug: "fgu",           name: "FGU",  fullName: "Florida Global University" },
  { slug: "global-coaching", name: "GC", fullName: "Global Coaching Federation" },
  { slug: "fundacion",     name: "FSC",  fullName: "Fundación Sholem Corazón Valiente" },
]

const PROGRAMS = [
  { slug: "life-coaching-integrativo", title: "Life Coaching Integrativo",   desc: "Formación integral para el cambio.", price: "$1.500", free: false, img: "/brand/programs/life-coaching.jpg" },
  { slug: "joogal-adultos",            title: "Instructor Jewgal · Adultos", desc: "Certifícate como instructor oficial del método Jewgal.", price: "Gratis", free: true, img: "/brand/programs/joogal-adultos.jpg" },
  { slug: "joogalkids",                title: "Instructor Joogalkids",       desc: "Formando a los guías del desarrollo infantil.", price: "$360", free: false, img: "/brand/programs/joogalkids.jpg" },
  { slug: "metodo-sholem",             title: "Método Sholem",               desc: "Formación de instructores para líderes adolescentes.", price: "$360", free: false, img: "/brand/programs/metodo-sholem.jpg" },
  { slug: "cabala-coach",              title: "Micro Curso · Cábala Coach",  desc: "Sabiduría milenaria aplicada al bienestar personal.", price: "$360", free: false, img: "/brand/programs/cabala-coach.svg" },
]

export default function HomePage() {
  /* ── Animaciones: IntersectionObserver + count-up + progress bars ── */
  useEffect(() => {
    const hero = document.getElementById("hero")
    if (hero) requestAnimationFrame(() => hero.classList.add("in"))

    const animateCount = (el: HTMLElement) => {
      const to = +(el.dataset.to ?? 0)
      const dur = 1600
      const t0 = performance.now()
      const fmt = (n: number) => to >= 1000 ? Math.round(n).toLocaleString("es") : Math.round(n) + (to >= 30 ? "+" : "")
      const tick = (t: number) => {
        const p = Math.min((t - t0) / dur, 1)
        const e = 1 - Math.pow(1 - p, 3)
        el.textContent = fmt(to * e)
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const el = entry.target as HTMLElement
        el.classList.add("show")
        el.querySelectorAll<HTMLElement>("[data-to]").forEach(animateCount)
        if (el.dataset.to) animateCount(el)
        el.querySelectorAll<HTMLElement>(".bar i").forEach((b) => { b.style.width = (b.dataset.w ?? "0") + "%" })
        if (el.id === "ruta") el.classList.add("in")
        io.unobserve(el)
      })
    }, { threshold: 0.18, rootMargin: "0px 0px -6% 0px" })

    document.querySelectorAll<HTMLElement>(".reveal, .stat, [data-to], #ruta").forEach((el, i) => {
      el.style.transitionDelay = ((i % 5) * 0.07) + "s"
      io.observe(el)
    })
    document.querySelectorAll<HTMLElement>(".stat .num, .com-side .big").forEach((el) => io.observe(el))
    document.querySelectorAll<HTMLElement>(".campus").forEach((c) => io.observe(c))

    return () => io.disconnect()
  }, [])

  return (
    <>
      <Navbar />

      {/* ── HERO ── */}
      <header className="hero" id="hero">
        {/* Video hero con carga inteligente (fondo premium instantáneo + video diferido) */}
        <HeroVideo />

        {/* Gradiente oscuro izquierda → transparente derecha */}
        <div className="hero-overlay" />

        {/* Partículas flotantes decorativas */}
        <FloatingParticles />

        {/* Luz de cursor — ilumina el hero al pasar el mouse */}
        <CursorLight />

        {/* Circuit SVG — esquina inferior izquierda */}
        <svg className="circuit" viewBox="0 0 460 280" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g stroke="#A76D61" strokeWidth="0.9" opacity="0.55">
            <path d="M20 240 L60 240 L60 200 L120 200 L120 160 L200 160 L200 120 L270 120"/>
            <path d="M20 215 L45 215 L45 175 L105 175 L105 135 L185 135"/>
            <path d="M140 250 L180 250 L180 210 L260 210 L260 175"/>
            <path d="M80 265 L80 240"/>
            <path d="M200 265 L200 250 L245 250"/>
            <path d="M300 205 L350 205 L350 165 L400 165"/>
            <path d="M270 120 L270 80 L320 80"/>
            <path d="M185 135 L185 95 L245 95"/>
          </g>
          <g fill="#A58D66">
            <circle cx="60"  cy="240" r="3" opacity=".85"/>
            <circle cx="60"  cy="200" r="3" opacity=".85"/>
            <circle cx="120" cy="200" r="3" opacity=".85"/>
            <circle cx="120" cy="160" r="4" opacity=".9"/>
            <circle cx="200" cy="160" r="3" opacity=".85"/>
            <circle cx="200" cy="120" r="3" opacity=".85"/>
            <circle cx="270" cy="120" r="4.5" opacity=".95"/>
            <circle cx="260" cy="210" r="3" opacity=".8"/>
            <circle cx="350" cy="205" r="3" opacity=".7"/>
            <circle cx="270" cy="80"  r="3" opacity=".75"/>
            <circle cx="185" cy="95"  r="3" opacity=".75"/>
          </g>
          <g fill="#A76D61">
            <circle cx="45"  cy="215" r="2.5" opacity=".8"/>
            <circle cx="105" cy="175" r="2.5" opacity=".8"/>
            <circle cx="185" cy="135" r="3" opacity=".85"/>
            <circle cx="180" cy="250" r="2.5" opacity=".7"/>
          </g>
          {/* Glow en nodos principales */}
          <circle cx="120" cy="160" r="9" fill="#A58D66" opacity=".12"/>
          <circle cx="270" cy="120" r="11" fill="#CBB78B" opacity=".1"/>
        </svg>

        {/* Contenido izquierda */}
        <div className="wrap">
          <div className="hero-inner">
            <span className="eyebrow">Jewgal Academy</span>
            <h1>
              <span className="ln"><span>Sabiduría para vivir.</span></span>
              <span className="ln"><span><em>Liderazgo para transformar.</em></span></span>
            </h1>
            <p>Programas, certificaciones y experiencias diseñadas para desarrollar resiliencia, bienestar emocional y crecimiento espiritual. Únete a una comunidad global de aprendizaje con propósito.</p>
            <div className="hero-cta">
              <MagneticButton href="#programas" className="btn solid">Explorar programas →</MagneticButton>
              <MagneticButton href="/conoce-a-devora" className="btn">Conocer a Devora</MagneticButton>
            </div>
          </div>
        </div>

        {/* Play button decorativo — lado derecho */}
        <div className="play">
          <span className="circle">
            <svg width="20" height="22" viewBox="0 0 20 22"><path d="M0 0l20 11L0 22z" fill="currentColor"/></svg>
          </span>
          <span>Ver vídeo<br/>institucional</span>
        </div>

        {/* Dots navegación */}
        <div className="dots">
          <i /><i /><i className="on" /><i /><i />
        </div>
      </header>

      {/* ── STATS ── */}
      <section className="stats">
        <div className="wrap">
          <div className="stats-grid">
            <div className="stat reveal">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" strokeWidth="1.3">
                <path d="M2 8l10-5 10 5-10 5z"/><path d="M6 10v5c0 1 3 3 6 3s6-2 6-3v-5"/>
              </svg>
              <div><div className="num" data-to="40">0</div><div className="lbl">Años de<br/>trayectoria</div></div>
            </div>
            <div className="stat reveal">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" strokeWidth="1.3">
                <circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>
              </svg>
              <div><div className="num" data-to="4">0</div><div className="lbl">Países: Argentina,<br/>Israel, Colombia, EE.UU.</div></div>
            </div>
            <div className="stat reveal">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" strokeWidth="1.3">
                <circle cx="12" cy="9" r="5"/><path d="M9 13l-1 8 4-2 4 2-1-8"/>
              </svg>
              <div><div className="num" data-to="5">0</div><div className="lbl">Programas y<br/>certificaciones</div></div>
            </div>
            <div className="stat reveal">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" strokeWidth="1.3">
                <circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/>
                <path d="M2 20c0-3 3-5 6-5s6 2 6 5M14 15c3 0 6 2 6 5"/>
              </svg>
              <div>
                <div className="num serif" style={{ fontSize: 30 }}>501(c)(3)</div>
                <div className="lbl">Fundación Sholem<br/>Corazón Valiente</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROGRAMAS ── */}
      <section className="programas pad" id="programas">
        <div className="wrap">
          <div className="prog-head reveal">
            <h2>Programas destacados</h2>
            <Link href="/#programas">Ver todos los programas →</Link>
          </div>
          <p className="reveal" style={{ color: "var(--ink-soft)", fontSize: 14.5, marginTop: -34, marginBottom: 40, maxWidth: 580, lineHeight: 1.6 }}>
            Modalidad <strong style={{ color: "var(--ink)" }}>presencial, online o híbrida</strong> según el programa — elige la que mejor se adapte a tu ritmo y lugar.
          </p>
          <div className="prog-grid">
            {PROGRAMS.map((p) => (
              <TiltCard key={p.slug} className="reveal" radius={6}>
                <Link href={`/programas/${p.slug}`} className="pcard">
                  <div className="thumb">
                    <Image
                      src={p.img}
                      alt={p.title}
                      width={600}
                      height={400}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </div>
                  <div className="body">
                    <h3>{p.title}</h3>
                    <p>{p.desc}</p>
                    <div className={`price${p.free ? " free" : ""}`}>{p.price}</div>
                    <span className="go">Ver programa →</span>
                  </div>
                </Link>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIFERENCIADOR · 3 DIMENSIONES ── */}
      <section style={{ background: "var(--navy-2)", borderTop: "1px solid var(--line-d)", borderBottom: "1px solid var(--line-d)" }}>
        <div className="wrap" style={{ padding: "clamp(64px,8vw,110px) 0" }}>
          <div className="reveal" style={{ textAlign: "center", maxWidth: 700, margin: "0 auto clamp(40px,5vw,64px)" }}>
            <span className="eyebrow" style={{ display: "inline-block", marginBottom: 18 }}>Qué nos hace únicos</span>
            <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(28px,4vw,48px)", color: "var(--text)", lineHeight: 1.12, marginBottom: 18 }}>
              Integramos tres dimensiones que <em style={{ fontStyle: "normal", color: "var(--gold-light)" }}>rara vez conviven</em> en una misma formación
            </h2>
            <p style={{ color: "var(--on-dark)", fontSize: "clamp(15px,1.6vw,17px)", lineHeight: 1.7 }}>
              El rigor de la ciencia, la profundidad del desarrollo humano y la sabiduría espiritual — unidos en un solo camino de transformación.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "clamp(20px,2.5vw,32px)" }}>
            {[
              { n: "01", title: "Rigor profesional",    desc: "Método con respaldo científico y certificación reconocida.", items: ["Coaching avalado", "Regulación emocional", "Logoterapia"] },
              { n: "02", title: "Desarrollo humano",    desc: "Herramientas para crecer y para acompañar a otros.",          items: ["Resiliencia", "Autoconocimiento", "Liderazgo consciente"] },
              { n: "03", title: "Sabiduría espiritual", desc: "La raíz ancestral como mapa del alma y del propósito.",       items: ["Cábala", "Consciencia", "Propósito de vida"] },
            ].map((d) => (
              <div key={d.n} className="reveal" style={{ background: "var(--surface)", border: "1px solid var(--line-d)", borderRadius: "var(--r-lg)", padding: "clamp(28px,3vw,38px)" }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: 13, fontStyle: "italic", color: "var(--gold)", marginBottom: 14 }}>{d.n}</div>
                <h3 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(20px,2.2vw,26px)", color: "var(--text)", marginBottom: 10 }}>{d.title}</h3>
                <p style={{ color: "var(--on-dark)", fontSize: 14.5, lineHeight: 1.6, marginBottom: 20 }}>{d.desc}</p>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, padding: 0 }}>
                  {d.items.map((it) => (
                    <li key={it} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--text-strong)" }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--gold)", flexShrink: 0 }} />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FUNDADORA ── */}
      <section className="fundadora pad" id="fundadora">
        <div className="wrap">
          <div className="fund-grid">
            <div className="fund-photo reveal">
              <div className="bg" style={{ backgroundImage: "url('/brand/devora-portrait.webp')" }} />
              <div className="mono">D</div>
              <div className="tag">Devora Benchimol</div>
            </div>
            <div className="fund-copy reveal">
              <span className="eyebrow">Conoce a la fundadora</span>
              <h2>Devora Benchimol</h2>
              <div className="sig">Master Coach Internacional · Educadora</div>
              <p>Más de 40 años facilitando procesos de transformación que integran mente, cuerpo y alma, con trayectoria internacional en Argentina, Israel, Colombia y Estados Unidos.</p>
              <p>Su método une Logoterapia y sentido de vida, Mindfulness y regulación del trauma, la sabiduría de la Cábala aplicada al coaching, y retiros de bienestar profundo.</p>
              <div className="fund-mission-block">
                <span className="fund-mission-icon" aria-hidden="true">✦</span>
                <p>Este trabajo forma parte de la misión de la <strong>Fundación Sholem Corazón Valiente</strong>, organización sin fines de lucro registrada como <strong>501(c)(3)</strong> en los Estados Unidos, creada para inspirar, empoderar y formar líderes con corazón valiente comprometidos con transformar el mundo.</p>
              </div>
              <Link href="/conoce-a-devora" className="btn">Conoce su historia →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── AVALES Y CERTIFICACIONES ── */}
      <section className="avales-section">
        <div className="wrap">
          <p className="avales-label">Avales y certificaciones</p>
          <div className="avales-grid">
            {CERT_INSTITUTES.map((inst) => (
              <div key={inst.slug} className="aval-item" title={inst.fullName}>
                <img
                  src={`/brand/certs/${inst.slug}.webp`}
                  alt={inst.fullName}
                  loading="lazy"
                  decoding="async"
                  className="aval-logo"
                  onLoad={(e) => {
                    const t = e.currentTarget as HTMLImageElement
                    t.classList.add("loaded")
                    const badge = t.nextElementSibling as HTMLElement
                    if (badge) badge.style.opacity = "0"
                  }}
                />
                <span className="aval-badge">{inst.name}</span>
              </div>
            ))}
          </div>
          <p className="avales-note">
            Certificado por institutos y organizaciones reconocidas internacionalmente.
          </p>
        </div>
      </section>

      {/* ── RUTA DE APRENDIZAJE ── */}
      <section className="ruta pad" id="ruta">
        <div className="stars" />
        <div className="wrap">
          <div className="ruta-head reveal">
            <span className="eyebrow">Ruta de aprendizaje</span>
            <h2 className="serif">Un camino probado para tu transformación</h2>
          </div>
          <div style={{ position: "relative" }}>
            <svg className="path-svg" viewBox="0 0 1000 60" preserveAspectRatio="none">
              <path d="M40 30 Q170 -10 290 30 T540 30 T790 30 T960 30"/>
            </svg>
            <div className="steps">
              {[
                { n: "01", title: "Descubre",   desc: "Conecta contigo y define tu propósito.", icon: <><circle cx="12" cy="12" r="9"/><path d="M16 8l-2 6-6 2 2-6z"/></> },
                { n: "02", title: "Aprende",    desc: "Adquiere conocimientos y herramientas clave.", icon: <path d="M3 5h7a2 2 0 012 2v12a3 3 0 00-3-3H3zM21 5h-7a2 2 0 00-2 2v12a3 3 0 013-3h6z"/> },
                { n: "03", title: "Integra",    desc: "Aplica en tu vida y genera nuevos hábitos.", icon: <><path d="M12 21c5-3 7-7 7-11a7 7 0 00-14 0c0 4 2 8 7 11z"/><path d="M12 3v18"/></> },
                { n: "04", title: "Transforma", desc: "Vive tu mejor versión en coherencia.", icon: <path d="M12 12c-2-5-9-5-9 0 0 4 9 8 9 8s9-4 9-8c0-5-7-5-9 0z"/> },
                { n: "05", title: "Lidera",     desc: "Inspira y guía a otros en su camino.", icon: <path d="M12 3l2.5 6H21l-5 4 2 7-6-4-6 4 2-7-5-4h6.5z"/> },
              ].map((s) => (
                <div key={s.n} className="step reveal">
                  <div className="ring">
                    <svg width="30" height="30" viewBox="0 0 24 24" strokeWidth="1.3" fill="none">{s.icon}</svg>
                  </div>
                  <span className="n">{s.n}</span>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section className="testi pad" id="testimonios">
        <div className="wrap">
          <div className="ruta-head reveal" style={{ marginBottom: 56 }}>
            <span className="eyebrow">Testimonios</span>
            <h2 className="serif" style={{ color: "var(--text)", fontSize: "clamp(28px,4vw,48px)", marginTop: 10 }}>Vidas que ya se transformaron</h2>
          </div>
          <div className="testi-grid">
            {[
              { text: "Qué bendición cruzarse con maestros tan empáticos que no solo educan, sino que muchas veces rescatan. Sus clases crean una profunda conexión entre quienes participamos.", who: "Constanza Wohlgemut" },
              { text: "Tus clases de coaching y Cábala han sido un faro en mi camino, ayudándome a comprender no solo la materia, sino aspectos de mi propia vida. Estas enseñanzas me han transformado.", who: "Diana Atri" },
              { text: "De todo corazón quiero agradecerte. Eres una guía invaluable; tu dedicación y sabiduría han marcado profundamente mi camino.", who: "Andrea Gálvez" },
            ].map((t) => (
              <TiltCard key={t.who} className="reveal" radius={8} intensity={5}>
                <div className="tcard">
                  <div className="qm">&ldquo;</div>
                  <p>{t.text}</p>
                  <div className="who">{t.who}</div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMUNIDAD / MAPA INTERACTIVO ── */}
      <section className="comunidad pad" id="comunidad">
        <div className="wrap">
          <ComunidadMap />
        </div>
      </section>

      {/* ── FEATURES + CAMPUS ── */}
      <section className="features pad" id="features">
        <div className="wrap">
          <div className="feat-grid">
            {[
              { title: "Biblioteca Premium",  desc: "Artículos, meditaciones, podcasts y masterclasses exclusivas.", go: "Explorar recursos →",
                icon: <><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></> },
              { title: "Comunidad Global",    desc: "Conéctate con estudiantes y mentores en todos los continentes.", go: "Ir a la comunidad →",
                icon: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></> },
              { title: "Eventos y Retiros",   desc: "Experiencias presenciales y virtuales que transforman.", go: "Ver próximos eventos →",
                icon: <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></> },
              { title: "Campus Virtual",      desc: "Tu espacio de aprendizaje personalizado, disponible 24/7.", go: "Ingresar al campus →",
                icon: <><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></> },
            ].map((f) => (
              <TiltCard key={f.title} className="reveal" radius={8} intensity={5}>
                <div className="feat">
                  <div className="ico">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.5">{f.icon}</svg>
                  </div>
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                  <span className="go">{f.go}</span>
                </div>
              </TiltCard>
            ))}
          </div>

          {/* Campus dashboard preview */}
          <div className="campus reveal">
            <div className="campus-l">
              <span className="eyebrow">Campus virtual</span>
              <h3>Tu espacio de aprendizaje personalizado</h3>
              <p>Accede a tu campus, conecta con la comunidad y continúa tu transformación cada día.</p>
              <Link href="/aula" className="btn solid" style={{ alignSelf: "flex-start" }}>Ir al campus →</Link>
            </div>
            <div className="campus-r">
              <div className="dash-top">
                <b>¡Hola!</b>
                <span>Mis cursos</span>
              </div>
              {[
                { name: "Life Coaching Integrativo", pct: 35 },
                { name: "Micro Curso · Cábala Coach", pct: 72 },
                { name: "Método Sholem", pct: 20 },
              ].map((c) => (
                <div key={c.name} className="course">
                  <div className="ci" />
                  <div className="meta">
                    <strong>{c.name}</strong>
                    <div className="bar"><i data-w={c.pct} /></div>
                  </div>
                  <span className="pct">{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── JOIN / CTA ── */}
      <section className="join pad">
        <div className="glow" />
        <div className="wrap join-inner reveal">
          <span className="eyebrow" style={{ display: "inline-block" }}>Únete a la comunidad</span>
          <h2>Aprende, crece y <em>transforma vidas</em> desde el propósito.</h2>
          <p>Una comunidad que se forma para guiar. Elige el plan que acompaña tu camino y empieza hoy.</p>
          <div className="join-actions">
            <Link href="#programas" className="btn solid">Empieza ahora →</Link>
            <span className="price-line">desde <b>$360</b></span>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
