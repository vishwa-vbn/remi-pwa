// importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// workbox.setConfig({ debug: false });

// workbox.core.skipWaiting();
// workbox.core.clientsClaim();

// // Precache assets
// workbox.precaching.precacheAndRoute([
//   { url: '/index.html', revision: '0d48aa279ef1b9ff1d55911e60820a94' },
//   { url: '/assets/index-BjJbPigV.css', revision: null },
//   { url: '/assets/index-CLFjXins.js', revision: null },
//   { url: '/vite.svg', revision: '8e3a10e157f75ada21ab742c022d5430' },
//   { url: '/manifest.webmanifest', revision: '74df59e8765999e75bb5deccb2c2fb68' },
// ]);

// // Cache images
// workbox.routing.registerRoute(
//   ({ request }) => request.destination === 'image',
//   new workbox.strategies.CacheFirst({
//     cacheName: 'images',
//     plugins: [
//       new workbox.expiration.ExpirationPlugin({ maxAgeSeconds: 30 * 24 * 60 * 60 }),
//     ],
//   })
// );
// self.addEventListener('push', (event) => {
//   const payload = event.data ? event.data.json() : { title: 'Test Notification', body: 'No payload' };
//   event.waitUntil(
//     self.registration.showNotification(payload.title, {
//       body: payload.body,
//       icon: '/icon-192x192.png',
//       badge: '/icon-192x192.png',
//       data: { url: '/' },
//     })
//   );
// });

// self.addEventListener('notificationclick', (event) => {
//   event.notification.close();
//   event.waitUntil(
//     clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
//       const url = event.notification.data.url;
//       for (const client of clientList) {
//         if (client.url === url && 'focus' in client) {
//           return client.focus();
//         }
//       }
//       if (clients.openWindow) {
//         return clients.openWindow(url);
//       }
//     })
//   );
// });


// importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// workbox.setConfig({ debug: false });

// workbox.core.skipWaiting();
// workbox.core.clientsClaim();

// // Precache assets
// workbox.precaching.precacheAndRoute([
//   { url: '/index.html', revision: '0d48aa279ef1b9ff1d55911e60820a94' },
//   { url: '/assets/index-BjJbPigV.css', revision: null },
//   { url: '/assets/index-CLFjXins.js', revision: null },
//   { url: '/vite.svg', revision: '8e3a10e157f75ada21ab742c022d5430' },
//   { url: '/manifest.webmanifest', revision: '74df59e8765999e75bb5deccb2c2fb68' },
// ]);

// // Cache images
// workbox.routing.registerRoute(
//   ({ request }) => request.destination === 'image',
//   new workbox.strategies.CacheFirst({
//     cacheName: 'images',
//     plugins: [
//       new workbox.expiration.ExpirationPlugin({ maxAgeSeconds: 30 * 24 * 60 * 60 }),
//     ],
//   })
// );

// self.addEventListener('push', (event) => {
//   const payload = event.data ? event.data.json() : { title: 'Task Reminder', body: 'No details provided.' };
//   event.waitUntil(
//     self.registration.showNotification(payload.title, {
//       body: payload.body,
//       icon: '/icon.png', // Ensure you have an icon in your public folder
//       data: payload.data
//     })
//   );
// });

// self.addEventListener('notificationclick', (event) => {
//   event.notification.close();
//   event.waitUntil(
//     clients.openWindow(`/task/${event.notification.data.taskId}`) // Adjust URL to match your app's routing
//   );
// });

importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

workbox.setConfig({ debug: true }); // Enable debug mode for more verbose Workbox logs

// Log service worker initialization
console.log('Service Worker: Initializing');

// Precache assets
workbox.precaching.precacheAndRoute([
  { url: '/index.html', revision: '0d48aa279ef1b9ff1d55911e60820a94' },
  { url: '/assets/index-BjJbPigV.css', revision: null },
  { url: '/assets/index-CLFjXins.js', revision: null },
  { url: '/vite.svg', revision: '8e3a10e157f75ada21ab742c022d5430' },
  { url: '/manifest.webmanifest', revision: '74df59e8765999e75bb5deccb2c2fb68' },
], {
  // Log precaching events
  cacheId: 'pwa-cache',
  plugins: [
    {
      cacheWillUpdate: async ({ request, response }) => {
        console.log('Service Worker: Precaching', request.url);
        return response;
      },
    },
  ],
});

// Cache images
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'images',
    plugins: [
      new workbox.expiration.ExpirationPlugin({ maxAgeSeconds: 30 * 24 * 60 * 60 }),
      {
        cacheWillUpdate: async ({ request, response }) => {
          console.log('Service Worker: Caching image', request.url);
          return response;
        },
      },
    ],
  })
);

// Handle service worker installation
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing');
  // Comment out skipWaiting to control updates
  // self.skipWaiting();
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating');
  event.waitUntil(
    self.clients.claim().then(() => {
      console.log('Service Worker: Claimed clients');
      // Notify clients of activation
      self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
        clients.forEach((client) =>
          client.postMessage({ type: 'SW_ACTIVATED' })
        );
      });
    })
  );
});

// Handle push events (first point of contact for incoming notifications)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push event received', {
    eventData: event.data ? event.data.text() : 'No data',
    timestamp: new Date().toISOString(),
  });

  let payload;
  try {
    payload = event.data ? event.data.json() : { title: 'Task Reminder', body: 'No details provided.' };
    console.log('Service Worker: Parsed push payload', {
      title: payload.title,
      body: payload.body,
      data: payload.data,
    });
  } catch (error) {
    console.error('Service Worker: Error parsing push payload', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    payload = { title: 'Task Reminder', body: 'Error parsing notification.' };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icon.png',
      data: payload.data,
    }).then(() => {
      console.log('Service Worker: Notification displayed successfully', {
        title: payload.title,
        body: payload.body,
        timestamp: new Date().toISOString(),
      });
    }).catch((error) => {
      console.error('Service Worker: Error displaying notification', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', {
    title: event.notification.title,
    body: event.notification.body,
    data: event.notification.data,
    timestamp: new Date().toISOString(),
  });
  event.notification.close();
  event.waitUntil(
    clients.openWindow(`/task/${event.notification.data.taskId}`).then(() => {
      console.log('Service Worker: Opened window for task', {
        taskId: event.notification.data.taskId,
        timestamp: new Date().toISOString(),
      });
    }).catch((error) => {
      console.error('Service Worker: Error opening window', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    })
  );
});

// Handle messages from client (e.g., for controlling updates)
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received from client', {
    message: event.data,
    timestamp: new Date().toISOString(),
  });
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker: Skipping waiting');
    self.skipWaiting();
  }
});