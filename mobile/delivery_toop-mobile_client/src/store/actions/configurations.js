import {GET_CONFIGURATIONS, SET_CONFIGURATIONS} from './actionTypes';

import {StorageSet, StorageGet} from '../../services/deviceStorage';

const key = '@configurations';

export const getConfigurations = (dispat = null) => {
  if (dispat) {
    StorageGet(key)
      .then(configuration => {
        dispat({
          type: GET_CONFIGURATIONS,
          payload: configuration,
        });
      })
      .catch(err => console.log(err));
  } else {
    return dispatch => {
      StorageGet(key)
        .then(configuration => {
          dispatch({
            type: GET_CONFIGURATIONS,
            payload: configuration,
          });
        })
        .catch(err => console.log(err));
    };
  }
};

export const setConfigurations = action => {
  return dispatch => {
    if (!action || !action.payload || action.payload == null) {
      return;
    }

    StorageGet(key).then(configuration => {
      if (!configuration) {
        StorageSet(key, action.payload).then(() => {
          return getConfigurations(dispatch);
        });
      } else {
        const payload = action.payload;
        configuration = {...configuration, ...payload};
        StorageSet(key, configuration).then(() => {
          getConfigurations(dispatch);
        });
      }
    });
  };
};
