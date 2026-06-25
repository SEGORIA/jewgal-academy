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
  const width = Math.round(height * (square ? 1.05 : 1.7))
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
