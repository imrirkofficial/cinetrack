// CineTrack Service Worker — Offline PWA Support
const CACHE = "cinetrack-v3";
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
  // Network first for TMDB API, cache first for local assets
  if (e.request.url.includes("themoviedb.org") || e.request.url.includes("googleapis.com")) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }))
    );
  }
});
