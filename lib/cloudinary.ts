import { v2 as cloudinary } from "cloudinary"

const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

export function isCloudinaryConfigured() {
  return Boolean(cloudName && apiKey && apiSecret)
}

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  })
}

export function buildUploadSignature(folder: string) {
  const timestamp = Math.round(Date.now() / 1000)
  const paramsToSign = { folder, timestamp }
  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret!)
  return {
    timestamp,
    signature,
    apiKey: apiKey!,
    cloudName: cloudName!,
    folder,
  }
}

// Subida server-side de un buffer ya generado (ej. un PDF armado en memoria)
// vía data-URI base64 — sin firma de navegador, sin manejo de streams.
// Cloudinary trata los PDF como resource_type "image" (permite thumbnails
// de la primera página a futuro sin cambios acá).
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  opts: { folder: string; publicId: string; mimeType: string; resourceType?: "image" | "raw" | "video" }
): Promise<string> {
  const dataUri = `data:${opts.mimeType};base64,${buffer.toString("base64")}`
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: opts.folder,
    public_id: opts.publicId,
    resource_type: opts.resourceType ?? "image",
    overwrite: true,
  })
  return result.secure_url
}

export { cloudinary }
