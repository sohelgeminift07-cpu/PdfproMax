/* ============================================================
   MaxOfPdf Service Worker  –  v1.1.0
   Strategy:
     • App shell (HTML, fonts, KaTeX, PDF.js, React) → Cache-First
     • Gemini / external API calls                   → Network-Only
     • Everything else                               → Network-First w/ cache fallback
   ============================================================ */

const CACHE_NAME      = 'maxofpdf-v2';
const OFFLINE_URL     = '/';

/* Resources to pre-cache on install (app shell) */
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

/* Domains that should NEVER be intercepted (live API calls) */
const NETWORK_ONLY_ORIGINS = [
  'generativelanguage.googleapis.com',
  'googleapis.com',
  'groq.com',
];

/* CDN origins we cache aggressively */
const CDN_ORIGINS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.jsdelivr.net',
  'cdnjs.cloudflare.com',
  'unpkg.com',
];

// ── Install ──────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate ─────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Message (SKIP_WAITING from update toast) ─────────────────
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ── Fetch ────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and chrome-extension requests
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // Network-only: API proxy routes (never cache)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  // Network-only: Gemini API and other live APIs
  if (NETWORK_ONLY_ORIGINS.some(o => url.hostname.includes(o))) {
    event.respondWith(fetch(request));
    return;
  }

  // Cache-first: CDN resources (fonts, libraries)
  if (CDN_ORIGINS.some(o => url.hostname.includes(o))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Cache-first: same-origin static assets (icons, manifest, scripts)
  if (url.origin === self.location.origin) {
    const ext = url.pathname.split('.').pop().toLowerCase();
    const staticExts = ['png','jpg','jpeg','svg','webp','ico','woff','woff2','ttf','css','js','json'];
    if (staticExts.includes(ext)) {
      event.respondWith(cacheFirst(request));
      return;
    }
    // HTML navigation → Network-first, fallback to cache
    event.respondWith(networkFirst(request));
    return;
  }

  // Default → Network-first
  event.respondWith(networkFirst(request));
});

// ── Strategies ───────────────────────────────────────────────

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.status === 200 && response.type !== 'opaque') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return cachedFallback(request);
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Last resort: serve the app shell for navigation requests
    if (request.mode === 'navigate') {
      return caches.match(OFFLINE_URL);
    }
    return new Response('Offline', { status: 503 });
  }
}

async function cachedFallback(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  if (request.mode === 'navigate') {
    return caches.match(OFFLINE_URL);
  }
  return new Response('Offline', { status: 503 });
}
