import { GET_USER } from '../storeTypes';

const initialState = {
  load: false,
  user: null,
};

const reducer = (state = initialState, action: any) => {
  const newState = { ...state };
  switch (action.type) {
    case GET_USER:
      if (action.payload === null) {
        return initialState;
      }

      newState.user = action.payload;
      return newState;
  }
  return newState;
};

export default reducer;
