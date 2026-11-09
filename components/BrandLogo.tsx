import Image from "next/image"

/**
 * Logo de marca (transparente, sin fondo).
 * - variant "horizontal" → barras (navbar, footer)
 * - variant "square"     → espacios verticales/cuadrados (sidebars)
 */
export default function BrandLogo({
  height,
  priority = false,
  variant = "horizontal",
}: {
  height: number
  priority?: boolean
  variant?: "horizontal" | "square"
}) {
  const square = variant === "square"
  const src = square ? "/brand/logo-cuadrado.png" : "/brand/logo-horizontal.png"
  // Ambos archivos miden 1266×1000 px (proporción 1.266). Antes se reservaba 1.05 / 1.7, así que el logo
  // "saltaba" de tamaño al cargar (layout shift) y Next avisaba en consola de la proporción incorrecta.
  const width = Math.round(height * (1266 / 1000))
  return (
    <span className="brand-logo" style={{ display: "inline-flex", lineHeight: 0 }}>
      <Image
        src={src}
        alt="Jewgal Academy"
        width={width}
        height={height}
        priority={priority}
        style={{ height, width: "auto" }}
      />
    </span>
  )
}
