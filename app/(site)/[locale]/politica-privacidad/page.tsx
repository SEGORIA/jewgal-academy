import { setRequestLocale } from "next-intl/server"
import LegalPage from "@/components/LegalPage"
import { pageMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return pageMetadata("privacidad", (await params).locale)
}

/** Política de privacidad: el contenido se edita desde el panel (Páginas legales). */
export default async function PoliticaPrivacidadPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  return <LegalPage doc="privacidad" locale={locale} />
}
