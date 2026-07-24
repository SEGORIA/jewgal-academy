import { setRequestLocale } from "next-intl/server"
import { getSiteContentForLocale, getCoursesForLocale } from "@/lib/server-content"
import HomeClient from "./HomeClient"

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const [content, courses] = await Promise.all([
    getSiteContentForLocale(locale),
    getCoursesForLocale(locale),
  ])

  return <HomeClient initialContent={content} initialCourses={courses} />
}
