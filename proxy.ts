import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session
  const isAdmin = session?.user?.role === "admin"

  const isAulaRoute       = nextUrl.pathname.startsWith("/aula")
  const isSuperadminRoute = nextUrl.pathname.startsWith("/superadmin")

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
})

export const config = {
  matcher: ["/aula/:path*", "/superadmin/:path*"],
}
