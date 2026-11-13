import { setRequestLocale } from "next-intl/server"
import LegalPage from "@/components/LegalPage"
import { pageMetadata } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return pageMetadata("terminos", (await params).locale)
}

/** Términos de uso: el contenido se edita desde el panel (Páginas legales). */
export default async function TerminosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  return <LegalPage doc="terminos" locale={locale} />
}
