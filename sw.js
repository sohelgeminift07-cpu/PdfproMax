const CACHE_NAME = 'maxofpdf-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/base.css',
  '/components.css',
  '/animations.css',
  '/reader.css',
  '/uiverse.css',
  '/manifest.json',
  '/pwa.js'
];

/* Install: Cache static assets */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS).catch(function(err) {
        console.warn('SW: Failed to cache some assets:', err);
        /* Continue even if some assets fail to cache */
        return Promise.resolve();
      });
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
            console.log('SW: Deleting old cache:', key);
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
  /* Bypass API requests — always go to network */
  if (e.request.url.includes('/api/')) {
    return;
  }
  
  /* Handle POST requests — bypass cache */
  if (e.request.method !== 'GET') {
    e.respondWith(fetch(e.request).catch(function() {
      return new Response('Network error', { status: 503 });
    }));
    return;
  }
  
  /* Stale-while-revalidate for GET requests */
  e.respondWith(
    caches.match(e.request).then(function(cachedResponse) {
      if (cachedResponse) {
        /* Return cached version immediately */
        /* Fetch fresh version in background to update cache */
        fetch(e.request).then(function(networkResponse) {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(e.request, networkResponse.clone());
            }).catch(function() {});
          }
        }).catch(function() {});
        return cachedResponse;
      }
      
      /* No cache, fetch from network */
      return fetch(e.request).catch(function() {
        return new Response('Network unavailable', { status: 503 });
      });
    })
  );
});

/* Listen for skipWaiting message from pwa.js update handler */
self.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    console.log('SW: Received SKIP_WAITING message');
    self.skipWaiting();
  }
});
