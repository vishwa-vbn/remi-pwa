import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

// VAPID public key
const VAPID_PUBLIC_KEY = 'BLVk8DvSeJRg3D-UbKDhedpjvlO2AKXb5ffmzyLn8wjoxeXO0Zy1KMMGtLkyhaa-khMWjlgXAZzPI6weVqyuA54';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const subscribeToPush = async (userId) => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    // Check for existing subscription
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      // Compare with stored subscription
      const subDoc = await getDoc(doc(db, 'subscriptions', userId));
      if (subDoc.exists() && subDoc.data().subscription === JSON.stringify(existingSubscription)) {
        return existingSubscription; // Use existing subscription
      }
      // Unsubscribe if different
      await existingSubscription.unsubscribe();
    }

    // Create new subscription
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    // Save subscription to Firestore
    await setDoc(doc(db, 'subscriptions', userId), {
      subscription: JSON.stringify(subscription),
      userId,
      updatedAt: new Date().getTime(),
    });

    return subscription;
  } catch (error) {
    console.error('Error subscribing to push:', error);
    return null;
  }
};