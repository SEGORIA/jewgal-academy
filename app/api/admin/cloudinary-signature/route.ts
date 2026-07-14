import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { isCloudinaryConfigured, buildUploadSignature } from "@/lib/cloudinary"

const bodySchema = z.object({
  folder: z.string().min(1).max(100).default("jewgal-recursos"),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

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
