import { Colors } from '../../styles';
import { GET_CONFIGURATIONS, SET_CONFIGURATIONS } from '../storeTypes';

const initialState = {
  statusBar: {
    barStyle: 'light-content',
    backgroundColor: Colors.GRAY_DARK,
    translucent: false,
  },
};

const reducer = (state = initialState, action: any) => {
  let newState = { ...state };
  switch (action.type) {
    case SET_CONFIGURATIONS:
      if (action.payload === null) {
        return initialState;
      }

      return {
        ...newState,
        ...action.payload,
      };
    case GET_CONFIGURATIONS:
      if (action.payload !== null) {
        newState = action.payload;
        return newState;
      }

      return initialState;
  }
  return newState;
};

export default reducer;
