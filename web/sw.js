// CineTrack Service Worker — Offline PWA Support
const CACHE = "cinetrack-v4";
const ASSETS = [
  "/",
  "/index.html",
  "/css/main.css",
  "/css/components.css",
  "/js/data.js",
  "/js/auth.js",
  "/js/tmdb.js",
  "/js/features.js",
  "/js/watchlist.js",
  "/js/reviews.js",
  "/js/pages.js",
  "/js/app.js",
  "/manifest.json",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const url = e.request.url;
  const isDoc = e.request.mode === "navigate" || url.endsWith("/") || url.includes("index.html");
  const isApi = url.includes("themoviedb.org") || url.includes("googleapis.com");

  if (isDoc || isApi) {
    // Network first, fallback to cache
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res.status === 200 && !isApi) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    // Cache first, fallback to network
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
        if (res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }))
    );
  }
});
