import { setRequestLocale } from "next-intl/server"
import { getSiteContentForLocale, getCoursesForLocale } from "@/lib/server-content"
import { getAvales, getTestimonials } from "@/lib/public-data"
import HomeClient from "./HomeClient"

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const [content, courses, avales, testimonials] = await Promise.all([
    getSiteContentForLocale(locale),
    getCoursesForLocale(locale),
    getAvales(),
    getTestimonials(locale),
  ])

  return <HomeClient initialContent={content} initialCourses={courses} avales={avales} testimonials={testimonials} />
}
