import type { ContentBlock } from "@/lib/materials-content"
import { getYouTubeId, getVimeoId } from "@/lib/program-content"

// Reconoce un link pegado y devuelve el bloque de video que corresponde.
// YouTube y Vimeo se incrustan; un archivo de video directo (Cloudinary, .mp4…)
// se reproduce con el reproductor nativo.
export function videoBlockFromUrl(raw: string): ContentBlock | null {
  const url = raw.trim()
  if (!url) return null
  try { new URL(url) } catch { return null }
  if (getYouTubeId(url)) return { type: "video-youtube", url }
  if (getVimeoId(url)) return { type: "video-vimeo", url }
  if (/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url) || /res\.cloudinary\.com\/[^/]+\/video\/upload\//i.test(url)) return { type: "video-cloudinary", url }
  return null
}
