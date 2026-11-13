import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { adminGuard } from "@/lib/admin-guard"
import { baseDb } from "@/lib/db"

export const dynamic = "force-dynamic"
export const maxDuration = 60

const lower = (m: string) => m.charAt(0).toLowerCase() + m.slice(1)
const MODELS = Prisma.dmmf.datamodel.models.map((m) => m.name)
const NEVER_EXPORT = new Set(["password"]) // las contraseñas (aunque estén cifradas) nunca salen de la base

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const delegate = (name: string) => (baseDb as any)[lower(name)] as { findMany: (a?: unknown) => Promise<Record<string, unknown>[]>; count: () => Promise<number> }

/** Celdas de CSV: se escapan las comillas y se neutralizan las fórmulas (=, +, -, @) que Excel ejecutaría al abrir el archivo. */
function csvCell(v: unknown): string {
  let s = v === null || v === undefined ? "" : v instanceof Date ? v.toISOString() : typeof v === "object" ? JSON.stringify(v) : String(v)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}
const toCsv = (rows: unknown[][]) => "﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n")

const file = (body: string, name: string, type: string) =>
  new Response(body, { headers: { "content-type": `${type}; charset=utf-8`, "content-disposition": `attachment; filename="${name}"`, "cache-control": "no-store" } })

const today = () => new Date().toISOString().slice(0, 10)

/**
 * Exportaciones del Super administrador:
 *  · ?kind=summary → cuántos registros hay en cada tabla
 *  · ?kind=full[&audit=1] → todos los datos en un archivo JSON (sin contraseñas; el historial es opcional)
 *  · ?kind=csv&table=students|enrollments|payments|contacts|subscribers → planilla para Excel
 */
export async function GET(req: NextRequest) {
  const g = await adminGuard("superadmin")
  if (!g.ok) return g.response
  g.enter()
  const sp = req.nextUrl.searchParams
  const kind = sp.get("kind") ?? "summary"

  if (kind === "summary") {
    const counts = await Promise.all(MODELS.map(async (m) => [m, await delegate(m).count()] as const))
    return NextResponse.json({ counts: Object.fromEntries(counts) })
  }

  const note = (label: string) => baseDb.auditLog.create({ data: { actorId: g.user.id, actorName: g.user.name, actorRole: g.user.role, action: "export", model: "Respaldo", label } }).catch(() => {})

  if (kind === "full") {
    const withAudit = sp.get("audit") === "1"
    const data: Record<string, unknown[]> = {}
    const counts: Record<string, number> = {}
    for (const m of MODELS) {
      if (m === "AuditLog" && !withAudit) continue
      const rows = await delegate(m).findMany()
      data[m] = rows.map((r) => Object.fromEntries(Object.entries(r).filter(([k]) => !NEVER_EXPORT.has(k))))
      counts[m] = rows.length
    }
    await note("Respaldo completo")
    const json = JSON.stringify({ app: "jewgal-academy", format: 1, exportedAt: new Date().toISOString(), exportedBy: g.user.email, counts, data }, null, 1)
    return file(json, `jewgal-respaldo-${today()}.json`, "application/json")
  }

  if (kind === "csv") {
    const table = sp.get("table")
    let rows: unknown[][] = []
    if (table === "students") {
      const list = await baseDb.user.findMany({ where: { role: "student" }, include: { enrollments: { include: { course: { select: { title: true } } } } }, orderBy: { createdAt: "desc" } })
      rows = [["Nombre", "Correo", "Teléfono", "País", "Ciudad", "Ocupación", "Estado", "Programas", "Registrado", "Último ingreso"],
        ...list.map((u) => [u.name, u.email, u.phone, u.country, u.city, u.job, u.status, u.enrollments.map((e) => `${e.course.title} (${e.status})`).join("; "), u.createdAt, u.lastLoginAt])]
    } else if (table === "enrollments") {
      const list = await baseDb.enrollment.findMany({ include: { user: { select: { name: true, email: true } }, course: { select: { title: true } } }, orderBy: { enrolledAt: "desc" } })
      rows = [["Alumno", "Correo", "Programa", "Estado", "Avance %", "Horas", "Inscripción", "Completado", "Certificado"],
        ...list.map((e) => [e.user.name, e.user.email, e.course.title, e.status, e.progress, e.hoursCompleted, e.enrolledAt, e.completedAt, e.certificateNumber])]
    } else if (table === "payments") {
      const list = await baseDb.payment.findMany({ include: { user: { select: { name: true, email: true } }, course: { select: { title: true } } }, orderBy: { createdAt: "desc" } })
      rows = [["Fecha", "Alumno", "Correo", "Programa", "Monto", "Moneda", "Medio", "Estado", "Nota"],
        ...list.map((p) => [p.paidAt ?? p.createdAt, p.user.name, p.user.email, p.course.title, p.amount, p.currency, p.method ?? (p.stripeSessionId ? "stripe" : p.stripePaymentId ? "paypal" : ""), p.status, p.note])]
    } else if (table === "contacts") {
      const list = await baseDb.contactMessage.findMany({ orderBy: { createdAt: "desc" } })
      rows = [["Fecha", "Nombre", "Correo", "Asunto", "Mensaje", "Estado"], ...list.map((m) => [m.createdAt, m.name, m.email, m.subject, m.message, m.status])]
    } else if (table === "subscribers") {
      const s = await baseDb.siteSetting.findUnique({ where: { key: "newsletter_subscribers" } })
      let list: { email: string; date: string }[] = []
      try { list = s?.value ? JSON.parse(s.value) : [] } catch {}
      rows = [["Correo", "Suscripción"], ...list.map((x) => [x.email, x.date])]
    } else {
      return NextResponse.json({ error: "Tabla desconocida" }, { status: 400 })
    }
    await note(`Exportó ${table}`)
    return file(toCsv(rows), `jewgal-${table}-${today()}.csv`, "text/csv")
  }

  return NextResponse.json({ error: "Tipo de exportación desconocido" }, { status: 400 })
}
