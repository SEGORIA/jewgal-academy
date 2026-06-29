import type { CSSProperties } from "react"

export function Skeleton({ style, className }: { style?: CSSProperties; className?: string }) {
  return (
    <div
      className={`skeleton${className ? ` ${className}` : ""}`}
      style={{ borderRadius: 6, background: "var(--surface)", ...style }}
    />
  )
}

export function SkeletonCard({ height = 220 }: { height?: number }) {
  return (
    <div style={{ border: "1px solid var(--line-d)", borderRadius: 10, padding: 28, background: "var(--navy-2)", display: "flex", flexDirection: "column", gap: 14 }}>
      <Skeleton style={{ height, borderRadius: 8, marginBottom: 4 }} />
      <Skeleton style={{ height: 20, width: "65%" }} />
      <Skeleton style={{ height: 15, width: "90%" }} />
      <Skeleton style={{ height: 15, width: "75%" }} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <Skeleton style={{ height: 14, width: "30%" }} />
        <Skeleton style={{ height: 14, width: "20%" }} />
      </div>
    </div>
  )
}

export function SkeletonText({ lines = 3, width = "100%" }: { lines?: number; width?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          style={{ height: 16, width: i === lines - 1 ? "65%" : "100%" }}
        />
      ))}
    </div>
  )
}
