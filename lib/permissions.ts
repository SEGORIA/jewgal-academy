// Roles y permisos del panel.
//
//  · "admin"   = Super administrador: puede todo, incluido gestionar el equipo, ver el historial y hacer respaldos.
//  · "staff"   = Colaborador/a (docente, asistente): solo las áreas que el super administrador le asigne.
//  · "student" = Alumno: sin acceso al panel.
//
// Este archivo no importa nada del servidor: lo usan tanto las rutas de API como los componentes del navegador.

export const PERMISSIONS = [
  { key: "alumnos", label: "Alumnos e inscripciones", desc: "Ver y editar alumnos, inscribirlos, ajustar su progreso y asistencia." },
  { key: "pagos", label: "Pagos", desc: "Ver pagos, registrar pagos manuales y reembolsos." },
  { key: "cursos", label: "Programas y materiales", desc: "Programas, módulos, lecciones, clases en vivo, recursos exclusivos y asistencia." },
  { key: "comunidad", label: "Comunidad", desc: "Moderar el foro y administrar sus categorías." },
  { key: "comunicaciones", label: "Comunicaciones", desc: "Enviar avisos, gestionar el newsletter y las plantillas de correo." },
  { key: "sitio", label: "Sitio web", desc: "Textos, páginas legales, SEO, blog, eventos, fotos, testimonios y avales." },
  { key: "certificados", label: "Certificados", desc: "Diseño de certificados, acreditaciones y emisión." },
] as const

export type StaffPermission = (typeof PERMISSIONS)[number]["key"]
/** "superadmin" = solo el rol admin (equipo, historial, respaldo, configuración general). "any" = cualquier integrante del panel. */
export type Permission = StaffPermission | "superadmin" | "any"

export const STAFF_PERMISSION_KEYS: string[] = PERMISSIONS.map((p) => p.key)

export type PermissionSubject = { role?: string | null; permissions?: string[] | null } | null | undefined

export const isPanelRole = (role?: string | null) => role === "admin" || role === "staff"

export function can(subject: PermissionSubject, perm: Permission): boolean {
  if (!subject || !isPanelRole(subject.role)) return false
  if (subject.role === "admin") return true
  if (perm === "any") return true
  if (perm === "superadmin") return false
  return (subject.permissions ?? []).includes(perm)
}

/** Permiso que exige cada pantalla del panel (para el menú y para el acceso por URL). */
export const ROUTE_PERMISSIONS: { prefix: string; perm: Permission }[] = [
  { prefix: "/superadmin/alumnos", perm: "alumnos" },
  { prefix: "/superadmin/pagos", perm: "pagos" },
  { prefix: "/superadmin/cursos", perm: "cursos" },
  { prefix: "/superadmin/recursos", perm: "cursos" },
  { prefix: "/superadmin/asistencia", perm: "cursos" },
  { prefix: "/superadmin/comunidad", perm: "comunidad" },
  { prefix: "/superadmin/comunicaciones", perm: "comunicaciones" },
  { prefix: "/superadmin/certificados", perm: "certificados" },
  { prefix: "/superadmin/web", perm: "sitio" },
  { prefix: "/superadmin/textos", perm: "sitio" },
  { prefix: "/superadmin/legales", perm: "sitio" },
  { prefix: "/superadmin/testimonios", perm: "sitio" },
  { prefix: "/superadmin/avales", perm: "sitio" },
  { prefix: "/superadmin/hero", perm: "sitio" },
  { prefix: "/superadmin/eventos", perm: "sitio" },
  { prefix: "/superadmin/blog", perm: "sitio" },
  { prefix: "/superadmin/equipo", perm: "superadmin" },
  { prefix: "/superadmin/historial", perm: "superadmin" },
  { prefix: "/superadmin/respaldo", perm: "superadmin" },
  { prefix: "/superadmin/configuracion", perm: "superadmin" },
]

export function permissionForPath(pathname: string): Permission {
  const hit = ROUTE_PERMISSIONS.find((r) => pathname === r.prefix || pathname.startsWith(r.prefix + "/"))
  return hit ? hit.perm : "any"
}
