"use client"

import { useState, useEffect } from "react"
import { Save, Plus, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, CalendarDays, Info } from "lucide-react"
import { DEFAULT_EVENTOS, type EventosData, type EventoItem, type EventoPasado } from "@/lib/eventos"

const accent = "#A76D61"

const inputStyle: React.CSSProperties = {
  width: "100%", background: "var(--surface-2)",
  border: "1px solid var(--border)", borderRadius: 8,
  padding: "8px 12px", fontSize: 13, color: "var(--text)",
  outline: "none",
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 0 }}>
      <span style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-faint)" }}>{label}</span>
      {children}
    </label>
  )
}

export default function EventosAdminPage() {
  const [data, setData] = useState<EventosData>(DEFAULT_EVENTOS)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/admin/eventos")
      .then((r) => r.json())
      .then((d: EventosData) => {
        if (d && Array.isArray(d.upcoming) && Array.isArray(d.past)) setData(d)
      })
      .catch(() => {})
  }, [])

  function setEvento(i: number, patch: Partial<EventoItem>) {
    setData((d) => ({ ...d, upcoming: d.upcoming.map((ev, idx) => (idx === i ? { ...ev, ...patch } : ev)) }))
  }

  function setPasado(i: number, patch: Partial<EventoPasado>) {
    setData((d) => ({ ...d, past: d.past.map((p, idx) => (idx === i ? { ...p, ...patch } : p)) }))
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= data.upcoming.length) return
    const next = [...data.upcoming]
    ;[next[i], next[j]] = [next[j], next[i]]
    setData((d) => ({ ...d, upcoming: next }))
  }

  function addEvento() {
    setData((d) => ({
      ...d,
      upcoming: [
        ...d.upcoming,
        { datetime: "2026-12-01T10:00", title: "", type: "Evento presencial", location: "", desc: "", spots: "", price: "", active: true },
      ],
    }))
  }

  function removeEvento(i: number) {
    setData((d) => ({ ...d, upcoming: d.upcoming.filter((_, idx) => idx !== i) }))
  }

  function addPasado() {
    setData((d) => ({ ...d, past: [...d.past, { title: "", date: "", location: "" }] }))
  }

  function removePasado(i: number) {
    setData((d) => ({ ...d, past: d.past.filter((_, idx) => idx !== i) }))
  }

  async function save() {
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/admin/eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setError(body?.error ?? "No se pudo guardar. Revisa que todos los eventos tengan título y fecha.")
        return
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setError("Error de conexión al guardar.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(22px,3vw,32px)", color: "var(--text)", marginBottom: 6 }}>
            Eventos
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Crea, edita, ordena y oculta los eventos de la página pública. El contador regresivo usa el próximo evento visible.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "11px 24px", borderRadius: 10, border: "none", cursor: saving ? "wait" : "pointer",
            background: saved ? "rgba(107,191,142,.18)" : `linear-gradient(135deg,${accent} 0%,#C49F72 100%)`,
            color: saved ? "var(--success)" : "white",
            fontWeight: 600, fontSize: 14,
            boxShadow: saved ? "none" : "0 6px 20px rgba(167,109,97,.35)",
            transition: "all .25s",
          }}
        >
          <Save size={16} />
          {saving ? "Guardando…" : saved ? "¡Guardado!" : "Guardar cambios"}
        </button>
      </div>

      {error && (
        <div role="alert" style={{ marginBottom: 20, padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.25)", color: "var(--danger)", fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* ── Próximos eventos ── */}
      <p style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 14 }}>
        Próximos eventos
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {data.upcoming.map((ev, i) => (
          <div
            key={i}
            style={{
              padding: "18px 20px", borderRadius: 12,
              background: "var(--surface)",
              border: `1px solid ${ev.active ? "rgba(165,141,102,.15)" : "rgba(255,255,255,.04)"}`,
              opacity: ev.active ? 1 : 0.5,
              transition: "all .2s",
            }}
          >
            {/* Fila 1: fecha + título + controles */}
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 12 }}>
              <div style={{ width: 190, flexShrink: 0 }}>
                <Field label="Fecha y hora">
                  <input
                    type="datetime-local"
                    value={ev.datetime}
                    onChange={(e) => setEvento(i, { datetime: e.target.value })}
                    style={inputStyle}
                  />
                </Field>
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <Field label="Título">
                  <input value={ev.title} onChange={(e) => setEvento(i, { title: e.target.value })} placeholder="Nombre del evento" style={inputStyle} />
                </Field>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button onClick={() => move(i, -1)} disabled={i === 0} title="Subir" style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-2)", cursor: i === 0 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", opacity: i === 0 ? 0.3 : 1 }}>
                  <ChevronUp size={14} />
                </button>
                <button onClick={() => move(i, 1)} disabled={i === data.upcoming.length - 1} title="Bajar" style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-2)", cursor: i === data.upcoming.length - 1 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", opacity: i === data.upcoming.length - 1 ? 0.3 : 1 }}>
                  <ChevronDown size={14} />
                </button>
                <button onClick={() => setEvento(i, { active: !ev.active })} title={ev.active ? "Ocultar del sitio" : "Mostrar en el sitio"} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border)", background: ev.active ? "rgba(167,109,97,.12)" : "var(--surface-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: ev.active ? accent : "var(--text-faint)" }}>
                  {ev.active ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button onClick={() => removeEvento(i)} title="Eliminar evento" style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(239,68,68,.25)", background: "rgba(239,68,68,.06)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--danger)" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Fila 2: tipo / lugar / precio / plazas */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 12 }}>
              <Field label="Tipo">
                <input value={ev.type} onChange={(e) => setEvento(i, { type: e.target.value })} placeholder="Retiro presencial" style={inputStyle} />
              </Field>
              <Field label="Lugar">
                <input value={ev.location} onChange={(e) => setEvento(i, { location: e.target.value })} placeholder="Miami, Florida" style={inputStyle} />
              </Field>
              <Field label="Precio">
                <input value={ev.price} onChange={(e) => setEvento(i, { price: e.target.value })} placeholder="$450 · Gratis · Por confirmar" style={inputStyle} />
              </Field>
              <Field label="Plazas">
                <input value={ev.spots} onChange={(e) => setEvento(i, { spots: e.target.value })} placeholder="20" style={inputStyle} />
              </Field>
            </div>

            {/* Fila 3: descripción */}
            <Field label="Descripción">
              <textarea
                value={ev.desc}
                onChange={(e) => setEvento(i, { desc: e.target.value })}
                placeholder="Descripción breve del evento…"
                rows={2}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit", lineHeight: 1.5 }}
              />
            </Field>
          </div>
        ))}
      </div>

      <button
        onClick={addEvento}
        style={{
          marginTop: 14, display: "flex", alignItems: "center", gap: 8,
          padding: "10px 18px", borderRadius: 10, cursor: "pointer",
          background: "transparent", border: "1px dashed rgba(165,141,102,.4)",
          color: "var(--gold)", fontSize: 13, fontWeight: 600,
        }}
      >
        <Plus size={15} /> Agregar evento
      </button>

      {/* ── Eventos pasados ── */}
      <p style={{ fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--text-faint)", margin: "36px 0 14px" }}>
        Eventos anteriores
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.past.map((p, i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", padding: "14px 16px", borderRadius: 12, background: "var(--surface)", border: "1px solid rgba(165,141,102,.1)" }}>
            <div style={{ flex: 2, minWidth: 200 }}>
              <Field label="Título">
                <input value={p.title} onChange={(e) => setPasado(i, { title: e.target.value })} placeholder="Retiro Sholem · Buenos Aires" style={inputStyle} />
              </Field>
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <Field label="Fecha (texto)">
                <input value={p.date} onChange={(e) => setPasado(i, { date: e.target.value })} placeholder="Marzo 2026" style={inputStyle} />
              </Field>
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <Field label="Lugar">
                <input value={p.location} onChange={(e) => setPasado(i, { location: e.target.value })} placeholder="Argentina" style={inputStyle} />
              </Field>
            </div>
            <button onClick={() => removePasado(i)} title="Eliminar" style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(239,68,68,.25)", background: "rgba(239,68,68,.06)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--danger)", flexShrink: 0 }}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addPasado}
        style={{
          marginTop: 14, display: "flex", alignItems: "center", gap: 8,
          padding: "10px 18px", borderRadius: 10, cursor: "pointer",
          background: "transparent", border: "1px dashed rgba(165,141,102,.4)",
          color: "var(--gold)", fontSize: 13, fontWeight: 600,
        }}
      >
        <Plus size={15} /> Agregar evento pasado
      </button>

      {/* Nota */}
      <div style={{ marginTop: 32, padding: "18px 20px", borderRadius: 12, background: "rgba(165,141,102,.06)", border: "1px solid rgba(165,141,102,.14)", display: "flex", gap: 14, alignItems: "flex-start" }}>
        <Info size={18} style={{ color: accent, flexShrink: 0, marginTop: 2 }} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
            <CalendarDays size={14} /> Cómo funciona
          </p>
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
            Los eventos visibles (ojo activado) aparecen en la página pública <strong>/eventos</strong> en el orden de esta lista.
            El contador regresivo muestra automáticamente el próximo evento visible con fecha futura.
            Cuando un evento ya ocurrió, puedes ocultarlo o eliminarlo y agregarlo a "Eventos anteriores".
          </p>
        </div>
      </div>
    </div>
  )
}
