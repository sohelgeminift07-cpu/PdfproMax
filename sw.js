const CACHE_NAME = 'maxofpdf-v2';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/style.css',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// ── Install: pre-cache core assets ───────────────────────────────────────────
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(PRECACHE_URLS);
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

// ── Activate: remove old caches ──────────────────────────────────────────────
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (cacheNames) {
        return Promise.all(
          cacheNames
            .filter(function (name) { return name !== CACHE_NAME; })
            .map(function (name) { return caches.delete(name); })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

// ── Fetch: network-first, fallback to cache ──────────────────────────────────
self.addEventListener('fetch', function (event) {
  // Only handle GET requests to our own origin
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  // For navigation requests (HTML pages) — network first, cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(function (response) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(function () {
          return caches.match('/index.html');
        })
    );
    return;
  }

  // For all other assets — cache first, network fallback
  event.respondWith(
    caches.match(event.request)
      .then(function (cached) {
        if (cached) {
          // Refresh cache in background
          fetch(event.request).then(function (response) {
            if (response && response.status === 200) {
              caches.open(CACHE_NAME).then(function (cache) {
                cache.put(event.request, response);
              });
            }
          }).catch(function () {});
          return cached;
        }

        // Not in cache — fetch and store
        return fetch(event.request).then(function (response) {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, clone);
          });
          return response;
        });
      })
  );
});
