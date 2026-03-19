/* eslint-disable no-fallthrough */
import { GET_REGISTRATION, SET_REGISTRATION } from '../storeTypes';

const initialState = {
  id: null,
  data: null,
};

const reducer = (state = initialState, action: any) => {
  const newState = { ...state };
  switch (action.type) {
    case GET_REGISTRATION:
      if (action.payload === null) {
        return initialState;
      }
    case SET_REGISTRATION:
      if (action.payload !== null) {
        newState.id = action.payload.id;
        newState.data = action.payload.data;
      }
      return newState;
  }
  return newState;
};
export default reducer;
