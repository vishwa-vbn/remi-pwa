

export async function subscribeToPushNotifications(taskId) {
  try {
    // Register service worker
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('Service Worker registered');

    // Check for push API support
    if (!('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return;
    }

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'BLVk8DvSeJRg3D-UbKDhedpjvlO2AKXb5ffmzyLn8wjoxeXO0Zy1KMMGtLkyhaa-khMWjlgXAZzPI6weVqyuA54' // Replace with your VAPID public key

    });

    // Send subscription to server
    await fetch('/api/save-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, subscription })
    });

    console.log('Subscribed to push notifications for task:', taskId);
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
  }
}

export async function requestNotificationPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted');
      return true;
    } else {
      console.warn('Notification permission denied');
      return false;
    }
  }
  return false;
}