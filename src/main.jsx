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

export const { store, persistor } = configureStore();

// Request notification permissions
if ('Notification' in window) {
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      console.log('Notification permission granted.');
    } else {
      console.warn('Notification permission denied.');
    }
  });
}

// Handle foreground messages
onMessage(messaging, (payload) => {
  console.log('Foreground message received:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png',
    data: payload.data,
  };

  if (Notification.permission === 'granted') {
    new Notification(notificationTitle, notificationOptions);
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <Switch>
            <Route path="/" component={App} />
          </Switch>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

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
//       .register('/firebase-messaging-sw.js') // Remove custom scope
//       .then((registration) => {
//         console.log('Firebase Messaging Service Worker registered:', registration);
//         messaging.useServiceWorker(registration); // Ensure Firebase uses this registration
//         registration.update();
//       })
//       .catch((error) => console.error('Firebase Messaging Service Worker registration failed:', error));
//   });
// }


// Register service workers
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Register Workbox service worker
    navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .then((registration) => {
        console.log('Workbox Service Worker registered:', registration);
        registration.update();
      })
      .catch((error) => console.error('Workbox Service Worker registration failed:', error));

    // Register Firebase Messaging service worker
    navigator.serviceWorker
      .register('/firebase-messaging-sw.js')
      .then((registration) => {
        console.log('Firebase Messaging Service Worker registered:', registration);
        // REMOVE THIS LINE: messaging.useServiceWorker(registration);
        registration.update(); // You might still want to call update if you want to force updates
      })
      .catch((error) => console.error('Firebase Messaging Service Worker registration failed:', error));
  });
}