"use client"

import { useState, useEffect, useCallback } from "react"
import { Save, KeyRound, Users, CreditCard, Mail, Search, Moon, Sun, Loader2, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react"

const card: React.CSSProperties = { background: "var(--surface)", border: "1px solid rgba(165,141,102,.13)", borderRadius: 14 }
const inputStyle: React.CSSProperties = { background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.2)", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: "var(--text)", outline: "none", fontFamily: "inherit", width: "100%" }
const labelStyle: React.CSSProperties = { fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--text-faint)", display: "block", marginBottom: 7 }

type Tab = "general" | "pagos" | "email" | "contrasenas"
type StudentRow = { id: string; name: string; email: string }

function StatusBadge({ ok }: { ok: boolean }) {
  return ok ? (
    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--success)", background: "rgba(107,191,142,.1)", border: "1px solid rgba(107,191,142,.25)", borderRadius: 20, padding: "4px 12px" }}>
      <CheckCircle2 size={12} /> Configurado
    </span>
  ) : (
    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--danger)", background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.25)", borderRadius: 20, padding: "4px 12px" }}>
      <AlertCircle size={12} /> No conectado
    </span>
  )
}

export default function ConfiguracionPage() {
  const [tab, setTab]             = useState<Tab>("general")
  const [theme, setTheme]         = useState<"dark" | "light">("dark")
  const [themeSaving, setThemeSaving] = useState(false)

  // General
  const [general, setGeneral] = useState({ name: "", url: "", email: "", phone: "", metaDescription: "" })
  const [generalLoading, setGeneralLoading] = useState(true)
  const [generalSaving, setGeneralSaving] = useState(false)
  const [generalSaved, setGeneralSaved] = useState(false)

  // Integraciones (solo lectura, vienen de env vars)
  const [integrations, setIntegrations] = useState<{ stripe: boolean; paypal: boolean; email: boolean; ai: boolean; cloudinary: boolean } | null>(null)

  // Reset password alumno
  const [students, setStudents] = useState<StudentRow[]>([])
  const [pwSearch, setPwSearch] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<StudentRow | null>(null)
  const [resetting, setResetting] = useState(false)
  const [tempPassword, setTempPassword] = useState("")
  const [resetError, setResetError] = useState("")

  // Mi contraseña (admin)
  const [pwCurrent, setPwCurrent] = useState("")
  const [pwNew, setPwNew] = useState("")
  const [pwConfirm, setPwConfirm] = useState("")
  const [myPwSaving, setMyPwSaving] = useState(false)
  const [myPwSaved, setMyPwSaved] = useState(false)
  const [myPwError, setMyPwError] = useState("")

  useEffect(() => {
    const t = document.documentElement.getAttribute("data-theme")
    setTheme(t === "light" ? "light" : "dark")
  }, [])

  useEffect(() => {
    fetch("/api/admin/settings/general").then((r) => r.json()).then(setGeneral).catch(() => {}).finally(() => setGeneralLoading(false))
    fetch("/api/admin/stats").then((r) => r.json()).then((d) => setIntegrations(d.integrations ?? null)).catch(() => {})
    fetch("/api/admin/students").then((r) => r.json()).then((d) => setStudents((d.students ?? []).map((s: StudentRow) => ({ id: s.id, name: s.name, email: s.email })))).catch(() => {})
  }, [])

  async function changeTheme(t: "dark" | "light") {
    if (t === theme || themeSaving) return
    setThemeSaving(true)
    const res = await fetch("/api/admin/theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: t }),
    })
    if (res.ok) {
      document.documentElement.setAttribute("data-theme", t)
      setTheme(t)
      window.location.reload()
    } else {
      setThemeSaving(false)
    }
  }

  async function saveGeneral() {
    setGeneralSaving(true)
    try {
      const res = await fetch("/api/admin/settings/general", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(general),
      })
      if (res.ok) { setGeneralSaved(true); setTimeout(() => setGeneralSaved(false), 2500) }
    } finally {
      setGeneralSaving(false)
    }
  }

  const filteredStudents = pwSearch.length > 1
    ? students.filter((s) => s.name.toLowerCase().includes(pwSearch.toLowerCase()) || s.email.toLowerCase().includes(pwSearch.toLowerCase()))
    : []

  async function resetStudentPassword() {
    if (!selectedStudent) return
    setResetting(true); setResetError(""); setTempPassword("")
    try {
      const res = await fetch(`/api/admin/students/${selectedStudent.id}/reset-password`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) { setResetError(data.error || "No se pudo resetear la contraseña"); return }
      setTempPassword(data.tempPassword)
    } finally {
      setResetting(false)
    }
  }

  async function saveMyPassword() {
    if (!pwNew || pwNew !== pwConfirm) return
    setMyPwSaving(true); setMyPwError("")
    try {
      const res = await fetch("/api/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwCurrent, newPassword: pwNew }),
      })
      const data = await res.json()
      if (!res.ok) { setMyPwError(data.error || "No se pudo actualizar"); return }
      setMyPwSaved(true)
      setPwCurrent(""); setPwNew(""); setPwConfirm("")
      setTimeout(() => setMyPwSaved(false), 2500)
    } finally {
      setMyPwSaving(false)
    }
  }

  const TABS: { key: Tab; label: string; icon: typeof Save }[] = [
    { key: "general",     label: "General",           icon: Save },
    { key: "pagos",       label: "Pagos",             icon: CreditCard },
    { key: "email",       label: "Email",             icon: Mail },
    { key: "contrasenas", label: "Contraseñas",       icon: KeyRound },
  ]

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <span style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", display: "block", marginBottom: 8 }}>Admin</span>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 36, color: "var(--text)", marginBottom: 6 }}>Configuración</h1>
        <p style={{ color: "var(--text-faint)", fontSize: 14 }}>Parámetros globales de la plataforma.</p>
      </div>

      {/* Tab nav */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "var(--surface)", borderRadius: 12, padding: 5 }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            padding: "10px 12px", borderRadius: 9, border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: tab === key ? 600 : 400,
            background: tab === key ? "rgba(165,141,102,.15)" : "transparent",
            color: tab === key ? "var(--gold)" : "var(--text-faint)",
            transition: "all .18s",
          }}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* GENERAL */}
      {tab === "general" && (
        <div style={{ ...card, padding: "28px 26px" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 20, color: "var(--text)", marginBottom: 22 }}>Información general</h2>
          {generalLoading ? (
            <p style={{ color: "var(--text-faint)", fontSize: 13 }}>Cargando…</p>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={labelStyle}>Nombre de la academia</label>
                  <input value={general.name} onChange={(e) => setGeneral((g) => ({ ...g, name: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>URL del sitio</label>
                  <input value={general.url} onChange={(e) => setGeneral((g) => ({ ...g, url: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Email de contacto</label>
                  <input value={general.email} onChange={(e) => setGeneral((g) => ({ ...g, email: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Teléfono / WhatsApp</label>
                  <input value={general.phone} onChange={(e) => setGeneral((g) => ({ ...g, phone: e.target.value }))} style={inputStyle} />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={labelStyle}>Descripción breve (meta description)</label>
                  <textarea value={general.metaDescription} onChange={(e) => setGeneral((g) => ({ ...g, metaDescription: e.target.value }))} rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }} />
                </div>
              </div>

              <button onClick={saveGeneral} disabled={generalSaving} style={{ marginTop: 22, background: generalSaved ? "var(--success)" : "var(--gold)", color: "#2C1F14", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 13, fontWeight: 700, cursor: generalSaving ? "not-allowed" : "pointer", opacity: generalSaving ? 0.7 : 1, display: "flex", alignItems: "center", gap: 8, transition: "background .3s" }}>
                {generalSaving ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={15} />}
                {generalSaving ? "Guardando…" : generalSaved ? "¡Guardado!" : "Guardar cambios"}
              </button>
            </>
          )}

          {/* Apariencia / Tema global */}
          <div style={{ marginTop: 26, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,.07)" }}>
            <label style={{ ...labelStyle, marginBottom: 6 }}>Apariencia de la plataforma</label>
            <p style={{ fontSize: 13, color: "var(--text-faint)", marginBottom: 14 }}>
              Cambia el tema de <strong style={{ color: "var(--text-strong)" }}>todo</strong> el sitio, el aula y el panel — para todos los visitantes.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                { key: "dark"  as const, label: "Modo oscuro", Icon: Moon, desc: "Elegante, fondos profundos" },
                { key: "light" as const, label: "Modo claro",  Icon: Sun,  desc: "Luminoso, fondos blancos" },
              ].map(({ key, label, Icon, desc }) => {
                const on = theme === key
                return (
                  <button key={key} onClick={() => changeTheme(key)} disabled={themeSaving}
                    style={{
                      flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start",
                      padding: "16px 18px", borderRadius: 12, cursor: themeSaving ? "wait" : "pointer",
                      background: on ? "rgba(165,141,102,.14)" : "var(--surface)",
                      border: `1px solid ${on ? "var(--gold)" : "rgba(255,255,255,.08)"}`,
                    }}>
                    <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, color: on ? "var(--gold)" : "var(--text-strong)" }}>
                      <Icon size={18} /> <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
                      {on && <span style={{ fontSize: 10, marginLeft: "auto", color: "var(--success)" }}>● Activo</span>}
                    </div>
                    <span style={{ fontSize: 12, color: "var(--text-faint)" }}>{desc}</span>
                  </button>
                )
              })}
            </div>
            {themeSaving && (
              <p style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-muted)", marginTop: 12 }}>
                <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Aplicando tema a toda la plataforma…
              </p>
            )}
          </div>
        </div>
      )}

      {/* PAGOS */}
      {tab === "pagos" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ ...card, padding: "18px 22px", display: "flex", gap: 12, alignItems: "flex-start", borderColor: "rgba(251,191,36,.15)", background: "rgba(251,191,36,.03)" }}>
            <AlertCircle size={16} style={{ color: "var(--warning)", flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
              Por seguridad, las claves secretas de pago se configuran como variables de entorno en Vercel, no desde este panel. Acá solo ves el estado de la conexión.
            </p>
          </div>

          {/* Stripe */}
          <div style={{ ...card, padding: "26px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 18, color: "var(--text)", marginBottom: 4 }}>Stripe</h2>
                <p style={{ fontSize: 13, color: "var(--text-faint)" }}>Tarjetas de crédito y débito</p>
              </div>
              {integrations ? <StatusBadge ok={integrations.stripe} /> : <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Verificando…</span>}
            </div>
            <p style={{ fontSize: 12.5, color: "var(--text-dim)", marginBottom: 12 }}>
              Variables requeridas: <code style={{ background: "var(--surface-2)", padding: "1px 6px", borderRadius: 4 }}>STRIPE_SECRET_KEY</code>, <code style={{ background: "var(--surface-2)", padding: "1px 6px", borderRadius: 4 }}>STRIPE_PUBLISHABLE_KEY</code>, <code style={{ background: "var(--surface-2)", padding: "1px 6px", borderRadius: 4 }}>STRIPE_WEBHOOK_SECRET</code>.
            </p>
            <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.2)", borderRadius: 9, padding: "10px 18px", fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>
              <ExternalLink size={14} /> Configurar en Vercel
            </a>
          </div>

          {/* PayPal */}
          <div style={{ ...card, padding: "26px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 18, color: "var(--text)", marginBottom: 4 }}>PayPal</h2>
                <p style={{ fontSize: 13, color: "var(--text-faint)" }}>Pagos vía cuenta PayPal</p>
              </div>
              {integrations ? <StatusBadge ok={integrations.paypal} /> : <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Verificando…</span>}
            </div>
            <p style={{ fontSize: 12.5, color: "var(--text-dim)", marginBottom: 12 }}>
              Variables requeridas: <code style={{ background: "var(--surface-2)", padding: "1px 6px", borderRadius: 4 }}>PAYPAL_CLIENT_ID</code>, <code style={{ background: "var(--surface-2)", padding: "1px 6px", borderRadius: 4 }}>PAYPAL_CLIENT_SECRET</code>.
            </p>
            <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.2)", borderRadius: 9, padding: "10px 18px", fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>
              <ExternalLink size={14} /> Configurar en Vercel
            </a>
          </div>

          {/* Asistente IA (Anthropic) */}
          <div style={{ ...card, padding: "26px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 18, color: "var(--text)", marginBottom: 4 }}>Asistente IA (Groq)</h2>
                <p style={{ fontSize: 13, color: "var(--text-faint)" }}>Chat de acompañamiento para los alumnos</p>
              </div>
              {integrations ? <StatusBadge ok={integrations.ai} /> : <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Verificando…</span>}
            </div>
            <p style={{ fontSize: 12.5, color: "var(--text-dim)", marginBottom: 12 }}>
              Variable requerida: <code style={{ background: "var(--surface-2)", padding: "1px 6px", borderRadius: 4 }}>GROQ_API_KEY</code>.
            </p>
            <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.2)", borderRadius: 9, padding: "10px 18px", fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>
              <ExternalLink size={14} /> Configurar en Vercel
            </a>
          </div>

          {/* Cloudinary */}
          <div style={{ ...card, padding: "26px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 18, color: "var(--text)", marginBottom: 4 }}>Cloudinary</h2>
                <p style={{ fontSize: 13, color: "var(--text-faint)" }}>Almacenamiento de audios y videos de recursos exclusivos</p>
              </div>
              {integrations ? <StatusBadge ok={integrations.cloudinary} /> : <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Verificando…</span>}
            </div>
            <p style={{ fontSize: 12.5, color: "var(--text-dim)", marginBottom: 12 }}>
              Variables requeridas: <code style={{ background: "var(--surface-2)", padding: "1px 6px", borderRadius: 4 }}>CLOUDINARY_CLOUD_NAME</code>, <code style={{ background: "var(--surface-2)", padding: "1px 6px", borderRadius: 4 }}>CLOUDINARY_API_KEY</code>, <code style={{ background: "var(--surface-2)", padding: "1px 6px", borderRadius: 4 }}>CLOUDINARY_API_SECRET</code>.
            </p>
            <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.2)", borderRadius: 9, padding: "10px 18px", fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>
              <ExternalLink size={14} /> Configurar en Vercel
            </a>
          </div>
        </div>
      )}

      {/* EMAIL */}
      {tab === "email" && (
        <div style={{ ...card, padding: "28px 26px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
            <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 20, color: "var(--text)" }}>Email (Resend)</h2>
            {integrations ? <StatusBadge ok={integrations.email} /> : <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Verificando…</span>}
          </div>
          <p style={{ color: "var(--text-faint)", fontSize: 14, marginBottom: 20 }}>
            La API key de Resend se configura como variable de entorno en Vercel, no desde este panel.
          </p>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "rgba(251,191,36,.06)", border: "1px solid rgba(251,191,36,.15)", borderRadius: 9, padding: "12px 14px", marginBottom: 20 }}>
            <AlertCircle size={15} style={{ color: "var(--warning)", flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
              El envío automático de emails (bienvenida, confirmación de pago, recordatorios) todavía no está implementado en el código — la key de Resend está lista para usarse, pero ningún flujo la dispara todavía.
            </p>
          </div>
          <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.2)", borderRadius: 9, padding: "10px 18px", fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>
            <ExternalLink size={14} /> Configurar RESEND_API_KEY en Vercel
          </a>
        </div>
      )}

      {/* CONTRASEÑAS */}
      {tab === "contrasenas" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Buscar alumno */}
          <div style={{ ...card, padding: "26px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <Users size={18} style={{ color: "var(--gold)" }} />
              <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 18, color: "var(--text)" }}>Resetear contraseña de alumno</h2>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-faint)", marginBottom: 22 }}>Buscá un alumno por email y generá una contraseña temporal.</p>

            <div style={{ position: "relative", marginBottom: 16 }}>
              <Search size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }} />
              <input
                value={pwSearch} onChange={(e) => { setPwSearch(e.target.value); setSelectedStudent(null); setTempPassword(""); setResetError("") }}
                placeholder="Buscar por email o nombre…"
                style={{ ...inputStyle, paddingLeft: 38 }}
              />
            </div>

            {pwSearch.length > 1 && !selectedStudent && (
              <div style={{ background: "var(--surface)", border: "1px solid rgba(165,141,102,.15)", borderRadius: 10, marginBottom: 16, overflow: "hidden" }}>
                {filteredStudents.length === 0 ? (
                  <p style={{ padding: "16px 18px", fontSize: 13, color: "var(--text-dim)" }}>No se encontraron alumnos con ese criterio.</p>
                ) : (
                  filteredStudents.slice(0, 6).map((s) => (
                    <button key={s.id} onClick={() => { setSelectedStudent(s); setPwSearch(s.name) }}
                      style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 18px", background: "none", border: "none", borderBottom: "1px solid var(--surface-2)", cursor: "pointer", color: "var(--text-strong)", fontSize: 13 }}>
                      {s.name} <span style={{ color: "var(--text-dim)", fontSize: 12 }}>· {s.email}</span>
                    </button>
                  ))
                )}
              </div>
            )}

            {resetError && <p style={{ fontSize: 13, color: "var(--danger)", marginBottom: 14 }}>{resetError}</p>}

            {tempPassword && (
              <div style={{ background: "rgba(107,191,142,.08)", border: "1px solid rgba(107,191,142,.25)", borderRadius: 9, padding: "14px 16px", marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>Nueva contraseña temporal para {selectedStudent?.name} — copiala y compartila de forma segura:</p>
                <code style={{ fontSize: 15, fontWeight: 700, color: "var(--success)", letterSpacing: ".04em" }}>{tempPassword}</code>
              </div>
            )}

            <button onClick={resetStudentPassword} disabled={!selectedStudent || resetting}
              style={{ background: tempPassword ? "var(--success)" : "var(--gold)", color: tempPassword ? "var(--bg)" : "#2C1F14", border: "none", borderRadius: 9, padding: "11px 22px", fontSize: 13, fontWeight: 700, cursor: !selectedStudent || resetting ? "not-allowed" : "pointer", opacity: !selectedStudent || resetting ? 0.5 : 1, display: "flex", alignItems: "center", gap: 8, transition: "background .3s" }}>
              {resetting ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <KeyRound size={14} />}
              {resetting ? "Generando…" : tempPassword ? "Generar otra contraseña" : "Generar contraseña temporal"}
            </button>
          </div>

          {/* Mi contraseña admin */}
          <div style={{ ...card, padding: "26px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <KeyRound size={18} style={{ color: "var(--teal)" }} />
              <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 18, color: "var(--text)" }}>Mi contraseña (admin)</h2>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-faint)", marginBottom: 22 }}>Cambiá la contraseña de acceso al panel de administración.</p>
            {myPwError && <p style={{ fontSize: 13, color: "var(--danger)", marginBottom: 14 }}>{myPwError}</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label style={labelStyle}>Contraseña actual</label><input type="password" value={pwCurrent} onChange={(e) => setPwCurrent(e.target.value)} placeholder="••••••••" style={inputStyle} /></div>
              <div><label style={labelStyle}>Nueva contraseña</label><input type="password" value={pwNew} onChange={(e) => setPwNew(e.target.value)} placeholder="Mínimo 6 caracteres" style={inputStyle} /></div>
              <div><label style={labelStyle}>Confirmar nueva contraseña</label><input type="password" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} placeholder="Repetir contraseña" style={inputStyle} /></div>
            </div>
            <button onClick={saveMyPassword} disabled={!pwCurrent || !pwNew || pwNew !== pwConfirm || myPwSaving}
              style={{ marginTop: 18, background: myPwSaved ? "var(--success)" : "#A76D61", color: "white", border: "none", borderRadius: 9, padding: "11px 22px", fontSize: 13, fontWeight: 700, cursor: !pwCurrent || !pwNew || pwNew !== pwConfirm ? "not-allowed" : "pointer", opacity: !pwCurrent || !pwNew || pwNew !== pwConfirm ? 0.5 : 1, transition: "background .3s", display: "flex", alignItems: "center", gap: 8 }}>
              {myPwSaving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : null}
              {myPwSaved ? "¡Contraseña actualizada!" : "Cambiar mi contraseña"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
