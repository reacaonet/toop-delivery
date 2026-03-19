import {TAB_GET_CATEGORY, TAB_SET_CATEGORY} from '../actions/actionTypes';

const initialState = {
  category: 'delivery',
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case TAB_GET_CATEGORY:
      return state;
    case TAB_SET_CATEGORY: {
      return {
        ...state,
        category: action?.payload?.category,
      };
    }
    default:
      return state;
  }
};

export default reducer;
