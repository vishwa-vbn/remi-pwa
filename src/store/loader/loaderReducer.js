import { SET_LOADING, CLEAR_LOADING } from './loaderActions';

const initialState = {
  isLoading: false,
};

const loaderReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_LOADING:
      return { ...state, isLoading: true };
    case CLEAR_LOADING:
      return { ...state, isLoading: false };
    default:
      return state;
  }
};

export default loaderReducer;