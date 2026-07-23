import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import createIntlMiddleware from "next-intl/middleware"
import { routing } from "@/i18n/routing"

// El Aula y el Superadmin viven fuera de app/(site)/[locale] — no llevan
// prefijo de idioma, así que el middleware de next-intl no debe tocarlos.
const intlMiddleware = createIntlMiddleware(routing)

export default auth((req) => {
  const { nextUrl, auth: session } = req

  // En Vercel, req.nextUrl a veces trae el host del deployment interno
  // (*.vercel.app) en lugar del dominio custom real — tanto los redirects
  // de auth como el middleware de next-intl usan esa URL como base, así
  // que sin corregirla, un dominio custom termina redirigiendo a
  // jewgal-academy.vercel.app (o, en el caso de next-intl, en un loop
  // infinito /  →  /). x-forwarded-host/proto sí traen el dominio real.
  const forwardedHost = req.headers.get("x-forwarded-host")
  const forwardedProto = req.headers.get("x-forwarded-proto") ?? "https"
  const baseUrl = forwardedHost && forwardedHost !== nextUrl.host
    ? `${forwardedProto}://${forwardedHost}`
    : nextUrl.origin

  const isAulaRoute       = nextUrl.pathname.startsWith("/aula")
  const isSuperadminRoute = nextUrl.pathname.startsWith("/superadmin")

  if (isAulaRoute || isSuperadminRoute) {
    const isLoggedIn = !!session
    const isAdmin = session?.user?.role === "admin"

    if (isAulaRoute && !isLoggedIn) {
      return NextResponse.redirect(new URL("/login?redirect=/aula", baseUrl))
    }

    if (isSuperadminRoute && !isAdmin) {
      if (!isLoggedIn) {
        return NextResponse.redirect(new URL("/login?redirect=/superadmin", baseUrl))
      }
      return NextResponse.redirect(new URL("/aula", baseUrl))
    }

    return NextResponse.next()
  }

  let intlReq: NextRequest = req
  if (baseUrl !== nextUrl.origin) {
    const correctedUrl = new URL(nextUrl.pathname + nextUrl.search, baseUrl)
    intlReq = new NextRequest(correctedUrl, req)
  }

  return intlMiddleware(intlReq)
})

export const config = {
  // Todo excepto rutas de API, internals de Next y archivos estáticos con extensión
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
