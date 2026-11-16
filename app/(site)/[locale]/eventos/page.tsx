import { setRequestLocale } from "next-intl/server"
import { getSiteContentForLocale, getEventos } from "@/lib/server-content"
import { baseDb } from "@/lib/db"
import EventosClient from "./EventosClient"

// Los lugares disponibles cambian con cada reserva: la página no se puede cachear.
export const dynamic = "force-dynamic"

export default async function EventosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const [content, eventos, groups] = await Promise.all([
    getSiteContentForLocale(locale),
    getEventos(),
    baseDb.eventRegistration.groupBy({ by: ["eventId"], where: { status: "confirmed" }, _count: { _all: true } }).catch(() => []),
  ])
  const taken: Record<string, number> = Object.fromEntries(groups.map((g) => [g.eventId, g._count._all]))

  return <EventosClient initialContent={content} initialEventos={eventos} taken={taken} />
}
