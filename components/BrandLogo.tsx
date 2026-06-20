import Image from "next/image"

/**
 * Logo adaptable al tema:
 * - versión blanca sobre fondos oscuros (modo oscuro),
 * - versión a color sobre fondos claros (modo claro).
 * El toggle se hace por CSS según data-theme (ver globals.css).
 */
export default function BrandLogo({
  height,
  priority = false,
}: {
  height: number
  priority?: boolean
}) {
  return (
    <span className="brand-logo" style={{ display: "inline-flex", lineHeight: 0 }}>
      <Image
        src="/brand/logo-white.png"
        alt="Jewgal Academy"
        width={359}
        height={200}
        priority={priority}
        className="brand-logo-dark"
        style={{ height, width: "auto" }}
      />
      <Image
        src="/brand/logo-trimmed.png"
        alt="Jewgal Academy"
        width={359}
        height={200}
        priority={priority}
        className="brand-logo-light"
        style={{ height, width: "auto" }}
      />
    </span>
  )
}
