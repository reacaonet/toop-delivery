import { takeEvery } from 'redux-saga/effects';
import {
  GET_USER_SAGA,
  SET_USER_SAGA,
  CLEAN_USER_SAGA,
  GET_BOOKING_SAGA,
  SET_BOOKING_SAGA,
  UPDATE_BOOKING_SAGA,
  CLEAN_BOOKING_SAGA,
  GET_LOCATION_SAGA,
  SET_LOCATION_SAGA,
  SET_MESSAGE_SAGA,
  SET_CONFIGURATION_SAGA,
} from './sagasTypes';

/** Redux Saga */
import { getAuth, setAuth, clearSession } from './user';
import { getBooking, setBooking, updateBooking, cleanBooking } from './booking';
import { getDriverLocation, setDriverLocation } from './driverLocation';
import { setMessage } from './messages';
import { setConfigurations } from './configurations';
import { getLocation, setLocation } from './location';

export default function* rootSaga() {
  yield takeEvery(GET_USER_SAGA, getAuth);
  yield takeEvery(SET_USER_SAGA, setAuth);
  yield takeEvery(CLEAN_USER_SAGA, clearSession);

  yield takeEvery(GET_BOOKING_SAGA, getBooking);
  yield takeEvery(SET_BOOKING_SAGA, setBooking);
  yield takeEvery(UPDATE_BOOKING_SAGA, updateBooking);
  yield takeEvery(CLEAN_BOOKING_SAGA, cleanBooking);

  yield takeEvery(GET_LOCATION_SAGA, getDriverLocation);
  yield takeEvery(SET_LOCATION_SAGA, setDriverLocation);

  yield takeEvery(GET_LOCATION_SAGA, getLocation);
  yield takeEvery(SET_LOCATION_SAGA, setLocation);

  yield takeEvery(SET_MESSAGE_SAGA, setMessage);

  yield takeEvery(SET_CONFIGURATION_SAGA, setConfigurations);
}
