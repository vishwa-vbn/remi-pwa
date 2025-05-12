import { useState } from 'react';
import './App.css';
import { VAPID_PUBLIC_KEY } from './config';

function App() {
  const [status, setStatus] = useState('Ready to subscribe');

  const handleNotify = async () => {
    try {
      // Check notification permission
      if (Notification.permission === 'denied') {
        setStatus('Notifications blocked. Enable in browser settings.');
        return;
      }
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          setStatus('Notification permission denied');
          return;
        }
      }

      // Register service worker and subscribe to push
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: VAPID_PUBLIC_KEY,
        });
        setStatus('Subscribed to push notifications');
      } else {
        setStatus('Already subscribed');
      }

      // Send subscription to backend
      const response = await fetch('http://localhost:3000/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription }),
      });

      if (response.ok) {
        setStatus('Notification sent! Check your browser notifications.');
      } else {
        setStatus('Failed to send notification');
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus('Error: ' + error.message);
    }
  };

  return (
    <div className="App">
      <h1>Simple PWA Push Notification</h1>
      <button onClick={handleNotify} disabled={status.includes('Error')}>
        Send Test Notification
      </button>
      <p>Status: {status}</p>
    </div>
  );
}

export default App;