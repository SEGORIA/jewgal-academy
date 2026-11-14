import { NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import { baseDb } from "@/lib/db"
import { EMAIL_STATUS_KEY, addressOf, defaultReplyTo, emailFrom, isEmailConfigured, type EmailStatus } from "@/lib/email"

export const dynamic = "force-dynamic"
export const maxDuration = 30

type Level = "ok" | "warn" | "error"
type Check = { id: string; level: Level; title: string; detail: string }

const domainOf = (email: string) => email.split("@")[1]?.toLowerCase() ?? ""

/**
 * ¿El dominio puede recibir correo? (tiene registros MX). Devuelve null si no se pudo comprobar.
 * Se consulta por HTTPS (DNS de Google) en vez del DNS del servidor, que según el entorno puede no responder.
 */
async function hasMx(domain: string): Promise<boolean | null> {
  if (!domain) return false
  try {
    const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return null
    const d = (await res.json()) as { Status?: number; Answer?: { type: number }[] }
    if (d.Status === 0) return (d.Answer ?? []).some((a) => a.type === 15)
    if (d.Status === 3) return false // el dominio no existe
    return null
  } catch { return null }
}

type ResendDomain = { name: string; status: string; region?: string }

/**
 * Diagnóstico del correo: revisa, sin enviar nada, si la clave de Resend sirve, si el dominio de envío está verificado
 * y si las casillas que usa la plataforma pueden recibir mensajes. Nunca devuelve la clave.
 */
export async function GET() {
  const g = await adminGuard("comunicaciones")
  if (!g.ok) return g.response
  g.enter()

  const checks: Check[] = []
  const from = emailFrom()
  const fromEmail = addressOf(from)
  const fromDomain = domainOf(fromEmail)

  // 1) Clave de Resend
  let domains: ResendDomain[] | null = null
  if (!isEmailConfigured()) {
    checks.push({ id: "key", level: "error", title: "Falta la clave de Resend", detail: "No está configurada la variable RESEND_API_KEY. Sin ella no se envía ningún correo. Creala en resend.com/api-keys y cargala en Vercel → Settings → Environment Variables (Production), y volvé a desplegar." })
  } else {
    try {
      const res = await fetch("https://api.resend.com/domains", { headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` }, signal: AbortSignal.timeout(8000) })
      const body = (await res.json().catch(() => ({}))) as { data?: ResendDomain[]; name?: string; message?: string }
      if (res.ok) {
        domains = body.data ?? []
        checks.push({ id: "key", level: "ok", title: "La clave de Resend es válida", detail: "Resend acepta la clave configurada." })
      } else if (res.status === 401 && body.name === "restricted_api_key") {
        checks.push({ id: "key", level: "ok", title: "Clave de solo envío", detail: "La clave es válida y solo tiene permiso para enviar (por eso no se puede comprobar el estado del dominio desde acá). Es lo recomendable." })
      } else if (res.status === 400 || res.status === 401 || res.status === 403) {
        checks.push({ id: "key", level: "error", title: "Resend rechaza la clave", detail: `${body.message ?? "La clave es inválida"}. Puede estar mal copiada, revocada o ser de otra cuenta. Creá una clave nueva en resend.com/api-keys, reemplazá RESEND_API_KEY en Vercel (Production) y volvé a desplegar.` })
      } else {
        checks.push({ id: "key", level: "warn", title: "No se pudo comprobar la clave", detail: `Resend respondió ${res.status}${body.message ? `: ${body.message}` : ""}. Probá de nuevo en unos minutos.` })
      }
    } catch {
      checks.push({ id: "key", level: "warn", title: "No se pudo contactar a Resend", detail: "La consulta a Resend no respondió a tiempo. Probá de nuevo en unos minutos." })
    }
  }

  // 2) Dominio de envío
  if (fromDomain === "resend.dev") {
    checks.push({ id: "domain", level: "warn", title: "Se está usando el remitente de prueba de Resend", detail: "Con onboarding@resend.dev solo se puede enviar a la casilla dueña de la cuenta de Resend. Configurá EMAIL_FROM con una dirección de tu dominio verificado." })
  } else if (domains) {
    const d = domains.find((x) => fromDomain === x.name || fromDomain.endsWith(`.${x.name}`))
    if (!d) checks.push({ id: "domain", level: "error", title: `El dominio ${fromDomain} no está en Resend`, detail: `El remitente es ${fromEmail}, pero ese dominio no figura en tu cuenta de Resend. Agregalo en resend.com/domains y cargá los registros DNS que te indica (o cambiá EMAIL_FROM por una dirección de un dominio ya verificado).` })
    else if (d.status === "verified") checks.push({ id: "domain", level: "ok", title: `Dominio ${d.name} verificado`, detail: `Los correos salen como ${from}.` })
    else checks.push({ id: "domain", level: "error", title: `El dominio ${d.name} no está verificado (${d.status})`, detail: "Resend no deja enviar hasta que los registros DNS (DKIM y SPF) estén verificados. Entrá a resend.com/domains, abrí el dominio y presioná “Verify DNS Records”; si falta alguno, agregalo en el panel donde administrás el dominio." })
  } else {
    checks.push({ id: "domain", level: "warn", title: "Remitente configurado", detail: `Los correos salen como ${from}. No se puede comprobar si el dominio está verificado con esta clave: si los correos no llegan, revisalo en resend.com/domains.` })
  }

  // 3) Respuestas: ¿a qué casilla van?
  const reply = await defaultReplyTo()
  const replyMx = reply ? await hasMx(domainOf(reply)) : null
  if (reply && replyMx === null) {
    checks.push({ id: "reply", level: "warn", title: "Respuestas a " + reply, detail: `Las respuestas llegan a ${reply} (el correo de contacto de “Portada y contacto”). No se pudo comprobar si ese dominio recibe correo.` })
  } else if (reply && replyMx) {
    checks.push({ id: "reply", level: "ok", title: "Las respuestas llegan a una casilla real", detail: `Cuando alguien responde un correo de la plataforma, le llega a ${reply} (el correo de contacto de “Portada y contacto”).` })
  } else if (reply && replyMx === false) {
    checks.push({ id: "reply", level: "error", title: `El correo de contacto ${reply} no puede recibir mensajes`, detail: `El dominio ${domainOf(reply)} no tiene registros MX. Cambiá el correo de contacto en “Portada y contacto” por una casilla real.` })
  } else {
    checks.push({ id: "reply", level: "warn", title: "No hay casilla para las respuestas", detail: "Cargá un correo de contacto en “Portada y contacto”. Mientras tanto, las respuestas van a la dirección de envío." })
  }
  if (fromDomain && fromDomain !== "resend.dev" && (await hasMx(fromDomain)) === false) {
    checks.push({ id: "from-mx", level: "warn", title: `${fromEmail} no recibe correo`, detail: `El dominio ${fromDomain} no tiene registros MX: nadie lee lo que se escriba a esa dirección. No impide enviar, pero conviene que las respuestas vayan al correo de contacto (arriba) y no usar ${fromEmail} como casilla.` })
  }

  // 4) Casilla de esta cuenta (las pruebas llegan acá)
  const mine = g.user.email
  const mineMx = await hasMx(domainOf(mine))
  checks.push(mineMx === null
    ? { id: "account", level: "warn", title: "Tu correo de cuenta", detail: `Las pruebas “Enviarme una prueba” llegan a ${mine}. No se pudo comprobar si ese dominio recibe correo.` }
    : mineMx
    ? { id: "account", level: "ok", title: "Tu correo de cuenta puede recibir mensajes", detail: `Las pruebas “Enviarme una prueba” llegan a ${mine}.` }
    : { id: "account", level: "error", title: `Tu cuenta usa ${mine}, que no recibe correo`, detail: `El dominio ${domainOf(mine)} no tiene registros MX, así que las pruebas “Enviarme una prueba” nunca llegan. Cambiá el correo de tu cuenta en Equipo y permisos → Editar, o escribí otra dirección en el campo de prueba de abajo.` })

  // 5) Avisos al administrador
  const adminAlert = process.env.ADMIN_EMAIL?.trim()
  checks.push(adminAlert
    ? { id: "admin", level: (await hasMx(domainOf(adminAlert))) === false ? "warn" : "ok", title: "Avisos internos activados", detail: `Los avisos de pagos, reembolsos y mensajes de contacto se mandan a ${adminAlert}.` }
    : { id: "admin", level: "warn", title: "Avisos internos desactivados", detail: "Falta ADMIN_EMAIL en Vercel: no se envían los avisos de pagos ni de mensajes de contacto a tu correo (siguen apareciendo en la campana del panel)." })

  // Lo último que pasó
  let status: EmailStatus = {}
  try {
    const s = await baseDb.siteSetting.findUnique({ where: { key: EMAIL_STATUS_KEY } })
    status = s?.value ? JSON.parse(s.value) : {}
  } catch {}

  return NextResponse.json({ checks, from, status, account: mine })
}
