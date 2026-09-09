const CACHE_NAME = 'angle-setter-cache-v1';
const OFFLINE_URLS = [
  new URL('./', self.registration.scope).toString(),
  new URL('./index.html', self.registration.scope).toString(),
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => cache.addAll(OFFLINE_URLS))
      .catch(() => null)
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(
          keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

const isSameOrigin = url => url.origin === self.location.origin;

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (!isSameOrigin(url)) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          const cached = await cache.match(event.request);
          if (cached) return cached;
          const fallback = await cache.match(OFFLINE_URLS[0]);
          if (fallback) return fallback;
          return Response.error();
        })
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async cache => {
      const cached = await cache.match(event.request);
      if (cached) return cached;

      try {
        const response = await fetch(event.request);
        cache.put(event.request, response.clone());
        return response;
      } catch (error) {
        const fallback = await cache.match(OFFLINE_URLS[0]);
        if (fallback) return fallback;
        throw error;
      }
    })
  );
});
