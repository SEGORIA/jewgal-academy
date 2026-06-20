import { PlayCircle, Clock, Lock } from "lucide-react"

const mockRecordings = [
  { id: "1", title: "Clase 1 – Bienvenida e Introducción",            moduleNumber: 1, duration: "1h 20min", videoUrl: null, isAvailable: false },
  { id: "2", title: "Clase 2 – Herramientas de Auto-conocimiento",    moduleNumber: 1, duration: "1h 05min", videoUrl: null, isAvailable: false },
]

const card: React.CSSProperties = {
  background: "rgba(255,255,255,.03)",
  border: "1px solid rgba(165,141,102,.14)",
  borderRadius: 14,
}

export default function GrabacionesPage() {
  const available = mockRecordings.filter((r) => r.isAvailable)
  const coming    = mockRecordings.filter((r) => !r.isAvailable)

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <span style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold,#A58D66)", display: "block", marginBottom: 10 }}>
          Aula Virtual
        </span>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 38, color: "#eef4f4", marginBottom: 8 }}>
          Grabaciones
        </h1>
        <p style={{ color: "rgba(224,233,234,.5)", fontSize: 15 }}>
          Revisá las clases pasadas cuando quieras.
        </p>
      </div>

      {/* Disponibles */}
      {available.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "#6BBF8E", marginBottom: 16 }}>
            Disponibles
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {available.map((rec) => (
              <div key={rec.id} style={{ ...card, overflow: "hidden" }}>
                <div style={{ aspectRatio: "16/9", background: "linear-gradient(135deg,#0b2535,#081E29)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(165,141,102,.2)", border: "2px solid rgba(165,141,102,.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <PlayCircle size={32} style={{ color: "var(--gold,#A58D66)" }} />
                  </div>
                </div>
                <div style={{ padding: "20px 24px" }}>
                  <h3 style={{ fontWeight: 600, color: "#eef4f4", fontSize: 15, marginBottom: 8 }}>{rec.title}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(224,233,234,.4)" }}>
                    <Clock size={12} style={{ color: "var(--gold,#A58D66)" }} />
                    {rec.duration} · Módulo {rec.moduleNumber}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Próximamente */}
      <section>
        <p style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(224,233,234,.3)", marginBottom: 16 }}>
          Próximamente
        </p>

        {available.length === 0 && (
          <div style={{ ...card, padding: "44px 32px", textAlign: "center", marginBottom: 16, borderColor: "rgba(165,141,102,.1)" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(165,141,102,.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
              <Lock size={24} style={{ color: "var(--gold,#A58D66)" }} />
            </div>
            <h3 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 20, color: "#eef4f4", marginBottom: 8 }}>
              Las grabaciones estarán disponibles pronto
            </h3>
            <p style={{ color: "rgba(224,233,234,.4)", fontSize: 14, lineHeight: 1.7, maxWidth: 440, margin: "0 auto" }}>
              Después de cada clase en vivo, Devora sube la grabación aquí para que puedas revisarla cuando quieras.
            </p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {coming.map((rec) => (
            <div key={rec.id} style={{ ...card, display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", opacity: 0.45 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(255,255,255,.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <PlayCircle size={18} style={{ color: "rgba(224,233,234,.3)" }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 500, color: "#eef4f4", fontSize: 14 }}>{rec.title}</p>
                <p style={{ fontSize: 12, color: "rgba(224,233,234,.35)", marginTop: 2 }}>Módulo {rec.moduleNumber} · {rec.duration}</p>
              </div>
              <span style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(165,141,102,.5)", border: "1px solid rgba(165,141,102,.2)", borderRadius: 20, padding: "4px 12px" }}>
                Pronto
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
