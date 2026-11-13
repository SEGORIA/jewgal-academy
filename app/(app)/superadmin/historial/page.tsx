"use client"

import { Fragment, useCallback, useEffect, useState } from "react"
import { ChevronDown, ChevronUp, History, RotateCcw, Search, Trash2 } from "lucide-react"
import { ApiError, ConfirmDialog, EmptyState, GhostButton, PageHeader, Spinner, ToastProvider, api, card, inputStyle, useToast } from "@/components/admin/ui"

type Entry = {
  id: string; createdAt: string; actorId: string | null; actorName: string | null; actorRole: string | null
  action: string; model: string; recordId: string | null; label: string | null; restoredAt: string | null
  before: Record<string, unknown> | null; after: Record<string, unknown> | null
}
type ModelInfo = { model: string; label: string; restorable: boolean }
type Actor = { id: string | null; name: string | null }

const ACTIONS: Record<string, { label: string; color: string }> = {
  create: { label: "Creó", color: "var(--success)" },
  update: { label: "Editó", color: "var(--gold-ink)" },
  delete: { label: "Eliminó", color: "var(--danger)" },
  restore: { label: "Restauró", color: "var(--terra)" },
  bulk: { label: "Cambio masivo", color: "var(--text-muted)" },
  export: { label: "Descargó", color: "var(--text-muted)" },
  view: { label: "Vio", color: "var(--text-muted)" },
}

const FIELD_LABELS: Record<string, string> = {
  title: "Título", name: "Nombre", email: "Correo", description: "Descripción", content: "Contenido", value: "Valor", price: "Precio", currency: "Moneda",
  status: "Estado", isPublished: "Publicado", isVisible: "Visible", isFree: "Gratis", order: "Orden", sortOrder: "Orden en el sitio", slug: "Dirección (slug)",
  shortDesc: "Descripción corta", thumbnail: "Miniatura", role: "Rol", permissions: "Permisos", amount: "Monto", method: "Medio de pago", note: "Nota",
  progress: "Avance", hoursCompleted: "Horas", certificateNumber: "N° de certificado", text: "Texto", textEn: "Texto (inglés)", roleEn: "Cargo (inglés)",
  logoUrl: "Logo", code: "Sigla", fileUrl: "Archivo", videoUrl: "Video", linkUrl: "Enlace", excerpt: "Resumen", coverImage: "Portada", key: "Clave",
}
const fieldLabel = (k: string) => FIELD_LABELS[k] ?? k

const when = (iso: string) => new Date(iso).toLocaleString("es", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })

function show(v: unknown): string {
  if (v === null || v === undefined) return "—"
  if (typeof v === "string") return v === "" ? "(vacío)" : v
  if (typeof v === "boolean") return v ? "Sí" : "No"
  return JSON.stringify(v)
}

