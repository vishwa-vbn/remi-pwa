// import { doc, updateDoc } from "firebase/firestore";
// import { db } from "../../firebase";
// import { clearTasksByPreference } from "../auth/authActions";

// export const SET_SELECTED_PERIOD = "SET_SELECTED_PERIOD";
// export const UPDATE_NOTIFICATION_PREFERENCE_SUCCESS = "UPDATE_NOTIFICATION_PREFERENCE_SUCCESS";
// export const UPDATE_NOTIFICATION_PREFERENCE_FAILURE = "UPDATE_NOTIFICATION_PREFERENCE_FAILURE";
// export const CLEAR_TASKS_SUCCESS = "CLEAR_TASKS_SUCCESS";
// export const CLEAR_TASKS_FAILURE = "CLEAR_TASKS_FAILURE";

// export const setSelectedPeriod = (period) => (dispatch) => {
//   dispatch({
//     type: SET_SELECTED_PERIOD,
//     payload: period,
//   });
// };

// export const updateNotificationPreference = (userId, isEnabled) => async (dispatch) => {
//   try {
//     const userDocRef = doc(db, "users", userId);
//     await updateDoc(userDocRef, { notificationEnabled: isEnabled });
//     dispatch({
//       type: UPDATE_NOTIFICATION_PREFERENCE_SUCCESS,
//       payload: isEnabled,
//     });
//   } catch (error) {
//     console.error("Error updating notification preference:", error);
//     dispatch({
//       type: UPDATE_NOTIFICATION_PREFERENCE_FAILURE,
//       payload: error.message,
//     });
//   }
// };

// export const clearTasks = (timeFrame, userId) => async (dispatch) => {
//   try {
//     await dispatch(clearTasksByPreference(timeFrame, userId));
//     dispatch({
//       type: CLEAR_TASKS_SUCCESS,
//     });
//   } catch (error) {
//     console.error("Error clearing tasks:", error);
//     dispatch({
//       type: CLEAR_TASKS_FAILURE,
//       payload: error.message,
//     });
//   }
// };


import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { clearTasksByPreference } from "../auth/authActions";
import { setLoading, clearLoading } from "../loader/loaderActions";

export const SET_SELECTED_PERIOD = "SET_SELECTED_PERIOD";
export const UPDATE_NOTIFICATION_PREFERENCE_SUCCESS = "UPDATE_NOTIFICATION_PREFERENCE_SUCCESS";
export const UPDATE_NOTIFICATION_PREFERENCE_FAILURE = "UPDATE_NOTIFICATION_PREFERENCE_FAILURE";
export const CLEAR_TASKS_SUCCESS = "CLEAR_TASKS_SUCCESS";
export const CLEAR_TASKS_FAILURE = "CLEAR_TASKS_FAILURE";

export const setSelectedPeriod = (period) => (dispatch) => {
  dispatch({
    type: SET_SELECTED_PERIOD,
    payload: period,
  });
};

export const updateNotificationPreference = (userId, isEnabled) => async (dispatch) => {
  try {
    dispatch(setLoading());
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, { notificationEnabled: isEnabled });
    dispatch({
      type: UPDATE_NOTIFICATION_PREFERENCE_SUCCESS,
      payload: isEnabled,
    });
    return { success: true, message: "Notification preference updated successfully" };
  } catch (error) {
    console.error("Error updating notification preference:", error);
    dispatch({
      type: UPDATE_NOTIFICATION_PREFERENCE_FAILURE,
      payload: error.message,
    });
    throw error;
  } finally {
    dispatch(clearLoading());
  }
};

export const clearTasks = (timeFrame, userId) => async (dispatch) => {
  try {
    dispatch(setLoading());
    await dispatch(clearTasksByPreference(timeFrame, userId));
    dispatch({
      type: CLEAR_TASKS_SUCCESS,
    });
    return { success: true, message: "Tasks cleared successfully" };
  } catch (error) {
    console.error("Error clearing tasks:", error);
    dispatch({
      type: CLEAR_TASKS_FAILURE,
      payload: error.message,
    });
    throw error;
  } finally {
    dispatch(clearLoading());
  }
};