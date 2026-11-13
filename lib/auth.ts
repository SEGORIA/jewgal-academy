import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { db, baseDb } from "./db"
import { can, isPanelRole } from "./permissions"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const nextAuth = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
        token.permissions = (user as any).permissions ?? []
        token.checkedAt = Date.now()
      }
      // Integrantes del panel: se relee el rol y los permisos desde la base cada 5 minutos, así un cambio
      // hecho por el super administrador llega a las pantallas sin esperar a que la persona vuelva a entrar.
      // (Las rutas de la API además confirman todo en cada llamada: ver lib/admin-guard.ts.)
      if (!user && token.id && isPanelRole(token.role as string) && Date.now() - ((token.checkedAt as number) ?? 0) > 5 * 60 * 1000) {
        try {
          const fresh = await baseDb.user.findUnique({ where: { id: token.id as string }, select: { role: true, status: true, permissions: true } })
          token.role = !fresh || fresh.status === "banned" ? "none" : fresh.role
          token.permissions = fresh?.permissions ?? []
        } catch { /* si la base no responde, se conserva lo que había */ }
        token.checkedAt = Date.now()
      }
      if (trigger === "update" && session) {
        if (typeof session.name === "string") token.name = session.name
        if (typeof session.image === "string" || session.image === null) token.picture = session.image
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.permissions = (token.permissions as string[] | undefined) ?? []
        if (token.name) session.user.name = token.name as string
        if (token.picture !== undefined) session.user.image = token.picture as string | null
      }
      return session
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        })

        if (!user || !user.password) return null

        const passwordMatch = await bcrypt.compare(
          parsed.data.password,
          user.password
        )

        if (!passwordMatch) return null
        // Quien integra el panel y fue suspendido no puede entrar.
        if (user.status === "banned" && isPanelRole(user.role)) return null

        void baseDb.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }).catch(() => {})

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          permissions: user.permissions,
        }
      },
    }),
  ],
})

export const { handlers, signIn, signOut } = nextAuth

/** Sesión real de quien está logueado (sin “ver como alumno”). Para las rutas del panel y para entrar/salir de esa vista. */
export const realAuth = nextAuth.auth

/** Cookie con el alumno a quien un administrador está “viendo como” (solo tiene efecto si la sesión real es del panel). */
export const VIEW_AS_COOKIE = "jewgal_view_as"

/**
 * auth(): igual que el de NextAuth, con una diferencia. Si quien está logueado es del panel (con permiso sobre Alumnos)
 * y eligió “Ver el aula como este alumno”, la sesión que ven el aula y sus APIs es la del alumno, marcada con `viewAs`.
 * Las escrituras se bloquean en proxy.ts: es una vista de solo lectura. Con argumentos (el uso como middleware) no cambia nada.
 */
/** La sesión del alumno que se está “viendo” (o la sesión real si no hay vista activa). */
async function sessionWithViewAs() {
  const session = await nextAuth.auth()
  if (!session?.user?.id || !can(session.user, "alumnos")) return session
  let target: string | undefined
  try { target = (await cookies()).get(VIEW_AS_COOKIE)?.value } catch { return session }
  if (!target) return session
  const student = await baseDb.user.findUnique({ where: { id: target }, select: { id: true, name: true, email: true, image: true, role: true } })
  if (!student || student.role !== "student") return session
  return {
    ...session,
    user: { ...session.user, id: student.id, name: student.name, email: student.email, image: student.image, role: "student", permissions: [], viewAs: { by: session.user.id, byName: session.user.name ?? null } },
  }
}

// OJO: esta función NO puede ser `async`. Con argumentos (proxy.ts: `export default auth((req) => …)`) tiene que devolver
// el middleware de NextAuth tal cual, no una Promesa. Sin argumentos devuelve la Promesa de la sesión.
export const auth = ((...args: unknown[]) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (args.length) return (nextAuth.auth as any)(...args)
  return sessionWithViewAs()
}) as typeof nextAuth.auth


declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      permissions: string[]
      name?: string | null
      email?: string | null
      image?: string | null
      /** Presente cuando un administrador está viendo el aula como este alumno (solo lectura). */
      viewAs?: { by: string; byName: string | null }
    }
  }
}