function Diff({ e }: { e: Entry }) {
  const keys = [...new Set([...Object.keys(e.before ?? {}), ...Object.keys(e.after ?? {})])].filter((k) => !["updatedAt", "createdAt"].includes(k))
  if (!keys.length) return <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>Sin detalle de campos.</p>
  const single = e.action === "create" || e.action === "delete"
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {keys.slice(0, single ? 14 : 40).map((k) => (
        <div key={k} style={{ display: "grid", gridTemplateColumns: "150px minmax(0,1fr)", gap: 12, fontSize: 13.5 }}>
          <span style={{ color: "var(--text-muted)" }}>{fieldLabel(k)}</span>
          {single ? (
            <span style={{ color: "var(--text-strong)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{show((e.action === "delete" ? e.before : e.after)?.[k])}</span>
          ) : (
            <span style={{ display: "grid", gap: 4 }}>
              <span style={{ color: "var(--danger)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>− {show(e.before?.[k])}</span>
              <span style={{ color: "var(--success)", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>+ {show(e.after?.[k])}</span>
            </span>
          )}
        </div>
      ))}
      {keys.length > (single ? 14 : 40) && <p style={{ fontSize: 12.5, color: "var(--text-faint)" }}>…y {keys.length - (single ? 14 : 40)} campos más.</p>}
    </div>
  )
}

function Inner() {
  const toast = useToast()
  const [view, setView] = useState<"all" | "trash">("all")
  const [items, setItems] = useState<Entry[]>([])
  const [models, setModels] = useState<ModelInfo[]>([])
  const [actors, setActors] = useState<Actor[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [model, setModel] = useState("")
  const [actor, setActor] = useState("")
  const [action, setAction] = useState("")
  const [q, setQ] = useState("")
  const [open, setOpen] = useState<string | null>(null)
  const [detail, setDetail] = useState<Record<string, Entry>>({})
  const [restoring, setRestoring] = useState<Entry | null>(null)
  const [conflict, setConflict] = useState<{ entry: Entry; fields: string[] } | null>(null)
  const [busy, setBusy] = useState(false)

  const params = useCallback((before?: string) => {
    const p = new URLSearchParams()
    if (view === "trash") p.set("view", "trash")
    if (model) p.set("model", model)
    if (actor) p.set("actor", actor)
    if (action && view !== "trash") p.set("action", action)
    if (q.trim()) p.set("q", q.trim())
    if (before) p.set("before", before)
    return p.toString()
  }, [view, model, actor, action, q])

  const load = useCallback(async (more = false) => {
    setLoading(true)
    try {
      const last = more ? items[items.length - 1]?.createdAt : undefined
      const d = await api<{ items: Entry[]; hasMore: boolean; models: ModelInfo[]; actors: Actor[] }>(`/api/admin/audit?${params(last)}`, { cache: "no-store" })
      setItems((cur) => (more ? [...cur, ...d.items] : d.items)); setHasMore(d.hasMore); setModels(d.models); setActors(d.actors)
    } catch (e) { toast("error", (e as Error).message) }
    finally { setLoading(false) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, toast])

  // se recarga al cambiar un filtro (el texto, con una pequeña espera)
  useEffect(() => { const t = setTimeout(() => load(false), q ? 300 : 0); return () => clearTimeout(t) }, [load, q])

  const modelLabel = (m: string) => models.find((x) => x.model === m)?.label ?? m
  const canRestore = (e: Entry) => !e.restoredAt && ["create", "update", "delete"].includes(e.action) && !!models.find((m) => m.model === e.model)?.restorable

  async function toggle(e: Entry) {
    if (open === e.id) { setOpen(null); return }
    setOpen(e.id)
    if (!detail[e.id]) {
      try { const d = await api<{ entry: Entry }>(`/api/admin/audit?id=${e.id}`, { cache: "no-store" }); setDetail((m) => ({ ...m, [e.id]: d.entry })) } catch { /* se muestra el resumen del listado */ }
    }
  }

  async function restore(entry: Entry, force = false) {
    setBusy(true)
    try {
      await api("/api/admin/audit/restore", { method: "POST", json: { id: entry.id, force } })
      toast("ok", entry.action === "delete" ? "Registro recuperado" : entry.action === "update" ? "Valores anteriores restaurados" : "Creación deshecha")
      setRestoring(null); setConflict(null); await load(false)
    } catch (e) {
      // el servidor avisa si el registro cambió después de esa edición: se pide confirmación para pisarlo
      if (e instanceof ApiError && e.data.conflict) { setRestoring(null); setConflict({ entry, fields: (e.data.fields as string[]) ?? [] }) }
      else { toast("error", (e as Error).message); setRestoring(null) }
    } finally { setBusy(false) }
  }

  const tab = (id: "all" | "trash", label: string, icon: React.ReactNode) => (
    <button role="tab" aria-selected={view === id} onClick={() => { setView(id); setOpen(null) }}
      style={{ display: "inline-flex", gap: 8, alignItems: "center", background: "none", border: "none", cursor: "pointer", padding: "11px 18px", fontSize: 15, fontWeight: view === id ? 600 : 500, color: view === id ? "var(--gold-ink)" : "var(--text-muted)", borderBottom: `2px solid ${view === id ? "var(--gold-ink)" : "transparent"}`, marginBottom: -1 }}>
      {icon}{label}
    </button>
  )

  const restoreText = (e: Entry) =>
    e.action === "delete" ? <>Se vuelve a crear <strong>“{e.label ?? e.recordId}”</strong> ({modelLabel(e.model)}) con los datos que tenía al eliminarse. Lo que dependía de ese registro y se borró junto con él no se recupera.</>
    : e.action === "update" ? <>Se devuelven los campos de <strong>“{e.label ?? e.recordId}”</strong> ({modelLabel(e.model)}) a los valores que tenían antes de esta edición.</>
    : <>Se deshace la creación: <strong>“{e.label ?? e.recordId}”</strong> ({modelLabel(e.model)}) se elimina. Esto se puede volver a restaurar desde la Papelera.</>

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <PageHeader eyebrow="Sistema" title="Historial de cambios"
        subtitle="Todo lo que se cambia desde el panel queda anotado: quién, qué y cuándo, con los valores de antes y después. Desde acá podés deshacer una edición o recuperar algo que se eliminó." />

      <div role="tablist" aria-label="Vista" style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", marginBottom: 18 }}>
        {tab("all", "Todos los cambios", <History size={16} />)}
        {tab("trash", "Papelera (eliminados)", <Trash2 size={16} />)}
      </div>

      <div style={{ ...card, padding: "14px 18px", marginBottom: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <Search size={15} aria-hidden style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre del registro…" aria-label="Buscar en el historial" style={{ ...inputStyle, paddingLeft: 38 }} />
        </div>
        <select aria-label="Filtrar por tipo" value={model} onChange={(e) => setModel(e.target.value)} style={{ ...inputStyle, width: "auto", cursor: "pointer" }}>
          <option value="">Todo tipo de registro</option>
          {models.map((m) => <option key={m.model} value={m.model}>{m.label}</option>)}
        </select>
        <select aria-label="Filtrar por persona" value={actor} onChange={(e) => setActor(e.target.value)} style={{ ...inputStyle, width: "auto", cursor: "pointer" }}>
          <option value="">Cualquier persona</option>
          {actors.map((a) => <option key={a.id} value={a.id ?? ""}>{a.name}</option>)}
        </select>
        {view === "all" && (
          <select aria-label="Filtrar por acción" value={action} onChange={(e) => setAction(e.target.value)} style={{ ...inputStyle, width: "auto", cursor: "pointer" }}>
            <option value="">Toda acción</option>
            {Object.entries(ACTIONS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        )}
      </div>

      {loading && items.length === 0 ? <Spinner /> : items.length === 0 ? (
        <EmptyState icon={view === "trash" ? <Trash2 size={28} /> : <History size={28} />} title={view === "trash" ? "La papelera está vacía" : "Todavía no hay cambios registrados"}
          text={view === "trash" ? "Lo que se elimine desde el panel va a aparecer acá, listo para recuperar." : "Cada cambio que se haga desde el panel aparecerá acá."} />
      ) : (
        <div style={{ ...card, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Cuándo", "Quién", "Qué", "Registro", ""].map((h, i) => <th key={i} scope="col" style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 500 }}>{h || <span className="sr-only">Acciones</span>}</th>)}
                </tr>
              </thead>
              <tbody>
                {items.map((e) => {
                  const a = ACTIONS[e.action] ?? { label: e.action, color: "var(--text-muted)" }
                  const isOpen = open === e.id
                  const full = detail[e.id] ?? e
                  return (
                    <Fragment key={e.id}>
                      <tr style={{ borderBottom: isOpen ? "none" : "1px solid var(--border-soft)", opacity: e.restoredAt ? 0.6 : 1 }}>
                        <td style={{ padding: "12px 16px", whiteSpace: "nowrap", color: "var(--text-muted)", fontSize: 13 }}>{when(e.createdAt)}</td>
                        <td style={{ padding: "12px 16px", color: "var(--text-strong)" }}>{e.actorName ?? "—"}</td>
                        <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}><strong style={{ color: a.color, fontWeight: 600 }}>{a.label}</strong> <span style={{ color: "var(--text-muted)" }}>{modelLabel(e.model).toLowerCase()}</span></td>
                        <td style={{ padding: "12px 16px", color: "var(--text)", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.label ?? e.recordId ?? "—"}{e.restoredAt && <em style={{ marginLeft: 8, fontSize: 12, color: "var(--terra)", fontStyle: "normal" }}>restaurado</em>}</td>
                        <td style={{ padding: "10px 12px", whiteSpace: "nowrap", textAlign: "right" }}>
                          {canRestore(e) && <GhostButton icon={<RotateCcw size={13} />} onClick={() => setRestoring(e)} style={{ padding: "6px 11px", fontSize: 12.5, marginRight: 6 }}>{e.action === "delete" ? "Recuperar" : "Deshacer"}</GhostButton>}
                          <button aria-label={isOpen ? "Ocultar detalle" : "Ver detalle"} aria-expanded={isOpen} onClick={() => toggle(e)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 7, verticalAlign: "middle" }}>{isOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}</button>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr style={{ borderBottom: "1px solid var(--border-soft)" }}>
                          <td colSpan={5} style={{ padding: "4px 16px 18px 16px", background: "var(--surface)" }}><Diff e={full} /></td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {hasMore && <div style={{ textAlign: "center", marginTop: 16 }}><GhostButton loading={loading} onClick={() => load(true)}>Ver más antiguos</GhostButton></div>}

      {restoring && (
        <ConfirmDialog title={restoring.action === "delete" ? "Recuperar registro" : restoring.action === "update" ? "Deshacer edición" : "Deshacer creación"} confirmLabel={restoring.action === "delete" ? "Recuperar" : "Restaurar"} busy={busy}
          danger={restoring.action === "create"} onCancel={() => setRestoring(null)} onConfirm={() => restore(restoring)} text={restoreText(restoring)} />
      )}
      {conflict && (
        <ConfirmDialog danger title="Este registro cambió después" confirmLabel="Restaurar igualmente" busy={busy} onCancel={() => setConflict(null)} onConfirm={() => restore(conflict.entry, true)}
          text={<>Después de esta edición se volvió a cambiar: <strong>{conflict.fields.map(fieldLabel).join(", ")}</strong>. Si restaurás igualmente, esos cambios más nuevos se pisan con el valor antiguo.</>} />
      )}
    </div>
  )
}

export default function HistorialPage() { return <ToastProvider><Inner /></ToastProvider> }
