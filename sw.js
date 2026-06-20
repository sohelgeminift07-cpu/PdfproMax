const CACHE_NAME = 'maxofpdf-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/base.css',
  '/components.css',
  '/animations.css',
  '/reader.css',
  '/uiverse.css',
  '/manifest.json'
];

/* Install: Cache static assets */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

/* Activate: Clean up old caches and claim clients immediately */
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.map(function(key) {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

/* Fetch: Stale-While-Revalidate caching strategy with API bypass */
self.addEventListener('fetch', function(e) {
  if (e.request.url.includes('/api/')) {
    return; /* Bypass API requests */
  }
  e.respondWith(
    caches.match(e.request).then(function(cachedResponse) {
      if (cachedResponse) {
        /* Fetch fresh version in background to update cache */
        fetch(e.request).then(function(networkResponse) {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(e.request, networkResponse);
            });
          }
        }).catch(function() {});
        return cachedResponse;
      }
      return fetch(e.request);
    })
  );
});

/* Listen for skipWaiting message from index.html update toast */
self.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
