import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { groq, isAIConfigured, buildSystemPrompt, AI_MODEL } from "@/lib/ai"
import { rateLimit } from "@/lib/security"

const bodySchema = z.object({
  message: z.string().min(1).max(2000),
  conversationId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  if (!isAIConfigured()) {
    return NextResponse.json({ error: "El asistente no está disponible en este momento" }, { status: 503 })
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

  // Obtener o crear conversación
  let conversation
  if (conversationId) {
    conversation = await db.conversation.findFirst({
      where: { id: conversationId, userId: session.user.id },
      include: { messages: { orderBy: { createdAt: "asc" }, take: 20 } },
    })
  }
  if (!conversation) {
    conversation = await db.conversation.create({
      data: { userId: session.user.id, title: message.slice(0, 60) },
      include: { messages: true },
    })
  }

  // Persistir mensaje del usuario
  await db.chatMessage.create({
    data: { conversationId: conversation.id, role: "user", content: message },
  })

  const systemPrompt = await buildSystemPrompt(session.user.id)

  const history = (conversation.messages ?? []).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }))

  let fullResponse = ""
  let interrupted = false

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const groqStream = await groq.chat.completions.create({
          model: AI_MODEL,
          max_tokens: 2048,
          messages: [
            { role: "system", content: systemPrompt },
            ...history,
            { role: "user", content: message },
          ],
          stream: true,
        })

        for await (const chunk of groqStream) {
          const text = chunk.choices[0]?.delta?.content ?? ""
          if (text) {
            fullResponse += text
            controller.enqueue(new TextEncoder().encode(text))
          }
        }

        controller.close()
      } catch {
        interrupted = true
        controller.close()
      } finally {
        const content = fullResponse || ""
        if (content) {
          await db.chatMessage.create({
            data: {
              conversationId: conversation.id,
              role: "assistant",
              content: interrupted ? `${content} [respuesta interrumpida]` : content,
            },
          })
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
