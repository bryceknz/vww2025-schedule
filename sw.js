// Service Worker for Vegan Wellbeing Weekend 2025 PWA
// Optimized for venues with poor internet connectivity
const CACHE_NAME = 'vww2025-v1.0.2';
const OFFLINE_URL = '/offline.html';

// Files to cache for offline use - ALL critical files
// Use absolute paths for better Vercel compatibility
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/styles.min.css',
  '/script.min.js',
  '/events.min.js',
  '/categories.min.js',
  '/locations.min.js',
  '/offline.html',
  '/manifest.json',
  // Cache all icons for offline use
  '/icons/icon-16x16.png',
  '/icons/icon-32x32.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install event - AGGRESSIVELY cache ALL static assets for poor connectivity
self.addEventListener('install', event => {
  console.log('🚀 Service Worker installing for poor connectivity venue...');
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Caching ALL static assets for offline use');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log(
          '✅ ALL static assets cached successfully - app ready for offline use'
        );
        // Force activation immediately
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ CRITICAL: Failed to cache static assets:', error);
        // Even if caching fails, still activate the service worker
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - CACHE FIRST strategy for poor connectivity venues
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip requests to external domains
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      // For main HTML file only, try network first to get updates
      // Skip this for offline.html and other special pages
      if (
        (event.request.url.endsWith('/') || event.request.url.endsWith('/index.html')) &&
        !event.request.url.includes('offline.html')
      ) {
        return fetch(event.request)
          .then(fetchResponse => {
            if (fetchResponse && fetchResponse.status === 200) {
              const responseToCache = fetchResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
                console.log('🔄 Updated cache:', event.request.url);
              });
              return fetchResponse;
            }
            // If network fails, return cached version
            return response || fetchResponse;
          })
          .catch(error => {
            console.log(
              '⚠️ Network failed, using cached version:',
              event.request.url
            );
            return response;
          });
      }

      // For other files, use cache first but update in background
      if (response) {
        console.log('✅ Serving from cache:', event.request.url);

        // Try to update cache in background (stale-while-revalidate)
        fetch(event.request)
          .then(fetchResponse => {
            if (
              fetchResponse &&
              fetchResponse.status === 200 &&
              fetchResponse.type === 'basic'
            ) {
              const responseToCache = fetchResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
                console.log('🔄 Background cache update:', event.request.url);
              });
            }
          })
          .catch(error => {
            console.log(
              '⚠️ Background update failed (using cached version):',
              event.request.url
            );
          });

        return response;
      }

      // If not in cache, try network but don't fail if network is bad
      console.log('🌐 Not in cache, trying network:', event.request.url);
      return fetch(event.request)
        .then(response => {
          // Only cache successful responses
          if (
            response &&
            response.status === 200 &&
            response.type === 'basic'
          ) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
              console.log('💾 Cached new resource:', event.request.url);
            });
          }
          return response;
        })
        .catch(error => {
          console.log('❌ Network failed:', event.request.url);

          // For navigation requests, show offline page
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL) || caches.match('/index.html');
          }

          // For other requests, try to return a fallback or show offline page
          if (event.request.url.includes('.html')) {
            return caches.match('/index.html');
          }

          // For CSS/JS files, return a basic response to prevent app breaking
          if (event.request.url.includes('.css')) {
            return new Response('/* Offline - styles cached */', {
              headers: { 'Content-Type': 'text/css' },
            });
          }

          if (event.request.url.includes('.js')) {
            return new Response('// Offline - scripts cached', {
              headers: { 'Content-Type': 'application/javascript' },
            });
          }

          // For everything else, throw error
          throw error;
        });
    })
  );
});

// Handle background sync (if supported)
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    // Add any background sync logic here
  }
});

// Handle push notifications (if needed in the future)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-32x32.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
      },
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(clients.openWindow('/'));
});
