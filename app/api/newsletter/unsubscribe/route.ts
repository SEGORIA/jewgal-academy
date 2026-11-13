import { NextRequest } from "next/server"
import { escapeHtml } from "@/lib/email-html"
import { readSubscribers, verifyUnsubscribeToken, writeSubscribers } from "@/lib/newsletter"
import { rateLimit, getClientIp } from "@/lib/security"

export const dynamic = "force-dynamic"

const page = (title: string, body: string, status = 200) =>
  new Response(
    `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${escapeHtml(title)} · Jewgal Academy</title></head>
<body style="margin:0;background:#F4EBE4;font-family:Georgia,'Times New Roman',serif;color:#463018;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:20px;">
<main style="max-width:460px;width:100%;background:#FAF3F0;border:1px solid #E6D6C8;border-radius:16px;padding:34px 30px;text-align:center;">
<p style="font-size:26px;margin:0 0 18px;">Jewgal <em style="color:#A76D61;">Academy</em></p>${body}</main></body></html>`,
    { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } }
  )

const BTN = "background:#A76D61;color:#fff;border:0;border-radius:10px;padding:13px 26px;font-size:15px;font-weight:600;cursor:pointer;font-family:Arial,Helvetica,sans-serif;"

function params(req: NextRequest) {
  return { email: (req.nextUrl.searchParams.get("e") ?? "").trim().toLowerCase(), token: req.nextUrl.searchParams.get("t") ?? "" }
}

/** Muestra la confirmación. (Darse de baja con un clic en el GET sería riesgoso: algunos antivirus abren los enlaces de los correos.) */
export async function GET(req: NextRequest) {
  const { email, token } = params(req)
  if (!email || !verifyUnsubscribeToken(email, token)) {
    return page("Enlace no válido", `<h1 style="font-size:22px;font-weight:500;margin:0 0 10px;">Este enlace no es válido</h1><p style="line-height:1.6;margin:0;">Es posible que esté incompleto o haya vencido. Si querés dejar de recibir el newsletter, respondé a cualquiera de sus correos y te damos de baja.</p>`, 400)
  }
  return page("Darme de baja", `<h1 style="font-size:22px;font-weight:500;margin:0 0 10px;">¿Querés dejar de recibir el newsletter?</h1>
<p style="line-height:1.6;margin:0 0 22px;">Vamos a quitar <strong>${escapeHtml(email)}</strong> de nuestra lista.</p>
<form method="post" action="/api/newsletter/unsubscribe?e=${encodeURIComponent(email)}&t=${encodeURIComponent(token)}"><button style="${BTN}">Sí, darme de baja</button></form>`)
}

/** Da de baja (también responde al “baja en un clic” de Gmail y Apple Mail, que hacen POST a este mismo enlace). */
export async function POST(req: NextRequest) {
  const rl = rateLimit(`unsub:${getClientIp(req)}`, 20, 60_000)
  if (!rl.ok) return page("Demasiados intentos", `<p>Esperá un momento y volvé a intentar.</p>`, 429)

  const { email, token } = params(req)
  if (!email || !verifyUnsubscribeToken(email, token)) return page("Enlace no válido", `<p>Este enlace no es válido.</p>`, 400)

  const list = await readSubscribers()
  if (list.some((s) => s.email === email)) await writeSubscribers(list.filter((s) => s.email !== email))
  return page("Listo", `<h1 style="font-size:22px;font-weight:500;margin:0 0 10px;">Te diste de baja</h1><p style="line-height:1.6;margin:0 0 20px;">No vas a recibir más correos del newsletter. Gracias por haber sido parte.</p><a href="/" style="color:#A76D61;">Volver al sitio</a>`)
}
