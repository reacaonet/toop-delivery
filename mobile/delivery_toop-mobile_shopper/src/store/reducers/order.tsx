import {GET_ORDER} from '../storeTypes';

const initialState = {
  load: false,
  payload: null,
};

const reducer = (state = initialState, action: any) => {
  const newState = {...state};
  switch (action.type) {
    case GET_ORDER:
      return (newState.payload = action.payload);
  }
  return newState;
};

export default reducer;
