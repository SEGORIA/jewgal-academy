"use client"

import { useState, useEffect } from "react"
import { Save, Eye, EyeOff, KeyRound, Users, CreditCard, Mail, Search, Moon, Sun, Loader2 } from "lucide-react"

const card: React.CSSProperties = { background: "var(--surface)", border: "1px solid rgba(165,141,102,.13)", borderRadius: 14 }
const inputStyle: React.CSSProperties = { background: "var(--surface-2)", border: "1px solid rgba(165,141,102,.2)", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: "var(--text)", outline: "none", fontFamily: "inherit", width: "100%" }
const labelStyle: React.CSSProperties = { fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--text-faint)", display: "block", marginBottom: 7 }

type Tab = "general" | "pagos" | "email" | "contrasenas"

export default function ConfiguracionPage() {
  const [tab, setTab]             = useState<Tab>("general")
  const [saved, setSaved]         = useState(false)
  const [showStripe, setShowStripe] = useState(false)
  const [showPayPal, setShowPayPal] = useState(false)
  const [pwSearch, setPwSearch]   = useState("")
  const [newPw, setNewPw]         = useState("")
  const [pwSaved, setPwSaved]     = useState(false)
  const [theme, setTheme]         = useState<"dark" | "light">("dark")
  const [themeSaving, setThemeSaving] = useState(false)

  useEffect(() => {
    const t = document.documentElement.getAttribute("data-theme")
    setTheme(t === "light" ? "light" : "dark")
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
      window.location.reload() // refresca el layout para aplicar el tema en toda la plataforma
    } else {
      setThemeSaving(false)
    }
  }

  function handleSave() { setSaved(true); setTimeout(() => setSaved(false), 2500) }
  function handlePwSave() { setPwSaved(true); setTimeout(() => setPwSaved(false), 2500) }

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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { label: "Nombre de la academia", key: "name", val: "Jewgal Academy" },
              { label: "URL del sitio", key: "url", val: "https://jewgalacademy.com" },
              { label: "Email de contacto", key: "email", val: "hola@jewgalacademy.com" },
              { label: "Teléfono / WhatsApp", key: "phone", val: "+1 (305) 000-0000" },
            ].map(({ label, key, val }) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <input defaultValue={val} style={inputStyle} />
              </div>
            ))}
            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>Descripción breve (meta description)</label>
              <textarea defaultValue="Programas de Life Coaching Integrativo, Cabalá y bienestar para transformación consciente." rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }} />
            </div>
          </div>
          <div style={{ marginTop: 22 }}>
            <label style={{ ...labelStyle, marginBottom: 12 }}>Modo de la plataforma</label>
            <div style={{ display: "flex", gap: 10 }}>
              {["Producción", "Modo demo (sin cobros reales)", "Mantenimiento"].map((m, i) => (
                <label key={m} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "var(--text-strong)" }}>
                  <input type="radio" name="mode" defaultChecked={i === 1} style={{ accentColor: "var(--gold)" }} /> {m}
                </label>
              ))}
            </div>
          </div>
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

          <button onClick={handleSave} style={{ marginTop: 24, background: saved ? "var(--success)" : "var(--gold)", color: "#2C1F14", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "background .3s" }}>
            <Save size={15} /> {saved ? "¡Guardado!" : "Guardar cambios"}
          </button>
        </div>
      )}

      {/* PAGOS */}
      {tab === "pagos" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Stripe */}
          <div style={{ ...card, padding: "26px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 18, color: "var(--text)", marginBottom: 4 }}>Stripe</h2>
                <p style={{ fontSize: 13, color: "var(--text-faint)" }}>Tarjetas de crédito y débito</p>
              </div>
              <span style={{ fontSize: 11, color: "var(--danger)", background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.25)", borderRadius: 20, padding: "4px 12px" }}>No conectado</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                { label: "Secret Key (sk_...)", key: "stripe_sk", placeholder: "sk_test_..." },
                { label: "Publishable Key (pk_...)", key: "stripe_pk", placeholder: "pk_test_..." },
                { label: "Webhook Secret (whsec_...)", key: "stripe_wh", placeholder: "whsec_..." },
              ].map(({ label, key, placeholder }) => (
                <div key={key} style={{ gridColumn: key === "stripe_wh" ? "span 2" : undefined }}>
                  <label style={labelStyle}>{label}</label>
                  <div style={{ position: "relative" }}>
                    <input type={showStripe ? "text" : "password"} placeholder={placeholder} style={{ ...inputStyle, paddingRight: 40 }} />
                    <button type="button" onClick={() => setShowStripe(!showStripe)} aria-label={showStripe ? "Ocultar clave" : "Mostrar clave"} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)" }}>
                      {showStripe ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleSave} style={{ marginTop: 18, background: "var(--gold)", color: "#2C1F14", border: "none", borderRadius: 9, padding: "11px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Conectar Stripe
            </button>
          </div>

          {/* PayPal */}
          <div style={{ ...card, padding: "26px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 18, color: "var(--text)", marginBottom: 4 }}>PayPal</h2>
                <p style={{ fontSize: 13, color: "var(--text-faint)" }}>Pagos vía cuenta PayPal</p>
              </div>
              <span style={{ fontSize: 11, color: "var(--danger)", background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.25)", borderRadius: 20, padding: "4px 12px" }}>No conectado</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              {[
                { label: "Client ID", placeholder: "Client ID de PayPal" },
                { label: "Client Secret", placeholder: "Client Secret de PayPal" },
              ].map(({ label, placeholder }) => (
                <div key={label}>
                  <label style={labelStyle}>{label}</label>
                  <div style={{ position: "relative" }}>
                    <input type={showPayPal ? "text" : "password"} placeholder={placeholder} style={{ ...inputStyle, paddingRight: 40 }} />
                    <button type="button" onClick={() => setShowPayPal(!showPayPal)} aria-label={showPayPal ? "Ocultar clave" : "Mostrar clave"} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)" }}>
                      {showPayPal ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
              <input type="checkbox" style={{ accentColor: "var(--gold)" }} /> Modo sandbox (pruebas)
            </label>
            <button onClick={handleSave} style={{ background: "var(--gold)", color: "#2C1F14", border: "none", borderRadius: 9, padding: "11px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Conectar PayPal
            </button>
          </div>
        </div>
      )}

      {/* EMAIL */}
      {tab === "email" && (
        <div style={{ ...card, padding: "28px 26px" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 20, color: "var(--text)", marginBottom: 6 }}>Configuración de email</h2>
          <p style={{ color: "var(--text-faint)", fontSize: 14, marginBottom: 24 }}>El sistema usa Resend para enviar emails de confirmación, bienvenida y recordatorios.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>API Key de Resend</label>
              <input type="password" placeholder="re_xxxxxxxxxxxxxxxxxx" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Nombre del remitente</label>
              <input defaultValue="Jewgal Academy" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email del remitente</label>
              <input defaultValue="hola@jewgalacademy.com" style={inputStyle} />
            </div>
          </div>
          <p style={{ fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 14 }}>Emails automáticos activados</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {[
              "Email de bienvenida al inscribirse",
              "Confirmación de pago",
              "Recordatorio de clase (24h antes)",
              "Reseteo de contraseña",
            ].map((label) => (
              <label key={label} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13, color: "var(--text-muted)" }}>
                <input type="checkbox" defaultChecked style={{ accentColor: "var(--gold)" }} /> {label}
              </label>
            ))}
          </div>
          <button onClick={handleSave} style={{ background: saved ? "var(--success)" : "var(--gold)", color: "#2C1F14", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "background .3s" }}>
            {saved ? "¡Guardado!" : "Guardar configuración"}
          </button>
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
            <p style={{ fontSize: 13, color: "var(--text-faint)", marginBottom: 22 }}>Buscá un alumno por email y asignale una nueva contraseña temporal.</p>

            <div style={{ position: "relative", marginBottom: 16 }}>
              <Search size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }} />
              <input
                value={pwSearch} onChange={(e) => setPwSearch(e.target.value)}
                placeholder="Buscar por email o nombre…"
                style={{ ...inputStyle, paddingLeft: 38 }}
              />
            </div>

            {pwSearch.length > 2 && (
              <div style={{ background: "var(--surface)", border: "1px solid rgba(165,141,102,.15)", borderRadius: 10, marginBottom: 16 }}>
                <p style={{ padding: "16px 18px", fontSize: 13, color: "var(--text-dim)" }}>No se encontraron alumnos con ese criterio.</p>
              </div>
            )}

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Nueva contraseña</label>
              <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Mínimo 8 caracteres" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Confirmar contraseña</label>
              <input type="password" placeholder="Repetir contraseña" style={inputStyle} />
            </div>
            <button onClick={handlePwSave} style={{ marginTop: 18, background: pwSaved ? "var(--success)" : "var(--gold)", color: "#2C1F14", border: "none", borderRadius: 9, padding: "11px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "background .3s" }}>
              <KeyRound size={14} /> {pwSaved ? "¡Contraseña actualizada!" : "Actualizar contraseña"}
            </button>
          </div>

          {/* Mi contraseña admin */}
          <div style={{ ...card, padding: "26px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <KeyRound size={18} style={{ color: "var(--teal)" }} />
              <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 18, color: "var(--text)" }}>Mi contraseña (admin)</h2>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-faint)", marginBottom: 22 }}>Cambiá la contraseña de acceso al panel de administración.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label style={labelStyle}>Contraseña actual</label><input type="password" placeholder="••••••••" style={inputStyle} /></div>
              <div><label style={labelStyle}>Nueva contraseña</label><input type="password" placeholder="Mínimo 8 caracteres" style={inputStyle} /></div>
              <div><label style={labelStyle}>Confirmar nueva contraseña</label><input type="password" placeholder="Repetir contraseña" style={inputStyle} /></div>
            </div>
            <button onClick={handleSave} style={{ marginTop: 18, background: saved ? "var(--success)" : "#A76D61", color: "white", border: "none", borderRadius: 9, padding: "11px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "background .3s" }}>
              {saved ? "¡Contraseña actualizada!" : "Cambiar mi contraseña"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
