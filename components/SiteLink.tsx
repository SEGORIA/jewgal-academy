"use client"

import NextLink from "next/link"
import { Link } from "@/i18n/navigation"
import { isExternalHref } from "@/lib/site-menu"

type Props = Omit<React.ComponentProps<"a">, "href"> & { href: string }

/**
 * Enlace del menú o del pie de página: una ruta del sitio (con el prefijo de idioma), una ruta del aula/panel (sin prefijo)
 * o un enlace externo (https, mailto, tel; los https se abren en otra pestaña).
 */
export default function SiteLink({ href, children, ...rest }: Props) {
  if (isExternalHref(href)) {
    const web = /^https?:/i.test(href)
    return <a href={href} {...(web ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...rest}>{children}</a>
  }
  if (/^\/(aula|superadmin)(\/|$)/.test(href)) return <NextLink href={href} {...rest}>{children}</NextLink>
  return <Link href={href} {...rest}>{children}</Link>
}
