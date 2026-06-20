export default function AdminLoading() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100%", minHeight: 320,
    }}>
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
        color: "rgba(224,233,234,.3)", fontSize: 13,
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: "50%",
          border: "2px solid rgba(165,141,102,.2)",
          borderTopColor: "var(--gold,#A58D66)",
          animation: "spin 0.9s linear infinite",
        }} />
        Cargando panel…
      </div>
    </div>
  )
}
