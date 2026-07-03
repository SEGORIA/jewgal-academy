import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

const DEFAULT_PHOTOS = [
  { src: "/brand/hero/devora-coaching.webp",  alt: "Devora con su grupo de coaching",      active: true, order: 0 },
  { src: "/brand/hero/devora-tv.webp",         alt: "Devora en televisión",                active: true, order: 1 },
  { src: "/brand/hero/devora-ninos.webp",      alt: "Devora con niños",                    active: true, order: 2 },
  { src: "/brand/hero/devora-miami.webp",      alt: "Devora en Miami con familia",          active: true, order: 3 },
  { src: "/brand/hero/devora-joven.webp",      alt: "Joven saludando en experiencia Jewgal", active: true, order: 4 },
]

export async function GET() {
  try {
    const setting = await db.siteSetting.findUnique({ where: { key: "hero_photos" } })
    if (setting?.value) {
      const photos = JSON.parse(setting.value)
      return NextResponse.json(photos)
    }
  } catch {}
  return NextResponse.json(DEFAULT_PHOTOS)
}
