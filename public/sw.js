const CACHE_NAME = 'tinderent-v' + Date.now(); // Dynamic cache versioning
const STATIC_CACHE = 'tinderent-static-v' + Date.now();
const DYNAMIC_CACHE = 'tinderent-dynamic-v' + Date.now();

const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install service worker and force immediate activation
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Force immediate activation to replace old service worker
        return self.skipWaiting();
      })
  );
});

// Activate service worker and claim all clients immediately
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete all old caches
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    }).then(() => {
      // Notify all clients to refresh
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'CACHE_UPDATED',
            message: 'New version available, please refresh!'
          });
        });
      });
    })
  );
});

// Aggressive cache-busting fetch strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request.clone(), {
      // Add cache-busting headers
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }).then((response) => {
      // Clone the response
      const responseClone = response.clone();
      
      // Cache dynamic content
      if (response.status === 200) {
        caches.open(DYNAMIC_CACHE)
          .then((cache) => {
            cache.put(event.request, responseClone);
          });
      }
      
      return response;
    }).catch(() => {
      // Fallback to cache only if network fails
      return caches.match(event.request);
    })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FORCE_REFRESH') {
    // Clear all caches and reload
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      // Notify client to reload
      event.source.postMessage({
        type: 'CACHE_CLEARED',
        message: 'Cache cleared, reloading...'
      });
    });
  }
});