import {
    SET_SELECTED_PERIOD,
    UPDATE_NOTIFICATION_PREFERENCE_SUCCESS,
    UPDATE_NOTIFICATION_PREFERENCE_FAILURE,
    CLEAR_TASKS_SUCCESS,
    CLEAR_TASKS_FAILURE,
  } from "./settingsActions";
  
  const initialState = {
    selectedPeriod: "week",
    notificationsEnabled: false,
    error: null,
  };
  
  const settingsReducer = (state = initialState, action) => {
    switch (action.type) {
      case SET_SELECTED_PERIOD:
        return {
          ...state,
          selectedPeriod: action.payload,
        };
      case UPDATE_NOTIFICATION_PREFERENCE_SUCCESS:
        return {
          ...state,
          notificationsEnabled: action.payload,
          error: null,
        };
      case UPDATE_NOTIFICATION_PREFERENCE_FAILURE:
        return {
          ...state,
          error: action.payload,
        };
      case CLEAR_TASKS_SUCCESS:
        return {
          ...state,
          error: null,
        };
      case CLEAR_TASKS_FAILURE:
        return {
          ...state,
          error: action.payload,
        };
      default:
        return state;
    }
  };
  
  export default settingsReducer;