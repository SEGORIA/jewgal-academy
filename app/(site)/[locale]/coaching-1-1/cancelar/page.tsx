import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import AuthShell from "@/components/auth/AuthShell"
import { authText, authTitle } from "@/components/auth/auth-styles"
import { baseDb } from "@/lib/db"
import { getCoachingSettings, verifyBookingToken } from "@/lib/coaching-server"
import CancelBooking from "./CancelBooking"

// Pantalla de servicio con un enlace firmado: fuera de los buscadores y sin referrer.
export const metadata: Metadata = { title: "Cancelar sesión", robots: { index: false, follow: false }, referrer: "no-referrer" }
export const dynamic = "force-dynamic"

export default async function CancelPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ id?: string; t?: string }> }) {
  const { locale: raw } = await params
  setRequestLocale(raw)
  const locale = raw === "en" ? "en" : "es"
  const { id = "", t = "" } = await searchParams
  const en = locale === "en"

  const valid = id && t && verifyBookingToken(id, t)
  const booking = valid ? await baseDb.coachingBooking.findUnique({ where: { id } }) : null

  if (!booking) {
    return (
      <AuthShell>
        <h1 style={authTitle}>{en ? "This link isn't valid" : "Este enlace no es válido"}</h1>
        <p style={authText}>{en ? "Check that you opened the full link from your email." : "Revisá que hayas abierto el enlace completo del correo."}</p>
      </AuthShell>
    )
  }

  const { timezone } = await getCoachingSettings()
  const when = new Intl.DateTimeFormat(en ? "en-US" : "es-ES", { timeZone: timezone, dateStyle: "full", timeStyle: "short" }).format(booking.startsAt)
  const closed = booking.status === "cancelled" || booking.status === "completed" || booking.startsAt.getTime() < Date.now()

  return (
    <AuthShell>
      <h1 style={authTitle}>{en ? "Cancel your session" : "Cancelar tu sesión"}</h1>
      <p style={authText}>
        <strong style={{ color: "var(--text)" }}>{booking.offerTitle}</strong><br />{when} ({timezone.replace(/_/g, " ")})
      </p>
      {closed ? (
        <p style={authText}>{booking.status === "cancelled" ? (en ? "This session was already cancelled." : "Esta sesión ya estaba cancelada.") : (en ? "This session can no longer be cancelled online." : "Esta sesión ya no se puede cancelar desde acá.")}</p>
      ) : (
        <CancelBooking id={booking.id} token={t} locale={locale} />
      )}
    </AuthShell>
  )
}
