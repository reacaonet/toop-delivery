import {GET_USER} from '../storeTypes';

const initialState = {
  load: false,
  user: null,
};

const reducer = (state = initialState, action: any) => {
  const newState = {...state};
  switch (action.type) {
    case GET_USER:
      return (newState.user = action.payload);
  }
  return newState;
};

export default reducer;
