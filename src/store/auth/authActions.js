// import {
//   collection,
//   getDoc,
//   setDoc,
//   doc,
//   updateDoc,
//   query,
//   where,
//   getDocs,
//   deleteDoc,
// } from 'firebase/firestore';
// import { db, googleProvider, signInWithPopup, auth } from '../../firebase';
// import { subscribeToTasks, unsubscribeFromTasks } from '../task/taskAction';
// import { startOfMonth, subMonths, endOfMonth } from 'date-fns';

// export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
// export const LOGOUT = 'LOGOUT';
// export const CLEAR_TASKS_SUCCESS = 'CLEAR_TASKS_SUCCESS';
// export const CLEAR_TASKS_FAILURE = 'CLEAR_TASKS_FAILURE';
// export const UPDATE_NOTIFICATION_PREFERENCE_SUCCESS =
//   'UPDATE_NOTIFICATION_PREFERENCE_SUCCESS';
// export const UPDATE_NOTIFICATION_PREFERENCE_FAILURE =
//   'UPDATE_NOTIFICATION_PREFERENCE_FAILURE';

// export function loginSuccess(user) {
//   return {
//     type: LOGIN_SUCCESS,
//     payload: user,
//   };
// }

// export const loginWithGoogle = () => {
//   return async (dispatch) => {
//     try {
//       const result = await signInWithPopup(auth, googleProvider);
//       const user = result.user;

//       console.log("user is", user)

//       const userDocRef = doc(db, 'users', user.uid);
//       const userSnapshot = await getDoc(userDocRef);

//       console.log("user doc ref", userDocRef,userSnapshot)
      
//       let userData = {
//         id: user.uid,
//         email: user.email,
//         givenName: user.displayName?.split(' ')[0] || '',
//         name: user.displayName || '',
//         picture: user.photoURL || '',
//         verifiedEmail: user.emailVerified,
//       };

//       if (!userSnapshot.exists()) {
//         userData = {
//           ...userData,
//           familyName: user.displayName?.split(' ').slice(1).join(' ') || '',
//           notificationEnabled: true,
//           status: 'Active',
//           preferences: [],
//         };
//         await setDoc(userDocRef, userData);
//       } else {
//         const firestoreData = userSnapshot.data();
//         userData = { ...firestoreData, ...userData };
//         await updateDoc(userDocRef, { status: 'Active' });
//       }

//       localStorage.setItem('user', JSON.stringify(userData));
//       localStorage.setItem('token', user.accessToken);

//       dispatch(loginSuccess(userData));
//       dispatch(subscribeToTasks());
//     } catch (error) {
//       console.error('Google Sign-In Error:', error);
//       throw error;
//     }
//   };
// };

// export function logout() {
//   return async (dispatch) => {
//     const storedUser = localStorage.getItem('user');
//     if (storedUser) {
//       const user = JSON.parse(storedUser);
//       const userDocRef = doc(db, 'users', user.id);
//       await updateDoc(userDocRef, { status: 'Inactive' });
//     }
//     localStorage.removeItem('user');
//     localStorage.removeItem('token');
//     dispatch({ type: LOGOUT });
//     dispatch(unsubscribeFromTasks());
//   };
// }

// export function checkUserSession() {
//   return async (dispatch) => {
//     const storedUser = localStorage.getItem('user');
//     if (storedUser) {
//       const user = JSON.parse(storedUser);
//       dispatch(loginSuccess(user));
//     }
//   };
// }

// export function clearTasksByPreference(timeFrame, userId) {
//   return async (dispatch) => {
//     try {
//       let cutoffDate;
//       const now = Date.now();
//       switch (timeFrame) {
//         case 'week':
//           cutoffDate = now - 7 * 24 * 60 * 60 * 1000;
//           break;
//         case 'month':
//           cutoffDate = endOfMonth(subMonths(new Date(), 1)).getTime();
//           break;
//         case 'year':
//           cutoffDate = endOfMonth(subMonths(new Date(), 12)).getTime();
//           break;
//         default:
//           cutoffDate = now;
//       }
//       const tasksRef = collection(db, 'tasks');
//       const q = query(
//         tasksRef,
//         where('userId', '==', userId),
//         where('timestamp', '<=', cutoffDate)
//       );
//       const querySnapshot = await getDocs(q);
//       if (querySnapshot.empty) return;
//       const deletePromises = querySnapshot.docs.map((docSnap) =>
//         deleteDoc(doc(db, 'tasks', docSnap.id))
//       );
//       await Promise.all(deletePromises);
//       dispatch({ type: CLEAR_TASKS_SUCCESS });
//     } catch (error) {
//       dispatch({ type: CLEAR_TASKS_FAILURE, payload: error });
//     }
//   };
// }

