// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { Provider } from 'react-redux';
// import { BrowserRouter, Switch, Route } from 'react-router-dom';
// import { PersistGate } from 'redux-persist/integration/react';
// import App from './components/screens/App';
// import './index.css';
// import { configureStore } from './store/configure/configureStore';

// export const { store, persistor } = configureStore();

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <Provider store={store}>
//       <PersistGate loading={null} persistor={persistor}>
//         <BrowserRouter>
//           <Switch>
//             <Route path="/" component={App} />
//           </Switch>
//         </BrowserRouter>
//       </PersistGate>
//     </Provider>
//   </React.StrictMode>
// );

// // Register service worker
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker
//       .register('/sw.js', { scope: '/' })
//       .then((registration) => console.log('Service Worker registered:', registration))
//       .catch((error) => console.error('Service Worker registration failed:', error));
//   });
// }


// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { Provider } from 'react-redux';
// import { BrowserRouter, Switch, Route } from 'react-router-dom';
// import { PersistGate } from 'redux-persist/integration/react';
// import App from './components/screens/App';
// import './index.css';
// import { configureStore } from './store/configure/configureStore';

// export const { store, persistor } = configureStore();

// // Request notification permissions
// if ('Notification' in window) {
//   Notification.requestPermission().then((permission) => {
//     if (permission === 'granted') {
//       console.log('Notification permission granted.');
//     } else {
//       console.warn('Notification permission denied.');
//     }
//   });
// }

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <Provider store={store}>
//       <PersistGate loading={null} persistor={persistor}>
//         <BrowserRouter>
//           <Switch>
//             <Route path="/" component={App} />
//           </Switch>
//         </BrowserRouter>
//       </PersistGate>
//     </Provider>
//   </React.StrictMode>
// );

// // Register service worker
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker
//       .register('/sw.js', { scope: '/' })
//       .then((registration) => console.log('Service Worker registered:', registration))
//       .catch((error) => console.error('Service Worker registration failed:', error));
//   });
// }

// // src/index.js
// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { Provider } from 'react-redux';
// import { BrowserRouter, Switch, Route } from 'react-router-dom';
// import { PersistGate } from 'redux-persist/integration/react';
// import App from './components/screens/App';
// import './index.css';
// import { configureStore } from './store/configure/configureStore';
// import { messaging, onMessage } from './firebase';

// export const { store, persistor } = configureStore();

// // Request notification permissions
// if ('Notification' in window) {
//   Notification.requestPermission().then((permission) => {
//     if (permission === 'granted') {
//       console.log('Notification permission granted.');
//     } else {
//       console.warn('Notification permission denied.');
//     }
//   });
// }

// // Handle foreground messages
// onMessage(messaging, (payload) => {
//   console.log('Foreground message received:', payload);
//   const notificationTitle = payload.notification.title;
//   const notificationOptions = {
//     body: payload.notification.body,
//     icon: '/icon-192x192.png',
//     data: payload.data,
//   };

//   if (Notification.permission === 'granted') {
//     new Notification(notificationTitle, notificationOptions);
//   }
// });

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <Provider store={store}>
//       <PersistGate loading={null} persistor={persistor}>
//         <BrowserRouter>
//           <Switch>
//             <Route path="/" component={App} />
//           </Switch>
//         </BrowserRouter>
//       </PersistGate>
//     </Provider>
//   </React.StrictMode>
// );

// // Register service workers
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     // Register Workbox service worker
//     navigator.serviceWorker
//       .register('/sw.js', { scope: '/', updateViaCache: 'none' })
//       .then((registration) => {
//         console.log('Workbox Service Worker registered:', registration);
//         registration.update();
//       })
//       .catch((error) => console.error('Workbox Service Worker registration failed:', error));

//     // Register Firebase Messaging service worker
//     navigator.serviceWorker
//       .register('/firebase-messaging-sw.js', { scope: '/firebase-messaging-sw/' })
//       .then((registration) => {
//         console.log('Firebase Messaging Service Worker registered:', registration);
//         registration.update();
//       })
//       .catch((error) => console.error('Firebase Messaging Service Worker registration failed:', error));
//   });
// }


// // src/index.js
// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { Provider } from 'react-redux';
// import { BrowserRouter, Switch, Route } from 'react-router-dom';
// import { PersistGate } from 'redux-persist/integration/react';
// import App from './components/screens/App';
// import './index.css';
// import { configureStore } from './store/configure/configureStore';
// import { messaging, onMessage } from './firebase';

// export const { store, persistor } = configureStore();

// // Request notification permissions
// if ('Notification' in window) {
//   Notification.requestPermission().then((permission) => {
//     if (permission === 'granted') {
//       console.log('Notification permission granted.');
//     } else {
//       console.warn('Notification permission denied.');
//     }
//   });
// }

// // Handle foreground messages
// onMessage(messaging, (payload) => {
//   console.log('Foreground message received:', payload);
//   const notificationTitle = payload.notification.title;
//   const notificationOptions = {
//     body: payload.notification.body,
//     icon: '/icon-192x192.png',
//     data: payload.data,
//   };

