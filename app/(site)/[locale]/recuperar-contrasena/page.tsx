import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import AuthShell from "@/components/auth/AuthShell"
import ForgotForm from "./ForgotForm"

// Pantalla de servicio: no tiene por qué aparecer en buscadores.
export const metadata: Metadata = { title: "Recuperar contraseña", robots: { index: false, follow: false } }

export default async function ForgotPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale)
  return (
    <AuthShell>
      <ForgotForm />
    </AuthShell>
  )
}
