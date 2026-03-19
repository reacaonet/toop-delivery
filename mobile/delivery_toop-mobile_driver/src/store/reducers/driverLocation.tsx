import { GET_LOCATION } from '../storeTypes';

const initialState = {
  load: false,
  location: null,
};

const reducer = (state = initialState, action: any) => {
  let newState = { ...state };
  switch (action.type) {
    case GET_LOCATION:
      let item: any = action.payload;
      newState = { ...newState, ...item };
      return newState;
  }
  return newState;
};

export default reducer;
