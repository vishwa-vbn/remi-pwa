// src/utils/pushNotifications.js
import { messaging, getToken } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import{VITE_FIREBASE_VAPID_KEY} from '../../env'


// Replace with your Firebase VAPID key (from Firebase Console > Project Settings > Cloud Messaging)
const VAPID_KEY = VITE_FIREBASE_VAPID_KEY; // Replace with your Firebase VAPID key

export const subscribeToPush = async (userId) => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Request FCM token
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    
    if (!token) {
      console.warn('No FCM token received');
      return null;
    }

    // Check existing token in Firestore
    const subDoc = await getDoc(doc(db, 'subscriptions', userId));
    if (subDoc.exists() && subDoc.data().token === token) {
      return token; // Token unchanged
    }

    // Save token to Firestore
    await setDoc(doc(db, 'subscriptions', userId), {
      token,
      userId,
      updatedAt: new Date().getTime(),
    });

    return token;
  } catch (error) {
    console.error('Error subscribing to push:', error);
    return null;
  }
};