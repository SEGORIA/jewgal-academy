"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Pencil, X } from "lucide-react"
import { can, isPanelRole, permissionForPath } from "@/lib/permissions"

type Target = { label: string; href: string }
type PageInfo = { title: string; targets: Target[] }

/** Qué se puede editar en cada página pública y adónde lleva cada atajo. */
function infoFor(path: string): PageInfo {
  const t = (ns: string): Target => ({ label: "Editar los textos de esta página", href: `/superadmin/textos?ns=${ns}` })
  const seo = (page: string): Target => ({ label: "Título y descripción para Google (SEO)", href: `/superadmin/textos?tab=seo#${page}` })
  if (path === "/") return { title: "Inicio", targets: [t("Home"), seo("home"), { label: "Portada, contacto y redes", href: "/superadmin/web" }, { label: "Fotos de la portada", href: "/superadmin/hero" }, { label: "Testimonios", href: "/superadmin/testimonios" }, { label: "Avales", href: "/superadmin/avales" }] }
  if (path === "/academia") return { title: "Academia", targets: [t("Academia"), seo("academia"), { label: "Programas (orden, precios, fichas)", href: "/superadmin/cursos" }] }
  if (path.startsWith("/programas/")) return { title: "Ficha de programa", targets: [{ label: "Editar este programa", href: "/superadmin/cursos" }, t("Programa")] }
  if (path === "/certificaciones") return { title: "Certificaciones", targets: [t("Certificaciones"), seo("certificaciones"), { label: "Diseño y avales de certificados", href: "/superadmin/certificados" }] }
  if (path === "/conoce-a-devora") return { title: "Conoce a Devora", targets: [t("Devora"), seo("conoce-a-devora"), { label: "Datos de la fundadora", href: "/superadmin/web" }] }
  if (path === "/eventos") return { title: "Eventos", targets: [{ label: "Editar eventos y retiros", href: "/superadmin/eventos" }, t("Eventos"), seo("eventos")] }
  if (path === "/blog" || path.startsWith("/blog/")) return { title: "Blog", targets: [{ label: "Editar artículos", href: "/superadmin/blog" }, seo("blog")] }
  if (path === "/contacto") return { title: "Contacto", targets: [t("Contacto"), seo("contacto"), { label: "Ver mensajes recibidos", href: "/superadmin/comunicaciones" }] }
  if (path === "/terminos") return { title: "Términos de uso", targets: [{ label: "Editar el texto legal", href: "/superadmin/legales" }, seo("terminos")] }
  if (path === "/politica-privacidad") return { title: "Política de privacidad", targets: [{ label: "Editar el texto legal", href: "/superadmin/legales" }, seo("privacidad")] }
  return { title: "Esta página", targets: [{ label: "Editar los textos del sitio", href: "/superadmin/textos" }] }
}

/**
 * Barra de edición en contexto: si quien navega el sitio es del equipo, un botón flotante le muestra
 * los atajos para editar lo que está viendo (textos, SEO, fotos, programas…) sin buscarlo en el panel.
 * Solo aparece para integrantes del panel y solo con los atajos a los que tienen permiso.
 */
export default function AdminEditBar() {
  const { data: session } = useSession()
  const pathname = usePathname() || "/"
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("mousedown", onDown); document.addEventListener("keydown", onKey)
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey) }
  }, [open])

  const user = session?.user
  if (!user || !isPanelRole(user.role)) return null

  // se quita el prefijo de idioma (/en) para reconocer la página
  const path = pathname.replace(/^\/en(?=\/|$)/, "") || "/"
  const info = infoFor(path)
  const targets = info.targets.filter((x) => can(user, permissionForPath(x.href.split("?")[0].split("#")[0])))
  if (!targets.length) return null

  return (
    <div ref={ref} style={{ position: "fixed", left: 16, bottom: 16, zIndex: 350 }}>
      {open && (
        <div role="menu" aria-label={`Editar ${info.title}`} style={{ marginBottom: 10, minWidth: 270, maxWidth: "calc(100vw - 32px)", background: "#2C1F14", color: "#F6EBDD", border: "1px solid #C49F72", borderRadius: 14, padding: 8, boxShadow: "0 18px 50px rgba(0,0,0,.45)" }}>
          <p style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "#E4C896", padding: "8px 12px 6px" }}>Editar · {info.title}</p>
          {targets.map((x) => (
            <a key={x.label} role="menuitem" href={x.href} style={{ display: "block", padding: "10px 12px", borderRadius: 9, fontSize: 14, color: "#F6EBDD", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(228,200,150,.14)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              {x.label}
            </a>
          ))}
          <Link role="menuitem" href="/superadmin" style={{ display: "block", padding: "10px 12px", marginTop: 4, borderTop: "1px solid rgba(228,200,150,.25)", fontSize: 13.5, color: "#E4C896", textDecoration: "none" }}>Ir al panel →</Link>
        </div>
      )}
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu"
        style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 999, border: "1px solid #C49F72", background: "#2C1F14", color: "#E4C896", fontSize: 13.5, fontWeight: 600, cursor: "pointer", boxShadow: "0 10px 30px rgba(0,0,0,.35)" }}>
        {open ? <X size={15} /> : <Pencil size={15} />} {open ? "Cerrar" : "Editar esta página"}
      </button>
    </div>
  )
}
