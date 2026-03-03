const CACHE_NAME = '8Bit_image-resize-v2'; //updated
const ASSETS = [
  './',              // The root folder
  './index.html',    // Your main file
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap'
];

// 1. INSTALL: Save everything to local storage
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('System: Caching Assets...');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // Force the new service worker to take over immediately
});

// 2. ACTIVATE: Clean up old versions so they don't block the offline mode
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// 3. FETCH: The "Cache-First" Logic
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return the cached file if found, otherwise try the network
      return cachedResponse || fetch(event.request).catch(() => {
        // Optional: If both fail (total offline + not cached), return a custom error
        console.log("System: Resource not in cache and user is offline.");
      });
    })
  );
});