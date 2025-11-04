// Aqua Buddy Service Worker for PWA functionality and notifications

const CACHE_NAME = 'aqua-buddy-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json'
];

// Install service worker and cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Fetch from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Activate and clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Handle notification clicks and actions
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open in a tab, focus it
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        // Otherwise open a new window
        return clients.openWindow('/');
      })
  );
});

// Handle push notifications (for future server-side push support)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Time to drink water! 💧',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'aqua-buddy-reminder',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification('Aqua Buddy Reminder 💧', options)
  );
});

// Handle messages from main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    // Store notification data for later use
    const { message, delay } = event.data;

    // Note: Service workers can't use setTimeout reliably
    // This is a placeholder for future Periodic Background Sync implementation
    console.log('Notification scheduled:', message, 'in', delay, 'ms');
  }
});
