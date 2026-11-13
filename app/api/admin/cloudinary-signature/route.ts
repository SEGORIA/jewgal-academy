import { NextRequest, NextResponse } from "next/server"
import { adminGuard } from "@/lib/admin-guard"
import { z } from "zod"
import { isCloudinaryConfigured, buildUploadSignature } from "@/lib/cloudinary"

const bodySchema = z.object({
  folder: z.string().min(1).max(100).default("jewgal-recursos"),
})

export async function POST(req: NextRequest) {
  const g = await adminGuard("any")
  if (!g.ok) return g.response
  g.enter()
  const session = g.session

  if (!isCloudinaryConfigured()) {
    return NextResponse.json({ error: "Cloudinary no está configurado" }, { status: 503 })
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 })
  }

  const result = buildUploadSignature(parsed.data.folder)
  return NextResponse.json(result)
}
