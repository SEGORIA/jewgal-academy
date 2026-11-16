import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { MarkdownLite } from "@/lib/markdown-lite"
import { markdownToPlainText, truncateText } from "@/lib/markdown-text"
import { getPublishedPage } from "@/lib/pages-data"
import { DEFAULT_OG_IMAGE, getSeoSettings } from "@/lib/seo"
import { getGeneralSettings } from "@/lib/general-settings"
import { SITE_URL } from "@/lib/site-url"

// Una página recién publicada, editada o despublicada se refleja al instante.
export const dynamic = "force-dynamic"

type Params = { params: Promise<{ locale: string; slug: string }> }

const urlFor = (locale: string, slug: string) => `${SITE_URL}${locale === "en" ? "/en" : ""}/p/${slug}`
const absolute = (u: string) => (u.startsWith("/") ? `${SITE_URL}${u}` : u)

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params
  const page = await getPublishedPage(slug, locale).catch(() => null)
  if (!page) return { title: locale === "en" ? "Page not found" : "Página no encontrada", robots: { index: false, follow: false } }
  const title = page.seoTitle ?? page.title
  const description = page.seoDescription ?? truncateText(markdownToPlainText(page.content), 160)
  const [seo, general] = await Promise.all([getSeoSettings(), getGeneralSettings()])
  const image = page.coverUrl ?? (seo.ogImage || DEFAULT_OG_IMAGE)
  return {
    title: { absolute: `${title} · ${general.name}` },
    description,
    alternates: { canonical: urlFor(locale, slug), languages: { es: urlFor("es", slug), en: urlFor("en", slug) } },
    openGraph: { type: "website", title, description, url: urlFor(locale, slug), ...(image ? { images: [{ url: absolute(image) }] } : {}) },
    twitter: { card: "summary_large_image", title, description, ...(image ? { images: [absolute(image)] } : {}) },
  }
}

export default async function CustomPage({ params }: Params) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const page = await getPublishedPage(slug, locale)
  if (!page) notFound()

  return (
    <>
      <Navbar />
      <section className="post-hero" style={{ background: "linear-gradient(120deg,var(--navy-2) 0%,var(--navy) 60%,#2A1D12 100%)", borderBottom: "1px solid var(--line-d)" }}>
        <div className="wrap" style={{ maxWidth: 900 }}>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(32px,5vw,58px)", color: "var(--text)", lineHeight: 1.08, letterSpacing: "-.01em" }}>
            {page.title}
          </h1>
        </div>
      </section>

      <section style={{ background: "var(--navy)", minHeight: "40vh" }}>
        {page.coverUrl && (
          <div className="wrap" style={{ maxWidth: 980, paddingTop: 44 }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- imagen subida desde el panel (Cloudinary u otro origen) */}
            <img src={page.coverUrl} alt={page.title} className="post-cover" />
          </div>
        )}
        <div className="post-body-wrap" style={{ paddingBottom: 72 }}>
          <MarkdownLite source={page.content} />
        </div>
      </section>
      <Footer />
    </>
  )
}
