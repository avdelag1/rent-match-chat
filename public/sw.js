// Cache version - increment this when deploying breaking changes
const CACHE_VERSION = 'swipematch-v2';
const CACHE_NAME = CACHE_VERSION;
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;

const urlsToCache = [
  '/',
  '/manifest.json',
  '/index.html'
];

// Message handler for version requests
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      type: 'VERSION_INFO',
      version: CACHE_VERSION
    });
  }
  
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    self.registration.update();
  }
});

// Install service worker with immediate activation
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force immediate activation
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(urlsToCache.map(url => 
          new Request(url, { cache: 'reload' })
        ));
      })
      .catch(error => console.error('[SW] Cache failed:', error))
  );
});

// Fetch event - improved strategy for different resource types
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Network-first for Supabase API calls (always fetch fresh data)
  if (url.hostname.includes('supabase')) {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(request))
    );
    return;
  }
  
  // Network-first for HTML pages to ensure fresh content
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then(cache => cache.put(request, responseClone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Network-first for JavaScript files to prevent stale chunk errors
  // Hashed filenames ensure browser-level caching still works efficiently
  if (request.destination === 'script') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first for static assets (CSS, images) with network fallback
  event.respondWith(
    caches.match(request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(request)
          .then(response => {
            // Cache successful responses (200 status code)
            if (response.status === 200) {
              const responseClone = response.clone();

              // Add cache control headers for optimal caching
              const newHeaders = new Headers(responseClone.headers);

              // Different cache durations based on asset type
              if (request.url.includes('/assets/')) {
                // Hashed assets can be cached indefinitely (1 year)
                newHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
              } else if (request.destination === 'style' || request.destination === 'script') {
                // Unhashed CSS/JS: cache for 30 days
                newHeaders.set('Cache-Control', 'public, max-age=2592000');
              } else if (request.destination === 'image') {
                // Images: cache for 30 days
                newHeaders.set('Cache-Control', 'public, max-age=2592000');
              } else {
                // Other assets: cache for 7 days
                newHeaders.set('Cache-Control', 'public, max-age=604800');
              }

              const newResponse = new Response(responseClone.body, {
                status: responseClone.status,
                statusText: responseClone.statusText,
                headers: newHeaders
              });

              caches.open(DYNAMIC_CACHE)
                .then(cache => cache.put(request, newResponse));
            }
            return response;
          });
      })
  );
});

// Activate service worker and clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Take control of all clients immediately
      self.clients.claim(),
      
      // Clean up old caches - only delete app-related caches with tinderent prefix
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Only delete caches that belong to this app and are not the current ones
            if (cacheName.startsWith('swipematch-') &&
                cacheName !== STATIC_CACHE &&
                cacheName !== DYNAMIC_CACHE) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
  
  // Notify clients about the update
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'SW_UPDATED',
        version: CACHE_VERSION
      });
    });
  });
});