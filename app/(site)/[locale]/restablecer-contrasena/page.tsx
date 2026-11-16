import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import AuthShell from "@/components/auth/AuthShell"
import { findValidResetToken } from "@/lib/password-reset"
import ResetForm from "./ResetForm"

// El token viaja en la URL: sin referrer para que no se filtre a otros sitios, y fuera de los buscadores.
export const metadata: Metadata = { title: "Nueva contraseña", robots: { index: false, follow: false }, referrer: "no-referrer" }
export const dynamic = "force-dynamic"

export default async function ResetPasswordPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ token?: string }> }) {
  setRequestLocale((await params).locale)
  const { token = "" } = await searchParams
  const valid = !!(await findValidResetToken(token))
  return (
    <AuthShell>
      <ResetForm token={token} valid={valid} />
    </AuthShell>
  )
}
