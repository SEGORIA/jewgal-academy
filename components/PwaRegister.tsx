"use client"

import { useEffect } from "react"

export default function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    // En desarrollo los chunks/CSS tienen nombre fijo y el SW (cache-first) mostraba código viejo tras cada edición:
    // se desregistra y se limpia su caché. El SW solo corre en producción (allí los nombres llevan hash).
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister())).catch(() => {})
      if ("caches" in window) caches.keys().then((ks) => ks.forEach((k) => caches.delete(k))).catch(() => {})
      return
    }

    navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      .then((reg) => {
        // Buscar una versión nueva en cada carga: sin esto el navegador puede
        // seguir sirviendo un SW viejo (y sus chunks cacheados) durante días.
        reg.update().catch(() => {})

        // Cuando el SW nuevo toma el control, recargar una sola vez para que
        // la pestaña deje de correr el código viejo.
        let refreshing = false
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (refreshing) return
          refreshing = true
          window.location.reload()
        })
      })
      .catch(() => {})
  }, [])

  return null
}
