import type { Metadata } from "next"
import { Cormorant_Garamond, Jost, Allura } from "next/font/google"
import "./globals.css"
import Providers from "@/components/Providers"

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
  title: "Jewgal Academy – Devora Benchimol | Master Coach",
  description:
    "Acompañándote a integrar tu ser para liderar tu vida. Formación de coaches, retiros transformadores y programas de desarrollo personal con Devora Benchimol desde Miami.",
  keywords: ["coaching", "Cabalá", "mindfulness", "desarrollo personal", "Jewgal Academy", "Devora Benchimol"],
  openGraph: {
    title: "Jewgal Academy – Devora Benchimol",
    description: "Acompañándote a integrar tu ser para liderar tu vida.",
    type: "website",
    locale: "es_ES",
  },
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
