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

importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

workbox.setConfig({ debug: false });

workbox.core.skipWaiting();
workbox.core.clientsClaim();

// Precache assets
workbox.precaching.precacheAndRoute([
  { url: '/index.html', revision: '0d48aa279ef1b9ff1d55911e60820a94' },
  { url: '/assets/index-BjJbPigV.css', revision: null },
  { url: '/assets/index-CLFjXins.js', revision: null },
  { url: '/vite.svg', revision: '8e3a10e157f75ada21ab742c022d5430' },
  { url: '/manifest.webmanifest', revision: '74df59e8765999e75bb5deccb2c2fb68' },
]);

// Cache images
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'images',
    plugins: [
      new workbox.expiration.ExpirationPlugin({ maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);

self.addEventListener('push', (event) => {
  const payload = event.data ? event.data.json() : { title: 'Task Reminder', body: 'No details provided.' };
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icon.png', // Ensure you have an icon in your public folder
      data: payload.data
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(`/task/${event.notification.data.taskId}`) // Adjust URL to match your app's routing
  );
});