// import {
//   collection,
//   doc,
//   updateDoc,
//   deleteDoc,
//   onSnapshot,
//   where,
//   query,
//   addDoc,
//   getDocs,
//   getDoc,
// } from "firebase/firestore";

// import { db } from "../../firebase/firebaseConfigure";
// import moment from "moment";

// export const ADD_TASK = "ADD_TASK";
// export const UPDATE_TASK = "UPDATE_TASK";
// export const SET_TASKS = "SET_TASKS";
// export const DELETE_TASK = "DELETE_TASK";

// export const addTask = (task) => async (dispatch, getState) => {
//   try {
//     const state = getState();
//     const currentUserId = state.auth.user?.id;
//     if (!currentUserId) {
//       console.error("Error: No logged-in user found.");
//       return;
//     }

//     if (task.timestamp) {
//       const q = query(
//         collection(db, "tasks"),
//         where("timestamp", "==", task.timestamp),
//         where("userId", "==", currentUserId)
//       );

//       const querySnapshot = await getDocs(q);

//       if (!querySnapshot.empty) {
//         const existingTask = querySnapshot.docs[0].data();
//         const docId = querySnapshot.docs[0].id;

//         const hasChanges = Object.keys(task).some(
//           (key) => task[key] !== existingTask[key] && task[key] !== undefined
//         );

//         if (hasChanges) {
//           const taskDocRef = doc(db, "tasks", docId);

//           await updateDoc(taskDocRef, {
//             ...existingTask,
//             ...task,
//             notified:
//               task.timestamp !== existingTask.timestamp
//                 ? false
//                 : task.notified ?? existingTask.notified,
//           });

//           dispatch({ type: "UPDATE_TASK", payload: { ...task, id: docId } });
//         }
//       } else {
//         const taskRef = await addDoc(collection(db, "tasks"), {
//           ...task,
//           userId: currentUserId,
//         });

//         dispatch({ type: "ADD_TASK", payload: { ...task, id: taskRef.id } });
//       }
//     } else {
//       console.error("Error: Task must have a timestamp to be added/updated.");
//     }

//     dispatch(subscribeToTasks());
//   } catch (error) {
//     console.error("Firestore Write Error:", error.code, error.message);
//   }
// };

// export const updateTask =
//   (taskId, updatedFields) => async (dispatch, getState) => {
//     try {
//       const state = getState();
//       const currentUserId = state.auth.user?.id;
//       if (!currentUserId) {
//         console.error("Error: No logged-in user found.");
//         return;
//       }

//       const taskDocRef = doc(db, "tasks", taskId);
//       const taskSnapshot = await getDoc(taskDocRef);

//       if (!taskSnapshot.exists()) {
//         console.warn("Task not found in Firestore, cannot update.");
//         return;
//       }

//       const existingTask = taskSnapshot.data();
//       let changes = {};
//       let hasChanges = false;

//       Object.keys(updatedFields).forEach((key) => {
//         if (updatedFields[key] !== existingTask[key]) {
//           changes[key] = updatedFields[key];
//           hasChanges = true;
//         }
//       });

//       if (!hasChanges) {
//         return;
//       }

//       if (
//         updatedFields.timestamp &&
//         updatedFields.timestamp !== existingTask.timestamp
//       ) {
//         changes.notified = false;
//       }

//       await updateDoc(taskDocRef, changes);
//       dispatch(subscribeToTasks());
//       dispatch({ type: "UPDATE_TASK", payload: { id: taskId, ...changes } });
//     } catch (error) {
//       console.error("Firestore Update Error:", error);
//     }
//   };

// export const subscribeToTasks = () => (dispatch, getState) => {
//   try {
//     const state = getState();
//     const currentUserId = state.auth.user?.id;

//     if (!currentUserId) {
//       return;
//     }

//     const userDocRef = doc(db, "users", currentUserId);
//     getDoc(userDocRef).then((docSnap) => {
//       if (!docSnap.exists()) {
//         return;
//       }

//       const tasksCollection = collection(db, "tasks");
//       const q = query(tasksCollection, where("userId", "==", currentUserId));

//       return onSnapshot(q, (snapshot) => {
//         const tasks = snapshot.docs.map((doc) => {
//           const taskData = doc.data();
//           let formattedTime = "N/A";

//           if (taskData.timestamp) {
//             if (
//               typeof taskData.timestamp === "object" &&
//               taskData.timestamp.toDate
//             ) {
//               formattedTime = moment(taskData.timestamp.toDate()).format(
//                 "h:mm A"
//               );
//             } else if (typeof taskData.timestamp === "number") {
//               formattedTime = moment(taskData.timestamp).format("h:mm A");
//             }
//           }

//           return {
//             id: doc.id,
//             time: formattedTime,
//             title: taskData.title || "Untitled",
//             description: taskData.description || "No description",
//             alertMinutes: taskData.alertMinutes || 0,
//             note: taskData.note || "",
//             status: taskData.status,
//             timestamp: taskData.timestamp || 0,
//             userId: taskData.userId,
//           };
//         });

//         tasks.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
//         dispatch({ type: "SET_TASKS", payload: tasks });
//       });
//     });
//   } catch (error) {
//     console.error("Firestore Snapshot Error:", error);
//   }
// };

// export const unsubscribeFromTasks = () => (dispatch) => {
//   dispatch({ type: SET_TASKS, payload: [] });
// };

// export const deleteTask = (taskId) => async (dispatch) => {
//   try {
//     const taskDocRef = doc(db, "tasks", taskId);
//     await deleteDoc(taskDocRef);
//     dispatch(subscribeToTasks());
//   } catch (error) {
//     console.error("Firestore Delete Error:", error.code, error.message);
//   }
// };


