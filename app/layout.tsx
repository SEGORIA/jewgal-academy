import type { Metadata, Viewport } from "next"
import { Cormorant_Garamond, Jost, Allura } from "next/font/google"
import "./globals.css"
import Providers from "@/components/Providers"

const SITE_URL = "https://jewgal-academy.vercel.app"

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
  themeColor: "#081e29",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${cormorant.variable} ${jost.variable} ${allura.variable}`}
    >
      <body><Providers>{children}</Providers></body>
    </html>
  )
}
