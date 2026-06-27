import type { Metadata, Viewport } from "next"
import { Cormorant_Garamond, Jost, Allura } from "next/font/google"
import "./globals.css"
import Providers from "@/components/Providers"
import ScrollProgress from "@/components/motion/ScrollProgress"
import WhatsAppFab from "@/components/WhatsAppFab"
import { getTheme } from "@/lib/theme"

const SITE_URL = "https://jewgal-academy.vercel.app"

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Jewgal Academy",
  url: SITE_URL,
  logo: `${SITE_URL}/brand/logo.png`,
  description:
    "Formación de coaches, certificaciones y programas de desarrollo personal y bienestar con Devora Benchimol.",
  founder: { "@type": "Person", name: "Devora Benchimol", jobTitle: "Master Coach Internacional" },
  sameAs: ["https://instagram.com/devora_benchimol_"],
  address: { "@type": "PostalAddress", addressLocality: "Miami", addressRegion: "FL", addressCountry: "US" },
}

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

const allura = Allura({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  preload: false,
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Jewgal Academy – Devora Benchimol | Master Coach",
    template: "%s · Jewgal Academy",
  },
  description:
    "Acompañándote a integrar tu ser para liderar tu vida. Formación de coaches, retiros transformadores y programas de desarrollo personal con Devora Benchimol desde Miami.",
  keywords: ["coaching", "Cabalá", "mindfulness", "desarrollo personal", "Jewgal Academy", "Devora Benchimol", "certificación coach"],
  authors: [{ name: "Devora Benchimol" }],
  creator: "Jewgal Academy",
  applicationName: "Jewgal Academy",
  openGraph: {
    title: "Jewgal Academy – Devora Benchimol",
    description: "Acompañándote a integrar tu ser para liderar tu vida.",
    url: SITE_URL,
    siteName: "Jewgal Academy",
    type: "website",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jewgal Academy – Devora Benchimol",
    description: "Acompañándote a integrar tu ser para liderar tu vida.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: SITE_URL },
}

export const viewport: Viewport = {
  themeColor: "#2C1F14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const theme = await getTheme()
  return (
    <html
      lang="es"
      data-theme={theme}
      className={`${cormorant.variable} ${jost.variable} ${allura.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <a href="#contenido" className="skip-link">Saltar al contenido</a>
        <ScrollProgress />
        <Providers>
          <div id="contenido">{children}</div>
        </Providers>
        <WhatsAppFab />
      </body>
    </html>
  )
}