import {
  collection,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  where,
  query,
  addDoc,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import moment from "moment";
import debounce from "lodash/debounce";

export const ADD_TASK = "ADD_TASK";
export const UPDATE_TASK = "UPDATE_TASK";
export const SET_TASKS = "SET_TASKS";
export const DELETE_TASK = "DELETE_TASK";
export const SET_NEW_TASK_COUNT = "SET_NEW_TASK_COUNT";
export const SET_UPDATED_TASK_COUNT = "SET_UPDATED_TASK_COUNT";

export const addTask = (task) => async (dispatch, getState) => {

  console.log("add task", task)
  try {
    const state = getState();
    const currentUserId = state.auth.user?.id;
    if (!currentUserId) {
      console.error("Error: No logged-in user found.");
      return;
    }

    if (!task.timestamp) {
      console.error("Error: Task must have a timestamp.");
      return;
    }

    // Optimistic update: Dispatch ADD_TASK immediately
    const tempId = `temp_${Date.now()}`;
    dispatch({
      type: ADD_TASK,
      payload: { ...task, id: tempId, userId: currentUserId, isNew: true },
    });
    dispatch({ type: SET_NEW_TASK_COUNT, payload: state.task.newTaskCount + 1 });

    const q = query(
      collection(db, "tasks"),
      where("timestamp", "==", task.timestamp),
      where("userId", "==", currentUserId)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const existingTask = querySnapshot.docs[0].data();
      const docId = querySnapshot.docs[0].id;
      const hasChanges = Object.keys(task).some(
        (key) => task[key] !== existingTask[key] && task[key] !== undefined
      );

      if (hasChanges) {
        const taskDocRef = doc(db, "tasks", docId);
        await updateDoc(taskDocRef, {
          ...existingTask,
          ...task,
          notified:
            task.timestamp !== existingTask.timestamp
              ? false
              : task.notified ?? existingTask.notified,
        });
        dispatch({
          type: UPDATE_TASK,
          payload: { ...task, id: docId, isUpdated: true },
        });
        dispatch({
          type: SET_UPDATED_TASK_COUNT,
          payload: state.task.updatedTaskCount + 1,
        });
      }
    } else {
      const taskRef = await addDoc(collection(db, "tasks"), {
        ...task,
        userId: currentUserId,
      });
      dispatch({
        type: ADD_TASK,
        payload: { ...task, id: taskRef.id, userId: currentUserId, isNew: true },
      });
    }
  } catch (error) {
    console.error("Firestore Write Error:", error.code, error.message);
    // Revert optimistic update on error
    dispatch({ type: SET_NEW_TASK_COUNT, payload: state.task.newTaskCount });
  }
};

export const updateTask = (taskId, updatedFields) => async (dispatch, getState) => {
  try {
    const state = getState();
    const currentUserId = state.auth.user?.id;
    if (!currentUserId) {
      console.error("Error: No logged-in user found.");
      return;
    }

    const taskDocRef = doc(db, "tasks", taskId);
    const taskSnapshot = await getDoc(taskDocRef);

    if (!taskSnapshot.exists()) {
      console.warn("Task not found in Firestore, cannot update.");
      return;
    }

    const existingTask = taskSnapshot.data();
    let changes = {};
    let hasChanges = false;

    Object.keys(updatedFields).forEach((key) => {
      if (updatedFields[key] !== existingTask[key]) {
        changes[key] = updatedFields[key];
        hasChanges = true;
      }
    });

    if (!hasChanges) {
      return;
    }

    if (updatedFields.timestamp && updatedFields.timestamp !== existingTask.timestamp) {
      changes.notified = false;
    }

    // Optimistic update: Dispatch UPDATE_TASK immediately
    dispatch({
      type: UPDATE_TASK,
      payload: { id: taskId, ...changes, isUpdated: true },
    });
    dispatch({
      type: SET_UPDATED_TASK_COUNT,
      payload: state.task.updatedTaskCount + 1,
    });

    await updateDoc(taskDocRef, changes);
  } catch (error) {
    console.error("Firestore Update Error:", error);
    // Revert optimistic update on error
    dispatch({
      type: SET_UPDATED_TASK_COUNT,
      payload: state.task.updatedTaskCount,
    });
  }
};

export const subscribeToTasks = () => (dispatch, getState) => {
  try {
    const state = getState();
    const currentUserId = state.auth.user?.id;

    if (!currentUserId) {
      console.error("No logged-in user found. Cannot subscribe to tasks.");
      return () => {};
    }

    const userDocRef = doc(db, "users", currentUserId);
    return getDoc(userDocRef).then((docSnap) => {
      if (!docSnap.exists()) {
        console.warn("User document does not exist in Firestore.");
        return () => {};
      }

      const tasksCollection = collection(db, "tasks");
      console.log("task collection",tasksCollection)
      const q = query(tasksCollection, where("userId", "==", currentUserId));

      const debouncedDispatch = debounce((tasks) => {
        dispatch({ type: SET_TASKS, payload: tasks });
      }, 100);

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const tasks = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          debouncedDispatch(tasks);
        },
        (error) => {
          console.error("Error in tasks snapshot listener:", error.code, error.message);
        }
      );

      return unsubscribe;
    });
  } catch (error) {
    console.error("Error setting up tasks subscription:", error.code, error.message);
    return () => {};
  }
};

export const unsubscribeFromTasks = () => (dispatch) => {
  dispatch({ type: SET_TASKS, payload: [] });
};

export const deleteTask = (taskId) => async (dispatch) => {
  try {
    const taskDocRef = doc(db, "tasks", taskId);
    await deleteDoc(taskDocRef);
    dispatch(subscribeToTasks());
  } catch (error) {
    console.error("Firestore Delete Error:", error.code, error.message);
  }
};