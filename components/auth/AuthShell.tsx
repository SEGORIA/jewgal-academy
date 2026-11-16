import { Link } from "@/i18n/navigation"
import BrandLogo from "@/components/BrandLogo"

/** Marco de las pantallas de acceso (recuperar / restablecer contraseña): mismo fondo y tarjeta que el inicio de sesión. */
export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 20px", position: "relative", overflow: "hidden",
      background: "linear-gradient(135deg,var(--bg) 0%,var(--bg-2) 55%,var(--bg-3) 100%)",
    }}>
      <div aria-hidden style={{ position: "absolute", top: "-20%", right: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(75,126,140,.09),transparent 70%)", pointerEvents: "none" }} />
      <div aria-hidden style={{ position: "absolute", bottom: "-25%", left: "-8%", width: 580, height: 580, borderRadius: "50%", background: "radial-gradient(circle,rgba(165,141,102,.07),transparent 70%)", pointerEvents: "none" }} />
      <main style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <Link href="/" aria-label="Jewgal Academy">
            <BrandLogo height={72} variant="square" priority />
          </Link>
        </div>
        <div style={{ background: "var(--surface)", borderRadius: 20, padding: "40px 36px", border: "1px solid rgba(165,141,102,.18)", boxShadow: "0 32px 80px rgba(0,0,0,.4), inset 0 1px 0 var(--surface-2)", backdropFilter: "blur(12px)" }}>
          {children}
        </div>
      </main>
    </div>
  )
}
