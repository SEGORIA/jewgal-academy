/**
 * Traducción asistida por IA (DeepL) para generar el primer borrador en
 * inglés de los textos que Devora ya escribió en español. Siempre queda a
 * revisión manual desde el superadmin antes de publicar.
 * No-op si no hay DEEPL_API_KEY configurada.
 */

export function isDeepLConfigured() {
  return Boolean(process.env.DEEPL_API_KEY)
}

// Las API keys del plan gratuito de DeepL terminan en ":fx" y usan un host distinto.
function deeplEndpoint(key: string) {
  return key.endsWith(":fx")
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate"
}

/**
 * Las variables {curso} de los textos del sitio no se deben traducir ni tocar. Se cambian por una marca XML que
 * DeepL ignora (<x n="0"/>) y se restauran al volver. Las marcas <b>…</b> las conserva el modo XML de DeepL.
 */
export function protectPlaceholders(text: string): { text: string; vars: string[] } {
  const vars: string[] = []
  const protectedText = text.replace(/\{[^{}]*\}/g, (m) => { vars.push(m); return `<x n="${vars.length - 1}"/>` })
  return { text: protectedText, vars }
}
export function restorePlaceholders(text: string, vars: string[]): string {
  return text.replace(/<x\s+n="(\d+)"\s*\/?>(?:<\/x>)?/g, (_m, i: string) => vars[Number(i)] ?? "")
}

export async function translateTexts(
  texts: string[],
  target: "EN" | "ES" = "EN",
  opts: { preserveMarkup?: boolean } = {}
): Promise<string[]> {
  const key = process.env.DEEPL_API_KEY
  if (!key) throw new Error("DEEPL_API_KEY no configurada")

  const trimmed = texts.map((t) => t?.trim() ?? "")
  const prepared = opts.preserveMarkup ? trimmed.map(protectPlaceholders) : trimmed.map((t) => ({ text: t, vars: [] as string[] }))
  const nonEmpty = prepared.map((p) => p.text)
  const res = await fetch(deeplEndpoint(key), {
    method: "POST",
    headers: {
      "Authorization": `DeepL-Auth-Key ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: nonEmpty,
      target_lang: target,
      source_lang: target === "EN" ? "ES" : "EN",
      ...(opts.preserveMarkup ? { tag_handling: "xml", ignore_tags: ["x"] } : {}),
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`DeepL devolvió ${res.status}: ${body}`)
  }

  const data = (await res.json()) as { translations: { text: string }[] }
  return data.translations.map((t, i) => (opts.preserveMarkup ? restorePlaceholders(t.text, prepared[i]?.vars ?? []) : t.text))
}
