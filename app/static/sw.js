var CACHE_NAME = 'olmastroy-v1';
var STATIC_ASSETS = [
  '/',
  '/static/css/style.css',
  '/static/js/main.js',
  '/static/js/mobile-nav.js',
  '/static/img/logo-icon.svg',
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) { return name !== CACHE_NAME; })
          .map(function(name) { return caches.delete(name); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;

  // Skip admin panel and API requests
  var url = new URL(event.request.url);
  if (url.pathname.startsWith('/panel') || url.pathname.startsWith('/api') || url.pathname.startsWith('/admin')) return;

  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) {
        // Return cached, update in background (stale-while-revalidate)
        var fetchPromise = fetch(event.request).then(function(response) {
          if (response && response.status === 200) {
            var clone = response.clone();
            caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, clone); });
          }
          return response;
        }).catch(function() {});
        return cached;
      }
      return fetch(event.request).then(function(response) {
        if (response && response.status === 200 && url.pathname.match(/\.(css|js|svg|png|jpg|webp|woff2?)$/)) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, clone); });
        }
        return response;
      });
    })
  );
});
