import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { groq, isAIConfigured, buildSystemPrompt, classifyAiError, AI_MODEL, AI_MODEL_OPTIONS } from "@/lib/ai"
import { rateLimit } from "@/lib/security"
import { getAiSettings, withExtraInstructions } from "@/lib/ai-settings"

// La respuesta se va emitiendo por partes: la función tiene que poder vivir más que el límite por defecto.
export const maxDuration = 60

const bodySchema = z.object({
  message: z.string().min(1).max(2000),
  conversationId: z.string().nullish(),
})

/** Cuántos mensajes anteriores de la conversación se le dan a la IA como contexto. */
const HISTORY_LIMIT = 20

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  if (!isAIConfigured()) {
    return NextResponse.json({ error: "El asistente no está disponible en este momento" }, { status: 503 })
  }

  // El asistente se puede pausar y limitar desde el panel (Asistente de IA).
  const ai = await getAiSettings()
  if (!ai.enabled) {
    return NextResponse.json({ error: "El asistente está en pausa por el momento. Volvé a intentar más tarde." }, { status: 503 })
  }

  const rl = rateLimit(`chat:${session.user.id}`, 20, 60_000)
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Esperá un momento e intentá de nuevo." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    )
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 })
  }
  const { message, conversationId } = parsed.data

  // Verificar inscripción activa
  const activeEnrollment = await db.enrollment.findFirst({
    where: { userId: session.user.id, status: { in: ["active", "completed"] } },
  })
  if (!activeEnrollment) {
    return NextResponse.json(
      { error: "Necesitás una inscripción activa para usar el asistente" },
      { status: 403 }
    )
  }

  if (ai.dailyLimit > 0) {
    const used = await db.chatMessage.count({
      where: { role: "user", createdAt: { gte: new Date(Date.now() - 24 * 3_600_000) }, conversation: { userId: session.user.id } },
    })
    if (used >= ai.dailyLimit) {
      return NextResponse.json({ error: `Llegaste al límite de ${ai.dailyLimit} mensajes por día con el asistente. Podés seguir mañana.` }, { status: 429 })
    }
  }

  // Conversación existente (si no se encuentra, se abre una nueva más abajo).
  // Se toman los ÚLTIMOS mensajes: con "asc" + take, pasados los primeros 20 la IA dejaba de ver lo reciente.
  const existing = conversationId
    ? await db.conversation.findFirst({
        where: { id: conversationId, userId: session.user.id },
        include: { messages: { orderBy: { createdAt: "desc" }, take: HISTORY_LIMIT } },
      })
    : null

  const systemPrompt = withExtraInstructions(await buildSystemPrompt(session.user.id), ai.extraInstructions)
  const history = (existing?.messages ?? [])
    .slice()
    .reverse()
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }))

  // La llamada a la IA se hace ANTES de responder y de guardar nada: si falla (clave, modelo, cuota, red),
  // el alumno recibe un aviso claro y no queda una burbuja vacía ni una pregunta sin respuesta en la conversación.
  const started = await groq.chat.completions
    .create({
      model: AI_MODEL,
      ...AI_MODEL_OPTIONS,
      max_tokens: ai.maxTokens,
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: message },
      ],
      stream: true,
    })
    .then((s) => ({ s }), (e: unknown) => ({ e }))
  if ("e" in started) {
    const f = classifyAiError(started.e)
    console.error(`[ai-chat] ${f.code}: ${f.adminMessage}`)
    return NextResponse.json({ error: f.userMessage }, { status: f.status })
  }
  const groqStream = started.s

  const conversation =
    existing ?? (await db.conversation.create({ data: { userId: session.user.id, title: message.slice(0, 60) } }))

  await db.chatMessage.create({
    data: { conversationId: conversation.id, role: "user", content: message },
  })

  let fullResponse = ""
  let interrupted = false
  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of groqStream) {
          const text = chunk.choices[0]?.delta?.content ?? ""
          if (text) {
            fullResponse += text
            controller.enqueue(encoder.encode(text))
          }
        }
      } catch (e) {
        interrupted = true
        console.error(`[ai-chat] respuesta interrumpida: ${classifyAiError(e).adminMessage}`)
        // Si no llegó nada, el alumno recibe un aviso en lugar de una burbuja vacía (no se guarda como respuesta).
        if (!fullResponse) {
          try { controller.enqueue(encoder.encode("No pude terminar la respuesta en este momento. Intentá de nuevo en unos minutos.")) } catch {}
        }
      } finally {
        try { controller.close() } catch {}
        if (fullResponse) {
          try {
            await db.chatMessage.create({
              data: {
                conversationId: conversation.id,
                role: "assistant",
                content: interrupted ? `${fullResponse} [respuesta interrumpida]` : fullResponse,
              },
            })
          } catch (e) {
            console.error("[ai-chat] no se pudo guardar la respuesta:", e instanceof Error ? e.message : e)
          }
        }
      }
    },
  })

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Conversation-Id": conversation.id,
      "Cache-Control": "no-store",
    },
  })
}
