import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton"

export default function AulaLoading() {
  return (
    <div style={{ background: "var(--navy)", minHeight: "100svh" }}>
      {/* Barra de navegación del aula */}
      <div style={{ height: 68, background: "var(--navy-2)", borderBottom: "1px solid var(--line-d)" }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(32px,5vw,60px) clamp(20px,4vw,40px)" }}>

        {/* Saludo skeleton */}
        <div style={{ marginBottom: 48 }}>
          <Skeleton style={{ height: 14, width: 120, marginBottom: 14 }} />
          <Skeleton style={{ height: 32, width: "45%", marginBottom: 8 }} />
          <Skeleton style={{ height: 18, width: "30%" }} />
        </div>

        {/* Progreso global */}
        <div style={{ border: "1px solid var(--line-d)", borderRadius: 10, padding: 28, background: "var(--navy-2)", marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <Skeleton style={{ height: 18, width: "40%" }} />
            <Skeleton style={{ height: 18, width: "15%" }} />
          </div>
          <Skeleton style={{ height: 8, borderRadius: 4 }} />
          <div style={{ display: "flex", gap: 24, marginTop: 20 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ flex: 1 }}>
                <Skeleton style={{ height: 14, width: "60%", marginBottom: 6 }} />
                <Skeleton style={{ height: 22, width: "40%" }} />
              </div>
            ))}
          </div>
        </div>

        {/* Grid de cursos */}
        <Skeleton style={{ height: 14, width: 160, marginBottom: 20 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
          <SkeletonCard height={180} />
          <SkeletonCard height={180} />
          <SkeletonCard height={180} />
        </div>

      </div>
    </div>
  )
}
