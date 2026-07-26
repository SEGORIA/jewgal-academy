import { setRequestLocale } from "next-intl/server"
import { getSiteContentForLocale, getEventos } from "@/lib/server-content"
import EventosClient from "./EventosClient"

export default async function EventosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const [content, eventos] = await Promise.all([
    getSiteContentForLocale(locale),
    getEventos(),
  ])

  return <EventosClient initialContent={content} initialEventos={eventos} />
}
