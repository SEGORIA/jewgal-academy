import { pageMetadata } from "@/lib/seo"

/** SEO de la página (título y descripción editables desde el panel: Textos y SEO). */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return pageMetadata("blog", (await params).locale)
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
