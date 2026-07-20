const CACHE_NAME = 'cozydesk-v2';

// Core files to cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    // Network-first for the app shell (HTML / navigation / entry point).
    // This is what lets a new deploy actually reach users instead of
    // serving a stale cached page forever.
    const isAppShell =
      request.mode === 'navigate' ||
      url.pathname === '/' ||
      url.pathname === '/index.html' ||
      url.pathname === '/manifest.json';

    if (isAppShell) {
      event.respondWith(
        fetch(request)
          .then((response) => {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
            return response;
          })
          .catch(() => caches.match(request).then((cached) => cached || caches.match('/index.html')))
      );
      return;
    }

    // Cache-first for hashed static assets (JS, CSS, images, fonts, audio).
    // Safe because Vite gives every build new filenames, so a new version
    // is a new URL that misses the cache and gets fetched fresh.
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return response;
          }
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        });
      })
    );
    return;
  }

  // Network-first for Google Fonts (graceful degradation if offline)
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => caches.match(request))
    );
  }
});