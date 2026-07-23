import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import createIntlMiddleware from "next-intl/middleware"
import { routing } from "@/i18n/routing"

// El Aula y el Superadmin viven fuera de app/(site)/[locale] — no llevan
// prefijo de idioma, así que el middleware de next-intl no debe tocarlos.
const intlMiddleware = createIntlMiddleware(routing)

export default auth((req) => {
  const { nextUrl, auth: session } = req

  const isAulaRoute       = nextUrl.pathname.startsWith("/aula")
  const isSuperadminRoute = nextUrl.pathname.startsWith("/superadmin")

  if (isAulaRoute || isSuperadminRoute) {
    const isLoggedIn = !!session
    const isAdmin = session?.user?.role === "admin"

    if (isAulaRoute && !isLoggedIn) {
      return NextResponse.redirect(new URL("/login?redirect=/aula", nextUrl))
    }

    if (isSuperadminRoute && !isAdmin) {
      if (!isLoggedIn) {
        return NextResponse.redirect(new URL("/login?redirect=/superadmin", nextUrl))
      }
      return NextResponse.redirect(new URL("/aula", nextUrl))
    }

    return NextResponse.next()
  }

  return intlMiddleware(req)
})

export const config = {
  // Todo excepto rutas de API, internals de Next y archivos estáticos con extensión
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
