import type { Metadata, Viewport } from "next"
import { notFound } from "next/navigation"
import { Cormorant_Garamond, Jost } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { setRequestLocale } from "next-intl/server"
import "../../globals.css"
import Providers from "@/components/Providers"
import ScrollProgress from "@/components/motion/ScrollProgress"
import WhatsAppFab from "@/components/WhatsAppFab"
import AdminEditBar from "@/components/AdminEditBar"
import PwaRegister from "@/components/PwaRegister"
import { getTheme } from "@/lib/theme"
import { Analytics } from "@vercel/analytics/next"
import { routing } from "@/i18n/routing"
import { SITE_URL } from "@/lib/site-url"
import { getGeneralSettings } from "@/lib/general-settings"
import { getSeo } from "@/lib/seo"

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
})

const jost = Jost({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
})

const cormorantItalic = Cormorant_Garamond({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["italic"],
  display: "swap",
  preload: false,
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

const METADATA_BY_LOCALE = {
  es: {
    title: { default: "Jewgal Academy – Devora Benchimol | Master Coach", template: "%s · Jewgal Academy" },
    description: "Acompañándote a integrar tu ser para liderar tu vida. Formación de coaches, retiros transformadores y programas de desarrollo personal con Devora Benchimol desde Miami.",
    ogLocale: "es_ES",
  },
  en: {
    title: { default: "Jewgal Academy – Devora Benchimol | Master Coach", template: "%s · Jewgal Academy" },
    description: "Helping you integrate who you are to lead your life. Coach training, transformative retreats and personal development programs with Devora Benchimol from Miami.",
    ogLocale: "en_US",
  },
} as const

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const general = await getGeneralSettings()
  const { locale } = await params
  const m = METADATA_BY_LOCALE[locale as keyof typeof METADATA_BY_LOCALE] ?? METADATA_BY_LOCALE.es
  const url = locale === routing.defaultLocale ? SITE_URL : `${SITE_URL}/${locale}`
  // Título, descripción e imagen para compartir: editables en “Textos y SEO” (Inicio)
  const seo = await getSeo("home", locale)

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: seo.title, template: `%s · ${general.name}` },
    description: seo.description,
    keywords: ["coaching", "Cabalá", "mindfulness", "desarrollo personal", "Jewgal Academy", "Devora Benchimol", "certificación coach"],
    authors: [{ name: "Devora Benchimol" }],
    creator: "Jewgal Academy",
    applicationName: "Jewgal Academy",
    openGraph: {
      title: seo.title,
      description: seo.description,
      url,
      siteName: general.name,
      type: "website",
      locale: m.ogLocale,
      ...(seo.image ? { images: [{ url: seo.image }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      ...(seo.image ? { images: [seo.image] } : {}),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    alternates: {
      canonical: url,
      languages: {
        es: SITE_URL,
        en: `${SITE_URL}/en`,
      },
    },
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "Jewgal Academy",
    },
    // Favicon: app/favicon.ico (16/32/48) + PNG nítidos. El ?v= salta la caché de iconos del navegador.
    icons: {
      icon: [
        { url: "/icons/icon-32.png?v=3", sizes: "32x32", type: "image/png" },
        { url: "/icons/icon-192.png?v=3", sizes: "192x192", type: "image/png" },
      ],
      apple: "/icons/apple-touch-icon.png?v=3",
    },
  }
}

export const viewport: Viewport = {
  themeColor: "#2C1F14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  if (!routing.locales.includes(locale as "es" | "en")) notFound()

  setRequestLocale(locale)
  const theme = await getTheme()
  const general = await getGeneralSettings()

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Jewgal Academy",
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo.png`,
    description: METADATA_BY_LOCALE[locale as keyof typeof METADATA_BY_LOCALE]?.description ?? METADATA_BY_LOCALE.es.description,
    founder: { "@type": "Person", name: "Devora Benchimol", jobTitle: "Master Coach Internacional" },
    sameAs: ["https://instagram.com/devora_benchimol_"],
    address: { "@type": "PostalAddress", addressLocality: "Miami", addressRegion: "FL", addressCountry: "US" },
  }

  return (
    <html
      lang={locale}
      data-theme={theme}
      className={`${cormorant.variable} ${jost.variable} ${cormorantItalic.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <a href="#contenido" className="skip-link">
          {locale === "en" ? "Skip to content" : "Saltar al contenido"}
        </a>
        <ScrollProgress />
        <NextIntlClientProvider>
          <Providers>
            <div id="contenido">{children}</div>
            <PwaRegister />
            {/* Atajos de edición: solo los ve el equipo del panel */}
            <AdminEditBar />
          </Providers>
          {/* WhatsAppFab usa useTranslations → debe ir dentro del provider */}
          <WhatsAppFab number={general.whatsapp} message={general.whatsappMessage} />
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  )
}
