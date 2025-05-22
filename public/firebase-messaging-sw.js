// // public/firebase-messaging-sw.js
// importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
// importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

// const firebaseConfig = {
//   apiKey: "AIzaSyCy3XcxbVP3qWlfRuFNG9Y5wBarupwsEI0",
//   authDomain: "remi-dbbdb.firebaseapp.com",
//   projectId: "remi-dbbdb",
//   storageBucket: "remi-dbbdb.firebasestorage.app",
//   messagingSenderId: "56268346739",
//   appId: "1:56268346739:web:7de4e9ef0de534f5c9e106"
// };

// firebase.initializeApp(firebaseConfig);
// const messaging = firebase.messaging();

// messaging.onBackgroundMessage((payload) => {
//   const notificationTitle = payload.notification.title;
//   const notificationOptions = {
//     body: payload.notification.body,
//     icon: '/icon-192x192.png',
//     data: payload.data,
//   };

//   self.registration.showNotification(notificationTitle, notificationOptions);
// });

// self.addEventListener('notificationclick', (event) => {
//   event.notification.close();
//   event.waitUntil(
//     clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
//       const url = `/task/${event.notification.data.taskId}`;
//       for (const client of clientList) {
//         if (client.url.includes('/task/') && 'focus' in client) {
//           client.focus();
//           return;
//         }
//       }
//       if (clients.openWindow) {
//         return clients.openWindow(url);
//       }
//     })
//   );
// });


// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCy3XcxbVP3qWlfRuFNG9Y5wBarupwsEI0",
  authDomain: "remi-dbbdb.firebaseapp.com",
  projectId: "remi-dbbdb",
  storageBucket: "remi-dbbdb.firebasestorage.app",
  messagingSenderId: "56268346739",
  appId: "1:56268346739:web:7de4e9ef0de534f5c9e106"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  // messaging.onBackgroundMessage((payload) => {
  //   console.log('Background message received:', payload);
  //   const notificationTitle = payload.notification.title;
  //   const notificationOptions = {
  //     body: payload.notification.body,
  //     icon: '/icon-192x192.png',
  //     data: payload.data,
  //   };

  //   self.registration.showNotification(notificationTitle, notificationOptions);
  // });

  messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: '/icon-192x192.png',
    data: { taskId: payload.data.taskId },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});


  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        const url = `/task/${event.notification.data.taskId}`;
        for (const client of clientList) {
          if (client.url.includes('/task/') && 'focus' in client) {
            client.focus();
            return;
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  });
} catch (error) {
  console.error('Error in Firebase Messaging service worker:', error);
}