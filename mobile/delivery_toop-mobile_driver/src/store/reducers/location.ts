import { GET_LOCATION, CLEAN_LOCATION } from '../storeTypes';

const initialState = {
  latitude: 0,
  longitude: 0,
};

const reducer = (state = initialState, action: any) => {
  let newState = { ...state };
  switch (action.type) {
    case GET_LOCATION:
      let item: any = action.payload;
      newState = { ...newState, ...item };
      return newState;
    case CLEAN_LOCATION:
      return initialState;
  }

  return newState;
};

export default reducer;
