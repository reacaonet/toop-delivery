import { GET_MESSAGE, SET_MESSAGE } from '../storeTypes';

const initialState = {
  title: null,
  description: null,
};

const reducer = (state = initialState, action: any) => {
  let newState = { ...state };
  switch (action.type) {
    case GET_MESSAGE:
      if (action.payload === null) {
        return initialState;
      }

      return newState;
    case SET_MESSAGE:
      if (action.payload !== null) {
        newState = action.payload;
        return newState;
      }

      return initialState;
  }
  return newState;
};
export default reducer;
