"use client"

import { useEffect, useRef, useState } from "react"
import { MessageCircle, Send, Loader2, Plus, AlertCircle, ChevronLeft, History } from "lucide-react"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: string
}

type Conversation = {
  id: string
  title: string | null
  updatedAt: string
  _count: { messages: number }
}

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid rgba(165,141,102,.14)",
  borderRadius: 14,
}

export default function AsistentePage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [noEnrollment, setNoEnrollment] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetch("/api/me/conversations")
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations ?? []))
      .catch(() => {})
      .finally(() => setLoadingConvs(false))
  }, [])

  useEffect(() => {
    if (!activeId) return
    fetch(`/api/me/conversations/${activeId}`)
      .then((r) => r.json())
      .then((d) => setMessages(d.conversation?.messages ?? []))
      .catch(() => {})
  }, [activeId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage() {
    const text = input.trim()
    if (!text || streaming) return
    setInput("")
    setError(null)

    const optimisticUser: Message = {
      id: `tmp-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimisticUser])

    const placeholderId = `stream-${Date.now()}`
    setMessages((prev) => [...prev, { id: placeholderId, role: "assistant", content: "", createdAt: new Date().toISOString() }])
    setStreaming(true)

    try {
      const res = await fetch("/api/me/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, ...(activeId ? { conversationId: activeId } : {}) }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (res.status === 403) setNoEnrollment(true)
        setError(data.error ?? "Error al conectar con el asistente")
        setMessages((prev) => prev.filter((m) => m.id !== placeholderId && m.id !== optimisticUser.id))
        return
      }

      const convId = res.headers.get("X-Conversation-Id")
      if (convId && !activeId) setActiveId(convId)

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        const snap = accumulated
        setMessages((prev) => prev.map((m) => (m.id === placeholderId ? { ...m, content: snap } : m)))
      }

      const convsData = await fetch("/api/me/conversations").then((r) => r.json())
      setConversations(convsData.conversations ?? [])
    } catch {
      setError("Hubo un problema al enviar tu mensaje. Intentá de nuevo.")
      setMessages((prev) => prev.filter((m) => m.id !== placeholderId && m.id !== optimisticUser.id))
    } finally {
      setStreaming(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function newConversation() {
    setActiveId(null)
    setMessages([])
    setError(null)
    setNoEnrollment(false)
    setShowSidebar(false)
    textareaRef.current?.focus()
  }

  function selectConversation(id: string) {
    setActiveId(id)
    setError(null)
    setShowSidebar(false)
  }

  const SidebarContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%" }}>
      <button
        onClick={newConversation}
        style={{
          display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
          borderRadius: 10, border: "1px solid rgba(165,141,102,.25)",
          background: "rgba(165,141,102,.08)", cursor: "pointer",
          fontSize: 13, color: "var(--gold)", fontWeight: 600, width: "100%",
          transition: "all .2s", flexShrink: 0,
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(165,141,102,.16)" }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(165,141,102,.08)" }}
      >
        <Plus size={15} /> Nueva conversación
      </button>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
        {loadingConvs ? (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 20 }}>
            <Loader2 size={16} style={{ color: "var(--text-dim)", animation: "spin 1s linear infinite" }} />
          </div>
        ) : conversations.length === 0 ? (
          <p style={{ fontSize: 12, color: "var(--text-dim)", padding: "12px 4px", textAlign: "center" }}>
            Sin conversaciones aún
          </p>
        ) : (
          conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => selectConversation(c.id)}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                background: c.id === activeId ? "rgba(165,141,102,.14)" : "transparent",
                borderLeft: c.id === activeId ? "2px solid var(--gold)" : "2px solid transparent",
                transition: "all .15s",
              }}
            >
              <p style={{ fontSize: 12, fontWeight: 600, color: c.id === activeId ? "var(--gold)" : "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>
                {c.title ?? "Conversación"}
              </p>
              <p style={{ fontSize: 11, color: "var(--text-dim)" }}>{c._count.messages} mensajes</p>
            </button>
          ))
        )}
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100% { opacity:.3 } 50% { opacity:1 } }
        @keyframes spin  { to { transform: rotate(360deg) } }
        .chat-layout { display: flex; gap: 24px; height: calc(100vh - 132px); }
        .chat-sidebar { width: 220px; flex-shrink: 0; }
        .chat-sidebar-drawer {
          display: none;
          position: fixed; inset: 0; z-index: 50;
          background: var(--scrim, rgba(0,0,0,.45));
          backdrop-filter: blur(4px);
        }
        .chat-sidebar-drawer.open { display: flex; align-items: flex-end; }
        .chat-sidebar-drawer-inner {
          width: 100%; max-height: 65vh;
          background: var(--bg);
          border-radius: 20px 20px 0 0;
          padding: 20px 16px 32px;
          display: flex; flex-direction: column; gap: 12px;
        }
        .chat-history-btn { display: none; }

        @media (max-width: 600px) {
          .chat-layout { flex-direction: column; gap: 0; height: calc(100vh - 120px); }
          .chat-sidebar { display: none; }
          .chat-history-btn { display: flex; }
        }
      `}</style>

      <div className="chat-layout">

        {/* Sidebar — solo desktop */}
        <aside className="chat-sidebar">
          {SidebarContent}
        </aside>

        {/* Drawer historial — solo mobile */}
        <div
          className={`chat-sidebar-drawer${showSidebar ? " open" : ""}`}
          onClick={(e) => { if (e.target === e.currentTarget) setShowSidebar(false) }}
        >
          <div className="chat-sidebar-drawer-inner">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", fontFamily: "var(--serif)" }}>
                Conversaciones
              </span>
              <button
                onClick={() => setShowSidebar(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}
              >
                <ChevronLeft size={15} /> Cerrar
              </button>
            </div>
            {SidebarContent}
          </div>
        </div>

        {/* Área de chat */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", ...card, overflow: "hidden", minHeight: 0 }}>

          {/* Header */}
          <div style={{
            padding: "14px 18px", borderBottom: "1px solid rgba(165,141,102,.1)",
            display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
          }}>
            {/* Botón historial mobile */}
            <button
              className="chat-history-btn"
              onClick={() => setShowSidebar(true)}
              style={{
                background: "rgba(165,141,102,.08)", border: "1px solid rgba(165,141,102,.2)",
                borderRadius: 8, padding: "6px 10px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 12, color: "var(--gold)", fontWeight: 600, flexShrink: 0,
              }}
            >
              <History size={14} />
              {conversations.length > 0 ? conversations.length : ""}
            </button>

            <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,rgba(196,159,114,.25) 0%,rgba(167,109,97,.15) 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <MessageCircle size={16} style={{ color: "var(--gold)" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>Asistente Jewgal</p>
              <p style={{ fontSize: 11, color: "var(--text-dim)" }}>Acompañamiento para tu aprendizaje</p>
            </div>

            {/* Nueva conversación mobile */}
            <button
              className="chat-history-btn"
              onClick={newConversation}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--gold)", padding: "6px", flexShrink: 0, display: "flex",
              }}
              title="Nueva conversación"
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Mensajes */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
            {noEnrollment ? (
              <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <AlertCircle size={28} style={{ color: "rgba(165,141,102,.4)", margin: "0 auto 14px", display: "block" }} />
                <p style={{ color: "var(--text-muted)", fontSize: 15, fontFamily: "var(--serif)", fontWeight: 500, marginBottom: 8 }}>
                  Inscripción requerida
                </p>
                <p style={{ color: "var(--text-dim)", fontSize: 13, maxWidth: 300, margin: "0 auto" }}>
                  Necesitás una inscripción activa para usar el asistente.
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(165,141,102,.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <MessageCircle size={22} style={{ color: "var(--gold)" }} />
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: 16, fontFamily: "var(--serif)", fontWeight: 500, marginBottom: 8 }}>
                  ¿En qué te puedo acompañar hoy?
                </p>
                <p style={{ color: "var(--text-dim)", fontSize: 13, maxWidth: 300, margin: "0 auto", lineHeight: 1.6 }}>
                  Podés preguntarme sobre los contenidos del programa, pedir reflexiones o explorar conceptos de tu curso.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {messages.map((m) => (
                  <div key={m.id} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                    <div style={{
                      maxWidth: "82%",
                      padding: "11px 15px",
                      borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                      background: m.role === "user"
                        ? "linear-gradient(135deg,#A76D61 0%,#C49F72 100%)"
                        : "rgba(165,141,102,.07)",
                      border: m.role === "assistant" ? "1px solid rgba(165,141,102,.12)" : "none",
                      color: m.role === "user" ? "#fff" : "var(--text)",
                      fontSize: 14,
                      lineHeight: 1.65,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}>
                      {m.content || (
                        <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)", animation: "pulse 1s ease-in-out infinite" }} />
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)", animation: "pulse 1s ease-in-out .2s infinite" }} />
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)", animation: "pulse 1s ease-in-out .4s infinite" }} />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              margin: "0 12px 8px", padding: "10px 14px", borderRadius: 8,
              background: "rgba(239,68,68,.06)", border: "1px solid rgba(239,68,68,.15)",
              color: "var(--danger, #ef4444)", fontSize: 13,
              display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
            }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: "10px 12px", borderTop: "1px solid rgba(165,141,102,.1)",
            display: "flex", alignItems: "flex-end", gap: 8, flexShrink: 0,
          }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribí tu pregunta…"
              disabled={streaming || noEnrollment}
              rows={1}
              style={{
                flex: 1, resize: "none",
                background: "var(--bg)",
                border: "1px solid rgba(165,141,102,.2)",
                borderRadius: 10, padding: "10px 14px",
                fontSize: 14, color: "var(--text)",
                outline: "none", fontFamily: "inherit",
                lineHeight: 1.5, maxHeight: 100, overflowY: "auto",
                transition: "border-color .2s",
              }}
              onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(165,141,102,.45)" }}
              onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(165,141,102,.2)" }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || streaming || noEnrollment}
              style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: !input.trim() || streaming || noEnrollment
                  ? "rgba(165,141,102,.1)"
                  : "linear-gradient(135deg,#A76D61 0%,#C49F72 100%)",
                border: "none",
                cursor: !input.trim() || streaming || noEnrollment ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: !input.trim() || streaming || noEnrollment ? "var(--text-dim)" : "#fff",
                transition: "all .2s",
              }}
              aria-label="Enviar"
            >
              {streaming
                ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                : <Send size={16} />
              }
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
