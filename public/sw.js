/**
 * Ultra-Fast Service Worker - Optimized for lightning-speed loading
 * Cache version is injected at build time for proper cache busting
 */
const BUILD_TIME = '__BUILD_TIME__';
const CACHE_VERSION = `tinderent-v${BUILD_TIME}`;
const CACHE_NAME = CACHE_VERSION;
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;
const IMAGE_CACHE = `${CACHE_NAME}-images`;

// Critical assets to precache immediately for offline-first experience
const urlsToCache = [
  '/',
  '/manifest.json',
  '/index.html'
];

// Cache TTL settings (in seconds)
const CACHE_TTL = {
  immutable: 31536000, // 1 year - for hashed assets
  static: 2592000,     // 30 days - for static assets
  dynamic: 604800,     // 7 days - for dynamic content
  api: 300,            // 5 minutes - for API responses
};

// Maximum cache sizes (number of items)
const MAX_DYNAMIC_CACHE_SIZE = 100;
const MAX_IMAGE_CACHE_SIZE = 200;

// Message handler for version requests and update control
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

  // CRITICAL: Allow app to force skip waiting for immediate update
  // This enables instant app refresh when user accepts update prompt
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Clear all caches on demand (for cache corruption recovery)
  if (event.data && event.data.type === 'CLEAR_CACHES') {
    caches.keys().then(names => {
      return Promise.all(names.map(name => caches.delete(name)));
    }).then(() => {
      if (event.ports[0]) {
        event.ports[0].postMessage({ type: 'CACHES_CLEARED' });
      }
    });
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
  
  // Network-first for HTML pages to ensure fresh content after deploys
  // Uses cache: 'no-cache' to bypass browser HTTP cache and CDN caches
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request, {
        // CRITICAL: Force revalidation to ensure fresh HTML after deploy
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
        .then(response => {
          // Only cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Offline fallback - serve from cache
          return caches.match(request);
        })
    );
    return;
  }
  
  // Cache-first for static assets (JS, CSS, images) with network fallback
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

              // Different cache durations based on asset type - optimized for repeat visits
              if (request.url.includes('/assets/') && request.url.match(/-[a-f0-9]{8}\./)) {
                // Hashed assets can be cached indefinitely (1 year) - immutable
                newHeaders.set('Cache-Control', `public, max-age=${CACHE_TTL.immutable}, immutable`);
              } else if (request.destination === 'style' || request.destination === 'script') {
                // CSS/JS: cache for 30 days with stale-while-revalidate
                newHeaders.set('Cache-Control', `public, max-age=${CACHE_TTL.static}, stale-while-revalidate=86400`);
              } else if (request.destination === 'image') {
                // Images: cache for 30 days with stale-while-revalidate
                newHeaders.set('Cache-Control', `public, max-age=${CACHE_TTL.static}, stale-while-revalidate=86400`);
              } else if (request.destination === 'font') {
                // Fonts: cache for 1 year (they rarely change)
                newHeaders.set('Cache-Control', `public, max-age=${CACHE_TTL.immutable}, immutable`);
              } else {
                // Other assets: cache for 7 days with stale-while-revalidate
                newHeaders.set('Cache-Control', `public, max-age=${CACHE_TTL.dynamic}, stale-while-revalidate=86400`);
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

      // FIX: Clean up old caches - use correct prefix 'tinderent-' (was 'swipematch-')
      // Also include IMAGE_CACHE in the exclusion list
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Only delete caches that belong to this app and are not the current ones
            if (cacheName.startsWith('tinderent-') &&
                cacheName !== STATIC_CACHE &&
                cacheName !== DYNAMIC_CACHE &&
                cacheName !== IMAGE_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),

      // FIX: Enforce cache size limits to prevent bloat
      enforceImageCacheLimit(),
      enforceDynamicCacheLimit()
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

// FIX: Implement cache eviction for images (LRU-style - delete oldest first)
async function enforceImageCacheLimit() {
  try {
    const cache = await caches.open(IMAGE_CACHE);
    const keys = await cache.keys();
    if (keys.length > MAX_IMAGE_CACHE_SIZE) {
      const toDelete = keys.slice(0, keys.length - MAX_IMAGE_CACHE_SIZE);
      await Promise.all(toDelete.map(key => cache.delete(key)));
      console.log(`[SW] Evicted ${toDelete.length} images from cache`);
    }
  } catch (e) {
    // Ignore cache eviction errors
  }
}

// FIX: Implement cache eviction for dynamic content
async function enforceDynamicCacheLimit() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const keys = await cache.keys();
    if (keys.length > MAX_DYNAMIC_CACHE_SIZE) {
      const toDelete = keys.slice(0, keys.length - MAX_DYNAMIC_CACHE_SIZE);
      await Promise.all(toDelete.map(key => cache.delete(key)));
      console.log(`[SW] Evicted ${toDelete.length} items from dynamic cache`);
    }
  } catch (e) {
    // Ignore cache eviction errors
  }
}