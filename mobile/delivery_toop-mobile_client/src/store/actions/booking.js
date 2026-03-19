import {GET_BOOKING, CLEAN_BOOKING} from './actionTypes';
import {
  StorageGet,
  StorageSet,
  StorageClean,
} from '../../services/deviceStorage';

const key = '@booking';

export const getBooking = (dispat = null) => {
  if (dispat) {
    StorageGet(key)
      .then(booking => {
        dispat({
          type: GET_BOOKING,
          payload: booking,
        });
      })
      .catch(err => console.log(err));
  } else {
    return dispatch => {
      StorageGet(key)
        .then(booking => {
          dispatch({
            type: GET_BOOKING,
            payload: booking,
          });
        })
        .catch(err => console.log(err));
    };
  }
};

export const setBooking = action => {
  return dispatch => {
    if (!action || !action.payload || action.payload == null) {
      return;
    }

    StorageGet(key, action.payload).then(() => {
      return getBooking(dispatch);
    });
  };
};

export const updateBooking = action => {
  return dispatch => {
    if (!action || !action.payload || action.payload == null) {
      return;
    }

    StorageGet(key).then(booking => {
      if (!booking) {
        StorageSet(key, action.payload).then(() => {
          return getBooking(dispatch);
        });
      } else {
        const payload = action.payload;
        booking = {...booking, ...payload};
        StorageSet(key, booking).then(() => {
          getBooking(dispatch);
        });
      }
    });
  };
};

export const cleanBooking = () => {
  return dispatch => {
    StorageClean(key).then(() => {
      dispatch({
        type: CLEAN_BOOKING,
      });
    });
  };
};
