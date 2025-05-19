import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase";
import debounce from "lodash/debounce";
import { GEMINI_KEY } from "../../../env";

// Action Types
export const ADD_MESSAGE = "ADD_MESSAGE";
export const SET_MESSAGES = "SET_MESSAGES";
export const SET_LOADING = "SET_LOADING";
export const SET_ERROR = "SET_ERROR";
export const SET_SESSIONS = "SET_SESSIONS";
export const ADD_SESSION = "ADD_SESSION";
export const UPDATE_SESSION = "UPDATE_SESSION";
export const DELETE_SESSION = "DELETE_SESSION";
export const SELECT_SESSION = "SELECT_SESSION";

// Create a new session
export const createSession = (title, userId) => async (dispatch) => {
  try {
    const session = {
      title,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const sessionRef = await addDoc(collection(db, "sessions"), session);
    dispatch({
      type: ADD_SESSION,
      payload: { ...session, id: sessionRef.id },
    });
    dispatch(selectSession(sessionRef.id));
  } catch (error) {
    dispatch({ type: SET_ERROR, payload: error.message });
    console.error("Error creating session:", error);
  }
};

// Update session title
export const updateSession = (sessionId, title) => async (dispatch) => {
  try {
    const sessionRef = doc(db, "sessions", sessionId);
    await updateDoc(sessionRef, {
      title,
      updatedAt: new Date().toISOString(),
    });
    dispatch({
      type: UPDATE_SESSION,
      payload: { id: sessionId, title },
    });
  } catch (error) {
    dispatch({ type: SET_ERROR, payload: error.message });
    console.error("Error updating session:", error);
  }
};

// Delete session and its chats
export const deleteSession = (sessionId) => async (dispatch) => {
  try {
    // Delete session
    const sessionRef = doc(db, "sessions", sessionId);
    await deleteDoc(sessionRef);

    // Delete related messages
    const chatsQuery = query(collection(db, "chats"), where("sessionId", "==", sessionId));
    const chatDocs = await getDocs(chatsQuery);
    for (const docSnap of chatDocs.docs) {
      await deleteDoc(docSnap.ref);
    }

    dispatch({ type: DELETE_SESSION, payload: sessionId });
  } catch (error) {
    dispatch({ type: SET_ERROR, payload: error.message });
    console.error("Error deleting session:", error);
  }
};

// Select current session
export const selectSession = (sessionId) => (dispatch) => {
  dispatch({ type: SELECT_SESSION, payload: sessionId });
};

// Real-time subscription to user sessions
export const subscribeToSessions = () => (dispatch, getState) => {
  try {
    const currentUserId = getState().auth.user?.id;
    if (!currentUserId) return;

    const q = query(collection(db, "sessions"), where("userId", "==", currentUserId));

    const debouncedDispatch = debounce((sessions) => {
      dispatch({ type: SET_SESSIONS, payload: sessions });
    }, 100);

    return onSnapshot(
      q,
      (snapshot) => {
        const sessions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        debouncedDispatch(sessions);
      },
      (error) => {
        dispatch({ type: SET_ERROR, payload: error.message });
      }
    );
  } catch (error) {
    dispatch({ type: SET_ERROR, payload: error.message });
  }
};

// Send user message and get Gemini bot response
export const addMessage = (messageContent, userId, sessionId) => async (dispatch, getState) => {
  try {
    dispatch({ type: SET_LOADING, payload: true });

    const currentUserId = getState().auth.user?.id;
    if (!currentUserId) throw new Error("User is not authenticated");
    if (userId !== currentUserId) throw new Error("Invalid user ID");

    const sessionRef = doc(db, "sessions", sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists() || sessionSnap.data().userId !== currentUserId) {
      throw new Error("Session not found or access denied");
    }

    const timestamp = new Date().toISOString();

    const userMessage = {
      content: messageContent,
      role: "user",
      userId: currentUserId,
      sessionId,
      timestamp,
    };

    // Temporary local message
    const tempId = `temp_${Date.now()}`;
    dispatch({
      type: ADD_MESSAGE,
      payload: { ...userMessage, id: tempId, isNew: true },
    });

    // Save to Firestore
    const userMsgRef = await addDoc(collection(db, "chats"), userMessage);
    dispatch({
      type: ADD_MESSAGE,
      payload: { ...userMessage, id: userMsgRef.id, isNew: true },
    });

    // Update session timestamp
    await updateDoc(sessionRef, { updatedAt: timestamp });

    // Gemini response
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: messageContent }] }],
        }),
      }
    );

    const data = await geminiRes.json();
    const botText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I didn't understand that.";

    const botMessage = {
      content: botText,
      role: "assistant",
      userId: currentUserId,
      sessionId,
      timestamp: new Date().toISOString(),
    };

    const botMsgRef = await addDoc(collection(db, "chats"), botMessage);
    dispatch({
      type: ADD_MESSAGE,
      payload: { ...botMessage, id: botMsgRef.id, isNew: true },
    });

    dispatch({ type: SET_LOADING, payload: false });
  } catch (error) {
    dispatch({ type: SET_ERROR, payload: error.message });
    dispatch({ type: SET_LOADING, payload: false });
    console.error("Error in addMessage:", error);
  }
};

// Real-time message subscription per session
export const subscribeToMessages = (sessionId) => (dispatch, getState) => {
  try {
    const currentUserId = getState().auth.user?.id;
    if (!currentUserId || !sessionId) return;

    const q = query(
      collection(db, "chats"),
      where("sessionId", "==", sessionId),
      where("userId", "==", currentUserId)
    );

    const debouncedDispatch = debounce((messages) => {
      dispatch({ type: SET_MESSAGES, payload: messages });
    }, 100);

    return onSnapshot(
      q,
      (snapshot) => {
        const messages = snapshot.docs.map((doc) => ({
          id: doc.id,
          sessionId,
          ...doc.data(),
        }));
        debouncedDispatch(messages);
      },
      (error) => {
        dispatch({ type: SET_ERROR, payload: error.message });
      }
    );
  } catch (error) {
    dispatch({ type: SET_ERROR, payload: error.message });
  }
};

// Clear messages in Redux (not Firestore)
export const clearMessages = () => (dispatch) => {
  dispatch({ type: SET_MESSAGES, payload: [] });
};
