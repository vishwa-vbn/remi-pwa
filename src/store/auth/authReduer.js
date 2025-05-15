import { LOGIN_SUCCESS, LOGOUT } from "./authActions";

const initialState = {
  user: null,
};

export default function authReducer(state = initialState, action) {
  console.log("action is",action)
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
      };
    case LOGOUT:
      return {
        ...state,
        user: null,
      };
    default:
      return state;
  }
}
