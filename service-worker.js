const CACHE_NAME = 'temp-humid-combo-v1';
const APP_SHELL = [
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// App shell: cache-first. Weather API calls: always go to network (never cached),
// so the data shown is always live.
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  const isApi = url.includes('api.open-meteo.com') ||
                url.includes('api.zippopotam.us') ||
                url.includes('api.bigdatacloud.net');

  if (isApi) {
    return; // let it hit the network normally, no caching of live data
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
