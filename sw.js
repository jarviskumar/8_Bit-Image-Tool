const CACHE_NAME = 'precision-vault-v4';
// List EVERY local file you use
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './main.js',
  './manifest.json',
  // External assets must be included to work offline
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap'
];

// Install: Save files to cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: Cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    })
  );
});

// Fetch: Serve from cache first, then network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
