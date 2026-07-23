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

export async function translateTexts(
  texts: string[],
  target: "EN" | "ES" = "EN"
): Promise<string[]> {
  const key = process.env.DEEPL_API_KEY
  if (!key) throw new Error("DEEPL_API_KEY no configurada")

  const nonEmpty = texts.map((t) => t?.trim() ?? "")
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
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`DeepL devolvió ${res.status}: ${body}`)
  }

  const data = (await res.json()) as { translations: { text: string }[] }
  return data.translations.map((t) => t.text)
}
