import { combineReducers } from "redux";

import { routerReducer } from "react-router-redux";

import authReducer from "../auth/authReduer"; // Ensure this file exists
import themeReducer from '../theme/themeReducer';
import taskReducer from "../task/taskReducer";
import settingsReducer from "../settings/settingsReducer";
import loaderReducer from "../loader/loaderReducer";

const rootReducer = combineReducers({
  router:routerReducer,
  auth: authReducer, 
  theme: themeReducer,
  task:taskReducer,
  settings:settingsReducer,
  loader:loaderReducer,
});

export default rootReducer;
