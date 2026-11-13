/**
 * Convierte un texto plano (con párrafos separados por línea en blanco) en un correo HTML con la marca de la academia.
 * Todo se escapa: lo que escribe quien administra o lo que viene de un formulario nunca se interpreta como HTML.
 * Es HTML de correo: tablas, estilos en línea y tipografías con alternativas (los clientes de correo no cargan CSS externo).
 */

export const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;")

/** Escapa el texto y convierte las direcciones http(s) en enlaces. */
function linkify(escaped: string): string {
  return escaped.replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)\]])/g, (url) => `<a href="${url}" style="color:#A76D61;text-decoration:underline;">${url}</a>`)
}

function paragraphs(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .trim()
    .split(/\n\s*\n/)
    .map((p) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#463018;">${linkify(escapeHtml(p)).replace(/\n/g, "<br>")}</p>`)
    .join("")
}

export type HtmlOptions = {
  /** Texto de vista previa que algunos clientes muestran junto al asunto. */
  preheader?: string
  /** Botón destacado al final del mensaje. */
  cta?: { label: string; url: string }
  /** Enlace para darse de baja (newsletter). */
  unsubscribeUrl?: string
  /** Pie fijo (por ejemplo, la dirección de la academia). */
  footerNote?: string
}

export function buildEmailHtml(text: string, opts: HtmlOptions = {}): string {
  const cta = opts.cta?.url && opts.cta.label
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;"><tr><td style="background:#A76D61;border-radius:10px;"><a href="${escapeHtml(opts.cta.url)}" style="display:inline-block;padding:13px 26px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">${escapeHtml(opts.cta.label)}</a></td></tr></table>`
    : ""
  const unsub = opts.unsubscribeUrl
    ? `<p style="margin:14px 0 0;font-size:12px;line-height:1.6;color:#8a7867;">Recibís este correo porque te suscribiste al newsletter de Jewgal Academy. <a href="${escapeHtml(opts.unsubscribeUrl)}" style="color:#8a7867;text-decoration:underline;">Darme de baja</a></p>`
    : ""
  const note = opts.footerNote ? `<p style="margin:0;font-size:12px;line-height:1.6;color:#8a7867;">${escapeHtml(opts.footerNote)}</p>` : ""
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>Jewgal Academy</title></head>
<body style="margin:0;padding:0;background:#F4EBE4;">
${opts.preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(opts.preheader)}</div>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4EBE4;padding:28px 12px;"><tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FAF3F0;border:1px solid #E6D6C8;border-radius:16px;">
    <tr><td style="padding:30px 34px 6px;text-align:center;"><span style="font-family:Georgia,'Times New Roman',serif;font-size:26px;letter-spacing:.02em;color:#463018;">Jewgal <em style="color:#A76D61;">Academy</em></span></td></tr>
    <tr><td style="padding:14px 34px 10px;font-family:Georgia,'Times New Roman',serif;">${paragraphs(text)}${cta}</td></tr>
    <tr><td style="padding:6px 34px 28px;border-top:1px solid #E6D6C8;font-family:Arial,Helvetica,sans-serif;">${note}${unsub}</td></tr>
  </table>
</td></tr></table>
</body></html>`
}
