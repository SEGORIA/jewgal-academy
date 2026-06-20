export default function AulaLoading() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100%", minHeight: 320,
    }}>
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
        color: "rgba(224,233,234,.35)", fontSize: 13,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          border: "2px solid rgba(165,141,102,.25)",
          borderTopColor: "var(--gold,#A58D66)",
          animation: "spin 0.9s linear infinite",
        }} />
        Cargando…
      </div>
    </div>
  )
}
