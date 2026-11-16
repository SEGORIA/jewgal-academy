import { NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import { AI_MODEL, AI_MODEL_OPTIONS, classifyAiError, groq, isAIConfigured } from "@/lib/ai"

export const dynamic = "force-dynamic"
export const maxDuration = 30

/**
 * Prueba real del asistente: hace una consulta mínima a Groq (unos pocos tokens) y dice si la clave y el modelo sirven.
 * Nunca devuelve la clave. Solo el superadministrador; cada presión del botón gasta una consulta de la cuota.
 */
export async function POST() {
  const g = await adminGuard("superadmin")
  if (!g.ok) return g.response
  g.enter()

  if (!isAIConfigured()) {
    return NextResponse.json({
      ok: false,
      model: AI_MODEL,
      message: "Falta la clave de la IA: GROQ_API_KEY no está configurada (o no empieza con “gsk_”). Creala en console.groq.com/keys, cargala en Vercel → Settings → Environment Variables (Production) y volvé a desplegar.",
    })
  }

  const t0 = Date.now()
  try {
    // Mismo camino que el chat de los alumnos (respuesta por partes), para que la prueba signifique lo mismo.
    const stream = await groq.chat.completions.create(
      { model: AI_MODEL, ...AI_MODEL_OPTIONS, max_tokens: 256, stream: true, messages: [{ role: "user", content: "Respondé solo con la palabra: listo" }] },
      { timeout: 15_000, maxRetries: 0 },
    )
    let reply = ""
    for await (const chunk of stream) reply += chunk.choices[0]?.delta?.content ?? ""
    reply = reply.trim()
    if (!reply) {
      return NextResponse.json({ ok: false, model: AI_MODEL, ms: Date.now() - t0, code: "unknown", message: `La IA aceptó la consulta pero respondió sin texto (modelo ${AI_MODEL}). Probá de nuevo; si se repite, definí GROQ_MODEL en Vercel con otro modelo vigente.` })
    }
    return NextResponse.json({
      ok: true,
      model: AI_MODEL,
      ms: Date.now() - t0,
      message: `El asistente responde con normalidad (modelo ${AI_MODEL}).`,
      reply: reply.slice(0, 40),
    })
  } catch (e) {
    const f = classifyAiError(e)
    return NextResponse.json({ ok: false, model: AI_MODEL, ms: Date.now() - t0, code: f.code, message: f.adminMessage })
  }
}
