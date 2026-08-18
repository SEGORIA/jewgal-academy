import fs from "node:fs"
import path from "node:path"
import { Document, Page, View, Text, Image, Svg, Path, Font, StyleSheet } from "@react-pdf/renderer"
import { DEFAULT_CERTIFICATE_DESIGN, type CertificateDesign } from "@/lib/certificate-design"

const FONT_DIR = path.join(process.cwd(), "public", "fonts")
const WATERMARK_PATH = path.join(process.cwd(), "public", "brand", "arbol-sefirot.png")

// <Image src="/ruta/absoluta"> intenta resolverla con fetch() (incluso en
// Node), que no entiende rutas de filesystem y falla en silencio. Se lee el
// archivo una sola vez con fs y se pasa el Buffer directo, que react-pdf sí
// acepta de forma nativa.
let watermarkBuffer: Buffer | null = null
function getWatermarkBuffer(): Buffer {
  if (!watermarkBuffer) watermarkBuffer = fs.readFileSync(WATERMARK_PATH)
  return watermarkBuffer
}

// El decodificador de imágenes de react-pdf (@react-pdf/image) solo entiende
// JPEG/PNG/SVG — un buffer webp no tira error, simplemente no se dibuja
// (mismo motivo por el que la marca de agua se convirtió a PNG, ver arriba).
// Cloudinary permite forzar el formato de entrega insertando "f_png" como
// transformación en la URL, así el archivo puede seguir subiéndose como
// webp (más liviano para la web) sin romper el render en el PDF.
function toPdfCompatibleUrl(url: string): string {
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", "/upload/f_png/")
  }
  return url
}

// Igual que la marca de agua: no se le pasa la URL directo a <Image>, que
// intentaría resolverla con el fetch propio de react-pdf (no probado en
// este código — si falla a mitad de un renderToBuffer(), se pierde todo el
// certificado, no solo el logo). Se trae a un Buffer antes de renderizar;
// si el fetch falla, se degrada a "sin logo" en vez de romper la emisión.
export async function fetchCoBrandingLogoBuffer(url: string | null | undefined): Promise<Buffer | null> {
  if (!url) return null
  try {
    const res = await fetch(toPdfCompatibleUrl(url))
    if (!res.ok) return null
    return Buffer.from(await res.arrayBuffer())
  } catch {
    return null
  }
}

// Avales por programa (ej. FGU, CEL, IDC) — mismo cuidado que la co-marca:
// cada logo se resuelve a un Buffer antes de renderizar, nunca se le pasa
// la URL cruda a <Image>. Acepta tanto rutas locales de public/brand/certs/
// (fs.readFileSync, como la marca de agua) como URLs remotas de Cloudinary
// (fetch, como la co-marca) — un logo individual que falla se descarta sin
// abortar los demás ni el certificado entero. Los archivos locales viven en
// webp (livianos para la web); acá se lee su gemelo .png ya convertido, no
// el webp original, por la misma limitación de react-pdf de arriba.
export async function fetchAccreditationLogoBuffers(urls: (string | null)[]): Promise<Buffer[]> {
  const results = await Promise.all(
    urls.filter((u): u is string => !!u).map(async (url): Promise<Buffer | null> => {
      try {
        if (url.startsWith("/")) {
          const pdfPath = url.endsWith(".webp") ? url.replace(/\.webp$/, ".png") : url
          return fs.readFileSync(path.join(process.cwd(), "public", pdfPath))
        }
        const res = await fetch(toPdfCompatibleUrl(url))
        if (!res.ok) return null
        return Buffer.from(await res.arrayBuffer())
      } catch {
        return null
      }
    })
  )
  return results.filter((b): b is Buffer => !!b)
}

let fontsRegistered = false
function ensureFontsRegistered() {
  if (fontsRegistered) return
  Font.register({
    family: "Cormorant Garamond",
    fonts: [
      { src: path.join(FONT_DIR, "CormorantGaramond-Regular.ttf"), fontWeight: 400 },
      { src: path.join(FONT_DIR, "CormorantGaramond-Medium.ttf"), fontWeight: 500 },
      { src: path.join(FONT_DIR, "CormorantGaramond-Italic.ttf"), fontStyle: "italic" },
    ],
  })
  fontsRegistered = true
}

