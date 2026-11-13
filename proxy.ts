import { auth, VIEW_AS_COOKIE } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import createIntlMiddleware from "next-intl/middleware"
import { routing } from "@/i18n/routing"
import { can, isPanelRole, permissionForPath } from "@/lib/permissions"

// El Aula y el Superadmin viven fuera de app/(site)/[locale] — no llevan
// prefijo de idioma, así que el middleware de next-intl no debe tocarlos.
const intlMiddleware = createIntlMiddleware(routing)

// El dominio custom es el único que debe quedar en la barra del navegador —
// ni el *.vercel.app del proyecto (accesible directo, sin login) ni un
// eventual www. deben servir contenido por su cuenta.
const CANONICAL_HOST = "jewgalacademy.com"

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
  const incomingHost = forwardedHost ?? nextUrl.host

  // VERCEL_ENV solo existe en deployments reales de Vercel — nunca en
  // desarrollo local, sin importar por qué host/IP se acceda al server de
  // dev (localhost, la IP de red que imprime Next, un túnel de alguna
  // herramienta, etc.). Es una condición mucho más robusta que intentar
  // enumerar variantes de "host local" a mano, que ya se probó insuficiente
  // (el navegador de esta sesión llega al dev server por una ruta de red
  // que no empezaba con "localhost" ni "127.0.0.1" y terminó redirigiendo
  // al dominio de producción en medio de una verificación local).
  if (process.env.VERCEL_ENV && incomingHost !== CANONICAL_HOST) {
    return NextResponse.redirect(new URL(nextUrl.pathname + nextUrl.search, `https://${CANONICAL_HOST}`), 301)
  }

  const baseUrl = forwardedHost && forwardedHost !== nextUrl.host
    ? `${forwardedProto}://${forwardedHost}`
    : nextUrl.origin

  // “Ver el aula como un alumno” es de solo lectura: ninguna escritura de las APIs del alumno pasa mientras esté activa.
  if (nextUrl.pathname.startsWith("/api/me")) {
    const writes = !["GET", "HEAD", "OPTIONS"].includes(req.method)
    if (writes && isPanelRole(session?.user?.role) && req.cookies.get(VIEW_AS_COOKIE)?.value) {
      return NextResponse.json({ error: "Estás viendo el aula como un alumno: es una vista de solo lectura." }, { status: 403 })
    }
    return NextResponse.next()
  }

  const isAulaRoute       = nextUrl.pathname.startsWith("/aula")
  const isSuperadminRoute = nextUrl.pathname.startsWith("/superadmin")

  if (isAulaRoute || isSuperadminRoute) {
    const isLoggedIn = !!session
    const isPanel = isPanelRole(session?.user?.role)

    if (isAulaRoute && !isLoggedIn) {
      return NextResponse.redirect(new URL("/login?redirect=/aula", baseUrl))
    }

    if (isSuperadminRoute && !isPanel) {
      if (!isLoggedIn) {
        return NextResponse.redirect(new URL("/login?redirect=/superadmin", baseUrl))
      }
      return NextResponse.redirect(new URL("/aula", baseUrl))
    }

    // Colaboradores: solo las pantallas de las áreas que tienen asignadas.
    if (isSuperadminRoute && !can(session?.user, permissionForPath(nextUrl.pathname))) {
      return NextResponse.redirect(new URL("/superadmin", baseUrl))
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
  // Todo excepto rutas de API, internals de Next y archivos estáticos con extensión;
  // más /api/me, para bloquear las escrituras mientras un administrador ve el aula como un alumno (solo lectura).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)", "/api/me/:path*"],
}
