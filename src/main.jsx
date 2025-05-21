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
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter, Switch, Route } from 'react-router-dom'; // Updated to Switch
import { PersistGate } from 'redux-persist/integration/react';
import App from './components/screens/App';
import './index.css';
import { configureStore } from './store/configure/configureStore';

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

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .then((registration) => {
        console.log('Service Worker registered:', registration);
        // Force service worker update on page load
        registration.update();
      })
      .catch((error) => console.error('Service Worker registration failed:', error));
  });
}