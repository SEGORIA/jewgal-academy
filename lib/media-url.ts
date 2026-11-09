// Las imágenes y videos de Cloudinary (diapositivas, portadas, posters, clips) se piden a través
// del propio dominio del sitio (/api/cdn → res.cloudinary.com, ver rewrites en
// next.config.ts). Así no dependen de que el navegador, una extensión de
// privacidad o el visor embebido permitan cargar imágenes de otro dominio:
// con el mismo origen siempre cargan.
const CLOUD_PREFIX = "https://res.cloudinary.com/dotnmrvkz/"

export function mediaSrc(url: string | null | undefined): string {
  if (!url) return ""
  return url.startsWith(CLOUD_PREFIX) ? `/api/cdn/${url.slice(CLOUD_PREFIX.length)}` : url
}
