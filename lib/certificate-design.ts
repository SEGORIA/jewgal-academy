import type { PrismaClient } from "@prisma/client"

export type CertificateProgramAccent = { slug: string; accent: string }

export type CertificateDesign = {
  accentColor: string
  backgroundColor: string
  textColor: string
  mutedTextColor: string
  eyebrow: string
  title: string
  awardedToLabel: string
  completionText: string
  institutionLine: string
  signatureName: string
  signatureRole: string
  tagline: string
  watermarkEnabled: boolean
  watermarkOpacity: number
  programs: CertificateProgramAccent[]
  coBrandingEnabled: boolean
  coBrandingLogoUrl: string | null
}

export const DEFAULT_CERTIFICATE_DESIGN: CertificateDesign = {
  accentColor: "#A58D66",
  backgroundColor: "#F4EAE7",
  textColor: "#3B2A1E",
  mutedTextColor: "#8E8078",
  eyebrow: "Jewgal Academy",
  title: "Certificado de Finalización",
  awardedToLabel: "Otorgado con honor a",
  completionText: "por completar exitosamente el programa de formación",
  institutionLine: "en la plataforma Jewgal Academy · por Devora Benchimol",
  signatureName: "Devora Benchimol",
  signatureRole: "Fundadora · Master Coach Internacional",
  tagline: "Sabiduría para vivir, Liderazgo para Transformar",
  watermarkEnabled: true,
  watermarkOpacity: 0.05,
  coBrandingEnabled: false,
  coBrandingLogoUrl: null,
  programs: [
    { slug: "life-coaching-integrativo", accent: "#A58D66" },
    { slug: "joogal-adultos", accent: "#C49F72" },
    { slug: "joogalkids", accent: "#A76D61" },
    { slug: "metodo-sholem", accent: "#A76D61" },
    { slug: "cabala-coach", accent: "#CBB78B" },
  ],
}

export function mergeCertificateDesign(partial: Partial<CertificateDesign> | null | undefined): CertificateDesign {
  if (!partial) return DEFAULT_CERTIFICATE_DESIGN
  return {
    ...DEFAULT_CERTIFICATE_DESIGN,
    ...partial,
    programs: Array.isArray(partial.programs) ? partial.programs : DEFAULT_CERTIFICATE_DESIGN.programs,
  }
}

export function resolveProgramAccent(design: CertificateDesign, slug: string): string {
  return design.programs.find((p) => p.slug === slug)?.accent ?? design.accentColor
}

// Server-only en la práctica (solo se llama desde rutas API y lib/certificates.ts),
// pero el archivo es seguro de importar desde componentes cliente porque el único
// símbolo que toca Prisma es un import de tipo — se borra en compilación, nada acá
// se ejecuta a nivel de módulo.
export async function getCertificateDesign(db: PrismaClient): Promise<CertificateDesign> {
  try {
    const setting = await db.siteSetting.findUnique({ where: { key: "certificate_design" } })
    if (setting?.value) return mergeCertificateDesign(JSON.parse(setting.value))
  } catch {}
  return DEFAULT_CERTIFICATE_DESIGN
}
