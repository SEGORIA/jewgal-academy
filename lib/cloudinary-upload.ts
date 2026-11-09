// Subida firmada a Cloudinary desde el navegador (con progreso). El servidor
// solo firma (/api/admin/cloudinary-signature); el archivo viaja directo del
// navegador a Cloudinary, sin pasar por Vercel (que limita el tamaño del body).
export function uploadToCloudinary(file: File, folder: string, onProgress: (pct: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const sigRes = await fetch("/api/admin/cloudinary-signature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder }),
        })
        if (!sigRes.ok) {
          const d = await sigRes.json().catch(() => ({}))
          reject(new Error(d.error ?? "Cloudinary no está configurado"))
          return
        }
        const { timestamp, signature, apiKey, cloudName, folder: signedFolder } = await sigRes.json()

        const formData = new FormData()
        formData.append("file", file)
        formData.append("timestamp", String(timestamp))
        formData.append("signature", signature)
        formData.append("api_key", apiKey)
        formData.append("folder", signedFolder)

        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
        }
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText).secure_url)
          else reject(new Error(`Error al subir: ${xhr.status}`))
        }
        xhr.onerror = () => reject(new Error("Error de red al subir"))
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`)
        xhr.send(formData)
      } catch (err) {
        reject(err instanceof Error ? err : new Error("Error al subir el archivo"))
      }
    })()
  })
}
