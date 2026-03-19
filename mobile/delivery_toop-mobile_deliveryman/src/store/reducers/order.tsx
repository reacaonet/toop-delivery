import {GET_ORDER, UPDATE_ORDER} from '../storeTypes';

const initialState = {
  load: false,
  payload: null,
  update: null,
};

const reducer = (state = initialState, action: any) => {
  const newState = {...state};
  switch (action.type) {
    case GET_ORDER:
      return (newState.payload = action.payload);
    case UPDATE_ORDER:
      return (newState.update = action.payload);
  }
  return newState;
};

export default reducer;
