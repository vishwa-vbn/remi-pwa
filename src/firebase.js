// import { initializeApp } from 'firebase/app';
// import { getAuth, GoogleAuthProvider,signInWithPopup } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';


// // Your Firebase configuration object (replace with your actual config)
// const firebaseConfig = {
// apiKey: "AIzaSyCy3XcxbVP3qWlfRuFNG9Y5wBarupwsEI0",
//   authDomain: "remi-dbbdb.firebaseapp.com",
//   projectId: "remi-dbbdb",
//   storageBucket: "remi-dbbdb.firebasestorage.app",
//   messagingSenderId: "56268346739",
//   appId: "1:56268346739:web:7de4e9ef0de534f5c9e106"
// };

// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const googleProvider = new GoogleAuthProvider();
// const db = getFirestore(app);

// export { auth, googleProvider, db,signInWithPopup };

// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyCy3XcxbVP3qWlfRuFNG9Y5wBarupwsEI0",
  authDomain: "remi-dbbdb.firebaseapp.com",
  projectId: "remi-dbbdb",
  storageBucket: "remi-dbbdb.firebasestorage.app",
  messagingSenderId: "56268346739",
  appId: "1:56268346739:web:7de4e9ef0de534f5c9e106"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);
const messaging = getMessaging(app);

export { auth, googleProvider, db, signInWithPopup, messaging, getToken, onMessage };