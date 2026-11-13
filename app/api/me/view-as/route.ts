import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

/** ¿Un administrador está viendo el aula como este alumno? (para mostrar el aviso con el botón de salida) */
export async function GET() {
  const session = await auth()
  const v = session?.user?.viewAs
  return NextResponse.json(v ? { active: true, student: session?.user?.name ?? "", by: v.byName } : { active: false })
}
