// import { useState } from 'react';
// import { VAPID_PUBLIC_KEY } from '../../config';

// function App() {
//   const [status, setStatus] = useState('Ready to subscribe');

//   const handleNotify = async () => {
//     try {
//       // Check notification permission
//       if (Notification.permission === 'denied') {
//         setStatus('Notifications blocked. Enable in browser settings.');
//         return;
//       }
//       if (Notification.permission !== 'granted') {
//         const permission = await Notification.requestPermission();
//         if (permission !== 'granted') {
//           setStatus('Notification permission denied');
//           return;
//         }
//       }

//       // Register service worker and subscribe to push
//       const registration = await navigator.serviceWorker.ready;
//       let subscription = await registration.pushManager.getSubscription();

//       if (!subscription) {
//         subscription = await registration.pushManager.subscribe({
//           userVisibleOnly: true,
//           applicationServerKey: VAPID_PUBLIC_KEY,
//         });
//         setStatus('Subscribed to push notifications');
//       } else {
//         setStatus('Already subscribed');
//       }

//       // Send subscription to backend
//       const response = await fetch('http://localhost:3000/api/notify', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ subscription }),
//       });

//       if (response.ok) {
//         setStatus('Notification sent! Check your browser notifications.');
//       } else {
//         setStatus('Failed to send notification');
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       setStatus('Error: ' + error.message);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
//       <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
//         <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
//           Simple PWA Push Notification
//         </h1>
//         <button
//           onClick={handleNotify}
//           disabled={status.includes('Error')}
//           className={`w-full py-2 px-4 rounded-md text-white font-semibold transition-colors duration-200 
//             ${status.includes('Error') 
//               ? 'bg-gray-400 cursor-not-allowed' 
//               : 'bg-blue-600 hover:bg-blue-700'}`}
//         >
//           Send Test Notification
//         </button>
//         <p className={`mt-4 text-center text-sm 
//           ${status.includes('Error') ? 'text-red-600' : 
//             status.includes('Subscribed') || status.includes('sent') ? 'text-green-600' : 'text-gray-600'}`}>
//           Status: {status}
//         </p>
//       </div>
//     </div>
//   );
// }

// export default App;
import React from 'react';
import { Switch, Redirect, Route } from 'react-router-dom';
import RestrictedRoute from '../restricted/index';
import LoginContainer from '../screens/login/LoginContainer.jsx';
import SettingsContainer from '../screens/settings/SettingsContainer.jsx';
import TaskContainer from './task/TaskContainer.jsx';

function App({ match }) {

    console.log("match is",match)
  const routes = [
    {
      component: SettingsContainer,
      link: 'settings',
    },
    {
      component: TaskContainer,
      link: 'tasks',
    },
  ];

  const login_routes = [
    {
      component: LoginContainer,
      link: '/login',
    },
  ];

  return (
    <Switch>
    
      {routes?.map((element) => (
        <RestrictedRoute
        exact
          path={`${match.url}${element.link}`}
          component={element.component}
        />
      ))}

      {login_routes?.map((element) => (
        <Route exact path={element.link} component={element.component} />
      ))}
      
    </Switch>
  );
}

export default App;