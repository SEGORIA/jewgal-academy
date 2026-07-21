const CACHE = "jewgal-v2"
const STATIC = [
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
]

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(STATIC)).then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (e) => {
  const { request } = e
  const url = new URL(request.url)

  // Nunca cachear API ni rutas de auth
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/data/") ||
    request.method !== "GET"
  ) {
    e.respondWith(fetch(request))
    return
  }

  // Assets estáticos de Next.js — cache-first
  if (url.pathname.startsWith("/_next/static/")) {
    e.respondWith(
      caches.open(CACHE).then(async (c) => {
        const cached = await c.match(request)
        if (cached) return cached
        const fresh = await fetch(request)
        c.put(request, fresh.clone())
        return fresh
      })
    )
    return
  }

  // Assets públicos (íconos, brand) — cache-first
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/brand/") ||
    url.pathname === "/manifest.json"
  ) {
    e.respondWith(
      caches.open(CACHE).then(async (c) => {
        const cached = await c.match(request)
        if (cached) return cached
        const fresh = await fetch(request)
        c.put(request, fresh.clone())
        return fresh
      })
    )
    return
  }

  // Navegaciones HTML — network-first, sin caché offline
  if (request.headers.get("accept")?.includes("text/html")) {
    e.respondWith(fetch(request).catch(() => caches.match("/aula")))
    return
  }

  // Todo lo demás — network only
  e.respondWith(fetch(request))
})
