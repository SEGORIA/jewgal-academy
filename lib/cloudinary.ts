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

export { cloudinary }