// Último recurso si ni el diseño guardado ni data.accent traen nada — no
// debería alcanzarse nunca en la práctica.
const FALLBACK_ACCENT = "#846145"

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
]

function formatFecha(d: Date): string {
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`
}

// Los colores viven en el diseño (editable) y se mezclan acá abajo al
// renderizar — el StyleSheet solo define layout (posición, tamaño, espaciado).
const styles = StyleSheet.create({
  page: {
    fontFamily: "Cormorant Garamond",
  },
  watermark: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 300,
    height: 300,
    marginLeft: -150,
    marginTop: -150,
  },
  outerBorder: {
    position: "absolute",
    top: 22, left: 22, right: 22, bottom: 22,
    borderWidth: 1,
  },
  innerBorder: {
    position: "absolute",
    top: 28, left: 28, right: 28, bottom: 28,
    borderWidth: 0.75,
  },
  content: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    paddingTop: 56,
    paddingBottom: 44,
    paddingHorizontal: 90,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  hr: {
    height: 1,
    width: 320,
  },
  eyebrowRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 22,
    marginBottom: 14,
  },
  eyebrow: {
    fontSize: 10.5,
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 27,
    fontWeight: 400,
    letterSpacing: 1.5,
    marginBottom: 22,
  },
  dividerRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 26,
  },
  smallLine: {
    height: 0.75,
    width: 60,
  },
  label: {
    fontSize: 10,
    letterSpacing: 2.6,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  studentName: {
    fontSize: 40,
    fontWeight: 500,
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  bodyText: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 12,
  },
  courseTitle: {
    fontSize: 22,
    fontWeight: 400,
    textAlign: "center",
    marginBottom: 8,
  },
  subText: {
    fontSize: 11.5,
    textAlign: "center",
    marginBottom: 30,
  },
  footerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: "auto",
  },
  signatureLine: {
    width: 160,
    height: 0.75,
    marginBottom: 8,
  },
  signatureName: {
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 3,
  },
  signatureRole: {
    fontSize: 9.5,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  metaLabel: {
    fontSize: 9.5,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 3,
    textAlign: "right",
  },
  metaValue: {
    fontSize: 12,
    textAlign: "right",
    marginBottom: 8,
  },
  metaNumber: {
    fontSize: 10,
    letterSpacing: 1,
    textAlign: "right",
  },
  tagline: {
    fontSize: 9.5,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 18,
  },
  coBrandingLogo: {
    position: "absolute",
    top: 30,
    right: 40,
    width: 100,
    height: 60,
    objectFit: "contain",
  },
  accreditationRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    marginTop: 16,
  },
  accreditationLogo: {
    width: 54,
    height: 26,
    objectFit: "contain",
  },
})

function Diamond({ color }: { color: string }) {
  return (
    <Svg width={7} height={7} viewBox="0 0 7 7">
      <Path d="M3.5 0 L7 3.5 L3.5 7 L0 3.5 Z" fill={color} />
    </Svg>
  )
}

const CORNER_D = "M2 2 L14 2 L14 4.4 L4.4 4.4 L4.4 14 L2 14 Z"
function CornerOrnament({ corner, color }: { corner: "tl" | "tr" | "br" | "bl"; color: string }) {
  const transforms: Record<string, string> = {
    tl: "rotate(0deg)",
    tr: "rotate(90deg)",
    br: "rotate(180deg)",
    bl: "rotate(270deg)",
  }
  const pos: Record<string, object> = {
    tl: { top: 34, left: 34 },
    tr: { top: 34, right: 34 },
    br: { bottom: 34, right: 34 },
    bl: { bottom: 34, left: 34 },
  }
  return (
    <View style={{ position: "absolute", width: 16, height: 16, ...pos[corner] }}>
      <Svg width={16} height={16} viewBox="0 0 16 16" style={{ transform: transforms[corner] }}>
        <Path d={CORNER_D} fill={color} />
      </Svg>
    </View>
  )
}

export type CertificatePdfData = {
  studentName: string
  courseTitle: string
  certificateNumber: string
  completedAt: Date
  accent?: string
}

export function CertificateDocument({
  data,
  design = DEFAULT_CERTIFICATE_DESIGN,
  coBrandingLogo = null,
  accreditationLogos = [],
}: {
  data: CertificatePdfData
  design?: CertificateDesign
  coBrandingLogo?: Buffer | null
  accreditationLogos?: Buffer[]
}) {
  ensureFontsRegistered()
  const accent = data.accent ?? design.accentColor ?? FALLBACK_ACCENT

  return (
    <Document title={`Certificado ${data.certificateNumber}`} author="Jewgal Academy">
      <Page size="LETTER" orientation="landscape" style={{ ...styles.page, backgroundColor: design.backgroundColor }}>
        {design.watermarkEnabled && (
          <Image src={getWatermarkBuffer()} style={{ ...styles.watermark, opacity: design.watermarkOpacity }} />
        )}
        {design.coBrandingEnabled && coBrandingLogo && (
          <Image src={coBrandingLogo} style={styles.coBrandingLogo} />
        )}
        <View style={{ ...styles.outerBorder, borderColor: accent }} />
        <View style={{ ...styles.innerBorder, borderColor: `${accent}80` }} />
        <CornerOrnament corner="tl" color={accent} />
        <CornerOrnament corner="tr" color={accent} />
        <CornerOrnament corner="br" color={accent} />
        <CornerOrnament corner="bl" color={accent} />

        <View style={styles.content}>
          <View style={{ ...styles.hr, backgroundColor: accent }} />

          <View style={styles.eyebrowRow}>
            <Diamond color={accent} />
            <Text style={{ ...styles.eyebrow, color: accent }}>{design.eyebrow}</Text>
            <Diamond color={accent} />
          </View>

          <Text style={{ ...styles.title, color: design.textColor }}>{design.title}</Text>

          <View style={styles.dividerRow}>
            <View style={{ ...styles.smallLine, backgroundColor: `${accent}99` }} />
            <Diamond color={accent} />
            <View style={{ ...styles.smallLine, backgroundColor: `${accent}99` }} />
          </View>

          <Text style={{ ...styles.label, color: design.mutedTextColor }}>{design.awardedToLabel}</Text>
          <Text style={{ ...styles.studentName, color: accent }}>{data.studentName}</Text>

          <Text style={{ ...styles.bodyText, color: design.mutedTextColor }}>{design.completionText}</Text>
          <Text style={{ ...styles.courseTitle, color: design.textColor }}>{data.courseTitle}</Text>
          <Text style={{ ...styles.subText, color: design.mutedTextColor }}>{design.institutionLine}</Text>

          <View style={styles.footerRow}>
            <View>
              <View style={{ ...styles.signatureLine, backgroundColor: `${accent}b0` }} />
              <Text style={{ ...styles.signatureName, color: design.textColor }}>{design.signatureName}</Text>
              <Text style={{ ...styles.signatureRole, color: accent }}>{design.signatureRole}</Text>
            </View>
            <View>
              <Text style={{ ...styles.metaLabel, color: design.mutedTextColor }}>Fecha de emisión</Text>
              <Text style={{ ...styles.metaValue, color: design.mutedTextColor }}>{formatFecha(data.completedAt)}</Text>
              <Text style={{ ...styles.metaNumber, color: accent }}>N° {data.certificateNumber}</Text>
            </View>
          </View>

          {accreditationLogos.length > 0 && (
            <View style={styles.accreditationRow}>
              {accreditationLogos.map((buf, i) => (
                <Image key={i} src={buf} style={styles.accreditationLogo} />
              ))}
            </View>
          )}

          <Text style={{ ...styles.tagline, color: accent }}>{design.tagline}</Text>
        </View>
      </Page>
    </Document>
  )
}
