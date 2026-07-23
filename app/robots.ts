import type { MetadataRoute } from "next"

const SITE = "https://jewgal-academy.vercel.app"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/aula/", "/superadmin/", "/api/", "/login", "/en/login"],
    },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  }
}
