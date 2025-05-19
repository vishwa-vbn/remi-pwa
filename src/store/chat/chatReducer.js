import {
  ADD_MESSAGE,
  SET_MESSAGES,
  SET_LOADING,
  SET_ERROR,
  SET_SESSIONS,
  ADD_SESSION,
  UPDATE_SESSION,
  DELETE_SESSION,
  SELECT_SESSION,
} from "./chatActions";

const initialState = {
  messages: [],
  sessions: [],
  selectedSessionId: null,
  loading: false,
  error: null,
};

const chatReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_MESSAGE: {
      const newMessage = { ...action.payload };
      return {
        ...state,
        messages: [...state.messages.filter((m) => m.id !== newMessage.id), newMessage],
      };
    }
    case SET_MESSAGES: {
      return {
        ...state,
        messages: action.payload.map((message) => ({
          ...message,
          isNew: false,
        })),
        error: null,
      };
    }
    case SET_SESSIONS: {
      return {
        ...state,
        sessions: action.payload,
      };
    }
    case ADD_SESSION: {
      return {
        ...state,
        sessions: [...state.sessions, action.payload],
      };
    }
    case UPDATE_SESSION: {
      return {
        ...state,
        sessions: state.sessions.map((session) =>
          session.id === action.payload.id
            ? { ...session, title: action.payload.title }
            : session
        ),
      };
    }
    case DELETE_SESSION: {
      return {
        ...state,
        sessions: state.sessions.filter((session) => session.id !== action.payload),
        selectedSessionId:
          state.selectedSessionId === action.payload ? null : state.selectedSessionId,
        messages: state.selectedSessionId === action.payload ? [] : state.messages,
      };
    }
    case SELECT_SESSION: {
      return {
        ...state,
        selectedSessionId: action.payload,
      };
    }
    case SET_LOADING: {
      return {
        ...state,
        loading: action.payload,
      };
    }
    case SET_ERROR: {
      return {
        ...state,
        error: action.payload,
      };
    }
    default:
      return state;
  }
};

export default chatReducer;