//   if (Notification.permission === 'granted') {
//     new Notification(notificationTitle, notificationOptions);
//   }
// });

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <Provider store={store}>
//       <PersistGate loading={null} persistor={persistor}>
//         <BrowserRouter>
//           <Switch>
//             <Route path="/" component={App} />
//           </Switch>
//         </BrowserRouter>
//       </PersistGate>
//     </Provider>
//   </React.StrictMode>
// );


// // Register service workers
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     // Register Workbox service worker
//     navigator.serviceWorker
//       .register('/sw.js', { scope: '/', updateViaCache: 'none' })
//       .then((registration) => {
//         console.log('Workbox Service Worker registered:', registration);
//         registration.update();
//       })
//       .catch((error) => console.error('Workbox Service Worker registration failed:', error));

//     // Register Firebase Messaging service worker
//     navigator.serviceWorker
//       .register('/firebase-messaging-sw.js')
//       .then((registration) => {
//         console.log('Firebase Messaging Service Worker registered:', registration);
//         // REMOVE THIS LINE: messaging.useServiceWorker(registration);
//         registration.update(); // You might still want to call update if you want to force updates
//       })
//       .catch((error) => console.error('Firebase Messaging Service Worker registration failed:', error));
//   });
// }



// // src/index.js
// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { Provider } from 'react-redux';
// import { BrowserRouter, Switch, Route } from 'react-router-dom';
// import { PersistGate } from 'redux-persist/integration/react';
// import App from './components/screens/App';
// import './index.css';
// import { configureStore } from './store/configure/configureStore';
// import { messaging, onMessage } from './firebase';

// export const { store, persistor } = configureStore();

// // Request notification permissions
// if ('Notification' in window) {
//   Notification.requestPermission().then((permission) => {
//     if (permission === 'granted') {
//       console.log('Notification permission granted.');
//     } else {
//       console.warn('Notification permission denied.');
//     }
//   });
// }

// // Handle foreground messages
// onMessage(messaging, (payload) => {
//   console.log('Foreground message received:', JSON.stringify(payload, null, 2));
//   if (!payload.notification) {
//     console.warn('No notification data in payload');
//     return;
//   }

//   const notificationTitle = payload.notification.title;
//   const notificationOptions = {
//     body: payload.notification.body,
//     icon: '/icon-192x192.png',
//     data: payload.data,
//     requireInteraction: true, // Keep notification until user interacts
//     vibrate: [200, 100, 200], // Vibration pattern for mobile
//   };

//   if (Notification.permission === 'granted') {
//     console.log('Attempting to show foreground notification:', notificationTitle);
//     try {
//       new Notification(notificationTitle, notificationOptions);
//     } catch (error) {
//       console.error('Error showing foreground notification:', error);
//     }
//   } else {
//     console.warn('Notification permission not granted');
//   }
// });

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <Provider store={store}>
//       <PersistGate loading={null} persistor={persistor}>
//         <BrowserRouter>
//           <Switch>
//             <Route path="/" component={App} />
//           </Switch>
//         </BrowserRouter>
//       </PersistGate>
//     </Provider>
//   </React.StrictMode>
// );

// // Register service workers
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     // Register Workbox service worker
//     // navigator.serviceWorker
//     //   .register('/sw.js', { scope: '/', updateViaCache: 'none' })
//     //   .then((registration) => {
//     //     console.log('Workbox Service Worker registered:', registration);
//     //     registration.update();
//     //   })
//     //   .catch((error) => console.error('Workbox Service Worker registration failed:', error));

//     // Register Firebase Messaging service worker
//     navigator.serviceWorker
//       .register('/firebase-messaging-sw.js')
//       .then((registration) => {
//         console.log('Firebase Messaging Service Worker registered:', registration);
//         registration.update();
//       })
//       .catch((error) => console.error('Firebase Messaging Service Worker registration failed:', error));
//   });
// }


// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import App from './components/screens/App';
import './index.css';
import { configureStore } from './store/configure/configureStore';
import { messaging, onMessage } from './firebase';
import { NotificationSnackbarProvider, useNotification } from './common/NotificationSnackbar';

export const { store, persistor } = configureStore();

// Notification listener component
const FirebaseForegroundNotificationHandler = () => {
  const { showNotification } = useNotification();

  React.useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received:', JSON.stringify(payload, null, 2));

      const title = payload.notification?.title || 'Notification';
      const body = payload.notification?.body;

      if (body) {
        showNotification(`${title}: ${body}`, 'info');
      } else {
        console.warn('No notification body in payload');
      }
    });

    return () => unsubscribe();
  }, [showNotification]);

  return null;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NotificationSnackbarProvider>
          <FirebaseForegroundNotificationHandler />
          <BrowserRouter>
            <Switch>
              <Route path="/" component={App} />
            </Switch>
          </BrowserRouter>
        </NotificationSnackbarProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

// // Register service workers
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker
//       .register('/firebase-messaging-sw.js')
//       .then((registration) => {
//         console.log('Firebase Messaging Service Worker registered:', registration);
//         registration.update();
//       })
//       .catch((error) => console.error('Firebase Messaging Service Worker registration failed:', error));
//   });
// }

// Request notification permissions
if ('Notification' in window) {
  Notification.requestPermission().then((permission) => {
    console.log(`Notification permission: ${permission}`);
  });
}
