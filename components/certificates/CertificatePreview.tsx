import type { CertificateDesign } from "@/lib/certificate-design"

export type CertificatePreviewProps = {
  studentName: string
  courseTitle: string
  certificateNumber: string
  completedAt: Date | string
  accent: string
  design: CertificateDesign
  accreditationLogos?: string[]
}

const CORNERS = [
  [18, 18, "top-left", "M2 2 L14 2 L14 5 L5 5 L5 14 L2 14 Z"],
  [18, 18, "top-right", "M30 2 L18 2 L18 5 L27 5 L27 14 L30 14 Z"],
  [18, 18, "bottom-right", "M30 30 L18 30 L18 27 L27 27 L27 18 L30 18 Z"],
  [18, 18, "bottom-left", "M2 30 L14 30 L14 27 L5 27 L5 18 L2 18 Z"],
] as const

export default function CertificatePreview({
  studentName,
  courseTitle,
  certificateNumber,
  completedAt,
  accent,
  design,
  accreditationLogos = [],
}: CertificatePreviewProps) {
  const date = typeof completedAt === "string" ? new Date(completedAt) : completedAt

  return (
    <div
      style={{
        width: "min(780px, 100%)",
        background: design.backgroundColor,
        border: `1px solid ${accent}55`,
        borderRadius: 20,
        padding: "60px 70px",
        position: "relative",
        overflow: "hidden",
        boxShadow: `0 40px 120px rgba(0,0,0,.35), 0 0 0 1px ${accent}22 inset`,
      }}
    >
      {/* Marca de agua — Árbol de las Sefirot */}
      {design.watermarkEnabled && (
        <img
          src="/brand/arbol-sefirot.webp"
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute", top: "50%", left: "50%",
            width: 300, transform: "translate(-50%,-50%)",
            opacity: design.watermarkOpacity, pointerEvents: "none",
          }}
        />
      )}

      {/* Logo de co-marca (ej. acreditación) */}
      {design.coBrandingEnabled && design.coBrandingLogoUrl && (
        <img
          src={design.coBrandingLogoUrl}
          alt=""
          aria-hidden="true"
          style={{ position: "absolute", top: 28, right: 32, height: 54, width: "auto", objectFit: "contain" }}
        />
      )}

      {/* Decoración de esquinas */}
      {CORNERS.map(([v, h, corner, d]) => {
        const s: React.CSSProperties = {
          position: "absolute", opacity: 0.45,
          ...(corner.includes("top") ? { top: v } : { bottom: v }),
          ...(corner.includes("left") ? { left: h } : { right: h }),
        }
        return (
          <svg key={corner} width="32" height="32" viewBox="0 0 32 32" style={s}>
            <path d={d} fill={accent} />
          </svg>
        )
      })}

      {/* Fondo decorativo */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 20% 80%, ${accent}10 0%, transparent 55%), radial-gradient(circle at 80% 20%, ${accent}08 0%, transparent 55%)`, pointerEvents: "none" }} />

      {/* Línea superior dorada */}
      <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${accent}80, transparent)`, marginBottom: 40 }} />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <p style={{ fontSize: 10, letterSpacing: ".45em", textTransform: "uppercase", color: accent, marginBottom: 4, opacity: .85 }}>
          ✦ &nbsp; {design.eyebrow} &nbsp; ✦
        </p>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 400, color: design.textColor, letterSpacing: ".04em" }}>
          {design.title}
        </h1>
      </div>

      {/* Ornamento central */}
      <div style={{ textAlign: "center", color: `${accent}50`, fontSize: 18, letterSpacing: 12, marginBottom: 36 }}>
        ─── ✦ ───
      </div>

      {/* Otorgado a */}
      <p style={{ textAlign: "center", fontSize: 11, letterSpacing: ".28em", textTransform: "uppercase", color: design.mutedTextColor, marginBottom: 16 }}>
        {design.awardedToLabel}
      </p>

      {/* Nombre del alumno */}
      <h2 style={{ fontFamily: "var(--serif)", fontSize: 44, fontWeight: 400, color: accent, textAlign: "center", marginBottom: 24, letterSpacing: ".02em", lineHeight: 1.1 }}>
        {studentName}
      </h2>

      <p style={{ textAlign: "center", fontSize: 14, color: design.mutedTextColor, marginBottom: 14, lineHeight: 1.7 }}>
        {design.completionText}
      </p>

      {/* Nombre del programa */}
      <h3 style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 400, color: design.textColor, textAlign: "center", marginBottom: 10 }}>
        {courseTitle}
      </h3>

      {/* Institución */}
      <p style={{ textAlign: "center", fontSize: 13, color: design.mutedTextColor, marginBottom: 50 }}>
        {design.institutionLine}
      </p>

      {/* Línea media dorada */}
      <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${accent}40, transparent)`, marginBottom: 36 }} />

      {/* Footer del certificado */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ width: 180, height: 1, background: `${accent}60`, marginBottom: 10 }} />
          <p style={{ fontSize: 14, color: design.textColor, fontWeight: 600, marginBottom: 3 }}>{design.signatureName}</p>
          <p style={{ fontSize: 11, color: accent, letterSpacing: ".16em", textTransform: "uppercase" }}>
            {design.signatureRole}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 11, color: design.mutedTextColor, marginBottom: 4, letterSpacing: ".1em", textTransform: "uppercase" }}>Fecha de emisión</p>
          <p style={{ fontSize: 13, color: design.mutedTextColor }}>
            {date.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <p style={{ fontSize: 10, color: `${accent}70`, marginTop: 10, letterSpacing: ".12em" }}>
            N° {certificateNumber}
          </p>
        </div>
      </div>

      {/* Avales por programa (ej. FGU, CEL, IDC) */}
      {accreditationLogos.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20, marginTop: 28, flexWrap: "wrap" }}>
          {accreditationLogos.map((url, i) => (
            <img key={i} src={url} alt="" aria-hidden="true" style={{ height: 24, width: "auto", objectFit: "contain", opacity: .85 }} />
          ))}
        </div>
      )}

      {/* Línea inferior */}
      <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${accent}80, transparent)`, marginTop: 40 }} />

      {/* Frase de marca */}
      <p style={{ textAlign: "center", fontSize: 11, fontStyle: "italic", color: `${accent}b0`, marginTop: 16 }}>
        {design.tagline}
      </p>
    </div>
  )
}