// export function updateNotificationPreference(userId, isEnabled) {
//   return async (dispatch) => {
//     try {
//       const userDocRef = doc(db, 'users', userId);
//       await updateDoc(userDocRef, { notificationEnabled: isEnabled });
//       dispatch({
//         type: UPDATE_NOTIFICATION_PREFERENCE_SUCCESS,
//         payload: isEnabled,
//       });
//     } catch (error) {
//       dispatch({
//         type: UPDATE_NOTIFICATION_PREFERENCE_FAILURE,
//         payload: error,
//       });
//     }
//   };
// }

import {
  collection,
  getDoc,
  setDoc,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { db, googleProvider, signInWithPopup, auth } from '../../firebase';
import { subscribeToTasks, unsubscribeFromTasks } from '../task/taskAction';
import { startOfMonth, subMonths, endOfMonth } from 'date-fns';
import { setLoading, clearLoading } from '../loader/loaderActions';

export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGOUT = 'LOGOUT';
export const CLEAR_TASKS_SUCCESS = 'CLEAR_TASKS_SUCCESS';
export const CLEAR_TASKS_FAILURE = 'CLEAR_TASKS_FAILURE';
export const UPDATE_NOTIFICATION_PREFERENCE_SUCCESS =
  'UPDATE_NOTIFICATION_PREFERENCE_SUCCESS';
export const UPDATE_NOTIFICATION_PREFERENCE_FAILURE =
  'UPDATE_NOTIFICATION_PREFERENCE_FAILURE';

export function loginSuccess(user) {
  return {
    type: LOGIN_SUCCESS,
    payload: user,
  };
}

export const loginWithGoogle = () => {
  return async (dispatch) => {
    try {
      dispatch(setLoading());
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userSnapshot = await getDoc(userDocRef);

      let userData = {
        id: user.uid,
        email: user.email,
        givenName: user.displayName?.split(' ')[0] || '',
        name: user.displayName || '',
        picture: user.photoURL || '',
        verifiedEmail: user.emailVerified,
      };

      if (!userSnapshot.exists()) {
        userData = {
          ...userData,
          familyName: user.displayName?.split(' ').slice(1).join(' ') || '',
          notificationEnabled: true,
          status: 'Active',
          preferences: [],
        };
        await setDoc(userDocRef, userData);
      } else {
        const firestoreData = userSnapshot.data();
        userData = { ...firestoreData, ...userData };
        await updateDoc(userDocRef, { status: 'Active' });
      }

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', user.accessToken);

      dispatch(loginSuccess(userData));
      dispatch(subscribeToTasks());
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    } finally {
      dispatch(clearLoading());
    }
  };
};

export function logout() {
  return async (dispatch) => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const userDocRef = doc(db, 'users', user.id);
      await updateDoc(userDocRef, { status: 'Inactive' });
    }
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    dispatch({ type: LOGOUT });
    dispatch(unsubscribeFromTasks());
  };
}

export function checkUserSession() {
  return async (dispatch) => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      dispatch(loginSuccess(user));
    }
  };
}

export function clearTasksByPreference(timeFrame, userId) {
  return async (dispatch) => {
    try {
      let cutoffDate;
      const now = Date.now();
      switch (timeFrame) {
        case 'week':
          cutoffDate = now - 7 * 24 * 60 * 60 * 1000;
          break;
        case 'month':
          cutoffDate = endOfMonth(subMonths(new Date(), 1)).getTime();
          break;
        case 'year':
          cutoffDate = endOfMonth(subMonths(new Date(), 12)).getTime();
          break;
        default:
          cutoffDate = now;
      }
      const tasksRef = collection(db, 'tasks');
      const q = query(
        tasksRef,
        where('userId', '==', userId),
        where('timestamp', '<=', cutoffDate)
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return;
      const deletePromises = querySnapshot.docs.map((docSnap) =>
        deleteDoc(doc(db, 'tasks', docSnap.id))
      );
      await Promise.all(deletePromises);
      dispatch({ type: CLEAR_TASKS_SUCCESS });
    } catch (error) {
      dispatch({ type: CLEAR_TASKS_FAILURE, payload: error });
    }
  };
}

export function updateNotificationPreference(userId, isEnabled) {
  return async (dispatch) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, { notificationEnabled: isEnabled });
      dispatch({
        type: UPDATE_NOTIFICATION_PREFERENCE_SUCCESS,
        payload: isEnabled,
      });
    } catch (error) {
      dispatch({
        type: UPDATE_NOTIFICATION_PREFERENCE_FAILURE,
        payload: error,
      });
    }
  };
}