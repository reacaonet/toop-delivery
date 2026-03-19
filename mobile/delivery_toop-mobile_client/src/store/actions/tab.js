import {TAB_GET_CATEGORY, TAB_SET_CATEGORY} from './actionTypes';

export const currentTab = () => {
  return dispatch => {
    dispatch({
      type: TAB_GET_CATEGORY,
    });
  };
};

export const setCategory = category => {
  return dispatch => {
    dispatch({
      type: TAB_SET_CATEGORY,
      payload: {
        category: category,
      },
    });
  };
};
