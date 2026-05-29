const CACHE_NAME = "tio-eric-family-tracker-v2";
const ASSETS = ["./", "./index.html", "./checkin.html", "./styles.css", "./app.js", "./checkin.js", "./data/leaderboard.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS).catch(() => undefined)));
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
