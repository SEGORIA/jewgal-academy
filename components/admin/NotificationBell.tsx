"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Bell, RefreshCcw, ShieldAlert, CheckCheck, CreditCard } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type Notification = {
  id: string
  type: "duplicate_purchase_blocked" | "refund_synced" | "payment_received"
  message: string
  isRead: boolean
  createdAt: string
}

const ICONS = {
  duplicate_purchase_blocked: ShieldAlert,
  refund_synced: RefreshCcw,
  payment_received: CreditCard,
} as const

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  const load = useCallback(() => {
    fetch("/api/admin/notifications", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setNotifications(d.notifications ?? [])
        setUnreadCount(d.unreadCount ?? 0)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 30_000) // refresco silencioso cada 30s
    return () => clearInterval(interval)
  }, [load])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  async function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    setUnreadCount((c) => Math.max(0, c - 1))
    await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {})
  }

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    setUnreadCount(0)
    await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    }).catch(() => {})
  }

  function timeAgo(iso: string) {
    const diffMs = Date.now() - new Date(iso).getTime()
    const min = Math.floor(diffMs / 60_000)
    if (min < 1) return "recién"
    if (min < 60) return `hace ${min} min`
    const h = Math.floor(min / 60)
    if (h < 24) return `hace ${h} h`
    return `hace ${Math.floor(h / 24)} d`
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => { setOpen((o) => !o); if (!open) load() }}
        aria-label="Notificaciones"
        aria-expanded={open}
        style={{
          position: "relative", width: 34, height: 34, borderRadius: "50%",
          background: "rgba(165,141,102,.1)", border: "1px solid rgba(165,141,102,.18)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "var(--gold)",
        }}
      >
        <Bell size={15} />
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: -3, right: -3,
            minWidth: 16, height: 16, borderRadius: 8, padding: "0 4px",
            background: "var(--danger)", color: "#fff",
            fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 0 2px var(--bg-3)",
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute", top: 44, right: 0, zIndex: 60,
              width: 360, maxHeight: 420, overflowY: "auto",
              background: "var(--surface-solid)", border: "1px solid rgba(165,141,102,.2)",
              borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,.4)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid var(--surface-2)" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Notificaciones</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", color: "var(--gold)", fontSize: 11.5, cursor: "pointer", fontWeight: 600 }}>
                  <CheckCheck size={13} /> Marcar todas
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p style={{ padding: "28px 16px", textAlign: "center", color: "var(--text-dim)", fontSize: 13 }}>
                Sin notificaciones todavía.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {notifications.map((n) => {
                  const Icon = ICONS[n.type] ?? Bell
                  return (
                    <button
                      key={n.id}
                      onClick={() => !n.isRead && markRead(n.id)}
                      style={{
                        display: "flex", gap: 10, alignItems: "flex-start", textAlign: "left",
                        padding: "12px 16px", borderBottom: "1px solid var(--surface-2)",
                        background: n.isRead ? "transparent" : "rgba(165,141,102,.06)",
                        border: "none", borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: "var(--surface-2)",
                        cursor: n.isRead ? "default" : "pointer", width: "100%",
                      }}
                    >
                      <Icon size={15} style={{
                        color: n.type === "refund_synced" ? "var(--warning)" : n.type === "payment_received" ? "var(--success)" : "var(--danger)",
                        flexShrink: 0, marginTop: 2,
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12.5, color: "var(--text)", lineHeight: 1.5 }}>{n.message}</p>
                        <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{timeAgo(n.createdAt)}</span>
                      </div>
                      {!n.isRead && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--gold)", flexShrink: 0, marginTop: 5 }} />}
                    </button>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
