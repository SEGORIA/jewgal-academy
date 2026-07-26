"use client"

import { useEffect } from "react"

export default function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

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
