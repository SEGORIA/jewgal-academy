import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ShareButtons from "@/components/blog/ShareButtons"
import { MarkdownLite } from "@/lib/markdown-lite"
import { truncateText } from "@/lib/markdown-text"
import { accentForCategory } from "@/lib/blog"
import { getPublishedPost, getRelatedPosts } from "@/lib/blog-data"
import { getSeoSettings } from "@/lib/seo"
import { getGeneralSettings } from "@/lib/general-settings"
import { SITE_URL } from "@/lib/site-url"

// Los artículos programados aparecen solos al llegar su fecha: no se puede cachear la página.
export const dynamic = "force-dynamic"

type Params = { params: Promise<{ locale: string; slug: string }> }

const absolute = (u: string) => (u.startsWith("/") ? `${SITE_URL}${u}` : u)
const urlFor = (locale: string, slug: string) => `${SITE_URL}${locale === "en" ? "/en" : ""}/blog/${slug}`

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params
  const post = await getPublishedPost(slug, locale).catch(() => null)
  if (!post) {
    return { title: locale === "en" ? "Article not found" : "Artículo no encontrado", robots: { index: false, follow: false } }
  }
  const title = post.seoTitle ?? post.title
  const description = post.seoDescription ?? truncateText(post.excerpt, 160)
  const url = urlFor(locale, slug)
  const [seo, general] = await Promise.all([getSeoSettings(), getGeneralSettings()])
  const image = post.coverUrl ?? seo.ogImage
  return {
    // La plantilla "· Jewgal Academy" no baja hasta acá (el layout del blog ya fijó su propio título), así que se agrega a mano.
    title: { absolute: `${title} · ${general.name}` },
    description,
    alternates: { canonical: url, languages: { es: urlFor("es", slug), en: urlFor("en", slug) } },
    openGraph: {
      type: "article",
      title, description, url,
      publishedTime: post.publishedAt ?? post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      tags: post.tags,
      ...(image ? { images: [{ url: absolute(image) }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description, ...(image ? { images: [absolute(image)] } : {}) },
  }
}

export default async function BlogPostPage({ params }: Params) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const post = await getPublishedPost(slug, locale)
  if (!post) notFound()

  const [t, related, seo] = await Promise.all([
    getTranslations({ locale, namespace: "Blog" }),
    getRelatedPosts(post, locale, 3),
    getSeoSettings(),
  ])

  const accent = accentForCategory(post.category)
  const dateFmt = (iso: string) => new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
  const published = post.publishedAt ?? post.createdAt
  const url = urlFor(locale, slug)
  const image = post.coverUrl ?? seo.ogImage

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.seoDescription ?? truncateText(post.excerpt, 160),
      ...(image ? { image: [absolute(image)] } : {}),
      datePublished: published,
      dateModified: post.updatedAt,
      author: { "@type": "Person", name: post.author },
      publisher: { "@type": "Organization", name: "Jewgal Academy", url: SITE_URL },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      inLanguage: locale,
      articleSection: post.category,
      ...(post.tags.length ? { keywords: post.tags.join(", ") } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: t("breadcrumbHome"), item: `${SITE_URL}${locale === "en" ? "/en" : ""}` },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}${locale === "en" ? "/en" : ""}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ]

  return (
    <>
      {/* "<" escapado para que ningún texto del artículo pueda cerrar la etiqueta <script> */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Navbar />

      {/* ── Cabecera ── */}
      <section className="post-hero" style={{ background: "linear-gradient(120deg,var(--navy-2) 0%,var(--navy) 60%,#2A1D12 100%)", borderBottom: "1px solid var(--line-d)" }}>
        <div className="wrap" style={{ maxWidth: 900 }}>
          <Link href="/blog" style={{ fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--on-dark)", textDecoration: "none", display: "inline-block", marginBottom: 28 }}>
            {t("backToBlog")}
          </Link>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 20 }}>
            <span style={{ fontSize: 11, background: `${accent}15`, border: `1px solid ${accent}35`, borderRadius: 16, padding: "4px 14px", color: accent, letterSpacing: ".12em", textTransform: "uppercase" }}>
              {post.category}
            </span>
            <span style={{ fontSize: 13, color: "var(--on-dark-faint)" }}>
              {dateFmt(published)} · ⏱ {t("minRead", { n: post.readMinutes })}
            </span>
          </div>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(32px,5vw,58px)", color: "var(--text)", lineHeight: 1.08, letterSpacing: "-.01em", marginBottom: 24 }}>
            {post.title}
          </h1>
          <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: "clamp(16px,1.8vw,20px)", color: "var(--on-dark)", lineHeight: 1.7, borderLeft: `3px solid ${accent}`, paddingLeft: 20, maxWidth: 720 }}>
            {post.excerpt}
          </p>
        </div>
      </section>

      {/* ── Portada + texto ── */}
      <section style={{ background: "var(--navy)" }}>
        {post.coverUrl && (
          <div className="wrap" style={{ maxWidth: 980, paddingTop: 44 }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- portada subida desde el panel (Cloudinary u otro origen) */}
            <img src={post.coverUrl} alt={post.title} className="post-cover" />
          </div>
        )}

        <div className="post-body-wrap">
          <MarkdownLite source={post.content} />

          {post.tags.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 36 }}>
              {post.tags.map((tag) => (
                <span key={tag} style={{ fontSize: 12, color: "var(--on-dark)", border: "1px solid var(--line-d)", borderRadius: 16, padding: "4px 12px" }}>#{tag}</span>
              ))}
            </div>
          )}

          <div style={{ marginTop: 40, paddingTop: 28, borderTop: "1px solid var(--line-d)", display: "grid", gap: 26 }}>
            <ShareButtons
              url={url}
              title={post.title}
              labels={{ share: t("share"), whatsapp: t("shareWhatsapp"), copy: t("copyLink"), copied: t("linkCopied") }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span aria-hidden style={{ width: 46, height: 46, borderRadius: "50%", background: "var(--navy-2)", border: "1px solid var(--line-d)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--serif)", fontSize: 20, color: "var(--gold-ink)", flexShrink: 0 }}>
                {post.author.charAt(0).toUpperCase()}
              </span>
              <p style={{ fontSize: 14, color: "var(--on-dark-faint)", lineHeight: 1.5 }}>
                {t("by")} <span style={{ color: "var(--gold-ink)" }}>{post.author}</span> · Jewgal Academy
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Relacionados ── */}
      {related.length > 0 && (
        <section style={{ background: "var(--navy-2)", borderTop: "1px solid var(--line-d)" }}>
          <div className="wrap" style={{ padding: "64px 36px" }}>
            <h2 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(24px,3vw,34px)", color: "var(--text)", marginBottom: 28 }}>{t("related")}</h2>
            <div className="post-related">
              {related.map((r) => (
                <Link key={r.id} href={`/blog/${r.slug}`} className="blog-card">
                  {r.coverUrl && (
                    // eslint-disable-next-line @next/next/no-img-element -- portada subida desde el panel
                    <img src={r.coverUrl} alt="" className="blog-card-cover" loading="lazy" />
                  )}
                  <div style={{ padding: "22px 24px 26px" }}>
                    <span style={{ fontSize: 11, color: accentForCategory(r.category), letterSpacing: ".12em", textTransform: "uppercase" }}>{r.category}</span>
                    <h3 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 18, color: "var(--text)", lineHeight: 1.25, margin: "10px 0" }}>{r.title}</h3>
                    <p style={{ color: "var(--on-dark)", fontSize: 14, lineHeight: 1.6 }}>{truncateText(r.excerpt, 110)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="join pad">
        <div className="glow" />
        <div className="wrap join-inner">
          <h2>{t("postCtaTitle")}</h2>
          <p>{t("postCtaText")}</p>
          <div className="join-actions">
            <Link href="/academia" className="btn solid">{t("modalPrograms")}</Link>
            <Link href="/blog" className="btn">{t("backToBlog")}</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
